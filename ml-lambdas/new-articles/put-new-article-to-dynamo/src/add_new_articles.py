from .config import *
from .new_articles import process_new_article

def get_new_article(article_text, item_id, article_creation_timestamp, user_id, language, article_cluster, summarized_text):
    logger.info("Processing new article")
    """
    This function returns dynamo ingestion result

    args:
    article_text (str): text of article read from s3 file
    item_id (str): id of the article
    article_creation_timestamp (str): timestamp at which the article was created
    user_id (str): id of user article created by
    language (str): language of article text
    article_cluster (str): id of article cluser, the article belongs to
    summarized_text (str): article text summary

    returns:
    dynamo response code (int): dynamo response code
    """
    try:
        response = process_new_article(sample_text = article_text,
                                                                    article_creation_timestamp  = article_creation_timestamp,
                                                                    item_id = item_id, #in the demo this will need to be generated
                                                                    dynamo_client = DYNAMOCLIENT,
                                                                    language= language,
                                                                    summarized_text = summarized_text,
                                                                    bedrock_client = BEDROCKCLIENT, 
                                                                    article_cluster = article_cluster,
                                                                    dynamotable = DYNAMO_MAIN_TABLE,
                                                                    user_id= user_id)
        return response
    except Exception as e:
        return logger.error("Error in parameters for processing new article for dynamo: %s", str(e))