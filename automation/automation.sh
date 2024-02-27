#! /bin/bash

# Installing Dependencies
echo "Installing Dependencies.............................."
pip install -r requirements.txt


# Creating directories
data_directory="Data"
folders=("PersonalizeReady" "Dynamodb" "ArticleClusterAdded")


# Check if the data directory exists
if [ -d "$data_directory" ]; then
    # Data directory exists, create the folders if they don't exist
    for folder_name in "${folders[@]}"; do
        if [ ! -d "$data_directory/$folder_name" ]; then
            # Folder doesn't exist, create it
            mkdir "$data_directory/$folder_name"
            echo "Folder '$folder_name' created inside '$data_directory'."
        else
            echo "Folder '$folder_name' already exists inside '$data_directory'."
        fi
    done
else
    # Data directory doesn't exist, create it along with the folders
    mkdir "$data_directory"
    for folder_name in "${folders[@]}"; do
        mkdir "$data_directory/$folder_name"
        echo "Data directory and folder '$folder_name' created."
    done
fi


# Variables
region=$(yq -e .region values.yaml | tr -d '"')
bucket_name=$(yq -e .bucket_name values.yaml | tr -d '"')
backend_bucket_name=$(yq -e .backend_bucket_name values.yaml | tr -d '"')
stack_name=$(yq -e .stack_name values.yaml | tr -d '"')
role_name=$(echo $(yq -e .role_name values.yaml | tr -d '"')-$(yq -e .region values.yaml | tr -d '"'))
account_no=$(aws sts get-caller-identity --query Account --output text)
cognito_domain_name=$(yq -e .cognito_domain_name values.yaml | tr -d '"')
number_of_article_clusters=$(yq -e .number_of_article_clusters values.yaml | tr -d '"')


# Sagemaker
model_name=$(yq -e .model_name values.yaml | tr -d '"')
kmeans_endpoint_name=$(yq -e .kmeans_endpoint_name values.yaml | tr -d '"')
user_interactions_dynamo_table=$(yq -e .user_interactions_dynamo_table values.yaml | tr -d '"')

# Interactions Schema (Shared)
interactions_schema_name=$(yq -e .interactions_schema_name values.yaml | tr -d '"')


# Personalize one to one model
dataset_group_one_to_one=$(yq -e .dataset_group_1 values.yaml | tr -d '"')
dataset_one_to_one_interactions=$(yq -e .dataset_one_to_one_interactions values.yaml | tr -d '"')
items_schema_name=$(yq -e .items_schema_name values.yaml | tr -d '"')
dataset_one_to_one_items=$(yq -e .dataset_one_to_one_items values.yaml | tr -d '"')
solution_one_to_one_user_pers=$(yq -e .solution_one_to_one_user_pers values.yaml | tr -d '"')
campaign_name_one_to_one_user_pers=$(yq -e .campaign_name_one_to_one_user_pers values.yaml | tr -d '"')
event_tracker_name_one_to_one=$(yq -e .event_tracker_name_one_to_one values.yaml | tr -d '"')
filter_name=$(yq -e .filter_name values.yaml | tr -d '"')


# Personalize clustered model and user affinity model params
dataset_group_clustered=$(yq -e .dataset_group_clustered values.yaml | tr -d '"')
dataset_clustred_interactions=$(yq -e .dataset_clustred_interactions values.yaml | tr -d '"')
solution_clustered_user_per=$(yq -e .solution_clustered_user_per values.yaml | tr -d '"')
solution_clustered_user_seg=$(yq -e .solution_clustered_user_seg values.yaml | tr -d '"')
campaign_name_clustered_user_per=$(yq -e .campaign_name_clustered_user_per values.yaml | tr -d '"')
event_tracker_name_clustered=$(yq -e .event_tracker_name_clustered values.yaml | tr -d '"')

#segmentation job name to be defined here
segmentation_job_name=$(yq -e .segmentation_job_name values.yaml | tr -d '"')

# data location to be defined here
interactions_data=$(yq -e .interactions_data values.yaml | tr -d '"')
old_articles=$(yq -e .old_articles values.yaml | tr -d '"')
breaking_news_articles=$(yq -e .breaking_news_articles values.yaml | tr -d '"')

# Creating IAM Role
echo "Creating IAM Role.............................."
aws iam create-role --role-name $role_name --assume-role-policy-document file://roles/trust.json


# Attaching Policies in Role
echo "Attaching Policy With The Role.............................."
aws iam attach-role-policy --role-name $role_name --policy-arn arn:aws:iam::aws:policy/service-role/AmazonPersonalizeFullAccess
aws iam attach-role-policy --role-name $role_name --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess


# Creating S3 Bucket
echo "Creating S3 Buckets.............................."
if [ $region == "us-east-1" ]; then
aws s3api create-bucket --bucket $bucket_name --region $region
aws s3api create-bucket --bucket $backend_bucket_name --region $region
else
aws s3api create-bucket --bucket $bucket_name --region $region --create-bucket-configuration LocationConstraint=$region
aws s3api create-bucket --bucket $backend_bucket_name --region $region --create-bucket-configuration LocationConstraint=$region
fi


# Policy Permission for personalize bucket
policy='
{
    "Version": "2012-10-17",
    "Id": "PersonalizeS3BucketAccessPolicy",
    "Statement": [
        {
            "Sid": "PersonalizeS3BucketAccessPolicy",
            "Effect": "Allow",
            "Principal": {
                "Service": "personalize.amazonaws.com"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<Bucket_name>",
                "arn:aws:s3:::<Bucket_name>/*"
            ]
        }
    ]
}
'


# Persisting The Policy
echo "Persisting Policy.............................."
policy_for_bucket="${policy//<Bucket_name>/$bucket_name}"
sleep 5
echo $policy_for_bucket > "./roles/s3_policy.json"


# Adding S3 Bucket Policy
echo "Attaching permissions To Bucket.............................."
aws s3api put-bucket-policy --bucket $bucket_name --policy file://roles/s3_policy.json --region $region


# Downloading The Data From S3 To Run The Python Scripts
echo "Downloading S3 Files.............................."
aws s3 cp $breaking_news_articles ./Data/InitialProcessing/deskdrop_articles_for_xenon_new.csv
aws s3 cp $old_articles ./Data/TranslatedSummarized/deskdrop_articles_for_xenon_old.csv
aws s3 cp $interactions_data ./Data/InitialProcessing/deskdrop_interactions_old.csv 


# Running the Python Scripts
python3 python_scripts/sagemaker_deployment.py --role $role_name --bucket $bucket_name --model_name $model_name --endpoint_name $kmeans_endpoint_name --region $region --cluster_number $number_of_article_clusters
python3 python_scripts/data_processing1_cluster_historical_articles.py --endpoint_name $kmeans_endpoint_name --region $region
python3 python_scripts/data_processing2_process_save_personalize_interactions.py --bucket $bucket_name
python3 python_scripts/data_processing3_cluster_new_articles.py --endpoint_name $kmeans_endpoint_name --endpoint_region $region 
python3 python_scripts/data_processing4_create_one_to_one.py --region $region --role $role_name --bucket $bucket_name --dataset_group $dataset_group_one_to_one --interactions_schema $interactions_schema_name --interactions_dataset $dataset_one_to_one_interactions --items_schema $items_schema_name  --items_dataset $dataset_one_to_one_items  --solution_name $solution_one_to_one_user_pers --campaign_name $campaign_name_one_to_one_user_pers --event_tracker_name $event_tracker_name_one_to_one --filter_name $filter_name
python3 python_scripts/data_processing5_create_clustered.py --region $region --role $role_name --bucket $bucket_name --dataset_group $dataset_group_clustered --interactions_schema $interactions_schema_name --interactions_dataset $dataset_clustred_interactions --segmentation_solution_name $solution_clustered_user_seg  --personalization_solution_name $solution_clustered_user_per  --personalization_campaign_name  $campaign_name_clustered_user_per --event_tracker_name  $event_tracker_name_clustered
python3 python_scripts/data_processing6_cluster_seg_job.py --role $role_name --bucket $bucket_name --account $account_no --region $region --user_seg_model_name $solution_clustered_user_seg --job_name $segmentation_job_name --cluster_number $number_of_article_clusters
python3 python_scripts/data_processing7_store_interactions_for_lookup.py 


# Uploading Files to S3 Bucket
aws s3 cp ./react/react.zip s3://$bucket_name/react/react.zip
aws s3 cp ./Data/Dynamodb/ClusterLookupTable.csv s3://$bucket_name/dynamodb/ClusterLookupTable.csv
aws s3 cp ./Data/Dynamodb/BreakingNewsMainTable.csv s3://$bucket_name/dynamodb/BreakingNewsMainTable.csv
aws s3 cp ./Data/Dynamodb/ArticleUserInteractionsTable.csv s3://$bucket_name/dynamodb/ArticleUserInteractionsTable.csv



# Getting Event Tracker IDs
json_data=$(aws personalize list-event-trackers --region $region)

name1=$(echo "$json_data" | jq -r '.eventTrackers[0].name')
arn1=$(echo "$json_data" | jq -r '.eventTrackers[0].eventTrackerArn')
 
name2=$(echo "$json_data" | jq -r '.eventTrackers[1].name')
arn2=$(echo "$json_data" | jq -r '.eventTrackers[1].eventTrackerArn')
 

# Check the name and echo ARN based on the condition
if [[ $name1 == $event_tracker_name_one_to_one ]] && [[ $name2 == $event_tracker_name_clustered ]]; then
    tracker_id_one_to_one=$(aws personalize describe-event-tracker --event-tracker-arn $arn1 --query "eventTracker.trackingId" --output text --region $region)
    tracker_id_clustered=$(aws personalize describe-event-tracker --event-tracker-arn $arn2 --query "eventTracker.trackingId" --output text --region $region)

    echo $tracker_id_one_to_one $tracker_id_clustered

elif [[ $name1 == $event_tracker_name_clustered ]] && [[ $name2 == $event_tracker_name_one_to_one ]]; then
    tracker_id_one_to_one=$(aws personalize describe-event-tracker --event-tracker-arn $arn2 --query "eventTracker.trackingId" --output text --region $region)
    tracker_id_clustered=$(aws personalize describe-event-tracker --event-tracker-arn $arn1 --query "eventTracker.trackingId" --output text --region $region)

    echo $tracker_id_one_to_one $tracker_id_clustered

else
    echo "Error"
fi


# Deploying Cloud Formation Stack using sam-cli
echo "Deploying Cloud Formation Stack.............................."
sam deploy \
    --template-file main.yaml \
    --stack-name $stack_name \
    --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
    --s3-bucket $bucket_name \
    --s3-prefix template \
    --region $region \
    --parameter-overrides bucketName=$bucket_name backendBucketName=$backend_bucket_name campaignName1=$campaign_name_one_to_one_user_pers campaignName2=$campaign_name_clustered_user_per filterName=$filter_name kmeansEndpointName=$kmeans_endpoint_name cognitoDomainName=$cognito_domain_name clusterEventTracker=$tracker_id_clustered oneToOneEventTracker=$tracker_id_one_to_one


# Uploading Data To The DynamoDB Table
echo "Uploading Data To The DynamoDB Table.............................."
python3 python_scripts/data_processing8.py --region $region --table_name $user_interactions_dynamo_table


# Invoking Lambda To Create Tables In RDS
aws lambda invoke --function-name rds-table-creation-lambda --region $region response.json


# Getting the Amplify App ID
amplifyAppId=$(aws cloudformation describe-stacks --stack-name $stack_name --query "Stacks[0].Outputs[?OutputKey=='amplifyAppId'].OutputValue" --output text)


# Getting the Amplify Url 
amplifyUrl=$(aws cloudformation describe-stacks --stack-name $stack_name --query "Stacks[0].Outputs[?OutputKey=='amplifyUrl'].OutputValue" --output text)


# Starting The Amplify Build
echo "Starting The Amplify Build.............................."
aws amplify start-job --app-id $amplifyAppId --branch-name master --job-type RELEASE


echo "URL-------> master.$amplifyUrl"
