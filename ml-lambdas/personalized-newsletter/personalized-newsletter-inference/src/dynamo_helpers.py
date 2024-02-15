from .config import logger

def query_dynamo_db_articles(cluster, dynamo_client, table_name, current_id, max_per_cluster):
    """
    This function obtains the list of articles with the latest timestamps that are within an article cluster and elligable to be seen by the current user.
    
    args:
    cluster (str): a string representing the cluster in question which we want to obtain the list of intrested users for
    dynamo_client: A boto3 dynamoDB client
    table_name (str): the table name of the dynamoDB table in which we store the information
    current_id (str): id of current user for elligibility check
    max_per_cluster (int): a int value received from diversity slider that will define max articles to be fetched per cluster

    query args:
    PersonalizedGenAIIndex: Index created to fetch latest breaking news based on clusterId as partition key and articleCreationTimestamp as sort key, it will only return the projected exressions
    
    returns:
    a dynamo db query response
    """
    try:
        arguments = {
        "TableName": table_name,
        "IndexName" : "PersonalizedGenAIIndex",
        "ScanIndexForward": False,  # Set to False to get items in descending order of timestamp
        "KeyConditionExpression": "articleClusterId = :V1",
        "FilterExpression": 'elligableUsers IN (:V2, :V3)',
        "ExpressionAttributeValues": {
            ":V1": {"S": str(cluster)},
            ":V2": {"S": 'All'},
            ":V3": {"S": str(current_id)}
        },
        "Limit": max_per_cluster
        }
        return dynamo_client.query(**arguments)
    except Exception as e:
        return logger.error("Error in querying breaking news articles from cluster: %s", f"{cluster}, {str(e)}")

def query_dynamo_db_articles_nonsummary(cluster, dynamo_client, table_name, current_id, max_per_cluster):
    """
    This function obtains the list of articles with the latest timestamps that are within an article cluster and elligable to be seen by the current user.
    
    args:
    cluster (str): a string representing the cluster in question which we want to obtain the list of intrested users for
    dynamo_client: A boto3 dynamoDB client
    table_name (str): the table name of the dynamoDB table in which we store the information
    current_id (str): id of current user for elligibility check
    max_per_cluster (int): a int value received from diversity slider that will define max articles to be fetched per cluster

    query args:
    PersonalizedIndex: Index created to fetch latest breaking news based on clusterId as partition key and articleCreationTimestamp as sort key, it will only return the projected exressions (in this case, without article_summary)
    
    returns:
    a dynamo db query response
    """
    try:
        arguments = {
        "TableName": table_name,
        "IndexName" : "PersonalizedIndex",
        "ScanIndexForward": False,  # Set to False to get items in descending order of timestamp
        "KeyConditionExpression": "articleClusterId = :V1",
        "FilterExpression": 'elligableUsers IN (:V2, :V3)',
        "ExpressionAttributeValues": {
            ":V1": {"S": str(cluster)},
            ":V2": {"S": 'All'},
            ":V3": {"S": str(current_id)}
        },
        "Limit": max_per_cluster
        }
        return dynamo_client.query(**arguments)
    except Exception as e:
        return logger.error("Error in querying breaking news articles from cluster: %s", f"{cluster}, {str(e)}")