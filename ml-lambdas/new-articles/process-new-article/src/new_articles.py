from .model_embeddings import translate_text, claude_summary, titan_embeddings
from .model_embeddings import cluster_from_embedding
from .dynamo_query import *
from .config import *

def process_new_article(sample_text,
                        dynamo_client, 
                        translate_client, 
                        sm_client, 
                        bedrock_client, 
                        kmeans_endpoint, 
                        dynamotable):
    """
    This function generates translation, summary and article cluster with embeddings from given text.
    The method is focused in generating interested user list as return

    args:
    sample_text (str): user generated text
    dynamo_client: A boto3 dynamoDB client
    translate_client: A boto3 translate client
    sm_client: A boto3 sagemaker client 
    bedrock_client: A boto3 bedrock client 
    kmeans_endpoint (str): kmeans endpoint name
    dynamotable (str): the table name of the dynamoDB table in which we store the information

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
        logger.info("Processing text with model")
        start_time = time.time()
        # Generating cluster from input text
        english_text, language = translate_text(sample_text, translate_client)
        validity, summarized_text = claude_summary(english_text, bedrock_client)
        # Validity is added to filter out any invalid input text by user, the lambda will abort further processing here
        if validity:
            embedding = titan_embeddings(summarized_text, bedrock_client)
            article_cluster = cluster_from_embedding(embedding, kmeans_endpoint, sm_client)
            logger.info("Model embeddings done and cluster id acquired in: %s", time.time()- start_time)

            logger.info("Getting user list based on cluster id")
            start_time = time.time()
            user_list = query_dynamo_user_affinity(str(int(float(article_cluster))), dynamo_client, dynamotable)[:10]
            logger.info("successfully returned user list in: %s", time.time()-start_time)
            
            return user_list, {"language": language, "summarized_text": summarized_text, "article_cluster": article_cluster}
        else:
            logger.warn('The input text is invalid, user list not retrieved')
            logger.info('Retrived article summary: %s', summarized_text)
            return  "Invalid text", "lambda not to be triggered"
    except Exception as e:
        return logger.error("Error in processing new article text: %s", str(e))