# Process new articles

## Introduction
- This lambda function is created to process new article from user, it will return interested user list based on the article cluster assigned to article 
- This lambda generates cluster from embeddings derived from sagemaker model with Kmeans endpoint, to generate this the summary needs to be created in english bedrock model to generate the digest based on recommended articles fetched from personalize (similar to breaking news)
- This lambda also triggers another lambda that will ingest the data into a dynamo table

## Parameters

### Input

- A json body input
- Input is in form of txt file stored in S3
- { 
    "s3_path": "" 
} 

### Output

- A user list
- {
    "user_list": [..],
}

## Requirements

### Environment Variables
Make sure to set the following environment variables either locally or in your Lambda function's configuration:

- `KMEANS_ENDPOINT_NAME` =	article-clusterer
- `DYNAMO_MAIN_TABLE` =	BreakingNewsMainTable
- `LAMBDAFUNCTION` = new-articles-to-dynamo-lambda

### Additional Configuration
- Additional layer is required for lambda deployment -> `boto3-latest` 
- Lambda is triggered by API Gateway/can be provided similar input manually
- IAM permissions for boto client services required -> translate, runtime.sagemaker, dynamodb, s3, lambda, bedrock-runtime

## Additional Requirements
The lambda function passed need to be setup as per requirement, as it will only then return the result

## Notes and Assumptions
The assumption is that we have translate, runtime.sagemaker, dynamodb, s3, lambda, bedrock-runtime all setup in same region/VPC with IAM configured