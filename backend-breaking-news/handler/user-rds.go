package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"main.go/model"
)

var (
	host     = RDS_HOST
	port     = RDS_PORT
	user     = RDS_USER
	password = RDS_PASSWORD
	dbname   = RDS_DBNAME
)

func CheckUserInRDS(user_email string) bool {
	db := ConnectToDB()

	err := db.QueryRow("SELECT * FROM users WHERE user_email = $1", user_email).Scan(user_email)
	if errors.Is(err, sql.ErrNoRows) {
		// return true - if we need to proceed further - as the email does not exist in the database.
		return true
	}
	return false
}

func InsertIntoRDS(c *gin.Context, userRDS model.RDSUser) error {

	// Construct the connection string
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s", host, port, user, password, dbname)

	// Open a database connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return err
	}
	defer db.Close()

	// Try to ping the database to check the connection
	err = db.Ping()
	if err != nil {
		return err
	}

	// Use a prepared statement
	stmt, err := db.Prepare("INSERT INTO users(cognito_user_id, user_name, user_email, created_at, is_active) VALUES($1, $2, $3, $4, $5) RETURNING user_id")
	if err != nil {
		return err
	}
	defer stmt.Close()
	// Execute the prepared statement and retrieve the inserted ID
	err = stmt.QueryRow(userRDS.CognitoUserId, userRDS.UserName, userRDS.UserEmail, userRDS.CreatedAt, userRDS.IsActive).Scan(&userRDS.UserId)
	if err != nil {
		return err
	}

	return nil
}
func GetUserInfo(c *gin.Context, user_email string) (userInRDS model.RDSUser, err error) {
	// Construct the connection string
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s",
		host, port, user, password, dbname)
	fmt.Print(connStr)
	// Open a database connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Try to ping the database to check the connection
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Successfully connected to the database!")

	// Select a particular column value from the table
	var userId string
	var userName string
	var cognitoUserId string

	err = db.QueryRow("SELECT user_name,user_id,cognito_user_id FROM users WHERE user_email = $1", user_email).Scan(&userName, &userId, &cognitoUserId)
	if err != nil {
		return model.RDSUser{}, err
	}

	userInRDS = model.RDSUser{
		UserId:        userId,
		UserName:      userName,
		CognitoUserId: cognitoUserId,
	}

	return userInRDS, nil
}

func ConnectToDB() *sql.DB {
	// Construct the connection string
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s",
		host, port, user, password, dbname)

	// Open a database connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	// Try to ping the database to check the connection
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Successfully connected to the database!")
	return db
}

func GetUserNameByCognitoId(cognito_user_id string, db *sql.DB) string {
	// Select a particular column value from the table
	var userName string

	err := db.QueryRow("SELECT user_name FROM users WHERE cognito_user_id = $1", cognito_user_id).Scan(&userName)

	// Check if the error is due to no rows found
	if errors.Is(err, sql.ErrNoRows) {
		// Set userName to "amazon media"
		userName = "Amazon media"
		return userName
	} else if err != nil {
		// Handle other errors, if any
		panic(err)
	}
	db.Close()
	return userName
}

func GetUserNameByUserEmail(user_email string) (string, error) {
	// Select a particular column value from the table
	var userName string

	dbNew := ConnectToDB()

	err := dbNew.QueryRow("SELECT user_name FROM users WHERE user_email = $1", user_email).Scan(&userName)
	if err != nil {
		return "", err
	}
	dbNew.Close()
	return userName, nil
}

func GetRDSCreds() model.RDSSecretManager {
	secretName := "dev/rds"

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(REGION_NAME)},
	)
	if err != nil {
		fmt.Println(err)
	}

	// Create Secrets Manager client
	svc := secretsmanager.New(sess)

	input := &secretsmanager.GetSecretValueInput{
		SecretId:     aws.String(secretName),
		VersionStage: aws.String("AWSCURRENT"), // VersionStage defaults to AWSCURRENT if unspecified
	}

	result, err := svc.GetSecretValue(input)
	if err != nil {
		log.Fatal(err.Error())
	}

	// Decrypts secret using the associated KMS key.
	var secretString string = *result.SecretString

	rdsData := model.RDSSecretManager{}

	error := json.Unmarshal([]byte(secretString), &rdsData)
	if error != nil {
		fmt.Println("Error:", err)
	}
	return rdsData
}

func SetIsResetFlagToFalse(user_email string) error {

	dbNew := ConnectToDB()

	err := dbNew.QueryRow("UPDATE users SET is_reset = false where user_email = $1", user_email)
	if err != nil {
		return errors.New("No user found in database.")
	}
	dbNew.Close()
	return nil
}

func SetIsResetFlagToTrue(user_email string) error {

	dbNew := ConnectToDB()

	err := dbNew.QueryRow("UPDATE users SET is_reset = true where user_email = $1", user_email)
	if err != nil {
		return errors.New("No user found in database.")
	}
	dbNew.Close()
	return nil
}

func GetIsResetFlagFromDB(user_email string) (bool, error) {

	is_reset := false

	dbNew := ConnectToDB()

	fmt.Print("user_email", user_email)

	err := dbNew.QueryRow("SELECT is_reset FROM users where user_email = $1", user_email).Scan(&is_reset)
	if err != nil {
		fmt.Print(err)
		return is_reset, err
	}
	dbNew.Close()
	return is_reset, nil
}

func SetIsResetPasswordCount(user_email string) (int, error) {
	reset_password_count := 0
	dbNew := ConnectToDB()

	err := dbNew.QueryRow("SELECT reset_password_count FROM users where user_email = $1", user_email).Scan(&reset_password_count)
	if err != nil {
		fmt.Print(err)
		return 0, err
	}

	fmt.Print("reset_password_count", reset_password_count)

	newCount := reset_password_count + 1

	// Use a prepared statement
	stmt, err2 := dbNew.Prepare("UPDATE users SET reset_password_count = $1 where user_email = $2")
	if err2 != nil {
		return 0, err2
	}
	defer stmt.Close()
	// Execute the prepared statement and retrieve the inserted ID
	err2 = stmt.QueryRow(newCount, user_email).Err()
	if err2 != nil {
		return 0, err2
	}

	dbNew.Close()
	return newCount, nil
}

func GetResetPasswordCount(user_email string) (int, error) {
	reset_password_count := 0
	dbNew := ConnectToDB()

	err := dbNew.QueryRow("SELECT reset_password_count FROM users where user_email = $1", user_email).Scan(&reset_password_count)
	if err != nil {
		fmt.Print(err)
		return 0, err
	}

	fmt.Print("reset_password_count", reset_password_count)

	dbNew.Close()
	return reset_password_count, nil
}
