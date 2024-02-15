from .config import *
from .return_recommendations import breaking_news_cluster_recommendation
from .templates import *

def get_breaking_news_recommandation(user_id, max_per_cluster, is_gen= False):
    """
    This function generates breaking news recommendation

    args:
    user_id (str): id of the user logged in
    max_per_cluster (int): diversity slider value put in by user
    is_gen (bool): GenAI applied or not by user (default False)

    returns:
    recommendation (list): recommended articles list
    """
    try:   
        logger.info('Generating news recommendation')
        recommendation = breaking_news_cluster_recommendation(
            personalize_runtime = PERSONALIZERUNTIMECLIENT, 
            personalize_campaign = USERPERSONALIZATIONCLUSTERENDPOINT,
            user_id = user_id,
            dynamo_client = DYNAMOCLIENT,
            table_name = DYNAMO_MAIN_TABLE,
            max_per_cluster = max_per_cluster,
            is_gen= is_gen
        )
        return recommendation
    except Exception as e:
        return logger.error("Error in variables in input breaking news cluster recommendation: %s", str(e)) 

def get_digest_entries(recommendation):
    """
    This function will generate digest entry for each recommended article

    args:
    recommendation (dict): recommendation entry received

    returns:
    digest entries (str): digest entry generated
    """
    try: 
        logger.info('Generating digest entry')
        digest_entries = f"""[{recommendation['articleTrigger']['S']}] {recommendation['articleHook']['S']}"""
        return digest_entries
    except Exception as e:
        return logger.error("Error in get digest entries: %s", str(e))
