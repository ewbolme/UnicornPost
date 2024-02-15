from src.config import *
from src.to_kinesis import put_data_to_kinesis, kinesis_validation
import json


def lambda_handler(event, context):
    event = event["body"]
    if type(event) == str:
        event = json.loads(event)
    logger.info("event: %s",event)
    status = kinesis_validation()
    if status == True:
        logger.info('Kinesis stream running')
    else:
        return logger.error("Kinesis validation failed, is stream running?")
    try:
        if type(event) == dict:
            logger.info("Recording event to kinesis for user: %s, interacting with article: %s, at timestamp: %s", event['user_id'], event['article_id'], event['interaction_timestamp'])
            response = put_data_to_kinesis(event)
            if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                logger.info('Event recorded in kinesis into shard: %s for user: %s', response['ShardId'], event['user_id'])
                return {
                    'statusCode': 200,
                    'body': f"Data consumed to shard: {response['ShardId']}"
                }
            else:
                logger.warn('Event not recorded in kinesis')
                return{
                    'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
                    'body': 'Data not consumed'
                }
        else:
            logger.warn('Event not recorded in kinesis because of invalid parameters')
            return {
                'statusCode': 400,
                'body': "Invalid parameters"
            }
    except Exception as e:
        logger.error("Error in live interactions to kinesis lambda: %s", str(e))
        raise