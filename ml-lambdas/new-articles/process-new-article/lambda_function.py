from src.config import *
from src.add_new_articles import process_article, publish_to_lambda
import json


def lambda_handler(event, context):
    event = event["body"]
    if type(event) == str:
        event = json.loads(event)
    logger.info("event: %s",event)
    try:
        s3_path = event['s3_path']
        logger.info("processing new article at = %s", s3_path)
        if s3_path:
            logger.info("processing article")
            start_time = time.time()
            user_list, processing_result = process_article(s3_path)
            if user_list != "Invalid text":
                logger.info("processing result acquired in :%s",time.time()-start_time)
                logger.info("New article user list: %s", user_list)
                logger.info("New article data to new article to dynamo lambda: %s", processing_result)
                response = publish_to_lambda(processing_result)
                logger.info('lambda response: %s', response)
                if response['ResponseMetadata']['HTTPStatusCode'] == 202:
                    logger.info('New article is being ingested in dynamo')
                    return {
                        'statusCode': 200,
                        'body': json.dumps(user_list)
                    }
                else:
                    logger.error('Error triggering new articles to dynamo lambda: %s', response)
                    return{
                        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
                        'body': f'Lambda to ingest dynamo not triggered properly with response {response}'
                    }
            else:
                logger.warn('As invalid text input is deployed, lambda is not triggerd')
                return {
                        'statusCode': 200,
                        'body': 'Invalid text input, user list not retrieved'
                    }
        else:
            logger.warning('Article was not processed because of invalid path')
            return {
                'statusCode': 400,
                'body': "Invalid path"
            }
    except Exception as e:
        logger.error("Error in processing new article lambda: %s", str(e))
        raise