from .dynamo_helpers import query_dynamo_db_articles

def breaking_news_cluster_recommendation(personalize_runtime, 
                                         personalize_campaign, 
                                         user_id,
                                         dynamo_client, 
                                         table_name, 
                                         start_timestamp, 
                                         end_timestamp, 
                                         desired_item_count,
                                         max_per_cluster,
                                         dynamo_name_suffix,
                                         current_user):
    """
    
    """
    print("Getting recommendations from model")
    recommendation = personalize_runtime.get_recommendations(campaignArn = personalize_campaign, userId = user_id)
    print("Recommendation results from model",recommendation)
    item_count = 0
    item_list = []
    
    for cluster_number in recommendation['itemList']:
        cluster = cluster_number['itemId'] + dynamo_name_suffix #note this .0 to added in is somewhat tempermental and you may need to handle it differently depending on how you serialize your data
        dynamo_query_response = query_dynamo_db_articles(cluster, dynamo_client, table_name, start_timestamp, end_timestamp, current_user)
        count_per_cluster = 0
        for item in dynamo_query_response['Items']:
            count_per_cluster += 1
            item_list.append(item)
            item_count += 1
            if item_count == desired_item_count:
                break
            if count_per_cluster >= max_per_cluster:
                break
        
        if item_count == desired_item_count:
            break
        
    return item_list

def one_to_one_recommendation(personalize_runtime,
                              personalize_campaign,
                              user_id,
                              user_device_type,
                              use_genre_filter=False,
                              filter_arn="",
                              genre_filter_value=""):
    
    if use_genre_filter:
    
        recommendation = personalize_runtime.get_recommendations(campaignArn = personalize_campaign, 
                                                                 userId = str(user_id), 
                                                                 context = {'user_device_type':user_device_type},
                                                                 filterArn = filter_arn,
                                                                 filterValues = {"GENRELIST": genre_filter_value},)
        
    else:
    
        recommendation = personalize_runtime.get_recommendations(campaignArn = personalize_campaign, 
                                                                 userId = str(user_id), 
                                                                 context = {'user_device_type':user_device_type},
                                                                 metadataColumns = {"ITEMS": ['article_summary','article_genre','article_cluster']})        
        
    # return recommendation['itemList']    
    return recommendation