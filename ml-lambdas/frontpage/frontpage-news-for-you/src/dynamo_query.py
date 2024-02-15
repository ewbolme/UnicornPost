from .config import logger

def query_dynamo_db_articles(dynamo_client, table_name, itemId):
    """
    This function obtains the list of article details with the provided itemId
    
    args:
    itemId (str): a string representing the article in question which we want to obtain the details for
    dynamo_client: A boto3 dynamoDB client
    table_name (str): the table name of the dynamoDB table in which we store the information

    returns:
    a dynamo db query response
    """
    try:
        arguments = {
            "TableName": table_name,
            "KeyConditionExpression": "articleId = :V1",
            "ExpressionAttributeValues": {
                ":V1": {"S": str(itemId)}},
        }
        return dynamo_client.query(**arguments)
    except Exception as e:
        return logger.error("Error in querying lookup article details for article: %s", f"{itemId}, {str(e)}")