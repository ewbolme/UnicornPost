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

func GetArticleDetails(c *gin.Context) {
	articleId := c.Param("article_id")
	articleClusterId := c.Param("article_cluster_id")
	tableName := ARTICLE_DETAILS_TABLE

	// Creating a Session
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}
	//Create DynamoDB client
	svc := dynamodb.New(sess)

	var queryInput = &dynamodb.QueryInput{
		TableName: aws.String(tableName),
		KeyConditions: map[string]*dynamodb.Condition{
			"articleId": {
				ComparisonOperator: aws.String("EQ"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						S: aws.String(articleId),
					},
				},
			},
			"articleClusterId": {
				ComparisonOperator: aws.String("EQ"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						S: aws.String(articleClusterId),
					},
				},
			},
		},
	}
	var resp1, err1 = svc.Query(queryInput)
	if err1 != nil {
		fmt.Println(err1)
	}

	// Parse the query the results
	articlesList := []model.Article{}

	for _, item := range resp1.Items {
		// Accessing each attribute in the item
		article := model.Article{}
		for key, value := range item {
			if key == "articleClusterId" {
				article.ArticleClusterId = attributeValueToString(value)
			}
			if key == "articleSummary" {
				article.ArticleSummary = attributeValueToString(value)
			}
			if key == "articleHook" {
				article.ArticleHook = attributeValueToString(value)
			}
			if key == "articleTitle" {
				article.ArticleTitle = attributeValueToString(value)
			}
			if key == "articleCreationTimestamp" {
				article.ArticleCreationTimestamp = attributeValueToString(value)
			}
			if key == "articleId" {
				article.ArticleId = attributeValueToString(value)
			}
		}
		articlesList = append(articlesList, article)
	}

	userInfo := GetUserInfoByToken(c)
	helper.APIResponse(c, articlesList, userInfo.UserId)
}

// Convert DynamoDB attribute value to string for printing
func attributeValueToString(av interface{}) string {
	switch v := av.(type) {
	case *dynamodb.AttributeValue:
		switch {
		case v.S != nil:
			return *v.S
		case v.N != nil:
			return *v.N
		case v.BOOL != nil:
			return fmt.Sprintf("%t", *v.BOOL)
		default:
			return "Unknown AttributeType"
		}
	default:
		return "Unknown Type"
	}
}
