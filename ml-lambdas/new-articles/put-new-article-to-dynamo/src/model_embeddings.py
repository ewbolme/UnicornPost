import json
import re
from .config import logger

def claude_hook_trigger(article_text, bedrock_client):
    """
    This function will generate article hook and trigger based on text

    args:
    article_text (str): article text (in this case, article summary)
    bedrock_client: A boto3 bedrock client

    returns:
    article_hook (str): article hook generated
    article_trigger (str): article trigger generated
    article_genre (str): article genre generated
    """
    try:
        logger.info('Generating article hook and trigger')
        prompt = f"""\n\nHuman: <instructions>Take a look at the article text between the <article></article> XML tags below. Use it to generate three pieces of information for each article

        1.	An article trigger – see examples of these below in the <article_X_example_trigger></article_X_example_trigger> XML tags return the answer in <article_trigger></article_trigger> XML tags
        2.	An article hook – see examples below in the <article_X_example_hook></article_X_example_hook> XML tags return the answer in <article_hook></article_hook> XML tags
        3.	The articles genre – see examples below in the <article_X_example_genre></article_X_example_genre> choose one of six genre’s. if multiple genres seem to apply 
        I) "cloud provider news" if the article discusses anything related to Microsoft Azure, Amazon Web Services (AWS), or Google Cloud.
        II) "crypto currency" if the article discusses anything related to blockchain or crypto currency.
        III) "ai" if the article discusses anything related neural networks, computer vision, natural language processing or any kind of autonomous vehicle.
        IV) “tech” if the article discusses any other tech company or technical concept
        V) "design best practices" if the article discusses design or development best practices including agile methodology
        VI) “other” if the article does not touch on any of the previous topics.

        return the answer in <article_genre></article_genre> XML tags

        See examples between the <examples></examples> XML tags.</instructions>

        <article>{article_text[:80000]}</article>

        <examples><article_1_example_text>The article describes a computer vision system to identify and analyze cookies in real time using OpenCV, an open source computer vision library. The system uses a digital camera, uniform lighting, and software to process images. It applies image filters to isolate the cookie and create a binary mask. Geometric analysis of the mask detects defects in cookie shape. The software runs in real time to inspect cookies on a simulated conveyor belt. Detailed steps are provided on the image capture, preprocessing, analysis, and result display. The goal is an educational example using free software and low cost parts. Industrial systems use specialized cameras, lighting, lenses and processors for precision high speed inspection. The full example code is available in a GitHub repository. There is a Python and C++ version. It demonstrates computer vision techniques for basic object analysis.</article_1_example_text>\n
        <article_1_example_trigger>Computer vision system inspects cookies in real time</article_1_example_trigger>\n
        <article_1_example_hook >An educational project uses OpenCV and Raspberry Pi for basic shape analysis and defect detection of cookies on a simulated conveyor belt. The full code is on GitHub.</article_1_example_hook>\n<article_1_example_genre>ai</article_1_example_genre>\n<article_2_example_text>\nGoogle Cloud Platform has joined the Node.js Foundation. This comes after Node.js runtime went into beta on Google App Engine, which makes it easy to build scalable web apps using various languages. In the industry, there is interest in a third wave of cloud computing focused on microservices and containers, which Node.js is well-suited for due to its efficiency, performance, and scalability. This makes it popular for IoT developers working with microservices. Joining the Foundation increases Google's investment in Node.js and involvement in the community. Google also develops the V8 JavaScript engine that powers Chrome and Node.js. The V8 team is working to improve the Node.js workflow and make testing easier. Google V8 contributors are on the Core Technical Committee. The Node.js Foundation welcomes Google Cloud Platform joining the community.</article_2_example_text>\n<article_2_example_trigger>Google Cloud Platform joins Node.js Foundation</article_2_example_trigger>\n<article_2_example_hook>Google Cloud Platform has joined the Node.js Foundation, increasing its investment in Node.js and involvement in the community. This comes after Node.js went into beta on Google App Engine</article_2_example_hook>\n<article_2_example_genre>tech</article_2_example_genre>\n<article_3_example_text>\nUdacity, an online education company known as the University of Silicon Valley, has made the code for its autonomous car simulator open source. This allows anyone with knowledge of Unity assets, which are tools for building 3D apps and games, to create their own virtual test tracks. Udacity\'s goal is to enable more people to participate in the development of self-driving cars. Building real autonomous test vehicles is expensive, and finding places to test them can be difficult, especially for independent developers and startups. The open source code can help these developers improve. Udacity recently launched an online Autonomous Car Engineer Nanodegree program, developed with partners like Mercedes-Benz and Nvidia. Students learn from experts like Sebastian Thrun, a leader in robotics who helped develop Google\'s self-driving car. The program already has Brazilian students enrolled.</article_3_example_text>\n<article_3_example_trigger>Udacity open sources self-driving car simulator</article_3_example_trigger>\n
        <article_3_example_hook>Udacity released the Unity code for its autonomous car simulator to enable more testing by independent developers.
        </article_3_example_hook>\n<article_3_example_genre>ai</article_3_example_genre><article_4_example_text>Many financial institutions are interested in blockchain technology to increase transparency and efficiency in record-keeping and auditing. According to Bitcoin developer Peter Todd, banks currently operate with high levels of mistrust, requiring labor-intensive human auditing. Blockchains provide cryptographic proof and signatures, acting as strong audit logs. This could reduce the need for trust in database admins and others with access. Ultimately, the goal is replacing human auditors with computer code, improving security and cutting costs. However, Todd notes financial institutions already do audits well. Faster settlement may require faster consensus on events. Still, blockchain aligns with banks' existing goals. The technology reduces need for trust, like Bitcoin aimed to do.</article_4_example_text>\n<article_4_example_trigger>Blockchain aligns with banks' goals of reducing trust needs and costs</article_4_example_trigger>\n<article_4_example_hook >Blockchain's cryptographic audit logs could reduce banks' need for labor-intensive human auditing and oversight, improving efficiency. But banks already audit well, so the main benefit may be faster consensus and settlement.</article_4_example_hook>\n<article_4_example_genre>crypto currency</article_4_example_genre>\n<article_5_example_text>Fran O'Hara, director at Inspire Quality Services, shared lessons on integrating testing into agile development. He says testing skills are still needed even without traditional testing roles. When agile teams only automate functional tests, they miss risks like system integration, performance, and usability. Although the goal is multifunctional teams, these shouldn't just be specialists or generalists. Generalists often lack mature testing skills like raising test cases that get lost in literal Scrum teams of just developers. Teams with regular testing skills perform better. Other traditional testing competencies like defining process and strategy may still be needed. Many organizations still bundle features into large versions requiring system integration. Agile teams testing during development often miss non-functional requirements that still need coordination. Appointing test champions can fill in missing skills, with the goal of full integration like having testing tasks in sprint planning. Work practices like limiting work in progress, not leaving validation to the end, code quality focus, strict definition of ready, discussing requirements in backlog refinement, and retrospectives on improving definition of ready can achieve this.</article_5_example_text>\n<article_5_example_trigger>Software testing skills still needed on agile teams</article_5_example_trigger>\n<article_5_example_hook >Although agile teams focus on delivering working software quickly, traditional testing skills like system integration and usability are still crucial. Appointing testing champions and integrating testing into all phases can achieve this.</article_5_example_hook>\n<article_5_example_genre>design best practices</article_5_example_genre></examples>\n\nAssistant:\n\n"""
        
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
        trigger = re.findall('<article_trigger>(.*)</article_trigger>', hook_trigger)[0].strip().replace('"', '')
        hook = re.findall('<article_hook>(.*)</article_hook>', hook_trigger)[0].strip().replace('"', '')
        genre = re.findall('<article_genre>(.*)</article_genre>', hook_trigger)[0].strip().replace('"', '')
        return hook, trigger, genre
    except Exception as e:
        return logger.error('Error in generating article hook and trigger: %s', str(e))


def generate_article_title(english_text: str, bedrock_client) -> str:
    """
    This function will generate article title based on text

    args:
    article_text (str): article text
    bedrock_client: A boto3 bedrock client

    returns:
    article_title (str): article title generated
    """
    try:
        logger.info('Generating article title')
        prompt = f"""Human: Generate a concise and engaging title for the article based on its content. The title should encapsulate the essence of the article while being captivating and informative. Begin the title with a phrase that grabs attention and summarizes the article effectively.

        Article Content:
        {english_text[:300]}  # Adjust the preview length based on your preference

        Example of a Good Title:
        "Revolutionizing Renewable Energy: Innovations Shaping the Future"
        Only give the article title text in your output.
        Assistant:
        """

        body = json.dumps({
            "prompt": prompt,
            "temperature": 0.3,
            "top_p": 0.9,
            "max_tokens_to_sample": 40
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
        
        generated_title = json.loads(response['body'].read())['completion']
        generated_title=generated_title.strip().replace('"', '')
        
        return generated_title
    except Exception as e:
        return logger.error('Error in generating article title: %s', str(e))