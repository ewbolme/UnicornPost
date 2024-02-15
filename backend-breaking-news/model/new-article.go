package model

type NewArticleLambdaRequest struct {
	S3Path string `json:"s3_path"`
}

type NewArticleLambdaResponse struct {
	ArticleText              string   `json:"article_text"`
	ArticleId                string   `json:"article_id"`
	ArticleCreationTimestamp string   `json:"timestamp"`
	UserIds                  []string `json:"user_list"`
	Language                 string   `json:"language"`
	SummarizedText           string   `json:"summarized_text"`
	ArticleCluster           string   `json:"article_cluster"`
	S3Path                   string   `json:"s3_path"`
}

type NewArticleDataToDynamoRequest struct {
	ArticleText              string `json:"article_text"`
	ArticleId                string `json:"article_id"`
	ArticleCreationTimestamp string `json:"timestamp"`
	UserId                   string `json:"user_id"`
	Language                 string `json:"language"`
	SummarizedText           string `json:"summarized_text"`
	ArticleCluster           string `json:"article_cluster"`
}

type NewArticleText struct {
	Data   string `json:"data"`
	UserId string `json:"user_id"`
}

type NewArticleTextReq struct {
	Data string `json:"data"`
}

type ResponseStructure struct {
	UserName        string `json:"user_name"`
	UserId          string `json:"user_id"`
	ProfileImageUrl string `json:"profile_image_url"`
}

type ArticleByReaderRequest struct {
	UserId string `json:"user_id"`
}

// User Interactions Data
type UserInteractionsDataRequestLambda struct {
	UserId               string `json:"user_id"`
	ArticleId            string `json:"article_id"`
	InteractionTimeStamp string `json:"interaction_timestamp"`
	SessionId            string `json:"session_id"`
	EventId              string `json:"event_id"`
}

type UserInteractionsDataRequest struct {
	UserId               string `json:"user_id"`
	ArticleId            string `json:"article_id"`
	InteractionTimeStamp string `json:"interaction_timestamp"`
}
