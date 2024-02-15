from .dynamo_helpers import lookup_article_cluster

def record_interaction(personalize_event_client,
                       dynamo_client,
                       one_to_one_tracker,
                       cluster_tracker,
                       user_id,
                       session_id,
                       event_id,
                       article_id,
                       timestamp,
                       cluster_lookup_table,
                       dynamo_name_suffix):
    
    """
    
    """
    
    # add the interaction with the article to the one to one dataset group
    one_to_one_response = personalize_event_client.put_events(
        trackingId=one_to_one_tracker,
        userId=user_id,
        sessionId=session_id,
        eventList=[
            {
                'eventId': event_id,
                'eventType': 'doesnothing',
                'itemId': article_id, # in this case the item ID is the unique articleId
                'sentAt': timestamp,
            },
        ]
    )
    
    # lookup the articles cluster
    dynamo_response = lookup_article_cluster(dynamo_client, article_id, cluster_lookup_table)
    article_cluster_id = dynamo_response['Items'][0]['articleClusterId']['S']
    
    # add the interaction with the article to the cluster dataset group
    cluster_response = personalize_event_client.put_events(
        trackingId=cluster_tracker,
        userId=user_id,
        sessionId=session_id,
        eventList=[
            {
                'eventId': event_id,
                'eventType': 'doesnothing',
                'itemId': str(int(float(article_cluster_id))) + dynamo_name_suffix,  # in this case the item ID is the articleClusterId - note the wierdness with the suffix and the str / int / float conversion should be fixable
                'sentAt': timestamp
            },
        ]
    )
    return one_to_one_response, cluster_response