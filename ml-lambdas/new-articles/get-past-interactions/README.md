# Get past interactions

## Introduction
This lambda function is created to provide last 5 articles interacted by user based on timestamp, these articles and their properties are then sent as response.

## Parameters

### Input

- A json body input
- {
    "user_id": "687bb4c3-b5d0-4f91-ba8d-b65e27cd85d3"}

### Output

- A set of lists
- { 
        ["article_hook": { 
          "S": string 
        }, 
        "articleId": { 
          "S": string 
        }, 
        "article_summary": { 
          "S": string     (with embedded newline characters \n) 
        }, 
        "creation_timestamp": { 
          "S": string 
        }, 
        "title": { 
          "S": string}], [
            ..
          ] , ..
      } 


## Requirements

### Environment Variables
Make sure to set the following environment variables either locally or in your Lambda function's configuration:

- `DESIRED_ITEMS` =	Number of desired items
- `DYNAMO_CLUSTER_LOOKUP_TABLE` =	Table name
- `DYNAMO_INTERACTION_TABLE` =	Table name

### Additional Configuration
- No additional layers are required for lambda deployment. 
- Lambda is triggered by API Gateway/can be provided similar input manually
- IAM permissions for boto client services required -> dynamodb

## Additional Requirements
None

## Notes and Assumptions
The assumption is that we have Dynamodb setup properly as per variable provided in same region/VPC with IAM configured