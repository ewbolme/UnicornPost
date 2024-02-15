from src.config import *
from src.get_personalized_news import get_personalized_newsletter
import json


def lambda_handler(event, context):
    event = event["body"]
    if type(event) == str:
        event = json.loads(event)
    logger.info("event: %s",event)
    try:
        user_id = event['user_id']
        is_gen = event['is_gen']
        desired_items = event['desired_items']
        prompts = event['prompts']
        user_name = event['user_name']
        logger.info("creating newsletter for user: %s", user_name)
        if user_id and user_name and is_gen == 'false':
            logger.info("Generative AI not applied")
            logger.info("Generating newsletter")
            start_time = time.time()
            processing_result = get_personalized_newsletter(user_id, desired_items, user_name)
            logger.info("Personalized digest result acquired in :%s",time.time()-start_time)
            logger.info("Personalized email results: %s", processing_result)
            return {
                'statusCode': 200,
                'body': processing_result
            }
        elif user_id and user_name and is_gen == 'true' and prompts:
            logger.info("Generative AI applied")
            logger.info("Generating newsletter")
            start_time = time.time()
            processing_result = get_personalized_newsletter(user_id, desired_items, user_name, prompts=prompts, is_gen = True)
            logger.info("Personalized email result acquired in :%s",time.time()-start_time)
            logger.info("Personalized email results: %s", processing_result)
            return {
                'statusCode': 200,
                'body': processing_result
            }
        else:
            logger.warning('Personalized newsletter was not fetched because of invalid parameters')
            return {
                'statusCode': 400,
                'body': "Invalid parameters"
            }
    except Exception as e:
        logger.error("Error in personalized newsletter lambda: %s", str(e))
        raise