from .config import *
from .dynamo_query import query_dynamo_db_articles, query_dynamo_db_interactions

def get_past_interactions(user_id):
    """
    This function obtains past 5 latest user interactions with distinct articles

    args:
    user_id (str): id of user logged in

    returns:
    article_list (list): List of past interacted articles
    """
    try:
        logger.info("Querying dynamo interactions for user: %s", user_id)
        start_time = time.time()

        # Getting user interacted article IDs
        results = query_dynamo_db_interactions(dynamo_client=DYNAMOCLIENT,
                                        table_name=DYNAMO_TABLE,
                                        current_id=user_id)
        logger.info("Dynamo return time: %s seconds", time.time() - start_time) 
        
        interactions = results["Items"][0]["articleInteractions"]["M"]
        logger.info("Querying dynamo lookup for articles fetched")

        updated_interactions = dict(sorted(interactions.items(), key=lambda x: x[1]['N'], reverse=True))

        article_list = []
        start_time = time.time()
        article_ids = list(updated_interactions.keys())[:min(len(updated_interactions.keys()), DESIRED_ITEMS)]

        # Querying article details per each article ID the user interacted with
        for article in article_ids:
            article_details = query_dynamo_db_articles(dynamo_client=DYNAMOCLIENT,
                                                    table_name= DYNAMO_CLUSTER_LOOKUP_TABLE,
                                                    itemId=article)
            article_list.extend(article_details['Items'])
        logger.info("Dynamo return time: %s seconds", time.time() - start_time) 
        return article_list
    
    except Exception as e:
        return logger.error("Error in querying past interactions via dynamo: %s", str(e))
        