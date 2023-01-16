package main

import (
	ctx "context"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

func validRating(rating int) bool {
	return rating >= 0 && rating <= 5
}

func (app *Application) RatingGetHandler(w http.ResponseWriter, r *http.Request) {
}

func (app *Application) RatingDeleteHandler(w http.ResponseWriter, r *http.Request) {
}

func (app *Application) RatingPostHandler(w http.ResponseWriter, r *http.Request) {
	// Get the fountain ID from request's path.
	fountainId, present := mux.Vars(r)["fountainId"]
	if !present {
		log.Println("fountain ID not present in request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Get and parse the rating from the request's body.
	raw, err := io.ReadAll(r.Body)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	rating, err := strconv.Atoi(string(raw))
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if !validRating(rating) {
		log.Println("rating should be between 0 and 5")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	type Rate struct {
		Rate int `json:"rate"`
	}

	type Update struct {
		Ratings map[string]Rate `json:"ratings"`
	}

	update := Update{
		Ratings: map[string]Rate{
			"LL": Rate{Rate: 4}, // TODO KEY GEN
		}}

	if _, err := app.colConn.UpdateDocument(context.Background(), "fountainId", update); err != nil {
		if arangodb.IsNotFoundGeneral(err) {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(fountainId))
}

func (app *Application) FountainRatingGetHandler(w http.ResponseWriter, r *http.Request) {
}
