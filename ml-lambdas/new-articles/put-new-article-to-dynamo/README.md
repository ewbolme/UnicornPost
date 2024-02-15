# New article to dynamo

## Introduction
- This lambda function is created to process new article from user and input received from process-new-article lambda, it will return ingest the new article in dynamo table
- This lambda generates article trigger, article, hook and title from bedrock model

## Parameters

### Input

- A json body input
- Input is generated from another lambda
- { 
    "language": "", 
    "summarized_text": "", 
    "article_cluster": "", 
    "article_text": "", 
    "article_id": "", 
    "timestamp": "", 
    "user_id": "" 
} 

### Output

- A Dynamo response
- {“Data saved in Dynamo”} (if status is 200) 

## Requirements

### Environment Variables
Make sure to set the following environment variables either locally or in your Lambda function's configuration:

- `DYNAMO_MAIN_TABLE` =	BreakingNewsMainTable

### Additional Configuration
- Additional layer is required for lambda deployment -> `boto3-latest` 
- Lambda is triggered by API Gateway/can be provided similar input manually
- IAM permissions for boto client services required -> dynamodb, s3, bedrock-runtime

## Additional Requirements
For testing purposes, we have set up a csv file in S3, and is then handled with pandas. For this additional layer of pandas is required -> `AWSSDKPandas-Python311`, available as one of default layers in AWS

## Notes and Assumptions
The assumption is that we have dynamodb, s3, bedrock-runtime all setup in same region/VPC with IAM configured