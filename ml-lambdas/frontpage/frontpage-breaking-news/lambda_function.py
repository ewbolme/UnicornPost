from src.config import logger, time
from src.breaking_news import get_breaking_news_recommandation
import json

def lambda_handler(event, context):
    event = event["body"]
    if type(event) == str:
        event = json.loads(event)
    logger.info("event: %s",event)
    try:
        user_id = event['user_id']
        max_per_cluster = event['max_per_cluster']
        logger.info("user id: %s",user_id)
        if user_id and max_per_cluster:
            logger.info("getting recommandation on user_id = %s", user_id)
            start_time = time.time()
            recommendation_result = get_breaking_news_recommandation(user_id,max_per_cluster)
            logger.info("recommandations results acquired in %s seconds", ((time.time()) - start_time))
            logger.info("Personalized breaking news results: %s", recommendation_result)
            return {
                'statusCode': 200,
                'body': recommendation_result
            }
        elif any(not value for value in [user_id, max_per_cluster]):
            missing_values = [key for key, value in {'user_id': user_id, 'max_per_cluster': max_per_cluster}.items() if not value]
            logger.warning('Invalid parameters for: %s', ', '.join(missing_values))
            return {
                'statusCode': 400,
                'body': f"Please provide proper value for: {', '.join(missing_values)}"
            }
        else:
            logger.warning('Breaking news was not fetched because of invalid parameters')
            return {
                'statusCode': 400,
                'body': "Invalid input parameters"
            }
    except Exception as e:
        logger.error("Error in breaking_news_cluster_recommendation lambda: %s", str(e))
        raise