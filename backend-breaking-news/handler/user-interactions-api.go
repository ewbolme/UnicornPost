package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"main.go/helper"
	"main.go/model"
)

func SaveUserInteractionsData(c *gin.Context) {
	var (
		request model.UserInteractionsDataRequest
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

	cognitoUserInfo := GetUserInfoByToken(c)
	event_id := cognitoUserInfo.EventId

	reqForLambda := model.UserInteractionsDataRequestLambda{
		UserId:               request.UserId,
		ArticleId:            request.ArticleId,
		InteractionTimeStamp: request.InteractionTimeStamp,
		SessionId:            event_id,
		EventId:              genShortUUID(),
	}

	jsonData, err := json.Marshal(reqForLambda)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	resp, err := http.Post(BASE_URL_ML_API+"fetch-live-interactions", CONTENT_TYPE, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// Parsing the response to get required data and returning in API response.
	// body, err := ioutil.ReadAll(resp.Body)
	// if err != nil {
	// 	fmt.Println("Error:", err)
	// 	return
	// }
	bodyForAPI := ""
	if resp.StatusCode == 200 {
		bodyForAPI = "Data Ingested Successfully."
	} else {
		bodyForAPI = "Error Encountered."
	}

	helper.APIResponse(c, bodyForAPI, cognitoUserInfo.UserId)
}
