package helper

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
)

// APIResponse
func APIResponse(ctx *gin.Context, data interface{}, user_id string) {

	ctx.JSON(http.StatusOK, gin.H{
		"user_id": user_id,
		"error":   false,
		"data":    data,
	})
}

// APIResponse for Login API
func APIResponseWithEmail(ctx *gin.Context, data interface{}, isConfirmed bool, user_email string, user_name string, user_id string) {

	ctx.JSON(http.StatusOK, gin.H{
		"is_confirmed": isConfirmed,
		"user_name":    user_name,
		"user_id":      user_id,
		"user_email":   user_email,
		"error":        false,
		"data":         data,
	})
}

// APIResponse For Signup - no user email, id in return response
func APIResponseUserOnboard(ctx *gin.Context, data interface{}) {

	ctx.JSON(http.StatusOK, gin.H{
		"error": false,
		"data":  data,
	})
}

// API Server Error Response
func APIResponseWithStatusCode(ctx *gin.Context, statusCode int, message string) {

	ctx.JSON(statusCode, gin.H{
		"message": message,
	})
}

// API Server Error Response
func APIServerError(ctx *gin.Context, statusCode int, err error) {

	printStackTrace(err)

	ctx.JSON(statusCode, gin.H{
		"error":   true,
		"message": err.Error(),
	})
}

type stacktracer interface {
	StackTrace() errors.StackTrace
}

type causer interface {
	Cause() error
}

func printStackTrace(err error) {

	var errStack errors.StackTrace

	for err != nil {
		// Find the earliest error.StackTrace
		if t, ok := err.(stacktracer); ok {
			errStack = t.StackTrace()
		}
		if c, ok := err.(causer); ok {
			err = c.Cause()
		} else {
			break
		}
	}
	if errStack != nil {
		fmt.Println(err)
		fmt.Printf("%+v\n", errStack)
	} else {
		fmt.Printf("%+v\n", errors.WithStack(err))
	}
}

func CORS() cors.Config {
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AddAllowHeaders("Authorization")
	corsConfig.AddAllowMethods("DELETE,GET,POST,PUT")
	return corsConfig
}
