from .record_interaction import *
from .config import *
from .dynamo_helpers import *

def record_interactions(user_id, article_id, timestamp, session_id, event_id):
    """
    This function records the data as event in models with input parameters

    args:
    user_id (str): a string representing the unique ID of an user logged in
    article_id (str): a string representing the unique ID of an article
    timestamp (str): a string of utc timestamp in which, event was recorded
    session_id (str): user session id
    event_id (str): id of the event recorded

    returns:
    one-to-one event status code (int): status code
    cluster event status code (int): status code
    """
    try:    
        logger.info('Recording interactions to event model')
        one_to_one_response, cluster_response =  record_interaction(personalize_event_client = PERSONALIZEEVENTCLIENT,
                                                                dynamo_client = DYNAMOCLIENT,
                                                                one_to_one_tracker = ONETOONEEVENTTRACKER,
                                                                cluster_tracker = CLUSTEREVENTTRACKER,
                                                                user_id = user_id,
                                                                session_id = session_id,
                                                                event_id = event_id,
                                                                article_id = article_id,
                                                                timestamp = timestamp,
                                                                cluster_lookup_table = DYNAMO_CLUSTER_LOOKUP_TABLE
                                                                )
        return one_to_one_response['ResponseMetadata']['HTTPStatusCode'], cluster_response['ResponseMetadata']['HTTPStatusCode']
    except Exception as e:
        return logger.error("Error in recording data with model parameters: %s", str(e))


def record_interactions_in_dynamo(interaction_timestamp, article_id, user_id):
    """
    This function records interactions in dynamo

    args:
    interaction_timestamp (str): the timestamp at which user interaction happened
    article_id (str): a string representing the unique ID of an article
    user_id (str): a string representing the unique ID of an user logged in

    returns:
    Dynamo response (dict): Dynamo ingestion response
    """
    try:
        logger.info('Looking up past interactions in dynamo table')
        response = lookup_interactions(dynamo_client=DYNAMOCLIENT, 
                                    user_id=user_id,
                                    table_name=DYNAMO_INTERACTION_TABLE)
        
        interactions = {}
        start_time = time.time()
        interaction_timestamp = str(convert_timestamp(interaction_timestamp))

        if response["Items"] != []:
            interactions = response["Items"][0]["articleInteractions"]["M"]

            # If user interaction response contains the same article user has interacted befor, it will update the timestamp
            if article_id in interactions.keys():
                logger.info('Article already present in lookup, updating timestamp')
                interactions[article_id]['N'] = interaction_timestamp
                logger.info('Updating latest interactions into dynamo table')
                dynamo_response = update_interactions_in_dynamo(DYNAMOCLIENT, user_id, DYNAMO_INTERACTION_TABLE, interactions)

            # If user interaction response does not contain article in event, it will remove oldest interaction and add latest
            else:
                logger.info('Article not present, updating new interactions')
                updated_interactions = dict(sorted(interactions.items(), key=lambda x: x[1]['N'], reverse=True))
                if len(interactions.keys()) == DESIRED_ITEMS:
                    updated_interactions.popitem()
                updated_interactions.setdefault(article_id, {})
                updated_interactions[article_id]['N'] = interaction_timestamp
                logger.info('Updating latest interactions into dynamo table')
                dynamo_response = put_article_in_dynamo(DYNAMO_INTERACTION_TABLE, DYNAMOCLIENT, updated_interactions, user_id)

        #  If user is not in table, a new record for the user is added to table
        else:
            logger.info('User not present in dynamo, adding interaction for new user')
            interactions.setdefault(article_id, {})
            interactions[article_id]['N'] = interaction_timestamp
            logger.info('Updating latest interactions into dynamo table')
            dynamo_response = put_article_in_dynamo(DYNAMO_INTERACTION_TABLE, DYNAMOCLIENT, interactions, user_id)

        logger.info('Total time to record interaction to lambda: %s', time.time()-start_time)
        return dynamo_response
    except Exception as e:
        return logger.error("Error in recording interaction in dynamo: %s", str(e))
    