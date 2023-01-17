package main

import (
	ctx "context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"

	arangodb "github.com/arangodb/go-driver"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func validRating(rating int) bool {
	return rating >= 0 && rating <= 5
}

// It is called on GET /fountains/{fountainId}/rating/{ratingId}
func (app *Application) RatingGetHandler(w http.ResponseWriter, r *http.Request) {
}

// It is called on DELETE /fountains/{fountainId}/rating/{ratingId}
func (app *Application) RatingDeleteHandler(w http.ResponseWriter, r *http.Request) {
}

// It is called on POST /fountains/{fountainId}/rating
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

	// Structs to generate the JSON patch, is something like this:
	//	{"ratings": {"XX": {"rate": 3 }}}
	type Rate struct {
		Rate int `json:"rate"`
	}

	type Update struct {
		Ratings map[string]Rate `json:"ratings"`
	}

	// Generate unique ID for the single rating.
	uuid, err := uuid.NewUUID()
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	update := Update{
		Ratings: map[string]Rate{
			uuid.String(): Rate{Rate: rating},
		}}

	// Save rating to the database.
	if _, err := app.ArangoCollection.UpdateDocument(ctx.Background(), fountainId, update); err != nil {
		if arangodb.IsNotFoundGeneral(err) {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Generate JSON response and sent to the client.
	type Response struct {
		Id    string `json:"id"`
		Value int    `json:"value"`
	}

	res := Response{Id: uuid.String(), Value: rating}
	payload, err := json.Marshal(res)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write(payload)
}

// It is called on GET /fountains/{fountainId}/rating
func (app *Application) FountainRatingGetHandler(w http.ResponseWriter, r *http.Request) {
}
