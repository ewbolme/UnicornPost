import boto3, logging, time, os

# This script is used to set configuration variables used in multiple files

logger = logging.getLogger()
logger.setLevel("INFO") # Set logging level to INFO

KINESISCLIENT = boto3.client('kinesis')
KINESISSTREAMNAME = os.getenv('KINESISSTREAMNAME')