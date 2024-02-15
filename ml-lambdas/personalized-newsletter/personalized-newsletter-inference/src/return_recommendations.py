from .dynamo_helpers import query_dynamo_db_articles, query_dynamo_db_articles_nonsummary
from .config import *

def breaking_news_cluster_recommendation(personalize_runtime, 
                                         personalize_campaign, 
                                         user_id,
                                         dynamo_client, 
                                         table_name,
                                         max_per_cluster,
                                         is_gen = False
                                         ):
    """
    This function will generate breaking news cluster recommendations to be received in personalized newsletter

    args:
    personalize_runtime: A boto3 personalize runtime client
    personalize_campaign: An arn for user personalization cluster endpoint
    user_id (str): id of the user logged in
    dynamo_client: A boto3 dynamoDB client
    table_name (str): the table name of the dynamoDB table in which we store the information
    max_per_cluster (int): diversity slider value put in by user
    is_gen (bool): is genAI applied or not by user (default False)

    returns:
    recommendation (list): recommended articles list
    """
    try:
        logger.info('Generating breaking news recommendation')
        recommendation = personalize_runtime.get_recommendations(campaignArn = personalize_campaign, userId = user_id)
        
        item_count = 0
        item_list = []
        logger.info('Retrieving articles from each cluster')
        for cluster_number in recommendation['itemList']:
            cluster = cluster_number['itemId']
            # The following block will get recommendation articles from dynamodb, in case of genai enabled, it will also retrieve summary
            if is_gen:
                dynamo_query_response = query_dynamo_db_articles(cluster, dynamo_client, table_name, user_id, max_per_cluster)
            else:
                dynamo_query_response = query_dynamo_db_articles_nonsummary(cluster, dynamo_client, table_name, user_id, max_per_cluster)
            for item in dynamo_query_response['Items']:
                item_list.append(item)
                item_count += 1
                if item_count == DESIRED_ITEMS:
                    break
            
            if item_count == DESIRED_ITEMS:
                break
            
        logger.info('Articles retrieved from dynamo')
        sorted_items = sorted(item_list, key=lambda x: x['articleCreationTimestamp']['N'], reverse=True)
        item_list = sorted_items[:DESIRED_ITEMS]

        return item_list
    except Exception as e:
        return logger.error("Error in generating custom claude prompt: %s", str(e))