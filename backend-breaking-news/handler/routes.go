package handler

import (
	"github.com/gin-gonic/gin"
)

func Routes(r *gin.Engine) {

	// User Onboarding APIs
	r.POST("create-user", CreateUser)
	r.POST("login", Login)
	r.POST("verify-user", VerifyUser)
	r.POST("forgot-password", ForgotPassword)
	r.POST("reset-password", ConfirmForgotPassword)
	r.POST("resend-verification-mail", ResendVerificationMail)
	r.POST("is-reset-password", IsResetPassword)
	r.POST("verify-reset-password-count", VerifyResetPasswordCount)

	r.Use(Authentication)
	{
		// Front page APIs.
		r.GET("breaking-news", BreakingNews)
		r.GET("news-for-you", NewsForYou)

		r.POST("user-interactions", SaveUserInteractionsData)

		// New Articles page APIs.
		r.POST("new-article", NewArticle)
		r.GET("last-articles-by-user", GetLastArticleByReader)

		// Personalized Newsletter page APIs.
		r.POST("newsletter", GetPersonalizedNewsletter)

		// Article details API (summary)
		r.GET("article-details/:article_id/:article_cluster_id", GetArticleDetails)

		// Genre API
		r.GET("genres", GetGenreDetails)

	}
}

func Authentication(c *gin.Context) {
	AuthenticationJwtMiddleware(c)
}
