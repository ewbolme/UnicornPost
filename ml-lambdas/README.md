# ML backend Lambdas

- The lambdas in this repo refers to the lambda functions used to fetch responses for Unicorn Newsletter backend API's.

## Lambdas

1. Frontpage lambdas
- Lambdas refering to frontpage/homepage functionalities

    1. Breaking news lambda -> [README](https://us-west-2.console.aws.amazon.com/codesuite/codecommit/repositories/ml-lambdas/browse/refs/heads/main/--/frontpage/frontpage-breaking-news/README.md?region=us-west-2)
    - This lambda returns breaking news recommendations for user

    2. News for you interactions -> [README](https://us-west-2.console.aws.amazon.com/codesuite/codecommit/repositories/ml-lambdas/browse/refs/heads/main/--/frontpage/frontpage-news-for-you/README.md?region=us-west-2)
    - This lambda returns news for you recommendations for user

2. New article processing lambdas
- Lambdas refering to the flow of new article processing

    1. Process new article -> [README](https://us-west-2.console.aws.amazon.com/codesuite/codecommit/repositories/ml-lambdas/browse/refs/heads/main/--/new-articles/process-new-article/README.md?region=us-west-2)
    - This lambda returns interested user list and also triggers new articles to dynamo

    2. New article to Dynamo -> [README](https://us-west-2.console.aws.amazon.com/codesuite/codecommit/repositories/ml-lambdas/browse/refs/heads/main/--/new-articles/put-new-article-to-dynamo/README.md?region=us-west-2)
    - This puts new article from user into dyanamo table

    3. Get past interactions-> [README](https://us-west-2.console.aws.amazon.com/codesuite/codecommit/repositories/ml-lambdas/browse/refs/heads/main/--/new-articles/get-past-interactions/README.md?region=us-west-2)
    - This lambda displays last 5 distinnct articles interacted by user

3. Personalized newsletter
- This lambdas refer to personalize newsletter functionality

    1. Personalized newsletter inference -> [README](https://us-west-2.console.aws.amazon.com/codesuite/codecommit/repositories/ml-lambdas/browse/refs/heads/main/--/personalized-newsletter/personalized-newsletter-inference/README.md?region=us-west-2)
    - This lambda returns personalized newsletter with/without GenAI for user