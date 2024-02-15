from src.config import *
from src.record_all_interactions import record_interactions, record_interactions_in_dynamo
import json
import base64


def lambda_handler(event, context):
    for record in event['Records']:
        try:
            logger.info(f"Processed Kinesis Event - EventID: {record['eventID']}")
            record_data = base64.b64decode(record['kinesis']['data']).decode('utf-8')
            logger.info(f"Record Data: {record_data}")
            record_data = json.loads(record_data)
            user_id = record_data['user_id']
            article_id = record_data['article_id']
            interaction_timestamp = record_data['interaction_timestamp']
            session_id = record_data['session_id']
            event_id = record_data['event_id']
            one_to_one_response, cluster_response = record_interactions(user_id, article_id, interaction_timestamp, session_id, event_id)
            if all(res == 200 for res in (one_to_one_response, cluster_response)):
                logger.info('Event recorded in tracker: %s', event)
            else:
                logger.info('Event not recorded in tracker: %s', event)
            interaction_timestamp = str(interaction_timestamp)
            dynamo_response = record_interactions_in_dynamo(interaction_timestamp, article_id, user_id)
            if dynamo_response == 200:
                logger.info('Event recorded in dynamo: %s', event)
            else:
                logger.info('%s :Event not recorded in dynamo: %s', dynamo_response, event)

        except Exception as e:
            return logger.error("Error in record interactions lambda: %s", str(e))
    logger.info("Successfully processed %s records.", len(event['Records']))