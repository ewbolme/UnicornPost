import boto3, logging, time, os, datetime

# This script is used to set configuration variables used in multiple files

logger = logging.getLogger()
logger.setLevel("INFO") # Set logging level to INFO

KINESISCLIENT = boto3.client('kinesis')
DYNAMOCLIENT = boto3.client('dynamodb')
PERSONALIZEEVENTCLIENT = boto3.client('personalize-events')

DYNAMO_CLUSTER_LOOKUP_TABLE = os.getenv('DYNAMO_CLUSTER_LOOKUP_TABLE')
DYNAMO_INTERACTION_TABLE = os.getenv('DYNAMO_INTERACTION_TABLE')

KINESISSTREAMNAME = os.getenv('KINESISSTREAMNAME')

ONETOONEEVENTTRACKER = os.getenv('ONETOONEEVENTTRACKER')
CLUSTEREVENTTRACKER = os.getenv('CLUSTEREVENTTRACKER')
DESIRED_ITEMS = int(os.getenv('DESIRED_ITEMS'))
        