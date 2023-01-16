package main

import (
	"net/http"
	ctx "context"

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

	colName := strings.Join([]string{"fountain", fountainId}, "")
	if found, err := app.ArangoClient.CollectionExists(ctx.Background(), colName); err != nil {
		log.Println("rating should be between 0 and 5")
		w.WriteHeader(http.StatusInternalServerError)
	} else if !found {
		log.Println("rating should be between 0 and 5")
		w.WriteHeader(http.StatusNotFound)
	}

	col, err := app.ArangoClient.Collection(ctx.Background(), colName)
	if err != nil {
		// TODO
	}


	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(fountainId))
}

func (app *Application) FountainRatingGetHandler(w http.ResponseWriter, r *http.Request) {
}
