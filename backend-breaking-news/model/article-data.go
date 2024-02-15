package model

type Article struct {
	ArticleId                string `json:"article_id"`
	ArticleClusterId         string `json:"article_cluster_id"`
	ArticleTitle             string `json:"article_title"`
	ArticleHook              string `json:"article_hook"`
	ArticleSummary           string `json:"article_summary"`
	ArticleCreationTimestamp string `json:"posted_on"`
}
type ArticleWithPagination struct {
	Articles     []Article `json:"articles"`
	MoreArticles bool      `json:"more_articles"`
}

type DetailedArticle struct {
	ArticleId                string `json:"article_id"`
	ArticleTitle             string `json:"article_title"`
	ArticleHook              string `json:"article_hook"`
	ArticleSummary           string `json:"article_summary"`
	ArticleCreationTimestamp string `json:"posted_on"`
}

type ArticleLambda struct {
	ArticleId                StringEntity `json:"articleId"`
	ArticleSummary           StringEntity `json:"articleSummary"`
	ArticleTitle             StringEntity `json:"articleTitle"`
	ArticleClusterId         StringEntity `json:"articleClusterId"`
	ArticleCreationTimestamp NumberEntity `json:"articleCreationTimestamp"`
	ArticleHook              StringEntity `json:"articleHook"`
}

type ArticleLambdaNewsFY struct {
	ArticleId                StringEntity `json:"articleId"`
	ArticleClusterId         StringEntity `json:"articleClusterId"`
	ArticleTrigger           StringEntity `json:"articleTrigger"`
	ArticleSummary           StringEntity `json:"articleSummary"`
	ArticleTitle             StringEntity `json:"articleTitle"`
	ArticleCreationTimestamp StringEntity `json:"articleCreationTimestamp"`
	ArticleHook              StringEntity `json:"articleHook"`
}

type ArticleLambdaResponse struct {
	StatusCode int             `json:"statusCode"`
	Body       []ArticleLambda `json:"body"`
}

type ArticleLambdaResponseNewsFY struct {
	StatusCode int                   `json:"statusCode"`
	Body       []ArticleLambdaNewsFY `json:"body"`
}

type ListArticles struct {
	Articles []Article `json:"articles"`
}
