package handler

import "os"

var (
	// URLS for getting data
	BASE_URL_ML_API                        = os.Getenv("BASE_URL_ML_API")
	PERSONALIZED_NEWSLETTER_FUNCTIONAL_URL = os.Getenv("PERSONALIZED_NEWSLETTER_FUNCTIONAL_URL")
	CONTENT_TYPE                           = os.Getenv("CONTENT_TYPE")

	// AWS Session
	REGION_NAME = os.Getenv("REGION_NAME")

	// S3
	S3_BUCKET_NAME = os.Getenv("S3_BUCKET_NAME")

	// DYNAMO DB
	ARTICLE_DETAILS_TABLE = os.Getenv("ARTICLE_DETAILS_TABLE")

	// COGNITO
	COGNITO_CLIENT_ID    = GetCognitoCreds().CognitoClientId
	COGNITO_SECRET_KEY   = GetCognitoCreds().CognitoSecretKey
	COGNITO_USER_POOL_ID = GetCognitoCreds().CognitoUserPoolId

	// RDS
	RDS_HOST   = os.Getenv("RDS_HOST")
	RDS_PORT   = os.Getenv("RDS_PORT")
	RDS_DBNAME = os.Getenv("RDS_DBNAME")

	RDS_USER     = GetRDSCreds().UserName
	RDS_PASSWORD = GetRDSCreds().Password

	// REDIS
	REDIS_HOST_PORT = os.Getenv("REDIS_HOST_PORT")
)
