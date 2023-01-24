package main

import (
	ctx "context"
	"encoding/json"
	"fmt"
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

type RatingResponse struct {
	Id    string `json:"id"`
	Value int    `json:"value"`
}

// It is called on GET /fountains/{fountainId}/rating/{ratingId}
func (app *Application) RatingGetHandler(w http.ResponseWriter, r *http.Request) {
	// Get and parse the fountain ID from request's path.
	fountainId, present := mux.Vars(r)["fountainId"]
	if !present {
		log.Println("fountain ID not present in request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Get and parse the rating ID from request's path.
	ratingId, present := mux.Vars(r)["ratingId"]
	if !present {
		log.Println("rating ID not present in request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	ratingUUID, err := uuid.Parse(ratingId)
	if err != nil {
		log.Println("ratingId ID must be a valid identifier")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Get the rating from the database.
	// This query built with fmt is safe because we parsed the IDs.
	query := fmt.Sprintf("FOR r IN ratings FILTER r._key == %q RETURN r.ratings[%q].rate",
		fountainId,
		ratingUUID.String())
	cursor, err := app.ArangoCollection.Database().Query(ctx.Background(), query, nil)
	if err != nil && arangodb.IsNotFoundGeneral(err) {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer cursor.Close()

	// Extract rating from the cursor.
	var rating int
	_, err = cursor.ReadDocument(ctx.Background(), &rating)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Generate and send JSON response to the client.
	res := RatingResponse{Id: ratingUUID.String(), Value: rating}
	payload, err := json.Marshal(res)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(payload)
}

// It is called on DELETE /fountains/{fountainId}/rating/{ratingId}
func (app *Application) RatingDeleteHandler(w http.ResponseWriter, r *http.Request) {
	// Get and parse the fountain ID from request's path.
	fountainId, present := mux.Vars(r)["fountainId"]
	if !present {
		log.Println("fountain ID not present in request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Get and parse the rating ID from request's path.
	ratingId, present := mux.Vars(r)["ratingId"]
	if !present {
		log.Println("rating ID not present in request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	ratingUUID, err := uuid.Parse(ratingId)
	if err != nil {
		log.Println("ratingId ID must be a valid identifier")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// To delete a single rating, we update the document and set to "null" the
	// rating, the database will delete that attribute.
	// This query built with fmt is safe because we parsed the IDs.
	query := fmt.Sprintf(`FOR r IN ratings
		FILTER r._key == %q
		UPDATE r WITH {ratings: {[%q]: null}} IN ratings
		OPTIONS { keepNull: false }`,
		fountainId, ratingUUID.String())
	cursor, err := app.ArangoCollection.Database().Query(ctx.Background(), query, nil)
	if err != nil && arangodb.IsNotFoundGeneral(err) {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer cursor.Close()

	w.WriteHeader(http.StatusOK)
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
	res := RatingResponse{Id: uuid.String(), Value: rating}
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
	// Get and parse the fountain ID from request's path.
	fountainId, present := mux.Vars(r)["fountainId"]
	if !present {
		log.Println("fountain ID not present in request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// All-in-one query. A bit messy, but it works.
	query := fmt.Sprintf(`FOR r IN ratings
		FILTER r._key == %q
		LET rates = TO_ARRAY(r.ratings)
		LET sum = (FOR single IN rates RETURN single.rate)
		LET res = AVG(sum)
		RETURN res != null ? CEIL(res) : 0`,
		fountainId)
	cursor, err := app.ArangoCollection.Database().Query(ctx.Background(), query, nil)
	if err != nil && arangodb.IsNotFoundGeneral(err) {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer cursor.Close()

	var average int
	_, err = cursor.ReadDocument(ctx.Background(), &average)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(strconv.Itoa(average)))
}
