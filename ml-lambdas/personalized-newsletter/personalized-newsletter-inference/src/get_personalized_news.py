from .recommended_digest import get_breaking_news_recommandation, get_digest_entries
from .templates import send_one_to_one_email, send_template_based_digest
from .config import *

def get_personalized_newsletter(user_id, 
                                max_per_cluster, 
                                user_name,
                                prompts = None,
                                bedrock_client= BEDROCKCLIENT,
                                is_gen= False):
    """
    This function will generate personalized newsletter for the received input payload

    args:
    user_id (str): id of user logged in
    max_per_cluster (int): diversity slider value put in by user
    user_name (str): name of user logged in
    prompts (str): Gen AI prompts received from user (default None)
    bedrock_client: A boto3 bedrock client
    is_gen (bool): Then GenAI filter is applied or not by user (default False)

    returns:
    response (dict): dict containing key email and article properties
    """
    try:
        logger.info('Generating recommendations')
        start_time = time.time()
        recommendation_result = get_breaking_news_recommandation(user_id, max_per_cluster, is_gen)
        logger.info('Recommendation results acquired in: %s', time.time()-start_time)

        if is_gen:
            logger.info('Generating personalized email with GenAI model')
            email, list = send_one_to_one_email(recommendation_result, user_name, bedrock_client, prompts)
            logger.info('Personalized email generated')
            return {"email": email, "articles": list}
        
        else:
            logger.info('Generating personalized digest')
            article_list = []
            full_digest = ''
            # Recommendation digest will be created by adding each recommended article to a string
            for recommendation in recommendation_result:
                value = {'article_trigger': recommendation['articleTrigger']['S'],
                        'article_id': recommendation['articleId']['S'],
                        'article_cluster_id': recommendation['articleClusterId']['S']
                }
                article_list.append(value)
                digest = get_digest_entries(recommendation)
                full_digest += f'- {digest}\n\n'

            logger.info('Digest entries aquired')
            return_digest = send_template_based_digest(user_name, full_digest)
            logger.info('Personalized digest generated')
            return {"email": return_digest, "articles": article_list}
        
    except Exception as e:
        return logger.error("Error in generating personalized newsletter: %s", str(e))
        
    
        
