# Golang Backend Lambdas #
This project is a backend application for Unicorn Post - News Recommendation System built using the Go programming language and designed to run on the Amazon Web Services (AWS) platform. It leverages various AWS services to provide scalable and reliable functionality.
## Features

- **Serverless Architecture**: The project utilizes AWS Lambda to implement serverless functions.
- **API Gateway**: AWS API Gateway is used to create RESTful APIs and manage the routing and authentication of incoming requests.
- **Database Integration**: The project integrates with AWS DynamoDB and Amazon RDS to store and retrieve data.
- **Authentication and Authorization**: AWS Cognito is used for user authentication and authorization.
- **Logging and Monitoring**: AWS CloudWatch can be used to monitor and log application metrics and logs.

##
##
##
## Table of Contents

- Prerequisites
- Installation
- Usage
- API Documentation
##
##
## Prerequisites

- Go programming language installed.
- AWS account with appropriate permissions to create and manage AWS resources.
##
##
## Installation

1. Clone the repository:
   ```shell
   git clone https://git-codecommit.us-west-2.amazonaws.com/v1/repos/backend-breaking-news
   ```

2. Install the dependencies:
   ```shell
   go mod download
   ```

3. Set up the AWS credentials:

   - Configure your AWS credentials using the AWS CLI or environment variables.

4. Set up the environment variables:
   - Create or edit the `constant.go` file in the root directory of the project.
   - Define the required environment variables in the `constant.go` file.

5. Build the project:
   ```shell
   go build
   ```

6. Deploy the application:

   - Use the AWS CLI or AWS CloudFormation to deploy the necessary AWS resources.
   - Configure the application with the appropriate environment variables.

7. Test the application:

   - Use tools like cURL or Postman to send requests to the API endpoints.
   - Monitor the application logs and metrics using AWS CloudWatch.
##
##
## Usage

1. Start the server:
   ```shell
   ./backend-breaking-news
   ```

2. Access the API endpoints:
   - Open your web browser and go to `http://localhost:5002` to access the homepage.
   - Use an API testing tool like Postman to send requests to the API endpoints.
##
##
## API Documentation

The API documentation can be found in the [api-doc](api-doc/config) directory. It provides detailed information about the available endpoints, request/response formats, and authentication requirements.
