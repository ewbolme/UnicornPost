# Record live interactions

## Introduction
This lambda function is created to record live interaction data of user interacting with article into a event tracker of the personalize model as well as dynamo table

## Parameters

### Input

- A kinesis stream as a trigger
- The stream will triggered per each 10 interactions fetched in kinesis

### Output

- A check message showing Dynamo and event tracker ingestion response


## Requirements

### Environment Variables
Make sure to set the following environment variables either locally or in your Lambda function's configuration:

- `DESIRED_ITEMS` =	Number of desired items
- `KINESISSTREAMNAME` =	user-interaction
- `CLUSTEREVENTTRACKER` =	Cluster event tracker endpoint
- `DYNAMO_CLUSTER_LOOKUP_TABLE` =	ClusterLookupTable
- `DYNAMO_INTERACTION_TABLE` =	ArticleUserInteractionsTable
- `ONETOONEEVENTTRACKER` =	One-to-one event tracker endpoint

### Additional Configuration
- No additional layers are required for lambda deployment. 
- Lambda is triggered kinesis stream
- IAM permissions for boto client services required -> kinesis, dynamodb, personalize-events

## Additional Requirements
The trigger value can be configured to more if the interactions values generate data on large scale

## Notes and Assumptions
The assumption is that we have kinesis, dynamodb, personalize-events setup in same region/VPC with IAM configured