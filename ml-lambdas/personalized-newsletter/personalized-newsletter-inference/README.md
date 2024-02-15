# Personalized newsletter inference

## Introduction
- This lambda function is created to generate a personalized newsletter email/digest with personalized articles specific to the user. 
- The implementation can be generated from a pre-generated template to provide user digest, as well as with using Gen-AI with user-generated prompts.
- This lambda uses bedrock model to generate the digest based on recommended articles fetched from personalize (similar to breaking news)

## Parameters

### Input

- A json body input
- {
    "user_id": "2959376686327377624",
    "user_name": "Eric",
    "is_gen": "false",
    "desired_items": 2,
    "prompts": "\n    Human: <example>Dear insert name here,\n\n                Here are the top stories for you this morning:\n\n                - [Agile practices promote sustainable development]. Agile teams focus on delivering value to customers through continuous delivery of working software. They welcome changing requirements and get constant feedback to adjust the project. However, agile isn't just about software - it's also about team culture and sustainable pace. \n\n                - [How to write compelling headlines and introductions]. A strong headline and intro can boost conversions by 30% or more. Use these techniques from experts like Brian Dean and Joseph Sugarman: message matching, billboard headlines, asking a question, using \"How to\" and more. - [Leveraging MQTT and Google Cloud for IoT]. Agosto built an open-source MQTT broker to integrate messaging between devices and Google Cloud Pub/Sub. It supports thousands of messages per minute. Check it out on GitHub if you're building an IoT app.\n- [Having kids destroyed my Hollywood career, but improved my life]. After becoming a new dad, director Travis Chambers struggled with long hours and lack of work-life balance in Hollywood. He started his own agency which allowed him to still earn income but also spend more time with family. \n- [Learn to build a chatbot with SitePoint's new Mini Course]. SitePoint just launched a 1-hour mini course on building a movie recommendation chatbot with Microsoft Bot Framework. It covers NLP, testing, message formatting and more. \nFor more breaking news, visit [www.unicornpost.com](www.unicornpost.com).\nSincerely,\\n\nThe unicornpost.com team\n</example>\n<article>article['articleSummary']['S']</article>\n<instructions>Pretend you are an editor with 10 yeaears of experiance at a major news corporation. Write a morning digest email of the breaking news articles lisited in the <article></article> XML tags above and provide the same kind of information for all the articles you recieve to email to customers to read when they wake up in the morning.  Address it to the individual customer (in this case {customer_name}). End with 'for more breaking stores visit [www.unicornpost.com](www.unicornpost.com).  \n\nSincerely,  \nThe Unicorn Post team  See an example between the <example></example> XML tags.</instructions>\n\nAssistant:"
  }
  - The input can be tweaked for genAI true/false, the prompts are only req for genAI = True

### Output

- A string of email response, alonwith articles list
- Email with articles list 
- {\"email\": \" Dear Eric,\\n\\nHere are the top stories for you this morning:\\n\\n- Mozilla experiments with evolving browser tabs into trails to preserve full browsing histories and context. Mozilla's open source Browser.html project connects trails to tabs for better web navigation. Trails aim to enhance experiences like sharing full histories, revisiting saved paths, and collaborating.\\n\\n- Insurance companies report strong earnings in 2016. Major insurance companies like Mapfre, Porto Seguro, Chubb, and Bradesco Seguros saw increased revenues and profits in 2016, though some saw declines in Brazil. Health and life segments showed particular growth.  \\n\\n- Johnson & Johnson acquires Actelion for $30 billion to expand rare disease portfolio. J&J is acquiring Swiss biotech Actelion for $30 billion in cash to gain access to Actelion's high-margin drugs for rare diseases and diversify J&J's offerings.\\n\\n- Facial recognition used by KFC in China to suggest personalized menus. A KFC restaurant in Beijing, China has installed facial recognition technology developed by Baidu to scan customers and suggest personalized menus based on their age, gender, and personality traits. \\n\\n- Google's AI generates realistic facial features from pixelated images. Google Brain has developed \\\"RAISR\\\" technology that uses machine learning to add realistic facial details to extremely low-resolution images, with potential applications in law enforcement.\\n\\nFor more breaking news, visit www.unicornpost.com.\\n\\nSincerely,\\n\\nThe unicornpost.com team\", \"articles\": [{\"article_trigger\": \"Top blog posts of 2016 summarized\", \"article_id\": \"7697593937932606048\", \"article_cluster_id\": \"47_TEST_XENON\"}, {\"article_trigger\": \"Mozilla experiments with evolving browser tabs into trails to preserve full browsing histories and context\", \"article_id\": \"6716649347760033969\", \"article_cluster_id\": \"47_TEST_XENON\"}, {\"article_trigger\": \"Insurance companies report strong earnings in 2016\", \"article_id\": \"2870099478920706993\", \"article_cluster_id\": \"2_TEST_XENON\"}, {\"article_trigger\": \"Johnson & Johnson acquires Actelion for $30 billion to expand rare disease portfolio\", \"article_id\": \"1348739322889189648\", \"article_cluster_id\": \"2_TEST_XENON\"}, {\"article_trigger\": \"Facial recognition used by KFC in China to suggest personalized menus\", \"article_id\": \"-9020955625521881630\", \"article_cluster_id\": \"15_TEST_XENON\"}, {\"article_trigger\": \"Google's AI generates realistic facial features from pixelated images\", \"article_id\": \"-7273935215244206740\", \"article_cluster_id\": \"15_TEST_XENON\"}]} 


## Requirements

### Environment Variables
Make sure to set the following environment variables either locally or in your Lambda function's configuration:

- `DESIRED_ITEMS` =	Number of desired items
- `DYNAMO_MAIN_TABLE` =	Table name
- `USERPERSONALIZATIONCLUSTERENDPOINT` =	model endpoint

### Additional Configuration
- Additional layer is required for lambda deployment -> `boto3-latest` 
- Lambda is triggered by API Gateway/can be provided similar input manually
- IAM permissions for boto client services required -> dynamodb, personalize-runtime, bedrock-runtime

## Additional Requirements
The Desired items can be tweaked to generate more articles inside personalized email

## Notes and Assumptions
The assumption is that we have dynamodb, personalize-runtime, bedrock-runtime all setup in same region/VPC with IAM configured