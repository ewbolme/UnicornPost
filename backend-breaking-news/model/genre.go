package model

type GenreAvailable struct {
	Genres []string `json:"genres_available"`
}

type ArticleGenresFromDB struct {
	GenresFromDB string `json:"genre_from_db"`
}
