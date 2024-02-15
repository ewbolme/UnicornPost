package handler

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"main.go/model"
)

func AuthenticationJwtMiddleware(c *gin.Context) {
	token := c.GetHeader("Authorization")

	if token == "" {
		c.Abort()
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   true,
			"message": "No authentication token provided.",
		})
	}

	// if bearer token is provided
	if token != "" {
		_, err := VerifyToken(strings.Split(token, " ")[1])
		if err != nil {
			c.Abort()
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   true,
				"message": err.Error(),
			})
		}
	}
}

func VerifyToken(token string) (model.JwtClaim, error) {
	var (
		jwtdata model.JwtClaim
	)

	jwttoken, _ := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(""), nil
	})

	claims, _ := jwttoken.Claims.(jwt.MapClaims)

	jwtdata = model.JwtClaim{
		CognitoUserId:  fmt.Sprintf("%v", claims["sub"]),
		UserEmail:      fmt.Sprintf("%v", claims["email"]),
		UserName:       fmt.Sprintf("%v", claims["cognito:username"]),
		EmailVerified:  bool(claims["email_verified"].(bool)),
		ExpirationTime: (time.Unix(int64(claims["exp"].(float64)), 0)).Unix(),
		CreationTime:   (time.Unix(int64(claims["auth_time"].(float64)), 0)).Unix(),
		EventId:        fmt.Sprintf("%v", claims["event_id"]),
	}

	if jwtdata.ExpirationTime != 0 && int64(jwtdata.ExpirationTime) <= time.Now().Unix() {
		return jwtdata, errors.New("Expired token")
	}

	return jwtdata, nil
}

func GetUserInfoByToken(ctx *gin.Context) model.UserInfoInCognito {

	// Extracting the bearer token
	reqToken := ctx.Request.Header.Get("Authorization")
	splitToken := strings.Split(reqToken, "Bearer")
	if len(splitToken) != 2 {
		// Error: Bearer token not in proper format
		log.Println("Bearer token not in proper format")
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Bearer token not in proper format.",
		})
		return model.UserInfoInCognito{}
	}

	reqToken = strings.TrimSpace(splitToken[1])

	jwtData, errJwt := VerifyToken(reqToken)
	if errJwt != nil {
		log.Println(errJwt)
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Error while binding the data.",
		})
		return model.UserInfoInCognito{}
	}

	userInfo := model.UserInfoInCognito{
		UserEmail: jwtData.UserEmail,
		UserName:  jwtData.UserName,
		UserId:    jwtData.CognitoUserId,
		EventId:   jwtData.EventId,
	}

	return userInfo
}
