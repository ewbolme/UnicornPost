import time
import json
import boto3
import argparse

# Start measuring script execution time
start_time = time.time()
print("\n\nThis script 4 will train and deploy breaking news one to one model for news for you frontpage section")
# Parsing command-line arguments
parser = argparse.ArgumentParser(description='Script to perform KMeans clustering on articles.')
parser.add_argument('--role', type=str, help='SageMaker role ARN')
parser.add_argument('--bucket', type=str, help='S3 bucket name')

parser.add_argument('--dataset_group', type=str, help='Dataset group for one to one model')
parser.add_argument('--interactions_schema', type=str, help='Interaction schema name')
parser.add_argument('--interactions_dataset', type=str, help='Interaction dataset name')
parser.add_argument('--items_schema', type=str, help='Items schema name')
parser.add_argument('--items_dataset', type=str, help='Items dataset name')

parser.add_argument('--solution_name', type=str, help='Personalization solution name')
parser.add_argument('--campaign_name', type=str, help='Campaign name')
parser.add_argument('--event_tracker_name', type=str, help='Event tracker name')
parser.add_argument('--filter_name', type=str, help='Genre Filter name')
parser.add_argument('--region', type=str, help='aws region')

args = parser.parse_args()
region=args.region
role = args.role
bucket_name = args.bucket
datasetGroup=args.dataset_group
interactionsSchema=args.interactions_schema
interactionsDataset=args.interactions_dataset
itemsSchema=args.items_schema
itemsDataset=args.items_dataset
oneToOneSolution=args.solution_name
oneToOneCampaign=args.campaign_name
eventTracker=args.event_tracker_name
filterName=args.filter_name


print("role given:",role,"bucket name given",bucket_name)

boto3.setup_default_session(region_name=region)
# Create a boto3 client for IAM
iam_client = boto3.client('iam')

# Get the role details including ARN
try:
    role_ = iam_client.get_role(RoleName=role)
    role_arn = role_['Role']['Arn']
    print(f"The ARN of the role '{role}' is: {role_arn}")
except iam_client.exceptions.NoSuchEntityException:
    print(f"Role '{role}' does not exist or you don't have permissions to access it.")
except Exception as e:
    print(f"An error occurred: {e}")

personalize_client = boto3.client('personalize')
personalize_runtime = boto3.client('personalize-runtime')

deskdrop_articles_one_to_one = "s3://"+bucket_name+"/personalize_ready/deskdrop_articles_one_to_one.csv"           ## Need the s3 dynamic
deskdrop_interactions_one_to_one = "s3://"+bucket_name+"/personalize_ready/deskdrop_interactions_one_to_one.csv"   ## Need the s3 dynamic



create_dataset_group_response = personalize_client.create_dataset_group(   
    name = datasetGroup,                                                                                  ## Need to set the name
)
dataset_group_arn = create_dataset_group_response['datasetGroupArn']
# print(json.dumps(create_dataset_group_response, indent=2))
print(f'DatasetGroupArn = {dataset_group_arn}')



status = None
max_time = time.time() + 3*60*60 # 3 hours
while time.time() < max_time:
    describe_dataset_group_response = personalize_client.describe_dataset_group(
        datasetGroupArn = dataset_group_arn
    )
    status = describe_dataset_group_response["datasetGroup"]["status"]
    print("DatasetGroup: {}".format(status))
    
    if status == "ACTIVE" or status == "CREATE FAILED":
        break
        
    time.sleep(15)



interactions_schema = {
	"type": "record",  
	"name": "Interactions",  
	"namespace": "com.amazonaws.personalize.schema",  
	"fields": [  
		{  
			"name": "USER_ID",  
			"type": "string"  
		},  
		{  
			"name": "ITEM_ID",  
			"type": "string"  
		},  
		{  
			"name": "TIMESTAMP",  
			"type": "long"  
		},  
		{  
			"name": "EVENT_TYPE",  
			"type": "string"  
		}  
	],  
	"version": "1.0"  
}  

interactions_schema_name =  interactionsSchema      ##Need to set the name
try:
    create_schema_response = personalize_client.create_schema(
        name = interactions_schema_name,
        schema = json.dumps(interactions_schema)
    )
    print(json.dumps(create_schema_response, indent=2))
    interactions_schema_arn = create_schema_response['schemaArn']
except personalize_client.exceptions.ResourceAlreadyExistsException:
    print('You already created this schema.')
    schemas = personalize_client.list_schemas(maxResults=100)['schemas']
    for schema_response in schemas:
        if schema_response['name'] == interactions_schema_name:
            interactions_schema_arn = schema_response['schemaArn']
            print(f"Using existing schema: {interactions_schema_arn}")



dataset_type = "INTERACTIONS"                                               ##Need to set the name
create_dataset_response = personalize_client.create_dataset(
    name = interactionsDataset,                          ##Need to set the name
    datasetType = dataset_type,
    datasetGroupArn = dataset_group_arn,
    schemaArn = interactions_schema_arn
)

interactions_dataset_arn = create_dataset_response['datasetArn']
print(json.dumps(create_dataset_response, indent=2))



max_time = time.time() + 6*60*60 # 6 hours
while time.time() < max_time:
    describe_dataset_response = personalize_client.describe_dataset(
        datasetArn = interactions_dataset_arn
    )
    status =  describe_dataset_response["dataset"]['status']
    print("Interactions Dataset: {}".format(status))
    
    if status == "ACTIVE" or status == "CREATE FAILED":
        break
        
    time.sleep(60)



interactions_create_dataset_import_job_response = personalize_client.create_dataset_import_job(
    jobName = "breakingnews-one-to-one-interaction-dataset-import",                                                             ##Need to set the name
    datasetArn = interactions_dataset_arn,
    dataSource = {
        "dataLocation": deskdrop_interactions_one_to_one
    },
    roleArn = role_arn                     ##Need to set the role
)
interactions_dataset_import_job_arn = interactions_create_dataset_import_job_response['datasetImportJobArn']
print(json.dumps(interactions_create_dataset_import_job_response, indent=2))



items_schema = {
    "type": "record",
    "name": "Items",
    "namespace": "com.amazonaws.personalize.schema",
    "fields": [
        {
            "name": "ITEM_ID",
            "type": "string"
        },
        {
            "name": "CREATION_TIMESTAMP",
            "type": "long"
        },
        {
            "name": "ARTICLE_SUMMARY",
            "type": ["null", "string"],
            "textual": True,
        },
        {
            "name": "LANG",
            "type": "string",
            "categorical": True
        },
        {
            "name": "ARTICLE_GENRE",
            "type": "string",
            "categorical": True
        },
        {
            "name": "ARTICLE_CLUSTER",
            "type": "string",
            "categorical": True
        },
    ],
    "version": "1.0"
}

items_schema_name = itemsSchema       ##Need to set the name
try:
    create_schema_response = personalize_client.create_schema(
        name = items_schema_name,
        schema = json.dumps(items_schema),
    )
    items_schema_arn = create_schema_response['schemaArn']
    print(json.dumps(create_schema_response, indent=2))
except personalize_client.exceptions.ResourceAlreadyExistsException:
    print('You aready created this schema.')
    schemas = personalize_client.list_schemas(maxResults=100)['schemas']
    for schema_response in schemas:
        if schema_response['name'] == items_schema_name:
            items_schema_arn = schema_response['schemaArn']
            print(f"Using existing schema: {items_schema_arn}")



dataset_type = "ITEMS"
create_dataset_response = personalize_client.create_dataset(
    name = itemsDataset,                                    ##Need to set the name
    datasetType = dataset_type,
    datasetGroupArn = dataset_group_arn,
    schemaArn = items_schema_arn
)

items_dataset_arn = create_dataset_response['datasetArn']
print(json.dumps(create_dataset_response, indent=2))



max_time = time.time() + 6*60*60 # 6 hours
while time.time() < max_time:
    describe_dataset_response = personalize_client.describe_dataset(
        datasetArn = items_dataset_arn
    )
    status =  describe_dataset_response["dataset"]['status']
    print("Items Dataset: {}".format(status))
    
    if (status == "ACTIVE" or status == "CREATE FAILED"):
        break
        
    time.sleep(60)



items_create_dataset_import_job_response = personalize_client.create_dataset_import_job(
    jobName = "breakingnews-one-to-one-items-dataset-import",                                           ##Need to set the name
    datasetArn = items_dataset_arn,
    dataSource = {
        "dataLocation": deskdrop_articles_one_to_one
    },
    roleArn = role_arn           ##Need to set the role
)
items_dataset_import_job_arn = items_create_dataset_import_job_response['datasetImportJobArn']
print(json.dumps(items_create_dataset_import_job_response, indent=2))



max_time = time.time() + 3*60*60 # 3 hours
while time.time() < max_time:
    import_job_response = personalize_client.describe_dataset_import_job(
        datasetImportJobArn = interactions_dataset_import_job_arn
    )
    status = import_job_response["datasetImportJob"]['status']
    
    print("Interactions Dataset Import: {}".format(status))
    
    import_job_response = personalize_client.describe_dataset_import_job(
        datasetImportJobArn = items_dataset_import_job_arn
    )
    status_2 = import_job_response["datasetImportJob"]['status']

    print("Items Dataset Import: {}".format(status_2))
    
    if (status == "ACTIVE" or status == "CREATE FAILED") & (status_2 == "ACTIVE" or status_2 == "CREATE FAILED"):
        break
    else:
        time.sleep(60)



user_personalization_recipe_arn = "arn:aws:personalize:::recipe/aws-user-personalization"

user_personalization_create_solution_response = personalize_client.create_solution(
    name = oneToOneSolution,                                               ##Need to set the name
    datasetGroupArn = dataset_group_arn,
    recipeArn = user_personalization_recipe_arn
)
user_personalization_solution_arn = user_personalization_create_solution_response['solutionArn']
print("\n\nBreaking news one to one solution arn:",json.dumps(user_personalization_solution_arn, indent=2))


user_personalization_create_solution_version_response = personalize_client.create_solution_version(
    solutionArn = user_personalization_solution_arn
)

user_personalization_solution_version_arn = user_personalization_create_solution_version_response['solutionVersionArn']
print("\n\nBreaking news one to one solution version arn:",json.dumps(user_personalization_solution_version_arn, indent=2))



max_time = time.time() + 10*60*60 # 10 hours
while time.time() < max_time:

    # User Personalization Solution Version
    user_personalization_version_response = personalize_client.describe_solution_version(
        solutionVersionArn = user_personalization_solution_version_arn
    )
    status_user_personalization_solution = user_personalization_version_response["solutionVersion"]["status"]

    if status_user_personalization_solution == "ACTIVE":
        print("Build succeeded for {}".format(user_personalization_solution_arn))
        
    elif status_user_personalization_solution == "CREATE FAILED":
        print("Build failed for {}".format(user_personalization_solution_arn))
        break

    if not status_user_personalization_solution == "ACTIVE":
        print("User Personalization Solution Version build is still in progress")
    else:
        print("The User Personalization Solution Version is ACTIVE")
        break

    print()
    time.sleep(60)


print("user_personalization_solution_arn is: ",user_personalization_solution_arn)


create_campaign_response = personalize_client.create_campaign(
    name = oneToOneCampaign,                                           ##Need to set the name
    solutionVersionArn = user_personalization_solution_version_arn,
    minProvisionedTPS = 1,
    campaignConfig = {"enableMetadataWithRecommendations": True}
)

user_personalization_campaign_arn = create_campaign_response['campaignArn']
print(json.dumps(create_campaign_response, indent=2))





max_time = time.time() + 3*60*60 # 3 hours
while time.time() < max_time:

    version_response = personalize_client.describe_campaign(
        campaignArn = user_personalization_campaign_arn
    )
    status = version_response['campaign']['status']

    if status == 'ACTIVE':
        print('Build succeeded for {}'.format(user_personalization_campaign_arn))
    elif status == "CREATE FAILED":
        print('Build failed for {}'.format(user_personalization_campaign_arn))
        in_progress_campaigns.remove(rerank_campaign_arn)
    
    if status == 'ACTIVE' or status == 'CREATE FAILED':
        break
    else:
        print('The campaign build is still in progress')
        
    time.sleep(60)



event_tracker_response = personalize_client.create_event_tracker(
    datasetGroupArn=dataset_group_arn,
    name=eventTracker                                                   ##Need to set the name
)

event_tracker_arn_query = event_tracker_response['eventTrackerArn']
event_tracking_id_query = event_tracker_response['trackingId']

print('\n\nEvent Tracker ARN: ' + event_tracker_arn_query)
print('\n\nEvent Tracking ID: ' + event_tracking_id_query)


try:
    create_category_filter_response = personalize_client.create_filter(
        name = filterName,                                                               ##Need to set the name
        datasetGroupArn = dataset_group_arn,
        filterExpression = 'INCLUDE ItemID WHERE Items.ARTICLE_GENRE IN ($GENRELIST)'
    )
    
    category_filter_arn = create_category_filter_response['filterArn']
    print('Creating the Personalize filter with category_filter_arn {}.'.format(category_filter_arn))
    

except personalize_client.exceptions.ResourceAlreadyExistsException as e:
    print('The Personalize filter {} already exists.'.format(category_filter_name))

end_time = time.time()
execution_time = end_time - start_time

print(f"Script execution time: {execution_time} seconds")  # 800 seconds