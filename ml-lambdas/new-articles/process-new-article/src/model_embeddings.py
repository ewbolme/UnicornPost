import json
from .config import logger

def cluster_from_embedding(embedding, endpoint_name: str, sm_client):
    """
    This function generates article cluster id from embeddings

    args:
    embedding: embeddings received from amazon titan client
    endpoint_name (str): The model endpoint used
    sm_client: A boto3 sagemaker client

    returns:
    cluster (str): Cluster obtained
    """
    try:
        logger.info('Generating cluster from embeddings')

        embedding_payload = json.dumps({"features": embedding}).encode('utf-8')

        embedded_response = sm_client.invoke_endpoint(EndpointName=endpoint_name, 
                                                    ContentType='application/jsonlines', 
                                                    Body=embedding_payload)

        return str(json.loads(embedded_response['Body'].read())['predictions'][0]['closest_cluster'])
    except Exception as e:
        return logger.error('Error in generating article cluster: %s', str(e))

def translate_text(raw_text: str, translate_client) -> str:
    """
    This function translates text input to english

    args:
    raw_text (str): text to be translated
    translate_client: A boto3 translate client

    returns:
    result (tuple):
    (
    translated text (str): Translated text
    lang (str): original language
    )
    """
    try:
        logger.info('Translating text')

        raw_text_len = raw_text.__len__()
        result = translate_client.translate_text(Text=raw_text[:8000], SourceLanguageCode="auto", TargetLanguageCode="en")
        language = result.get('SourceLanguageCode')
        if language == "en":
            return(raw_text, language)

        else:
            translated_text = result.get('TranslatedText')
            for i in range(8000, raw_text_len, 8000):

                result = translate_client.translate_text(Text=raw_text[i:i+8000], SourceLanguageCode="auto", TargetLanguageCode="en")

                translated_text += result.get('TranslatedText')

            return(translated_text, language)
    except Exception as e:
        return logger.error('Error in translating article text: %s', str(e))
    
    
def claude_summary(english_text: str, bedrock_client) -> str:
    """
    This function generates summary of input text

    args:
    english_text (str): text to create summary on
    bedrock_client: A boto3 bedrock client

    returns:
    validation (bool): Input text validation
    summary (str): summary response
    """
    try:
        not_enough_info_pattern = "NOT_ENOUGH_INFO"
        prompt = f"""\n\nHuman: Generate a plain text expert level summary of the article between the <article></article> XML tags. See an example of the format between the <example></example> XML tags. If you are not given enough information, contains repetative content or if the text contains noncontextual information, create a summary respond "not enough information was given to generate an article summary: '{not_enough_info_pattern}' ":  \n\n<article>{english_text[:90000]}</article>  \n\n<example>The first public version of the Ethereum software was recently released, and the system could face some of the same technical and legal problems that have tarnished Bitcoin.
        Most major banks are interested in using blockchains to make trading and money transfer faster and more efficient. Michael Novogratz, a former top executive at Fortress Investing Group, has been looking at Ethereum since last fall.
        While Bitcoin was created by an unknown developer, Ethereum has been created in a more transparent fashion by a 21-year-old Russian-Canadian, Vitalik Buterin. The Ethereum system is run by a distributed system of users. It also has a dedicated network of developers who have helped develop applications on the system. Mr. Joseph Bonneau, an expert in the field, said Ethereum was the first system to catch his interest since Bitcoin.</example>  \n\nAssistant: Here is a plain text summary of the article: \n\n"""

        logger.info('Generating article summary')
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
        summary = json.loads(response['body'].read())['completion']
        return not_enough_info_pattern not in summary, summary
    except Exception as e:
        return logger.error('Error in generating article summary: %s', str(e))

def titan_embeddings(english_text, bedrock_client):
    """
    This function will generate embeddings on text

    args:
    english_text (str): text to generate embeddings on
    bedrock_client: A boto3 bedrock client

    returns:
    embeddings (str): List of embeddings in str (json)
    """
    try:
        logger.info('Generating titan embeddings')
        prompt = f"{english_text}"
        body = json.dumps({
            "inputText": prompt,
        })
        
        model_id = 'amazon.titan-embed-text-v1'
        accept = 'application/json' 
        content_type = 'application/json'
        
        response = bedrock_client.invoke_model(
            body=body, 
            modelId=model_id, 
            accept=accept, 
            contentType=content_type
        )
        
        response_body = json.loads(response['body'].read())
        return response_body.get('embedding')
    except Exception as e:
        return logger.error('Error in generating embeddings: %s', str(e))