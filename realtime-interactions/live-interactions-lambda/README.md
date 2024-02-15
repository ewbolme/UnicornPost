# Fetch live interactions

## Introduction
This lambda function is created to record live interaction data of user interacting with article into a kinesis stream. This later to be used when recording events into event tracker and dynamo table

## Parameters

### Input

- A json body input
- {
    "user_id": "999",
    "article_id": "-3348652277274905234",
    "interaction_timestamp": "1481656789"
  }

### Output

- A check message showing kinesis ingestion response


## Requirements

### Environment Variables
Make sure to set the following environment variables either locally or in your Lambda function's configuration:

- `KINESISSTREAMNAME` =	user-interaction

### Additional Configuration
- No additional layers are required for lambda deployment. 
- Lambda is triggered by API Gateway/can be provided similar input manually
- IAM permissions for boto client services required -> kinesis

## Additional Requirements
None

## Notes and Assumptions
The assumption is that we have kinesis setup in same region/VPC with IAM configured