import re
from .config import *
from .prompts import *

def send_template_based_digest(customer_name,
                               digest_entries):
    """
    This function will return user personalized newletter based on digest entries received via recommendations with following template

    args:
    customer_name (str): name of user logged in
    digest_entries (list): list of digest entries of recommended articles

    returns:
    personalized digest (str): personalized digest generated
    """
    try:
        logger.info('Generating template based digest from digest entries')
        personalized_digest = f"""Dear {customer_name},

        Here are the top stories for you this morning: 

        {digest_entries}
        For more breaking news visit [www.unicornpost.com](www.unicornpost.com).
        
        Sincerely,
            
        The UnicornPost Team"""

        return personalized_digest
    except Exception as e:
        return logger.error("Error in generating template based digest: %s", str(e))


def send_one_to_one_email(recommendation, customer_name, bedrock_client, prompts):
    """
    This function will generate personalized newsletter email from user generated prompts with following template
    This function needs the prompts to be wriiten in certain way (inside tags), and if the prompts written are invalid, it will trigger conditions to use default prompts

    args:
    recommendation (list): list of dict entries of recommended articles
    customer_name (str): name of user logged in
    bedrock_client: A boto3 bedrock client
    prompts (str): Gen AI prompts received from user

    returns:
    response (str): claude generated response based on prompt generated
    """
    try:
        defaultprompts= {
            'example': 'Dear insert name here,\n\n                Here are the top stories for you this morning:\n\n                - [Agile practices promote sustainable development]. Agile teams focus on delivering value to customers through continuous delivery of working software. They welcome changing requirements and get constant feedback to adjust the project. However, agile isn\'t just about software - it\'s also about team culture and sustainable pace. \n\n                - [How to write compelling headlines and introductions]. A strong headline and intro can boost conversions by 30% or more. Use these techniques from experts like Brian Dean and Joseph Sugarman: message matching, billboard headlines, asking a question, using "How to" and more.\n\n                - [Leveraging MQTT and Google Cloud for IoT]. Agosto built an open-source MQTT broker to integrate messaging between devices and Google Cloud Pub/Sub. It supports thousands of messages per minute. Check it out on GitHub if you\'re building an IoT app.\n\n                - [Having kids destroyed my Hollywood career, but improved my life]. After becoming a new dad, director Travis Chambers struggled with long hours and lack of work-life balance in Hollywood. He started his own agency which allowed him to still earn income but also spend more time with family. \n\n                - [Learn to build a chatbot with SitePoint\'s new Mini Course]. SitePoint just launched a 1-hour mini course on building a movie recommendation chatbot with Microsoft Bot Framework. It covers NLP, testing, message formatting and more. \n\n                For more breaking news, visit [www.unicornpost.com](www.unicornpost.com).\n\n                Sincerely,\n\n                The UnicornPost Team\n                ',
            'article': "article['articleSummary']['S']",
            'instructions': "Pretend you are an editor with 10 years of experience at a major news corporation. Write a morning digest email of the breaking news articles listed in the <article></article> XML tags above and provide the same kind of information for all the articles you receive to email to customers to read when they wake up in the morning and it should be concise and conclude within 1000-1200 words. Address it to the individual customer (in this case {customer_name}). End with 'for more breaking news visit [www.unicornpost.com](www.unicornpost.com).  \n\nSincerely,  \nThe UnicornPost Team'  See an example between the <example></example> XML tags."
        }
        article_list = []
        #  If the provided prompt is valid, following part will be run, if it is not the default prompt will be considered
        try:
            logger.info('Generating one to one email')
            prompt = get_prompts(prompts)
            if any(value == '' for value in prompt.values()):
                for key, value in prompt.items():
                    if value == '':
                        prompt[key] = defaultprompts.get(key)
                        logger.warn("Invalid prompt, using default prompt for %s", key)
                
            instuctions = re.sub('{customer_name}', customer_name, prompt['instructions'])

            for i in range(0, DESIRED_ITEMS):
                article = recommendation[i]
                article_ = prompt['article']
                article_ = f"{article}[{article_.split('article[')[1]}"
                article_trigger = article['articleTrigger']['S']
                article_id = article['articleId']['S']
                article_cluster_id=article['articleClusterId']['S']
                value = {'article_trigger': article_trigger,
                        'article_id': article_id,
                        'article_cluster_id': article_cluster_id
                }
                article_list.append(value)

                if i == 0:
                        claude_prompt = f"""\n\nHuman: <example> {prompt['example']}
                        </example>

                        <article>{article_}</article>"""
                else:
                    claude_prompt += f"\n\n<article>{article_}</article>"

            claude_prompt += f"""\n\n <instructions>{instuctions}</instructions>  \n\nAssistant:"""

            return claude_custom_prompt(bedrock_client, claude_prompt), article_list
        except:
            logger.warn("Applying default prompts as the prompts provided are invalid")
            for i in range(0, DESIRED_ITEMS):
                article = recommendation[i]
                article_trigger = article['articleTrigger']['S']
                article_id = article['articleId']['S']
                article_cluster_id=article['articleClusterId']['S']
                value = {'article_trigger': article_trigger,
                        'article_id': article_id,
                        'article_cluster_id': article_cluster_id
                }
                article_list.append(value)
                if i == 0:
                        claude_prompt = f"""\n\nHuman: <example>Dear insert name here,

                        Here are the top stories for you this morning:

                        - [Agile practices promote sustainable development]. Agile teams focus on delivering value to customers through continuous delivery of working software. They welcome changing requirements and get constant feedback to adjust the project. However, agile isn't just about software - it's also about team culture and sustainable pace. 

                        - [How to write compelling headlines and introductions]. A strong headline and intro can boost conversions by 30% or more. Use these techniques from experts like Brian Dean and Joseph Sugarman: message matching, billboard headlines, asking a question, using "How to" and more.

                        - [Leveraging MQTT and Google Cloud for IoT]. Agosto built an open-source MQTT broker to integrate messaging between devices and Google Cloud Pub/Sub. It supports thousands of messages per minute. Check it out on GitHub if you're building an IoT app.

                        - [Having kids destroyed my Hollywood career, but improved my life]. After becoming a new dad, director Travis Chambers struggled with long hours and lack of work-life balance in Hollywood. He started his own agency which allowed him to still earn income but also spend more time with family. 

                        - [Learn to build a chatbot with SitePoint's new Mini Course]. SitePoint just launched a 1-hour mini course on building a movie recommendation chatbot with Microsoft Bot Framework. It covers NLP, testing, message formatting and more. 

                        For more breaking news, visit [www.unicornpost.com](www.unicornpost.com).

                        Sincerely,\n
                        The UnicornPost Team
                        </example>


                        <article>{article['articleSummary']['S']}</article>"""
                else:
                    claude_prompt += f"\n\n<article>{article['articleSummary']['S']}</article>"

            claude_prompt += f"""\n\n <instructions>Pretend you are an editor with 10 years of experience at a major news corporation. Write a morning digest email of the breaking news articles listed in the <article></article> XML tags above and provide the same kind of information for all the articles you receive to email to customers to read when they wake up in the morning and it should be concise. Address it to the individual customer (in this case {customer_name}). End with 'for more breaking news visit [www.unicornpost.com](www.unicornpost.com).  \n\nSincerely,  \nThe UnicornPost Team'  See an example between the <example></example> XML tags.</instructions>  \n\nAssistant:""" 
            
            return claude_custom_prompt(bedrock_client, claude_prompt), article_list
    except Exception as e:
        return logger.error("Error in generating one to one email: %s", str(e))