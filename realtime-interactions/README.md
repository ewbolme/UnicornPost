# Realtime interactions Lambdas

- The lambdas in this repo refers to the lambda functions used to fetch and record all the live interactions by user logged in.

## Lambdas

1. Live interactions lambda -> [README](https://us-west-2.console.aws.amazon.com/codesuite/codecommit/repositories/realtime-interactions/browse/refs/heads/main/--/live-interactions-lambda/README.md?region=us-west-2)
- This lambda records live interactions into a kinesis stream

2. Record live interactions -> [README](https://us-west-2.console.aws.amazon.com/codesuite/codecommit/repositories/realtime-interactions/browse/refs/heads/main/--/record-interactions-lambda/README.md?region=us-west-2)
- This lambda records interactions from kinesis stream into personalize event tracker and dynamodb