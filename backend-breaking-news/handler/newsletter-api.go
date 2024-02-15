package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"main.go/helper"
	"main.go/model"
)

func GetPersonalizedNewsletter(c *gin.Context) {
	var (
		request model.PersonalizedNewsletterRequest
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
	user_id := cognitoUserInfo.UserId
	user_name := cognitoUserInfo.UserName

	// Request to the ML API
	requestForLambda := model.NewsletterLambdaReqBody{
		UserId:         user_id,
		UserName:       user_name,
		IsGenAIEnabled: strconv.FormatBool(request.IsGenAIEnabled),
		Diversity:      request.Diversity,
		PromptData:     request.PromptData,
	}

	jsonData, err := json.Marshal(requestForLambda)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	resp, err := http.Post(PERSONALIZED_NEWSLETTER_FUNCTIONAL_URL, CONTENT_TYPE, bytes.NewBuffer(jsonData))
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

	v := &model.EmailWithArticleDetails{}
	if err := json.Unmarshal(body, v); err != nil {
		log.Fatalf("Parse response failed, reason: %v \n", err)
	}

	defer resp.Body.Close()

	helper.APIResponse(c, v, cognitoUserInfo.UserId)
}
