package model

import "time"

type CreateUserRequest struct {
	UserName  string `json:"user_name"`
	UserEmail string `json:"user_email"`
	Password  string `json:"password"`
}

type UserInfo struct {
	UserName     string `json:"user_name"`
	UserEmail    string `json:"user_email"`
	UserPassword string `json:"user_password"`
}

type UserInfoInCognito struct {
	UserName  string `json:"user_name"`
	UserEmail string `json:"user_email"`
	UserId    string `json:"user_id"`
	EventId   string `json:"event_id"`
}

type RDSUser struct {
	UserId        string    `json:"user_id"`
	CognitoUserId string    `json:"cognito_user_id"`
	UserName      string    `json:"user_name"`
	UserEmail     string    `json:"user_email"`
	CreatedAt     time.Time `json:"created_at"`
	IsActive      bool      `json:"is_active"`
}

type LoginRequest struct {
	UserEmail    string `json:"user_email"`
	UserPassword string `json:"user_password"`
}

type AuthenticationResult struct {
	AccessToken  string `json:"access_token"`
	ExpiresIn    int64  `json:"expires_in"`
	IdToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
}

type VerifyUserRequest struct {
	VerificationCode string `json:"verification_code"`
	UserName         string `json:"user_name"`
}

type VerifyUserForgotPasswordInput struct {
	VerificationCode string `json:"verification_code"`
	UserEmail        string `json:"user_email"`
}

type ForgotPasswordRequest struct {
	UserEmail string `json:"user_email"`
}

type ResetPasswordRequest struct {
	UserEmail        string `json:"user_email"`
	ConfirmationCode string `json:"confirmation_code"`
	UserPassword     string `json:"user_password"`
}

type JwtClaim struct {
	CognitoUserId  string `json:"cognito_user_id"`
	UserName       string `json:"user_name"`
	UserEmail      string `json:"user_email"`
	EmailVerified  bool   `json:"email_verified"`
	ExpirationTime int64  `json:"expiration_time"`
	CreationTime   int64  `json:"creation_time"`
	EventId        string `json:"event_id"`
}

type Cognito struct {
	ClientId   string `json:"cognito_client_id"`
	SecretKey  string `json:"cognito_secret_key"`
	UserPoolId string `json:"cognito_user_pool_id"`
}

type RDSSecretManager struct {
	UserName             string `json:"username"`
	Password             string `json:"password"`
	Engine               string `json:"engine"`
	Host                 string `json:"host"`
	Port                 string `json:"port"`
	DbInstanceIdentifier string `json:"dbInstanceIdentifier"`
}

type CognitoSecretManager struct {
	CognitoClientId   string `json:"cognito_client_id"`
	CognitoSecretKey  string `json:"cognito_secret_key"`
	CognitoUserPoolId string `json:"cognito_user_pool_id"`
}

type ResendVerificationMail struct {
	UserEmail string `json:"user_email"`
}

type VerifyResetPasswordCount struct {
	UserEmail          string `json:"user_email"`
	ResetPasswordCount string `json:"reset_password_count"`
}
type VerifyResetPasswordCountResponse struct {
	ToResetPassword bool `json:"to_reset_password"`
}
