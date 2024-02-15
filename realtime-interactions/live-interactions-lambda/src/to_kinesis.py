import json
from .config import *

def kinesis_validation():
    """
    This functions validates kinesis stream status

    returns:
    bool
    """
    try:
        response = KINESISCLIENT.describe_stream(StreamName=KINESISSTREAMNAME)

        if response['StreamDescription']['StreamStatus'] == 'ACTIVE':
            return True
        else:
            return False
    except Exception as e:
        return logger.error("Error in kinesis validation: %s", str(e))  

def kinesis_ingestion(kinesis_client,
                        kinesis_stream,
                        data,
                        user_id):
    """
    This functions ingests data into kinesis by put record

    args:
    kinesis_client: A boto3 kinesis client
    kinesis_stream (str): kinesis stream name to ingest to
    data (json): data to ingest in kinesis stream
    user_id (str): id of user logged in

    returns:
    kinesis response (dict): kinesis ingestion response
    """
    try:
        return kinesis_client.put_record(StreamName = kinesis_stream, Data=data, PartitionKey= user_id)
    except Exception as e:
        return logger.error("Error in put_record to kinesis: %s", str(e))
    

def put_data_to_kinesis(data):
    """
    This function is used to input parameters for put record

    args:
    data (dict): Data to input in kinesis stream

    returns:
    kinesis response (dict): kinesis ingestion response
    """
    try:
        logger.info('Ingesting interaction data in kinesis stream')
        user_id = data['user_id']
        response = kinesis_ingestion(kinesis_client= KINESISCLIENT,
                        kinesis_stream= KINESISSTREAMNAME,
                        data=json.dumps(data),
                        user_id= user_id)
        return response
    except Exception as e:
        return logger.error("Error in ingesting data to kinesis: %s", str(e))
