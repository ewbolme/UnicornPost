from .config import *

def one_to_one_recommendation(personalize_runtime,
                              personalize_campaign,
                              user_id,
                              use_genre_filter=False,
                              filter_arn='',
                              genre_filter_value=""):
    """
    This function obtaines recommended article ids for user

    args:
    personalize_runtime: A boto3 personalize runtime client
    personalize_campaign: An arn for user personalization one-to-one endpoint
    user_id (str): id of user logged in
    use_genre_filter (bool): specifies if genre filter is applied or not
    genre_filter_value (str): genre value if genre filter is applied
    filter_arn (str): arn of personalize for genre filter

    returns:
    recommendation (list): recommended article_id list 
    """
    try:
        logger.info('Generating one to one recommendations')
        if use_genre_filter:
            recommendation = personalize_runtime.get_recommendations(campaignArn = personalize_campaign, 
                                                                    userId = str(user_id),
                                                                    filterArn = filter_arn,
                                                                    numResults = 60,
                                                                    filterValues = {"GENRELIST": genre_filter_value},)
            
        else:
        
            recommendation = personalize_runtime.get_recommendations(campaignArn = personalize_campaign,
                                                                    numResults = 60,
                                                                    userId = str(user_id))        
            
            
        return recommendation['itemList']
    except Exception as e:
        logger.error("Error in generating recommendation via model: %s", str(e))
        raise