import json, re
from .config import logger

def claude_custom_prompt(bedrock_client, claude_prompt) -> str:
    """
    This function will generate result from a given prompt via a claude custom model

    args:
    bedrock_client: A boto3 bedrock client
    claude_prompt (str): prompts received to generate result on

    returns:
    response (str): claude generated response
    """
    try:
        logger.info('Generating claude custom prompt')
        prompt = claude_prompt
        
        body = json.dumps({
            "prompt": prompt,
            "temperature":0.0,
            "top_p":0.5,
            "stop_sequences":['\n\nHuman:'],
            "max_tokens_to_sample": 500
        })

        model_id = 'anthropic.claude-v2'
        accept = 'application/json' 
        content_type = 'application/json'

        response = bedrock_client.invoke_model(
            body=body, 
            modelId=model_id, 
            accept=accept, 
            contentType=content_type
        )
        return json.loads(response['body'].read())['completion']
    except Exception as e:
        return logger.error("Error in generating custom claude prompt result: %s", str(e))
    

def get_prompts(input_string):
    """
    This function will extract prompts when genAI is applied

    args:
    input_string (str): input prompt provided by user

    returns:
    response (dict): dict containing keys of prompt placeholders
    """
    try:
        logger.info('Extracting prompts')
        def extract_content(input_string, tag):
            pattern = f"<{tag}>(.*?)</{tag}>"
            matches = re.findall(pattern, input_string, re.DOTALL)
            return matches
        
        example = ''
        article = ''
        instructions = ''
        example_extract = extract_content(input_string, 'example')
        article_extract = extract_content(input_string, 'article')
        instructions_extract = extract_content(input_string, 'instructions')
        if example_extract != []:
            example = example_extract[0]
            logger.info("<example> extracted successfully")
        if article_extract != []:
            article = article_extract[0]
            logger.info("<article> extracted successfully")
        if instructions_extract != []:
            instructions = instructions_extract[0]
            logger.info("<instructions> extracted successfully")
        return {'example': example, "article": article, "instructions": instructions}
    except Exception as e:
        return logger.error("Error in extracting prompts: %s", str(e))
        