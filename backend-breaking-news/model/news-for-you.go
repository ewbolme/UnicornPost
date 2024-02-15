package model

type NewsForYouLambdaReqBody struct {
	UserId string `json:"user_id"`
	Genre  string `json:"genre_filter_value"`
}

type NewsForYouLambdaRequest struct {
	Body NewsForYouLambdaReqBody `json:"body"`
}

type NewsForYouRequest struct {
	UserId string `json:"user_id"`
	Genre  string `json:"genre"`
}
