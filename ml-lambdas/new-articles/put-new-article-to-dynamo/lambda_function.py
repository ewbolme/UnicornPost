from src.config import *
from src.add_new_articles import get_new_article
import json


def lambda_handler(event, context):
    if type(event) == str:
        event = json.loads(event)
    logger.info("event: %s",event)
    try:
        article_text = event['article_text']
        article_id = event['article_id']
        article_creation_timestamp = event['timestamp']
        user_id = event['user_id']
        language = event['language']
        summarized_text = event['summarized_text']
        article_cluster = event['article_cluster']
        logger.info("processing new article= %s", article_id)
        logger.info("processing new article of cluster = %s", article_cluster)
        if all([language, summarized_text, article_cluster]):
            logger.info("Processing article created by user: %s", user_id)
            start_time = time.time()
            processing_result = get_new_article(article_text, article_id, article_creation_timestamp, user_id, language, article_cluster, summarized_text)
            if processing_result == 200:
                logger.info("Processed article and put to dynamo in :%s", time.time()-start_time)
                logger.info("Article_id: %s with cluster_id: %s saved in dynamo", article_id, article_cluster)
                return {
                    'statusCode': 200,
                    'body': "Data saved in Dynamo"
                }
            else:
                logger.warning('Article was not put in dynamo with dynamo response: %s', processing_result)
                return {
                    'statusCode': processing_result,
                    'body': f"Data not saved with code {processing_result}"
                }
        else:
            logger.warning('Article was not put in dynamo because of invalid parameters')
            return {
                'statusCode': processing_result,
                'body': f"Data not saved with code {processing_result}"
            }
    except Exception as e:
        logger.error("Error in adding new article to dynamo lambda: %s", str(e))
        raise