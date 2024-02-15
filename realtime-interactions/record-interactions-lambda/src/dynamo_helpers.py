from .config import logger

def lookup_article_cluster(dynamo_client, article_id, table_name):
    """
    lookups the cluster membership of an article which exists in the system
    
    args:
    dynamo_client: a boto3 dynamo db client
    article_id (str): a string representing the unique ID of an article
    table_name (str): the name of the table which includes the articleId to articleClusterId lookup

    query args:
    ClusterLookupIndex: Index created to fetch cluster id of given article
    
    returns:
    a dynamo db query response
    """
    try:
        arguments = {
        "TableName": table_name,
        "IndexName" : "ClusterLookupIndex",
        "KeyConditionExpression": "articleId = :V1",
        "ExpressionAttributeValues": {
            ":V1": {"S": str(article_id)},
            },
        }
        return dynamo_client.query(**arguments)
    except Exception as e:
        return logger.error("Error in querying lookup article details for article: %s", f"{article_id}, {str(e)}")

def lookup_interactions(dynamo_client, user_id, table_name):
    """
    lookups the cluster membership of an article which exists in the system
    
    args:
    dynamo_client: a boto3 dynamo db client
    user_id (str): a string representing the unique ID of an user logged in
    table_name (str): the name of the dynamo table to qury from

    query args:
    InteractionsLookupIndex: Index created to fetch article interactions from table
    
    returns:
    a dynamo db query response
    """
    try:
        arguments = {
        "TableName": table_name,
        "IndexName" : "InteractionsLookupIndex",
        "KeyConditionExpression": "userId = :V1",
        "ExpressionAttributeValues": {
            ":V1": {"S": str(user_id)},
            },
        }
        return dynamo_client.query(**arguments)
    except Exception as e:
        return logger.error("Error in querying lookup interactions for user: %s", f"{user_id}, {str(e)}")

def update_interactions_in_dynamo(dynamo_client, user_id, table_name, interactions):
    """
    This dynamo function updates user interactions in dynamo

    args:
    dynamo_client: a boto3 dynamo db client
    user_id (str): a string representing the unique ID of an user logged in
    interactions (dict): records of user interations to update to
    """
    try:
        response = dynamo_client.update_item(
                    TableName=table_name,
                    Key={
                        'userId': {'S': user_id}
                    },
                    UpdateExpression='SET articleInteractions = :V1',
                    ExpressionAttributeValues={
                        ':V1': {'M': interactions}
                    }
                )
        return response['ResponseMetadata']['HTTPStatusCode']
    except Exception as e:
        return logger.error("Error in updating interactions for user: %s", f"{user_id}, {str(e)}")

def put_article_in_dynamo(dynamo_table_name : str, 
                          dynamo_client,
                          interactions: dict,
                          user_id: str):
    """
    This dynamo function ingests a new record in a given dynamo table 
    """
    try:
        dynamo_response = dynamo_client.put_item(TableName=dynamo_table_name, 
                                            Item={
                                                'userId':{'S': user_id},
                                                'articleInteractions' :{'M': interactions}
                                            })
        return dynamo_response['ResponseMetadata']['HTTPStatusCode']
    except Exception as e:
        return logger.error("Error in put article in dynamo: %s", str(e))

