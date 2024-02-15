import boto3, logging, time, os

# This script is used to set configuration variables used in multiple files

logger = logging.getLogger()
logger.setLevel("INFO") # Set logging level to INFO

TRANSLATECLIENT = boto3.client('translate')
SMCLIENT = boto3.client('runtime.sagemaker')
DYNAMOCLIENT = boto3.client('dynamodb')
BEDROCKCLIENT = boto3.client('bedrock-runtime')
S3CLIENT = boto3.client('s3')
LAMBDACLIENT = boto3.client('lambda')

DYNAMO_MAIN_TABLE = os.getenv('DYNAMO_MAIN_TABLE')
KMEANS_ENDPOINT_NAME = os.getenv('KMEANS_ENDPOINT_NAME')
LAMBDAFUNCTION = os.getenv('LAMBDAFUNCTION')