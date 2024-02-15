package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"main.go/handler"
	"main.go/helper"

	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
)

var (
	ginLambda *ginadapter.GinLambda
)

func init() {
	local := false
	r := gin.Default()

	// Enable CORS
	r.Use(cors.New(helper.CORS()))

	log.Println(r, "r")
	handler.Routes(r)
	if local {
		r.Run(":5002")
	}

	ginLambda = ginadapter.New(r)
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// If no name is provided in the HTTP request body, throw an error
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	log.SetFlags(log.Lshortfile | log.LstdFlags)
	lambda.Start(Handler)
}
