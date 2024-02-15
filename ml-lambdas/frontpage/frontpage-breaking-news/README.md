# Frontpage breaking news

## Introduction
This lambda function is created to provide personalized recommendations for article clusters for the user generated from AWS personalize model. This clusters contain articles having similar embeddings.

This generated clusters are queried from dynamo main table to fetch the provided number of articles per cluster (provided as input 'max_per_cluster'), this articles are then sent to user via frontend.

## Parameters

### Input

- A json body input
-
    {
    "user_id": string containing unique user id,
    "max_per_cluster": int
  }

### Output

- A set of lists
-
    { 
      ["articleId": { 
        "S": string 
      }, 
      "articleSummary": { 
        "S": string     (with embedded newline characters \n) 
      }, 
      "article_title": { 
        "S": string 
      }, 
      "articleClusterId": { 
        "S": string 
      }, 
      "articleCreationTimestamp": { 
        "N": int 
      }, 
      "articleHook": { 
        "S": string}], [
            ..
          ] , ..
      } 


## Requirements

### Environment Variables
Make sure to set the following environment variables either locally or in your Lambda function's configuration:

- `DESIRED_ITEMS` =	Number of desired items
- `DYNAMO_MAIN_TABLE` =	BreakingNewsMainTable
- `USERPERSONALIZATIONCLUSTERENDPOINT` =	Endpoint ARN

### Additional Configuration
- No additional layers are required for lambda deployment. 
- Lambda is triggered by API Gateway/can be provided similar input manually
- IAM permissions for boto client services required -> dynamodb, personalize-runtime

## Additional Requirements
A case can be made with use of `DESIRED_ITEMS` as env variable, with which response can be made to contain articles not exceeding desired items provided

## Notes and Assumptions
The assumption is that we have a AWS-personalize model trained and deployed with the provided endpoint, as well as Dynamodb all setup in same region/VPC with IAM configured