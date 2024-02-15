from .dynamo_query import query_dynamo_db_articles
from .config import *
from .return_recommendations import one_to_one_recommendation

def get_one_to_one_news_recommandation(user_id, genre_filter_value = None,use_genre_filter=False):
    """
    This function obtains one to one user recommended articles for user

    args:
    user_id (str): id of user logged in
    genre_filter_value (str): genre value if genre filter is applied
    use_genre_filter (bool): specifies if genre filter is applied or not

    returns:
    recommendation (list): recommended articles list
    """
    try:
        logger.info("Getting news for you recommendation")
        start_time = time.time()
        recommendations = one_to_one_recommendation(personalize_runtime = PERSONALIZERUNTIMECLIENT, 
                                            personalize_campaign = USERPERSONALIZATIONONETOONEENDPOINT,
                                            user_id = user_id,
                                            filter_arn= GENREFILTERARN,
                                            use_genre_filter= use_genre_filter,
                                            genre_filter_value= genre_filter_value)
        # Returns articleId list recommendation
        logger.info("Recommendation time: %s seconds", time.time() - start_time)
        return_list = []

        logger.info("Getting recommendation news from dynamo")
        dynamo_start_time = time.time()
        # Querying article details per each articleid recommended
        for recommendation in recommendations:
            articleId = recommendation['itemId']
            query_result = query_dynamo_db_articles(DYNAMOCLIENT, DYNAMO_CLUSTER_LOOKUP_TABLE, articleId)
            return_list.extend(query_result['Items'])     
        logger.info("Dynamo return time: %s seconds", time.time() - dynamo_start_time) 

        return return_list
    except Exception as e:
        logger.error("Error in generating one to one recommendations: %s", str(e))
        raise

def add_quotes(input_string):
    """
    This function adds quotes to genre as required by model

    args:
    input_string (str): input string received

    returns:
    output_string (str): input string with quotes added required by model
    """
    return f'"{input_string}\"'


