package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/Pallinder/go-randomdata"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gin-gonic/gin"
	"github.com/lithammer/shortuuid"
	"main.go/helper"
	"main.go/model"
)

func NewArticle(c *gin.Context) {
	var (
		request model.NewArticleTextReq
	)

	cognitoUserInfo := GetUserInfoByToken(c)
	user_id := cognitoUserInfo.UserId

	requestBodyLambda := model.NewArticleText{
		UserId: user_id,
		Data:   request.Data,
	}

	err := c.Bind(&requestBodyLambda)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}

	userId := requestBodyLambda.UserId

	// Upload the image to S3 Bucket.
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	uploader := s3manager.NewUploader(sess)

	if err != nil {
		log.Panicf("Failed reading data from file: %s", err)
	}
	dt := time.Now()
	timeStampUTC := dt.Unix()
	s3BucketName := S3_BUCKET_NAME
	s3FileName := userId + "/" + dt.Format("2006-01-02") + "/" + genShortUUID() + "-" + strconv.FormatInt(timeStampUTC, 10) + ".txt"
	s3Uri := "s3://" + s3BucketName + "/" + s3FileName //s3 uri example - s3://news-recommendtion-bucket/3/2023-12-15/C443p5w7YULLCGbpgwVBs-1702644452.txt

	input := &s3manager.UploadInput{
		Bucket:      aws.String(s3BucketName),                        // bucket's name
		Key:         aws.String(s3FileName),                          // files destination location
		Body:        bytes.NewReader([]byte(requestBodyLambda.Data)), // content of the file
		ContentType: aws.String("text/plain"),                        // content type
	}
	_, err = uploader.UploadWithContext(context.Background(), input)

	// Request to the ML API
	requestBody := model.NewArticleLambdaRequest{
		S3Path: s3Uri,
	}
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	resp, err := http.Post(BASE_URL_ML_API+"new-articles-lambda", CONTENT_TYPE, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()

	// Parsing the response to get required data and returning in API response.
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	var jsonLambdaResponse []string
	err = json.Unmarshal(body, &jsonLambdaResponse)
	if err != nil {
		fmt.Print("Error in input - ", err)
		helper.APIServerError(c, 400, errors.New("Invalid input provided."))
		return
	}
	newArticleResponse := []model.ResponseStructure{}
	//newDb := ConnectToDB()
	for _, element := range jsonLambdaResponse {
		randomFirstName := randomdata.FirstName(randomdata.RandomGender)
		//userNameByRDS := GetUserNameByCognitoId(element, newDb)
		responseStruct := model.ResponseStructure{
			UserName:        randomFirstName,
			UserId:          element,
			ProfileImageUrl: "", // to-do -> to be updated if required.
		}
		newArticleResponse = append(newArticleResponse, responseStruct)
	}

	helper.APIResponse(c, newArticleResponse, user_id)
}

func GetLastArticleByReader(c *gin.Context) {

	user_id := c.Query("user_id")

	// Request to the ML API
	requestBody := model.ArticleByReaderRequest{
		UserId: user_id,
	}
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	resp, err := http.Post(BASE_URL_ML_API+"past-interactions-lambda", CONTENT_TYPE, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	// Parsing the response to get required data and returning in API response.
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	defer resp.Body.Close()

	var objectArticleLambda []model.ArticleLambdaNewsFY

	error := json.Unmarshal(body, &objectArticleLambda)
	if error != nil {
		fmt.Println("Error:", err)
		return
	}

	articlesList := []model.Article{}

	for _, element := range objectArticleLambda {
		article := model.Article{
			ArticleId:                element.ArticleId.S,
			ArticleClusterId:         element.ArticleClusterId.S,
			ArticleTitle:             element.ArticleTitle.S,
			ArticleHook:              element.ArticleHook.S,
			ArticleSummary:           element.ArticleSummary.S,
			ArticleCreationTimestamp: element.ArticleCreationTimestamp.S,
		}
		articlesList = append(articlesList, article)
	}

	userInfo := GetUserInfoByToken(c)
	helper.APIResponse(c, articlesList, userInfo.UserId)
}

func genShortUUID() string {
	id := shortuuid.New()
	return id
}

func NewArticleDataToDynamo(c *gin.Context, body []byte) {

	jsonLambdaResponse := &model.NewArticleLambdaResponse{}
	if err := json.Unmarshal(body, jsonLambdaResponse); err != nil {
		log.Fatalf("Parse response failed, reason: %v \n", err)
	}
	userInfo := GetUserInfoByToken(c)

	newArticleDataToDynamoRequest := model.NewArticleDataToDynamoRequest{
		ArticleText:              jsonLambdaResponse.ArticleText,
		ArticleId:                jsonLambdaResponse.ArticleId,
		ArticleCreationTimestamp: jsonLambdaResponse.ArticleCreationTimestamp,
		UserId:                   userInfo.UserId,
		Language:                 jsonLambdaResponse.Language,
		SummarizedText:           jsonLambdaResponse.SummarizedText,
		ArticleCluster:           jsonLambdaResponse.ArticleCluster,
	}

	jsonDataForDynamo, err := json.Marshal(newArticleDataToDynamoRequest)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	respForDynamo, errForDynamo := http.Post(BASE_URL_ML_API+"new-articles-to-dynamo-lambda", CONTENT_TYPE, bytes.NewBuffer(jsonDataForDynamo))
	if errForDynamo != nil {
		fmt.Println("Error:", errForDynamo)
		return
	}
	defer respForDynamo.Body.Close()

	// Parsing the response to get required data and returning in API response.
	r, err := ioutil.ReadAll(respForDynamo.Body)
	fmt.Print(string(r))
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
}
