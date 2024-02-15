package handler

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"main.go/helper"
	"main.go/model"
)

func IsResetPassword(c *gin.Context) {

	var (
		request model.IsResetPassword
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

	isReset, error := GetIsResetFlagFromDB(userEmail)
	if error != nil {
		fmt.Print(err)
	}

	resp := model.IsResetPasswordResponse{
		IsReset: isReset,
	}

	helper.APIResponseUserOnboard(c, resp)
}
