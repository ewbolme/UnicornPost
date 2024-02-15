from .config import logger

def query_dynamo_user_affinity(cluster, dynamo_client, table_name):
    """
    This dynamo query returns user list that are interested in mentioned cluster
    
    args:
    cluster (str): a string representing the cluster in question which we want to obtain the list of interested users for
    dynamo_client: A boto3 dynamoDB client
    table_name (str): the table name of the dynamoDB table in which we store the information
    
    returns:
    List[str] a list of strings in which each string is a user identified by an amazon personalize user segmentation model as being potentially interested in the content in question 
    """
    try:
        arguments = {
            "TableName": table_name,
            "KeyConditionExpression": "articleClusterId = :V1 and articleId = :V2",
            "ExpressionAttributeValues": {
                ":V1": {"S": str(cluster)},
                ":V2": {"S": "USERAFFINITY"}
                                        }
        }
        response = dynamo_client.query(**arguments)
        return response['Items'][0]['users_list']['S'][2:-2].split("', '")
    except Exception as e:
        return logger.error("Error in querying user affinitys for cluster: %s", f"{cluster}, {str(e)}")