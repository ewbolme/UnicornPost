import boto3, logging, time, os

# This script is used to set configuration variables used in multiple files

logger = logging.getLogger()
logger.setLevel("INFO") # Set logging level to INFO

DYNAMOCLIENT = boto3.client('dynamodb')

DYNAMO_TABLE = os.getenv('DYNAMO_INTERACTION_TABLE')
DYNAMO_CLUSTER_LOOKUP_TABLE = os.getenv('DYNAMO_CLUSTER_LOOKUP_TABLE')
DESIRED_ITEMS = int(os.getenv('DESIRED_ITEMS'))