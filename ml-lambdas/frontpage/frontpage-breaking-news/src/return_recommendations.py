from .dynamo_helpers import *
from .config import *

def breaking_news_cluster_recommendation(personalize_runtime, 
                                         personalize_campaign, 
                                         user_id,
                                         dynamo_client, 
                                         table_name,
                                         max_per_cluster
                                         ):
    """
    This function returns breaking news recommendation based on cluster recommendation received from personalize runtime

    args:
    personalize_runtime: A boto3 personalize runtime client
    personalize_campaign: An arn for user personalization cluster endpoint
    user_id (str): id of the user logged in
    max_per_cluster (int): diversity slider value put in by user
    dynamo_client: A boto3 dynamoDB client
    table_name (str): the table name of the dynamoDB table in which we store the information

    returns:
    recommendation (list): recommended articles list
    """
    try:
        logger.info('Generating breaking news recommendation clusters')
        start_time = time.time()

        recommendation_start_time = time.time()
        recommendation = personalize_runtime.get_recommendations(campaignArn=personalize_campaign, userId=user_id)   # Returns recommended clusterId list
        logger.info("Recommendation time: %s seconds", time.time() - recommendation_start_time)
    
        item_count = 0
        item_list = []
        
        logger.info("Getting recommendation news for each cluster from dynamo")
        dynamo_start_time = time.time()
       
        # Following snippet for getting max_per_cluster number of articles from each cluster recommended till it reaches the desired_items value defined(20)
        for cluster_number in recommendation['itemList']:
            cluster = cluster_number['itemId']
            dynamo_query_response = query_dynamo_db_articles(cluster, dynamo_client, table_name, user_id, max_per_cluster)
            for item in dynamo_query_response['Items']:
                item_list.append(item)
                item_count += 1
                
                if item_count == DESIRED_ITEMS:
                    break
            
            if item_count == DESIRED_ITEMS:
                    break
        logger.info('Fetched articles from dynamo in: %s', time.time()-dynamo_start_time)
        
        total_elapsed_time = time.time() - start_time
        logger.info(f"Total execution time: %s seconds", total_elapsed_time)
            
        logger.info("Total items fetched: %s", item_count)
        sorted_items = sorted(item_list, key=lambda x: x['articleCreationTimestamp']['N'], reverse=True)
            
        return sorted_items
    except Exception as e:
        return logger.error("Error in breaking news cluster recommendation: %s", str(e))