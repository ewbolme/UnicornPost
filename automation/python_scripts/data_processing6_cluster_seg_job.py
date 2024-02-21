import boto3
import tqdm
import pandas as pd
import time
import subprocess
import csv
import boto3
import argparse

# Start measuring script execution time
start_time = time.time()
print("\n\nScript to perform user segmentation")
# Parsing command-line arguments
parser = argparse.ArgumentParser(description="Script to perform user segmentation")
parser.add_argument("--role", type=str, help="SageMaker role ARN")
parser.add_argument("--bucket", type=str, help="S3 bucket name")
parser.add_argument("--account", type=str, help="aws account number")
parser.add_argument("--region", type=str, help="aws region")
parser.add_argument("--job_name", type=str, help="unique segmentation job name")
parser.add_argument(
    "--user_seg_model_name",
    type=str,
    help="name of personalize user segmentation model",
)
parser.add_argument(
    "--cluster_number",
    type=str,
    help="Number of clusters in the article segmentation model",
)
args = parser.parse_args()

role = args.role
bucket_name = args.bucket
account_no = args.account
region = args.region
user_seg = args.user_seg_model_name
job_name = args.job_name
num_clusters = args.cluster_number

print(
    "role given:",
    role,
    "bucket name given",
    bucket_name,
    "user segmentation model name",
    user_seg,
    "\njob",
    job_name,
)

boto3.setup_default_session(region_name=region)
# Create a boto3 client for IAM
iam_client = boto3.client("iam")

# Get the role details including ARN
try:
    role_ = iam_client.get_role(RoleName=role)
    role_arn = role_["Role"]["Arn"]
    print(f"The ARN of the role '{role}' is: {role_arn}")
except iam_client.exceptions.NoSuchEntityException:
    print(f"Role '{role}' does not exist or you don't have permissions to access it.")
except Exception as e:
    print(f"An error occurred: {e}")

DYNAMO_MAIN_TABLE = "BreakingNewsMainTable"
DYNAMOCLIENT = boto3.client("dynamodb")


# Create a Personalize client
personalize = boto3.client("personalize", region_name=region)

# Define the solution ARN
solution_arn = f"arn:aws:personalize:{region}:{account_no}:solution/{user_seg}"

# Get the latest version of the solution
try:
    response = personalize.list_solution_versions(
        solutionArn=solution_arn, maxResults=1
    )

    # Extract the latest solution version ARN
    latest_version_arn = response["solutionVersions"][0]["solutionVersionArn"]

    print(f"The latest version of the user segmentation model is: {latest_version_arn}")

except Exception as e:
    print(f"An error occurred: {e}")


USERSEGMENTATIONCLUSTERSOLUTIONVERSION = latest_version_arn
print("segementation version its picking:", USERSEGMENTATIONCLUSTERSOLUTIONVERSION)

cluster_list = []
item_id_list = []

for i in range(0, num_clusters):
    cluster_list.append(str(i))
    item_id_list.append("item_id")


testdf = pd.DataFrame(data={"itemId": cluster_list})


with open("Schemas/breakingnews_user_segmentation.json", "w") as outfile:
    testdf.to_json(outfile, orient="records", lines=True)

outfile.close()

user_seg = "s3://" + bucket_name + "/breakingnews_user_segmentation.json"
command = "aws s3 cp ./Schemas/breakingnews_user_segmentation.json  " + user_seg
subprocess.run(command, shell=True, check=True)
print("File copied to S3 successfully!")


personalize = boto3.client("personalize")

s3_data_source = "s3://" + bucket_name + "/breakingnews_user_segmentation.json"
job_output_path = "s3://" + bucket_name + "/user_segementation/output/"

# change the jobName if already exists
create_batch_segment_response = personalize.create_batch_segment_job(
    jobName=job_name,  ## Need to update this
    solutionVersionArn=USERSEGMENTATIONCLUSTERSOLUTIONVERSION,
    numResults=1000,  # Can be up to 5 million
    jobInput={"s3DataSource": {"path": s3_data_source}},
    jobOutput={"s3DataDestination": {"path": job_output_path}},
    roleArn=role_arn,
)

batch_segment_job_arn = create_batch_segment_response["batchSegmentJobArn"]
print(batch_segment_job_arn)


def wait_for_batch_segment_job(batch_segment_job_arn):
    max_time = time.time() + 3 * 60 * 60
    while time.time() < max_time:
        describe_job_response = personalize.describe_batch_segment_job(
            batchSegmentJobArn=batch_segment_job_arn
        )
        status = describe_job_response["batchSegmentJob"]["status"]
        print("Batch Segment Job: {}".format(status))

        start = describe_job_response["batchSegmentJob"]["creationDateTime"]
        end = describe_job_response["batchSegmentJob"]["lastUpdatedDateTime"]
        if status == "ACTIVE":
            print("Time took: {}".format(end - start))
            break
        if status == "CREATE FAILED":
            print("Time took: {}".format(end - start))
            print(
                "Job Failed: {}".format(
                    describe_job_response["batchSegmentJob"]["failureReason"]
                )
            )
            break

        time.sleep(180)


wait_for_batch_segment_job(batch_segment_job_arn)


batch_file_name = (
    "s3://"
    + bucket_name
    + "/user_segementation/output/breakingnews_user_segmentation.json"
)
output_file_name_s3 = batch_file_name + ".out"
output = pd.read_json(output_file_name_s3, lines=True)

print("json output: ", output)

existing_data = pd.read_csv("./Data/Dynamodb/BreakingNewsMainTable.csv")

output_result = []

for i, row in tqdm.tqdm(output.iterrows(), total=output.shape[0]):
    articleClusterId = str(row.input["itemId"])
    articleCreationTimestamp = int(1)
    articleId = "USERAFFINITY"
    users_list = str(row.output["usersList"])

    Item = {
        "articleClusterId": articleClusterId,
        "articleCreationTimestamp": articleCreationTimestamp,
        "articleId": articleId,
        "users_list": users_list,
    }
    output_result.append(Item)
try:
    updated_data = pd.concat(
        [existing_data, pd.DataFrame(output_result)], ignore_index=True
    )
    updated_data.to_csv("./Data/Dynamodb/BreakingNewsMainTable.csv", index=False)
except Exception as e:
    print(e)

end_time = time.time()
execution_time = end_time - start_time

print(f"Script execution time: {execution_time} seconds")
