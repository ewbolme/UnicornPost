package model

type PersonalizedNewsletterRequest struct {
	Diversity      int    `json:"diversity"`
	IsGenAIEnabled bool   `json:"is_gen_ai_enabled"`
	PromptData     string `json:"prompt_data"`
}

type NewsletterLambdaRequest struct {
	Body NewsletterLambdaReqBody `json:"body"`
}

type NewsletterLambdaReqBody struct {
	UserId         string `json:"user_id"`
	UserName       string `json:"user_name"`
	IsGenAIEnabled string `json:"is_gen"`
	Diversity      int    `json:"desired_items"`
	PromptData     string `json:"prompts"`
}

type NewsletterResponse struct {
	PersonalizedNewsletter string `json:"personalized_newsletter"`
}

type EmailWithArticleDetails struct {
	Email    string           `json:"email"`
	Articles []ArticleDetails `json:"articles"`
}

type ArticleDetails struct {
	ArticleId        string `json:"article_id"`
	ArticleTrigger   string `json:"article_trigger"`
	ArticleClusterId string `json:"article_cluster_id"`
}
