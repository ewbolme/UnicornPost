package handler

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/gin-gonic/gin"
	"main.go/helper"
	"main.go/model"
)

// To get the values for the genre.
func GetGenreDetails(c *gin.Context) {
	tableName := ARTICLE_DETAILS_TABLE
	pageSize := 1000 // Set your desired page size

	// Creating a Session
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}

	// Create DynamoDB client
	svc := dynamodb.New(sess)

	var lastEvaluatedKey map[string]*dynamodb.AttributeValue
	var articlesList []model.ArticleGenresFromDB

	for {
		params := &dynamodb.ScanInput{
			TableName:         aws.String(tableName),
			Limit:             aws.Int64(int64(pageSize)),
			ExclusiveStartKey: lastEvaluatedKey,
		}

		result, err := svc.Scan(params)
		if err != nil {
			fmt.Println(err)
			break
		}

		// Parse the query results
		for _, item := range result.Items {
			// Accessing each attribute in the item
			article := model.ArticleGenresFromDB{}
			for key, value := range item {
				if key == "articleGenre" {
					article.GenresFromDB = attributeValueToString(value)
				}
			}
			articlesList = append(articlesList, article)
		}

		if result.LastEvaluatedKey == nil {
			// No more pages to scan
			break
		}

		lastEvaluatedKey = result.LastEvaluatedKey
	}

	var arr []string
	for _, item := range articlesList {
		if item.GenresFromDB != "" && item.GenresFromDB != "nan" {
			arr = append(arr, item.GenresFromDB)
		}
	}

	cognitoUserInfo := GetUserInfoByToken(c)
	genreResponse := model.GenreAvailable{
		Genres: unique(arr),
	}

	helper.APIResponse(c, genreResponse, cognitoUserInfo.UserId)
}

// func GetGenres(c *gin.Context) {
// 	var genres [4]string
// 	genres[0] = "tech"
// 	genres[1] = "crypto currency"
// 	genres[2] = "non tech"
// 	genres[3] = "cloud provider news"

// 	genreResponse := model.GenreAvailable{
// 		Genres: genres[:],
// 	}

// 	cognitoUserInfo := GetUserInfoByToken(c)
// 	helper.APIResponse(c, genreResponse, cognitoUserInfo.UserId)
// }

// // To get the Dynamic values for the genre from the dynamo.
// func GetGenreDetails(c *gin.Context) {

// 	tableName := ARTICLE_DETAILS_TABLE

// 	// Creating a Session
// 	sess, err := session.NewSession(&aws.Config{
// 		Region: aws.String(REGION_NAME)},
// 	)
// 	if err != nil {
// 		fmt.Println(err)
// 	}
// 	// Create DynamoDB client
// 	svc := dynamodb.New(sess)

// 	params := &dynamodb.ScanInput{
// 		TableName: aws.String(tableName),
// 	}
// 	result, err := svc.Scan(params)
// 	if err != nil {
// 		fmt.Println(err)
// 	}
// 	var count int
// 	// Parse the query the results
// 	articlesList := []model.ArticleGenresFromDB{}

// 	for _, item := range result.Items {
// 		count++
// 		// Accessing each attribute in the item
// 		article := model.ArticleGenresFromDB{}
// 		for key, value := range item {
// 			if key == "articleGenre" {
// 				article.GenresFromDB = attributeValueToString(value)
// 			}
// 		}
// 		articlesList = append(articlesList, article)
// 	}
// 	fmt.Print("count-------------------------------------", count)
// 	arr := []string{}
// 	for _, item := range articlesList {
// 		if item.GenresFromDB != "" {
// 			if item.GenresFromDB != "nan" {
// 				arr = append(arr, item.GenresFromDB)
// 			}
// 		}
// 	}
// 	cognitoUserInfo := GetUserInfoByToken(c)
// 	genreResponse := model.GenreAvailable{
// 		Genres: unique(arr),
// 	}

// 	helper.APIResponse(c, genreResponse, cognitoUserInfo.UserId)
// }

func unique(arr []string) []string {
	occurred := map[string]bool{}
	result := []string{}
	for e := range arr {
		// check if already the mapped
		// variable is set to true or not
		if occurred[arr[e]] != true {
			occurred[arr[e]] = true

			// Append to result slice.
			result = append(result, arr[e])
		}
	}
	return result
}
