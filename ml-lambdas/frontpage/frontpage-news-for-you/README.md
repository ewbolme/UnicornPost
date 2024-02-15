# Frontpage news for you

## Introduction
This lambda function is created to provide personalized article recommendations for the user generated from AWS personalize model. This model generated general recommedations as well as genre based recommedation for articles. 

This generated articles are queried from dynamo lookup table to fetch the properties of the articles, this properties are then sent to user via frontend.

## Parameters

### Input

- A json body input
-
    {"user_id": "2959376686327377624",
    "genre_filter_value": "tech"}   # This can be left as '' empty string if a general recommendations are required

### Output

- A set of lists
-
    { 
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

- `DYNAMO_CLUSTER_LOOKUP_TABLE` =	Table name
- `GENREFILTERARN` =	Genre filter ARN
- `USERPERSONALIZATIONONETOONEENDPOINT` =	Model endpoint ARN

### Additional Configuration
- No additional layers are required for lambda deployment. 
- Lambda is triggered by API Gateway/can be provided similar input manually
- IAM permissions for boto client services required -> dynamodb, personalize-runtime

## Additional Requirements
None

## Notes and Assumptions
The assumption is that we have a AWS-personalize model trained and deployed with the provided endpoint, as well as Dynamodb all setup in same region/VPC with IAM configured