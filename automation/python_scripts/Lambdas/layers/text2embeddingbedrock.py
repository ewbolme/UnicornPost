import json
import re

def translate_text(raw_text: str, translate_client) -> str:
    #TODO add code to move to previous white space
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
    
    
def claude_summary(english_text: str, bedrock_client) -> str:
    """
    docstring
    """
    prompt = f"""\n\nHuman: Generate a plain text expert level summary of the article between the <article></article> XML tags. See an example of the format between the <example></example> XML tags:  \n\n<article>{english_text[:90000]}</article>  \n\n<example>The first public version of the Ethereum software was recently released, and the system could face some of the same technical and legal problems that have tarnished Bitcoin.
Most major banks are interested in using blockchains to make trading and money transfer faster and more efficient. Michael Novogratz, a former top executive at Fortress Investing Group, has been looking at Ethereum since last fall.
While Bitcoin was created by an unknown developer, Ethereum has been created in a more transparent fashion by a 21-year-old Russian-Canadian, Vitalik Buterin. The Ethereum system is run by a distributed system of users. It also has a dedicated network of developers who have helped develop applications on the system. Mr. Joseph Bonneau, an expert in the field, said Ethereum was the first system to catch his interest since Bitcoin.</example>  \n\nAssistant: Here is a plain text summary of the article: \n\n"""
    
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

def claude_hook_trigger(article_text, bedrock_client):
    """
    docstring
    """
    prompt = f"""\n\nHuman: <instructions>Take a look at the article text between the <article></article> XML tags below. Use it to generate three pieces of information for each article

1.	An article trigger – see examples of these below in the <article_X_example_trigger></article_X_example_trigger> XML tags return the answer in <article_trigger></article_trigger> XML tags
2.	An article hook – see examples below in the <article_X_example_hook></article_X_example_hook> XML tags return the answer in <article_hook></article_hook> XML tags
3.	The articles genre – see examples below in the <article_X_example_genre></article_X_example_genre> choose one of four genre’s "cloud provider news" if the article discusses Microsoft, Amazon, or Google "crypto currency" if the article discusses anything related to blockchain or crypto currency, “tech” if the article discusses any other tech company or technical concept or “non tech” if the article does not touch on any of the previous three topics return the answer in <article_genre></article_genre> XML tags

See examples between the <examples></examples> XML tags.</instructions>

<article>{article_text[:80000]}</article>

<examples><article_1_example_text>The article describes a computer vision system to identify and analyze cookies in real time using OpenCV, an open source computer vision library. The system uses a digital camera, uniform lighting, and software to process images. It applies image filters to isolate the cookie and create a binary mask. Geometric analysis of the mask detects defects in cookie shape. The software runs in real time to inspect cookies on a simulated conveyor belt. Detailed steps are provided on the image capture, preprocessing, analysis, and result display. The goal is an educational example using free software and low cost parts. Industrial systems use specialized cameras, lighting, lenses and processors for precision high speed inspection. The full example code is available in a GitHub repository. There is a Python and C++ version. It demonstrates computer vision techniques for basic object analysis.</article_1_example_text>\n
<article_1_example_trigger>Computer vision system inspects cookies in real time</article_1_example_trigger>\n
<article_1_example_hook >An educational project uses OpenCV and Raspberry Pi for basic shape analysis and defect detection of cookies on a simulated conveyor belt. The full code is on GitHub.</article_1_example_hook>\n<article_1_example_genre>tech</article_1_example_genre>\n<article_2_example_text>\nDeepMind is an artificial intelligence company located in London that was acquired by Google in 2014 for $660 million. DeepMind\'s office is modest and unassuming despite the high profile acquisition. \n\nDeepMind was attractive to Google because it gives Google an advantage in the AI talent race against competitors like Facebook and Microsoft. DeepMind has top AI researchers and has achieved prestigious publications in Nature magazine. \n\nDeepMind\'s long term mission is to solve general intelligence and create AI as capable as a human. This aligns with Google\'s interests in developing powerful AI. \n\nKeeping DeepMind as a separate entity in London allows it to retain independence and focus on research rather than business demands. \n\nDeepMind is taking a neuroscience-inspired approach to developing AI algorithms. This differentiates it from other AI labs focused on deep learning.\n\nEven without achieving human-level AI, DeepMind\'s research can benefit other Alphabet companies. For example, DeepMind AI reduced electricity usage in Google data centers by 40%.\n\nDeepMind also wants to apply AI to solve problems in healthcare, energy, and clean water access. It has partnerships with UK hospitals to analyze medical records and scans to improve diagnoses.\n\nAccess to real-world data is crucial for DeepMind\'s applied AI efforts. This could raise privacy concerns over corporate use of personal data that DeepMind will need to address.  \n\nDeepMind\'s long-term value is in becoming an "algorithm factory" that produces AI software for Alphabet. The data DeepMind analyzes stays with the partner organizations while the knowledge gained belongs to Alphabet.</article_2_example_text>\n<article_2_example_trigger>Inside DeepMind - Google's London AI lab</article_2_example_trigger>\n
<article_2_example_hook>DeepMind takes a neuroscience approach to develop human-level AI. Its talent and research align with Google's AI interests.</article_2_example_hook>\n<article_2_example_genre>tech</article_2_example_genre>\n<article_3_example_text>\nUdacity, an online education company known as the University of Silicon Valley, has made the code for its autonomous car simulator open source. This allows anyone with knowledge of Unity assets, which are tools for building 3D apps and games, to create their own virtual test tracks. Udacity\'s goal is to enable more people to participate in the development of self-driving cars. Building real autonomous test vehicles is expensive, and finding places to test them can be difficult, especially for independent developers and startups. The open source code can help these developers improve. Udacity recently launched an online Autonomous Car Engineer Nanodegree program, developed with partners like Mercedes-Benz and Nvidia. Students learn from experts like Sebastian Thrun, a leader in robotics who helped develop Google\'s self-driving car. The program already has Brazilian students enrolled.</article_3_example_text>\n<article_3_example_trigger>Udacity open sources self-driving car simulator</article_3_example_trigger>\n
<article_3_example_hook>Udacity released the Unity code for its autonomous car simulator to enable more testing by independent developers.
</article_3_example_hook>\n<article_3_example_genre>tech</article_3_example_genre><article_4_example_text>Many financial institutions are interested in blockchain technology to increase transparency and efficiency in record-keeping and auditing. According to Bitcoin developer Peter Todd, banks currently operate with high levels of mistrust, requiring labor-intensive human auditing. Blockchains provide cryptographic proof and signatures, acting as strong audit logs. This could reduce the need for trust in database admins and others with access. Ultimately, the goal is replacing human auditors with computer code, improving security and cutting costs. However, Todd notes financial institutions already do audits well. Faster settlement may require faster consensus on events. Still, blockchain aligns with banks' existing goals. The technology reduces need for trust, like Bitcoin aimed to do.</article_4_example_text>\n<article_4_example_trigger>Blockchain aligns with banks' goals of reducing trust needs and costs</article_4_example_trigger>\n<article_4_example_hook >Blockchain's cryptographic audit logs could reduce banks' need for labor-intensive human auditing and oversight, improving efficiency. But banks already audit well, so the main benefit may be faster consensus and settlement.</article_4_example_hook>\n<article_4_example_genre>crypto currency</article_4_example_genre></examples>\n\nAssistant:\n\n"""
    
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
    hook_trigger = json.loads(response['body'].read())['completion']
    trigger = re.findall('<article_trigger>(.*)</article_trigger>', hook_trigger)[0]
    hook = re.findall('<article_hook>(.*)</article_hook>', hook_trigger)[0] 
    genre = re.findall('<article_genre>(.*)</article_genre>', hook_trigger)[0] 
    return hook, trigger, genre

def titan_embeddings(english_text, bedrock_client):
    """
    docstring
    """
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