def put_article_in_dynamo(dynamo_table_name : str, 
                          dynamo_cluster_suffix : str,
                          dynamo_client,
                          article_cluster: str,
                          article_creation_timestamp: str,
                          item_id : str, 
                          article_text : str, 
                          article_title : str,  
                          article_summary : str,
                          article_hook : str, 
                          article_trigger : str, 
                          article_genre : str,
                          article_language : str,
                          elligable_users : str):

    dynamo_response = dynamo_client.put_item(TableName=dynamo_table_name, 
                                        Item={
                                            'articleClusterId':{'S': article_cluster + dynamo_cluster_suffix},
                                            'articleCreationTimestamp':{'N': article_creation_timestamp},
                                            'articleId' :{'S': item_id},
                                            'articleText': {'S': article_text},
                                            'articleTitle' : {'S': article_title},  
                                            'articleSummary': {'S': article_summary},
                                            'articleHook': {'S': article_hook},
                                            'articleTrigger': {'S': article_trigger},
                                            'articleGenre': {'S': article_genre},
                                            'articleLanguage': {'S': article_language},
                                            'elligableUsers': {'S': elligable_users}
                                        })