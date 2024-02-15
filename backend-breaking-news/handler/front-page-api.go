package handler

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"main.go/helper"
	"main.go/model"
)

func BreakingNews(c *gin.Context) {
	diversityQueryParam, error := strconv.Atoi(c.Query("diversity"))
	if error != nil {
		panic(error)
	}
	// pageNumberQueryParam, error := strconv.Atoi(c.Query("page"))
	// if error != nil {
	// 	pageNumberQueryParam = 1
	// }

	cognitoUserInfo := GetUserInfoByToken(c)
	user_id := cognitoUserInfo.UserId

	request := model.BreakingNewsRequest{
		UserId:        user_id,
		MaxPerCluster: diversityQueryParam,
	}

	err := c.Bind(&request)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}
	userId := request.UserId
	diversity := request.MaxPerCluster

	// Request to the ML API
	requestForLambda := model.BreakingNewsLambdaReqBody{
		UserId:        userId,
		MaxPerCluster: diversity,
	}
	requestBody := model.BreakingNewsLambdaRequest{
		Body: requestForLambda,
	}
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	resp, err := http.Post(BASE_URL_ML_API+"frontpage-breaking-news-lambda", CONTENT_TYPE, bytes.NewBuffer(jsonData))
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
	v := &model.ArticleLambdaResponse{}
	if err := json.Unmarshal(body, v); err != nil {
		log.Fatalf("Parse response failed, reason: %v \n", err)
	}

	articlesListLambda := v.Body
	articlesList := []model.Article{}

	for _, element := range articlesListLambda {
		article := model.Article{
			ArticleId:                element.ArticleId.S,
			ArticleClusterId:         element.ArticleClusterId.S,
			ArticleTitle:             element.ArticleTitle.S,
			ArticleHook:              element.ArticleHook.S,
			ArticleSummary:           element.ArticleSummary.S,
			ArticleCreationTimestamp: element.ArticleCreationTimestamp.N,
		}
		articlesList = append(articlesList, article)
	}

	if err != nil {
		helper.APIServerError(c, 400, err)
		return
	}
	helper.APIResponse(c, articlesList, cognitoUserInfo.UserId)
}

func NewsForYou(c *gin.Context) {

	genreQueryParam := c.Query("genre")
	cognitoUserInfo := GetUserInfoByToken(c)
	user_id := cognitoUserInfo.UserId

	pageNumberQueryParam, error := strconv.Atoi(c.Query("page"))
	if error != nil {
		pageNumberQueryParam = 1
	}

	request := model.NewsForYouRequest{
		UserId: user_id,
		Genre:  genreQueryParam,
	}

	err := c.Bind(&request)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return
	}

	userId := request.UserId
	genre := request.Genre

	redisKey := userId + "_" + genre

	// if page = 1
	// get the data from the model
	if pageNumberQueryParam == 1 {
		fmt.Print("Data from the model - ", err)

		// Request to the ML API
		requestForLambda := model.NewsForYouLambdaReqBody{
			UserId: userId,
			Genre:  genre,
		}
		requestBody := model.NewsForYouLambdaRequest{
			Body: requestForLambda,
		}
		jsonData, err := json.Marshal(requestBody)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		resp, err := http.Post(BASE_URL_ML_API+"frontpage-news-for-you-lambda", CONTENT_TYPE, bytes.NewBuffer(jsonData))
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

		v := &model.ArticleLambdaResponseNewsFY{}
		if err := json.Unmarshal(body, v); err != nil {
			log.Fatalf("Parse response failed, reason: %v \n", err)
		}

		articlesListLambda := v.Body
		articlesList := []model.Article{}

		for _, element := range articlesListLambda {
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

		// Insert the data
		data := articlesList
		redisValue := data
		jsonBytes, err := json.Marshal(redisValue)
		if err != nil {
			log.Fatalf("Error marshaling struct: %v", err)
		}

		// Convert the JSON bytes to a string
		redisString := string(jsonBytes)

		result := insertIt(c, redisKey, redisString)
		if result == true {
			fmt.Print("Data Successfully inserted to Redis.")
		}
		resultForAPI, err := GetDataPage(1, articlesList)
		helper.APIResponse(c, resultForAPI, cognitoUserInfo.UserId)
		return
	}

	resultIfInRedis, err := CreateRedisConnection(c).Get(redisKey).Result()
	if err != nil {
		fmt.Print("Data from the model - ", err)

		// Request to the ML API
		requestForLambda := model.NewsForYouLambdaReqBody{
			UserId: userId,
			Genre:  genre,
		}
		requestBody := model.NewsForYouLambdaRequest{
			Body: requestForLambda,
		}
		jsonData, err := json.Marshal(requestBody)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		resp, err := http.Post(BASE_URL_ML_API+"frontpage-news-for-you-lambda", CONTENT_TYPE, bytes.NewBuffer(jsonData))
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

		v := &model.ArticleLambdaResponseNewsFY{}
		if err := json.Unmarshal(body, v); err != nil {
			log.Fatalf("Parse response failed, reason: %v \n", err)
		}

		articlesListLambda := v.Body
		articlesList := []model.Article{}

		for _, element := range articlesListLambda {
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

		// Insert the data
		data := articlesList
		redisValue := data
		jsonBytes, err := json.Marshal(redisValue)
		if err != nil {
			log.Fatalf("Error marshaling struct: %v", err)
		}

		// Convert the JSON bytes to a string
		redisString := string(jsonBytes)

		result := insertIt(c, redisKey, redisString)
		if result == true {
			fmt.Print("Data Successfully inserted to Redis.")
		}
		resultForAPI, err := GetDataPage(pageNumberQueryParam, articlesList)
		helper.APIResponse(c, resultForAPI, cognitoUserInfo.UserId)
		return
	} else {
		fmt.Print("Got the data from Redis.")
		//Apply pagination here -

		var stu = &[]model.Article{}
		err = json.Unmarshal([]byte(resultIfInRedis), stu)
		if err != nil {
			fmt.Print(err)
		}

		result, err := GetDataPage(pageNumberQueryParam, *stu)
		if err != nil {
			fmt.Print(err)
			return
		}
		cognitoUserInfo := GetUserInfoByToken(c)
		user_id := cognitoUserInfo.UserId

		helper.APIResponse(c, result, user_id)
		return
	}
}

// Add Pagination - Pages start at 1, can't be 0 or less.
func GetDataPage(page int, data []model.Article) (model.ArticleWithPagination, error) {

	itemsPerPage := 20

	start := (page - 1) * itemsPerPage
	stop := start + itemsPerPage

	if start > len(data) {
		result := model.ArticleWithPagination{
			Articles:     data,
			MoreArticles: false,
		}
		return result, nil
	}

	if stop > len(data) {
		stop = len(data)
	}

	dataFromEnd := data[start:stop]
	dataFromStart := data[0:start]

	moreArticles := true
	if stop == len(data) || stop > len(data) {
		moreArticles = false
	}

	result := model.ArticleWithPagination{
		Articles:     append(dataFromStart, dataFromEnd...),
		MoreArticles: moreArticles,
	}
	return result, nil
}

func CreateRedisConnection(c *gin.Context) *redis.Client {

	client := redis.NewClient(&redis.Options{
		TLSConfig: &tls.Config{
			MinVersion: tls.VersionTLS12,
			//Certificates: []tls.Certificate{cert}
		},
		Addr:     REDIS_HOST_PORT,
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// Ping Redis to check if the connection is working
	_, err := client.Ping().Result()
	if err != nil {
		//panic(err)
		fmt.Print(err)
		helper.APIServerError(c, 500, err)
	}

	return client
}

func insertIt(c *gin.Context, key, value string) bool {
	err := CreateRedisConnection(c).Set(key, value, 0).Err()

	if err != nil {
		return false
	}
	return true
}
