package model

type IsResetPassword struct {
	UserEmail string `json:"user_email"`
}

type IsResetPasswordResponse struct {
	IsReset bool `json:"is_reset"`
}
