package model

type BreakingNewsLambdaReqBody struct {
	UserId        string `json:"user_id"`
	MaxPerCluster int    `json:"max_per_cluster"`
}

type BreakingNewsLambdaRequest struct {
	Body BreakingNewsLambdaReqBody `json:"body"`
}

type BreakingNewsRequest struct {
	UserId        string `json:"user_id"`
	MaxPerCluster int    `json:"diversity"`
}
