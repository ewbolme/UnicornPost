from .config import *
from .return_recommendations import breaking_news_cluster_recommendation


def get_breaking_news_recommandation(user_id :str, max_per_cluster: int):
    """
    This function returns breaking news recommendation by calling the function with variables obtained

    args:
    user_id (str): id of the user logged in
    max_per_cluster (int): diversity slider value put in by user

    returns:
    recommendation (list): recommended articles list
    """
    try:
        logger.info('Generating recommendation articles')
        recommendation = breaking_news_cluster_recommendation(
            personalize_runtime = PERSONALIZERUNTIMECLIENT, 
            personalize_campaign = USERPERSONALIZATIONCLUSTERENDPOINT,
            user_id = user_id,
            dynamo_client = DYNAMOCLIENT,
            table_name = DYNAMO_MAIN_TABLE,
            max_per_cluster = max_per_cluster
        )
        return recommendation
    except Exception as e:
        return logger.error("Error in variables in input breaking news cluster recommendation: %s", str(e))


