from .config import *
from .new_articles import process_new_article
import json

def get_new_article(article_text):
    """
    This function returns article processing results

    args:
    article_text (str): text of article read from s3 file

    returns:
    if valid:
        (tuple): (
        user_list (list): list of interested users
        articles_dict (dict): dict representing the article properties
        )
    else:
        (tuple): (
        (str):"Invalid text"
        (str):"lambda not to be triggered"
        )
    """
    try:
        logger.info("Processing new article")
        result, data = process_new_article(sample_text = article_text,
                                                                    dynamo_client = DYNAMOCLIENT, 
                                                                    translate_client = TRANSLATECLIENT, 
                                                                    sm_client = SMCLIENT, 
                                                                    bedrock_client = BEDROCKCLIENT, 
                                                                    kmeans_endpoint = KMEANS_ENDPOINT_NAME, 
                                                                    dynamotable = DYNAMO_MAIN_TABLE)
        return result, data
    except Exception as e:
        return logger.error("Error in parameters for processing new article: %s", str(e))

def process_article(path):
    """
    This function returns article processing results after extracting the article data from path

    args:
    path (str): path of article stored in s3 bucket

    returns:
    if valid:
        (tuple): (
        user_list (list): list of interested users
        articles_dict (dict): dict representing the article properties
        )
    else:
        (tuple): (
        (str):"Invalid text"
        (str):"lambda not to be triggered"
        )
    """
    try:
        bucket, key = path.replace('s3://', '').split('/', 1)
        response = S3CLIENT.get_object(Bucket=bucket, Key=key)
        file_content = response['Body'].read().decode('utf-8')
        logger.info("File content read")
        
        article_id = key.split('/')[-1].split('.')[0].split('-')[0]
        timestamp = key.split('/')[-1].split('.')[0].split('-')[1]
        user_id = key.split('/')[-3]
        logger.info("article obtained: %s", article_id)
        logger.info("timestamp obtained: %s", timestamp)
        logger.info("user obtained: %s", user_id)

        list, result = get_new_article(file_content)
        if list != "Invalid text":
            # The article list will be appended with the following properties that will be ingested in Dynamo
            result['article_text'] = file_content
            result['article_id'] = article_id
            result['timestamp'] = timestamp
            result['user_id'] = user_id
 
        return list, result
    except Exception as e:
        return logger.error("Error in reading path: %s", str(e))
    
def publish_to_lambda(processing_result):
    """
    This function will send the new article processing data to another lambda, that will send it to dynamo

    args:
    processing_result (dict): results of new article processing

    returns:
    lambda response (dict): response of lambda invocation
    """
    try:
        logger.info("Sending new article data to new articles to dynamo")
        response = LAMBDACLIENT.invoke(
            FunctionName= LAMBDAFUNCTION,
            InvocationType='Event',
            Payload=json.dumps(processing_result)
        )
        return response
    except Exception as e:
        return logger.error("Error in triggering lambda: %s", str(e))