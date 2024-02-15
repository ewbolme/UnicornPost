from .config import logger

def put_article_in_dynamo(dynamo_table_name : str,
                          dynamo_client,
                          article_cluster: str,
                          article_creation_timestamp: str,
                          item_id : str, 
                          article_title: str,
                          article_text : str, 
                          article_summary : str,
                          article_hook : str, 
                          article_trigger : str, 
                          article_genre : str,
                          article_language : str,
                          elligable_users : str):
    """
    This dynamo function ingests a given record in a given dynamo table

    returns:
    Dynamo response (dict): response of dynamo ingestion
    """
    try:
        dynamo_response = dynamo_client.put_item(TableName=dynamo_table_name, 
                                            Item={
                                                'articleClusterId':{'S': article_cluster},
                                                'articleCreationTimestamp':{'N': article_creation_timestamp},
                                                'articleId' :{'S': item_id},
                                                'articleTitle':{'S': article_title},
                                                'articleText': {'S': article_text},
                                                'articleSummary': {'S': article_summary},
                                                'articleHook': {'S': article_hook},
                                                'articleTrigger': {'S': article_trigger},
                                                'articleGenre': {'S': article_genre},
                                                'articleLanguage': {'S': article_language},
                                                'elligableUsers': {'S': elligable_users}
                                            })
        return dynamo_response
    except Exception as e:
        return logger.error("Error in put article in dynamo: %s", str(e))