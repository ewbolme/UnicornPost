
export const marks = [
    {
      value: 1,
      label: '1',
    },
    {
      value: 2,
      label: '2',
    },
    {
      value: 3,
      label: '3',
    },
    {
      value: 4,
      label: '4',
    },
    {
      value: 5,
      label: '5',
    },
];


// constant containing newsletter prompt 
export const defaultNewsletterValue = `\n Human: <example>Dear insert name here,\n\n Here are the top stories for you this morning:\n\n - [Agile practices promote sustainable development]. Agile teams focus on delivering value to customers through continuous delivery of working software. They welcome changing requirements and get constant feedback to adjust the project. However, agile isn't just about software - it's also about team culture and sustainable pace. \n\n - [How to write compelling headlines and introductions]. A strong headline and intro can boost conversions by 30% or more. Use these techniques from experts like Brian Dean and Joseph Sugarman: message matching, billboard headlines, asking a question, using \"How to\" and more. \n\n - [Leveraging MQTT and Google Cloud for IoT]. Agosto built an open-source MQTT broker to integrate messaging between devices and Google Cloud Pub/Sub. It supports thousands of messages per minute. Check it out on GitHub if you're building an IoT app.\n\n- [Having kids destroyed my Hollywood career, but improved my life]. After becoming a new dad, director Travis Chambers struggled with long hours and lack of work-life balance in Hollywood. He started his own agency which allowed him to still earn income but also spend more time with family. \n\n- [Learn to build a chatbot with SitePoint's new Mini Course]. SitePoint just launched a 1-hour mini course on building a movie recommendation chatbot with Microsoft Bot Framework. It covers NLP, testing, message formatting and more. \n\n For more breaking news, visit [www.unicornpost.com](www.unicornpost.com).\n\n Sincerely,\n\nThe UnicornPost Team\n</example>\n<article>article['articleSummary']['S']</article>\n<instructions>Pretend you are an editor with 10 years of experience at a major news corporation. Write a morning digest email of the breaking news articles listed in the <article></article> XML tags above and provide the same kind of information for all the articles you receive to email to customers to read when they wake up in the morning and it should be concise. Address it to the individual customer (in this case {customer_name}). End with 'for more breaking news visit [www.unicornpost.com](www.unicornpost.com).  \n\nSincerely,  \nThe UnicornPost Team'  See an example between the <example></example> XML tags.</instructions>\n\nAssistant: `;
