def put_userlist_in_dynamo(dynamo_table_name : str, 
                           dynamo_cluster_suffix : str,
                           article_cluster: str,
                           userList):
    """
    This places the user affinity list into a dynamo for later retreval
    
    args:
    dynamo_table_name (str): the name of a table which contains the various articles assigned to various article clusters
    dynamo_cluster_suffix (str): a name to append to the cluster numbers to facilitate easier 
    article_cluster (str): the cluster which the list of identified users is intrested in
    userList (List[str]): a list of users intrested in a type of article as identified by an Amazon Personalize User Segementation model
    """
    dynamo_response = DYNAMOCLIENT.put_item(TableName=dynamo_table_name, 
                                    Item={
                                        'articleClusterId':{'S': article_cluster + dynamo_cluster_suffix},
                                        'articleCreationTimestamp':{'N': str(1)},
                                        'articleId' :{'S': str('USERAFFINITY')},
                                        'users_list': {'S': str(userList)}
                                    })
    return dynamo_response

def query_dynamo_user_affinity(cluster, dynamo_client, table_name):
    """
    Note for the purposes below there is no timestamp filter - there likely would be one in production - alternatively one could use a time to     life value for breakingnews articles and have the articles get automatically deleted from dynamo after a certain period - A production         system very likely would include both
    
    args:
    cluster (str or int): a string or an integer representing the cluster in question which we want to obtain the list of intrested users for
    dynamo_client: A boto3 dynamoDB client
    table_name (str): the table name of the dynamoDB table in which we store the inforamtion
    
    returns:
    List[str] a list of strings in which each string is a user identified by an amazon personalize user segmentation model as being potentially     intrested in the content in question 
    """
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

def query_dynamo_db_articles(cluster, dynamo_client, table_name, start_timestamp, end_timestamp, current_user):
    """
    This function obtains the list of articles between the provided timestamps that are within an article cluster and elligable to be seen by       the current user. Note the timeframe windows probably are not needed for the demo
    
    args:
    cluster (str or int): a string or an integer representing the cluster in question which we want to obtain the list of intrested users for
    dynamo_client: A boto3 dynamoDB client
    table_name (str): the table name of the dynamoDB table in which we store the inforamtion
    start_timestamp (int): a unix epoch time (in seconds) representing the start of the elligable window for news articles
    end_timestamp (int): a unix epoch time (in seconds) representing the end of the elligable window for news articles 
    """
    arguments = {
        "TableName": table_name,
        "KeyConditionExpression": "articleClusterId = :V1",
        "FilterExpression": 'articleCreationTimestamp BETWEEN :V2 AND :V3 AND elligableUsers IN (:V4, :V5)',
        "ExpressionAttributeValues": {
            ":V1": {"S": str(cluster)},
            ":V2": {"N": str(start_timestamp)},
            ":V3": {"N": str(end_timestamp)},
            ":V4": {"S": 'All'},   
            ":V5": {"S": str(current_user)},
                                     },
    }
    return dynamo_client.query(**arguments)

def lookup_article_cluster(dynamo_client, article_id, cluster_lookup_table):
    """
    lookups the cluster membership of an article which exists in the system
    
    args:
    dynamo_client: a dynamo db client
    article_id (str): a string representing the unique ID of an article
    cluster_lookup_table (str): the name of the table which includes the articleId to articleClusterId lookup
    
    returns:
    a dynamo db query response
    """
    arguments = {
    "TableName": cluster_lookup_table,
    "KeyConditionExpression": "articleId = :V1",
    "ExpressionAttributeValues": {
        ":V1": {"S": str(article_id)},
        },
    }
    return dynamo_client.query(**arguments)