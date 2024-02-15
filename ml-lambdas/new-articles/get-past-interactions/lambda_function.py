from src.config import *
from src.get_interactions import get_past_interactions
import json


def lambda_handler(event, context):
    event = event["body"]
    if type(event) == str:
        event = json.loads(event)
    logger.info("event: %s",event)
    try:
        user_id = event['user_id']
        if user_id:
            logger.info("getting past interactions of = %s", user_id)
            start_time = time.time()
            processing_result = get_past_interactions(user_id)
            logger.info("interactions result acquired on : %s", time.time()- start_time)
            logger.info("User past interaction result: %s", processing_result)
            return {
                'statusCode': 200,
                'body': json.dumps(processing_result)
            }
        else:
            logger.warning('Past interactions were not fetched because of invalid user id')
            return {
                'statusCode': 400,
                'body': "Invalid user id"
            }
    except Exception as e:
        logger.error("Error in past interactions lambda: %s", str(e))
        raise