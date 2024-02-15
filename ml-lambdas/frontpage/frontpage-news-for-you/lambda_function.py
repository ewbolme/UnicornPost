from src.config import logger, time
from src.news_for_you import get_one_to_one_news_recommandation, add_quotes
import json


def lambda_handler(event, context):
    event = event["body"]
    if type(event) == str:
        event = json.loads(event)
    logger.info("event: %s",event)
    try:
        user_id = event['user_id']
        genre_filter_value = event['genre_filter_value']
        logger.info("getting personalized recommandations on user_id = %s", user_id)
        if user_id and genre_filter_value !='':
            genre_filter_value = f"{add_quotes(genre_filter_value)}"
            logger.info("genre filter used: %s",genre_filter_value)
            start_time = time.time()
            recommendation_result = get_one_to_one_news_recommandation(user_id,genre_filter_value,use_genre_filter= True)
            logger.info("Personalized recommandation result  acquired in :%s", time.time()-start_time)
            logger.info("Personalized news for you results: %s", recommendation_result)
            return {
                'statusCode': 200,
                'body': recommendation_result
            }
        elif user_id and genre_filter_value == '':
            logger.info("genre filter not used")
            start_time = time.time()
            recommendation_result = get_one_to_one_news_recommandation(user_id)
            logger.info("Personalized recommandation result  acquired in :%s", time.time()-start_time)
            logger.info("Personalized news for you results: %s", recommendation_result)
            return {
                'statusCode': 200,
                'body': recommendation_result
            }

        else:
            logger.warning('News for you was not fetched because of invalid parameters')
            return {
                'statusCode': 400,
                'body': "Please provide proper user_id and genre_filter_value"
            }
    except Exception as e:
        logger.error("Error in news-for-you lambda: %s", str(e))
        raise