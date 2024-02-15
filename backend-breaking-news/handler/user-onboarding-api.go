package handler

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"main.go/helper"
	"main.go/model"

	cognito "github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
)

const flowUsernamePassword = "USER_PASSWORD_AUTH"

func CreateUser(c *gin.Context) {
	var (
		request model.UserInfo
	)
	err := c.Bind(&request)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}

	userName := request.UserName
	userEmail := strings.ToLower(request.UserEmail)
	userPassword := request.UserPassword

	// Creating an AWS session.
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}

	// Creating a cognito client.
	cognitoClient := cognito.New(sess)

	// Check user in Cognito if it is confirmed or not.
	getUserDetails, err := cognitoClient.AdminGetUser(&cognito.AdminGetUserInput{
		UserPoolId: aws.String(COGNITO_USER_POOL_ID),
		Username:   aws.String(userName),
	})
	if err == nil {
		isConfirmed := false
		userStatus := *getUserDetails.UserStatus
		if userStatus == "CONFIRMED" {
			isConfirmed = true
		}

		if isConfirmed == false {
			helper.APIServerError(c, 400, errors.New("UserNotConfirmedException: User is not confirmed, please check your inbox for the verification mail."))
			return
		}
	}

	// Check user already exists in RDS Database based on user email.
	toProceed := CheckUserInRDS(userEmail)

	if toProceed {

		// Handling the sign up scenario.
		user := &cognito.SignUpInput{
			Username: aws.String(userName),
			Password: aws.String(userPassword),
			ClientId: aws.String(COGNITO_CLIENT_ID),
			UserAttributes: []*cognito.AttributeType{
				{
					Name:  aws.String("name"),
					Value: aws.String(userName),
				},
				{
					Name:  aws.String("email"),
					Value: aws.String(userEmail),
				},
			},
		}
		secretHash := computeSecretHash(COGNITO_SECRET_KEY, userName, COGNITO_CLIENT_ID)
		user.SecretHash = aws.String(secretHash)

		resp, err := cognitoClient.SignUp(user)
		if err != nil {
			fmt.Print(err)
			helper.APIServerError(c, 400, err)
			return
		} else {
			// Insert data into the RDS table - users
			userRDS := model.RDSUser{
				CognitoUserId: *resp.UserSub,
				UserName:      userName,
				UserEmail:     userEmail,
				CreatedAt:     time.Now(),
				IsActive:      true,
			}
			errRDS := InsertIntoRDS(c, userRDS)
			if errRDS != nil {
				fmt.Println(errRDS)
				helper.APIServerError(c, 400, errors.New("UserAlreadyExistsException: User with this email already exists."))
				return
			}
		}
		helper.APIResponseUserOnboard(c, "User Created Successfully.")
	} else {
		helper.APIServerError(c, 400, errors.New("UserAlreadyExistsException: User with this email already exists."))
	}
}

func Login(c *gin.Context) {
	var (
		request model.LoginRequest
	)
	err := c.Bind(&request)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}

	// Clear the redis cache -
	client := redis.NewClient(&redis.Options{
		TLSConfig: &tls.Config{
			MinVersion: tls.VersionTLS12,
			//Certificates: []tls.Certificate{cert}
		},
		Addr:     REDIS_HOST_PORT,
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	errRedis := client.FlushDB().Err()
	if errRedis != nil {
		fmt.Print("Redis error - ", err)
	} else {
		fmt.Print("Cleared the redis cache.")
	}

	userEmail := strings.ToLower(request.UserEmail)
	userPassword := request.UserPassword

	userInfo, err := GetUserInfo(c, userEmail)
	if err != nil {
		fmt.Println(err)
		helper.APIServerError(c, 400, errors.New("NoUserFoundException: No user found with email address provided."))
		return
	}
	userName := strings.ToLower(userInfo.UserName)

	// Creating an AWS session.
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}

	// Creating a cognito client.
	cognitoClient := cognito.New(sess)

	flow := aws.String(flowUsernamePassword)
	params := map[string]*string{
		"USERNAME": aws.String(userName),
		"EMAIL":    aws.String(userEmail),
		"PASSWORD": aws.String(userPassword),
	}
	secretHash := computeSecretHash(COGNITO_SECRET_KEY, userName, COGNITO_CLIENT_ID)
	params["SECRET_HASH"] = aws.String(secretHash)

	authTry := &cognito.InitiateAuthInput{
		AuthFlow:       flow,
		AuthParameters: params,
		ClientId:       aws.String(COGNITO_CLIENT_ID),
	}

	resp, err := cognitoClient.InitiateAuth(authTry)
	if err != nil {
		fmt.Println(err)
		helper.APIServerError(c, 400, err)
	}

	authenticationResult := model.AuthenticationResult{
		AccessToken:  *resp.AuthenticationResult.AccessToken,
		RefreshToken: *resp.AuthenticationResult.RefreshToken,
		IdToken:      *resp.AuthenticationResult.IdToken,
		ExpiresIn:    *resp.AuthenticationResult.ExpiresIn,
		TokenType:    *resp.AuthenticationResult.TokenType,
	}

	// To get the user_id
	jwtData, errJwt := VerifyToken(authenticationResult.IdToken)
	if errJwt != nil {
		log.Println(errJwt)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
	}

	getUserDetails, err := cognitoClient.AdminGetUser(&cognito.AdminGetUserInput{
		UserPoolId: aws.String(COGNITO_USER_POOL_ID),
		Username:   aws.String(jwtData.UserName),
	})

	isConfirmed := false
	userStatus := *getUserDetails.UserStatus
	if userStatus == "CONFIRMED" {
		isConfirmed = true
	}

	helper.APIResponseWithEmail(c, authenticationResult, isConfirmed, userEmail, userName, jwtData.CognitoUserId)
}

func VerifyUser(c *gin.Context) {
	var (
		request model.VerifyUserRequest
	)
	err := c.Bind(&request)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}

	// Creating an AWS session.
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}

	// Creating a cognito client.
	cognitoClient := cognito.New(sess)

	userName := strings.ToLower(request.UserName)

	secretHash := computeSecretHash(COGNITO_SECRET_KEY, userName, COGNITO_CLIENT_ID)
	user := &cognito.ConfirmSignUpInput{
		ConfirmationCode: aws.String(request.VerificationCode),
		Username:         aws.String(userName),
		ClientId:         aws.String(COGNITO_CLIENT_ID),
		SecretHash:       aws.String(secretHash),
	}

	_, err = cognitoClient.ConfirmSignUp(user)
	if err != nil {
		fmt.Println(err)
		helper.APIServerError(c, 400, err)
		return
	}

	helper.APIResponseUserOnboard(c, "User Confirmed Successfully.")
}

func ForgotPassword(c *gin.Context) {
	var (
		request model.ForgotPasswordRequest
	)
	err := c.Bind(&request)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}

	userEmail := strings.ToLower(request.UserEmail)

	errorFromDB := SetIsResetFlagToTrue(userEmail)
	if errorFromDB != nil {
		fmt.Print(errorFromDB)
	}

	userInfo, err := GetUserInfo(c, userEmail)
	if err != nil {
		fmt.Println(err)
		helper.APIServerError(c, 400, errors.New("NoUserFoundException: No user found with email address provided."))
		return
	}
	userName := strings.ToLower(userInfo.UserName)

	// Creating an AWS session.
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}

	// Creating a cognito client.
	cognitoClient := cognito.New(sess)

	// Check user in Cognito if it is confirmed or not.
	getUserDetails, err := cognitoClient.AdminGetUser(&cognito.AdminGetUserInput{
		UserPoolId: aws.String(COGNITO_USER_POOL_ID),
		Username:   aws.String(userName),
	})

	isConfirmed := false
	userStatus := *getUserDetails.UserStatus
	if userStatus == "CONFIRMED" {
		isConfirmed = true
	}

	if isConfirmed == false {
		helper.APIServerError(c, 400, errors.New("UserNotConfirmedException: User is not confirmed, please confirm from mail."))
		return
	}

	count, errFromDB := SetIsResetPasswordCount(userEmail)
	if errFromDB != nil {
		fmt.Print("errFromDB", errFromDB)
		helper.APIServerError(c, 400, errFromDB)
		return
	}

	strCount := strconv.Itoa(count)
	clientMetaData := map[string]*string{
		"ResetPasswordCount": aws.String(strCount),
	}

	secretHash := computeSecretHash(COGNITO_SECRET_KEY, userName, COGNITO_CLIENT_ID)

	cognitoUser := &cognito.ForgotPasswordInput{
		SecretHash:        aws.String(secretHash),
		ClientId:          aws.String(COGNITO_CLIENT_ID),
		Username:          aws.String(userName),
		AnalyticsMetadata: &cognito.AnalyticsMetadataType{},
		ClientMetadata:    clientMetaData,
	}

	cognitoUser.Validate()

	_, err = cognitoClient.ForgotPassword(cognitoUser)
	if err != nil {
		fmt.Print(err)
		helper.APIServerError(c, 400, err)
		return
	}

	helper.APIResponseUserOnboard(c, "Please check your email, for the confirmation code.")
}

func ConfirmForgotPassword(c *gin.Context) {
	var (
		request model.ResetPasswordRequest
	)
	err := c.Bind(&request)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}

	userInfo, err := GetUserInfo(c, request.UserEmail)
	if err != nil {
		fmt.Println(err)
		helper.APIServerError(c, 400, errors.New("NoUserFoundException: No user found with email address provided."))
		return
	}
	userName := strings.ToLower(userInfo.UserName)

	// Creating an AWS session.
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}

	// Creating a cognito client.
	cognitoClient := cognito.New(sess)

	secretHash := computeSecretHash(COGNITO_SECRET_KEY, userName, COGNITO_CLIENT_ID)

	cognitoUser := &cognito.ConfirmForgotPasswordInput{
		SecretHash:       aws.String(secretHash),
		ClientId:         aws.String(COGNITO_CLIENT_ID),
		Username:         aws.String(userName),
		ConfirmationCode: aws.String(request.ConfirmationCode),
		Password:         aws.String(request.UserPassword),
	}

	_, err = cognitoClient.ConfirmForgotPassword(cognitoUser)
	if err != nil {
		fmt.Print(err)
		helper.APIServerError(c, 400, errors.New("ExpiredLinkException: This link has been expired, please verify it or request a new link."))
		return
	}

	errorFromDB := SetIsResetFlagToFalse(request.UserEmail)
	if errorFromDB != nil {
		fmt.Print(errorFromDB)
	}

	helper.APIResponseUserOnboard(c, "Password Changed Successfully.")
}

func computeSecretHash(clientSecret string, username string, clientId string) string {
	mac := hmac.New(sha256.New, []byte(clientSecret))
	mac.Write([]byte(username + clientId))

	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

func GetCognitoCreds() model.CognitoSecretManager {
	secretName := "dev/cognito"

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}

	// Create Secrets Manager client
	svc := secretsmanager.New(sess)

	input := &secretsmanager.GetSecretValueInput{
		SecretId:     aws.String(secretName),
		VersionStage: aws.String("AWSCURRENT"), // VersionStage defaults to AWSCURRENT if unspecified
	}

	result, err := svc.GetSecretValue(input)
	if err != nil {
		log.Fatal(err.Error())
	}

	// Decrypts secret using the associated KMS key.
	var secretString string = *result.SecretString

	cognitoData := model.CognitoSecretManager{}

	error := json.Unmarshal([]byte(secretString), &cognitoData)
	if error != nil {
		fmt.Println("Error:", err)
	}
	return cognitoData
}

func ResendVerificationMail(c *gin.Context) {
	var (
		request model.ResendVerificationMail
	)
	err := c.Bind(&request)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}

	userEmail := request.UserEmail
	userName, err := GetUserNameByUserEmail(userEmail)
	if err != nil {
		fmt.Print(err)
	}

	// Creating an AWS session.
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}

	// Creating a cognito client.
	secretHash := computeSecretHash(COGNITO_SECRET_KEY, userName, COGNITO_CLIENT_ID)

	cognitoClient := cognito.New(sess)

	// Check user in Cognito if it is confirmed or not.
	getUserDetails, err := cognitoClient.AdminGetUser(&cognito.AdminGetUserInput{
		UserPoolId: aws.String(COGNITO_USER_POOL_ID),
		Username:   aws.String(userName),
	})
	if err == nil {
		userStatus := *getUserDetails.UserStatus
		if userStatus == "CONFIRMED" {
			helper.APIServerError(c, 400, errors.New("UserAlreadyConfirmedException: User is already confirmed."))
			return
		}
	} else if err != nil {
		fmt.Print(err)
		helper.APIServerError(c, 400, err)
		return
	}

	cognitoInput := &cognito.ResendConfirmationCodeInput{
		SecretHash: aws.String(secretHash),
		ClientId:   aws.String(COGNITO_CLIENT_ID),
		Username:   aws.String(userName),
	}

	_, err = cognitoClient.ResendConfirmationCode(cognitoInput)
	if err != nil {
		fmt.Print(err)
		helper.APIServerError(c, 400, err)
		return
	}

	helper.APIResponseUserOnboard(c, "Verification email Re-sent.")
}

func VerifyResetPasswordCount(c *gin.Context) {
	var (
		request model.VerifyResetPasswordCount
	)
	err := c.Bind(&request)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}
	userEmail := request.UserEmail
	countToMatch := request.ResetPasswordCount

	countToMatchWith, err := GetResetPasswordCount(userEmail)
	if err != nil {
		fmt.Print(err)
		helper.APIServerError(c, 400, err)
		return
	}

	toReset := false

	if countToMatch == strconv.Itoa(countToMatchWith) {
		toReset = true
	}

	result := model.VerifyResetPasswordCountResponse{
		ToResetPassword: toReset,
	}

	helper.APIResponseUserOnboard(c, result)
}
