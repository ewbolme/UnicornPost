from .dynamo_helpers import lookup_article_cluster
from .config import *

# The following script is added for timestamp conversion to match event tracker and dyanmo
def convert_timestamp(timestamp):
    try:
        datetime_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        dt_object = datetime.datetime.strptime(timestamp, datetime_format)
        unix_timestamp = int(dt_object.timestamp())
        return unix_timestamp
    except Exception as e:
        return logger.error("Error in converting timestamp: %s", str(e))
    
def record_interaction(personalize_event_client,
                       dynamo_client,
                       one_to_one_tracker,
                       cluster_tracker,
                       user_id,
                       session_id,
                       event_id,
                       article_id,
                       timestamp,
                       cluster_lookup_table):
    
    """
    This function records user interaction data into event trackers to train personalization models on latest data

    args:
    user_id (str): a string representing the unique ID of an user logged in
    article_id (str): a string representing the unique ID of an article
    timestamp (str): a string of utc timestamp in which, event was recorded
    session_id (str): user session id
    event_id (str): id of the event recorded

    returns:
    one-to-one tracker response (Dict): one-to-one tracker ingestion response
    cluster tracker response (Dict): cluster tracker ingestion response
    """
    try:
        logger.info('Generating one to one response')
        start_time = time.time()
        unix_timestamp = convert_timestamp(timestamp)
        # add the interaction with the article to the one to one dataset group
        one_to_one_response = personalize_event_client.put_events(
            trackingId=one_to_one_tracker,
            userId=user_id,
            sessionId=session_id,
            eventList=[
                {
                    'eventId': event_id,
                    'eventType': 'VIEW',
                    'itemId': article_id, # in this case the item ID is the unique articleId
                    'sentAt': unix_timestamp,
                },
            ]
        )
        logger.info('Event recorded in one to one event tracker: %s', one_to_one_response)
        logger.info('one to one response generated in: %s', time.time()-start_time)
        
        # lookup the articles cluster
        logger.info('Looking up article cluster')
        dynamo_start_time = time.time()
        dynamo_response = lookup_article_cluster(dynamo_client, article_id, cluster_lookup_table)
        logger.info('Dynamo query completed in: %s', time.time()-dynamo_start_time)
        article_cluster_id = dynamo_response['Items'][0]['articleClusterId']['S']
        
        logger.info('Extracted cluster id: %s', article_cluster_id)
        # add the interaction with the article to the cluster dataset group
        logger.info('Generating cluster response')
        start_time = time.time()
        cluster_response = personalize_event_client.put_events(
            trackingId=cluster_tracker,
            userId=user_id,
            sessionId=session_id,
            eventList=[
                {
                    'eventId': event_id,
                    'eventType': 'VIEW',
                    'itemId': str(int(float(article_cluster_id))),
                    'sentAt': unix_timestamp
                },
            ]
        )
        logger.info('Event recorded in cluster event tracker: %s', cluster_response)
        logger.info('Cluster response generated in: %s', time.time()-start_time)
        return one_to_one_response, cluster_response
    except Exception as e:
        return logger.error("Error in recording interaction in event tracker: %s", str(e))