# Custom Lambda for Forgot Password
To send the confirmation code/link for Forgot Password request using cognito.

##
##
##
## Table of Contents

- Description
- Working
- Prerequisites
- Getting Started
##
##

## Description

When user initiates a forgot password, a verification code/link would be sent over email/SMS to the verified identity.

Amazon Cognito invokes this trigger before it sends an email or phone verification message. We can customize the email message dynamically with this custom message trigger moreover we can choose wheather to verify the user using a verification code or a link.

## Working
We check the Trigger Source to make sure it is the forgotPassword event and we get access to the email and username and then we can customize the messages accordingly.


## Prerequisites
- Node.js and npm installed on your machine.
- AWS account with appropriate permissions to create and manage AWS resources.
- AWS CLI installed and configured with your AWS credentials.
- Cognito User Pool.

## Getting Started

1. Clone the repository:
```shell
   git clone https://git-codecommit.us-west-2.amazonaws.com/v1/repos/backend-cognito-custom-lambda
   ```

2. Install the necessary dependencies:
```shell
   npm install
   ```

3. Configure the AWS credentials:

   - Set up your AWS credentials using the AWS CLI or environment variables.

4. Customize the Lambda triggers:

   - Open the Lambda function code and modify the trigger logic to suit your specific requirements.
   - Implement the necessary business logic or integrations with other services.

5. Deploy the Lambda function:

   - Use the AWS CLI or AWS CloudFormation to deploy the Lambda function and create the necessary AWS resources.
   - Configure the Cognito user pool to trigger the Lambda function for the desired events.

6. Test the triggers:

   - Perform the actions that trigger the Lambda function, FORGOT-PASSWORD.
   - Verify that the Lambda function is executed and the desired actions are performed.

