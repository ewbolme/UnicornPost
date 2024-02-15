import boto3, logging, time, os

# This script is used to set configuration variables used in multiple files

logger = logging.getLogger()
logger.setLevel("INFO") # Set logging level to INFO

DYNAMOCLIENT = boto3.client('dynamodb')
BEDROCKCLIENT = boto3.client('bedrock-runtime')

DYNAMO_MAIN_TABLE = os.getenv('DYNAMO_MAIN_TABLE')