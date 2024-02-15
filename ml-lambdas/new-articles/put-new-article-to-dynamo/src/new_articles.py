from io import StringIO
from .model_embeddings import claude_hook_trigger
from .model_embeddings import generate_article_title
from .dynamo_query import *
from .config import *

def process_new_article(sample_text,
                        article_creation_timestamp,
                        item_id,
                        dynamo_client, 
                        language,
                        summarized_text, 
                        bedrock_client, 
                        article_cluster, 
                        dynamotable,
                        user_id):
    """
    This function generates article hook, trigger and title from given text.
    The method is focused in ingesting new article data to dynamo

    args:
    sample_text (str): user generated text
    article_creation_timestamp (str): timestamp at which the article was created
    item_id (str): id of the article
    dynamo_client: A boto3 dynamoDB client
    language (str): language of article text
    summarized_text (str): article text summary
    bedrock_client: A boto3 bedrock client 
    article_cluster (str): id of article cluser, the article belongs to
    dynamotable (str): the table name of the dynamoDB table in which we store the information
    user_id (str): id of user article created by

    returns:
    dynamo response code (int): dynamo response code
    """
    try:
        logger.info("Processing text with bedrock model")
        start_time = time.time()
        # Generating trigger, hook and title for the new article
        hook, trigger, genre = claude_hook_trigger(summarized_text, bedrock_client)
        title = generate_article_title(summarized_text, bedrock_client)
        logger.info("Title, hook and trigger acquired in: %s", time.time()- start_time)

        logger.info("putting article in dynamo")
        dynamo_start_time = time.time()
        response = put_article_in_dynamo(dynamo_table_name = dynamotable, dynamo_client = dynamo_client, article_cluster = str(article_cluster).split('.')[0],article_creation_timestamp = str(article_creation_timestamp),item_id = str(item_id), article_title=str(title), article_text = str(sample_text), article_summary = str(summarized_text),article_hook = str(hook), article_trigger = str(trigger), article_genre = str(genre),article_language = str(language),elligable_users = user_id)
        response_code = response['ResponseMetadata']['HTTPStatusCode']
        if response_code == 200:
            logger.info("Successfully put article in dynamo in: %s", time.time()- dynamo_start_time)
            logger.info('Data put in article: %s', {'article_cluster': str(article_cluster).split('.')[0], 'article_creation_timestamp': article_creation_timestamp, 'item_id': item_id, 'article_title': title, 'article_text': sample_text, 'article_summary': summarized_text, 'article_hook': hook, 'article_trigger': trigger,'article_genre': genre, 'article_language': language, 'elligable_users': user_id })
        
        return response_code
    except Exception as e:
        return logger.error("Error in processing new article text: %s", str(e))