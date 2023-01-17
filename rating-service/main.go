package main

import (
	ctx "context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"

	arangodb "github.com/arangodb/go-driver"
	arangohttp "github.com/arangodb/go-driver/http"
	"github.com/gorilla/mux"
)

type Application struct {
	ArangoClient     arangodb.Client
	ArangoCollection arangodb.Collection
}

func main() {
	// ArangoDB
	log.Println("Initializing database connection...")
	arangoConn, err := arangohttp.NewConnection(arangohttp.ConnectionConfig{
		Endpoints: []string{"http://localhost:8529"},
	})
	if err != nil {
		log.Fatal(err)
	}

	arangoClient, err := arangodb.NewClient(arangodb.ClientConfig{Connection: arangoConn})
	if err != nil {
		log.Fatal(err)
	}

	dbConn, err := arangoClient.Database(ctx.Background(), "ratingsdb")
	if err != nil && arangodb.IsNotFoundGeneral(err) {
		dbConn, err = arangoClient.CreateDatabase(ctx.Background(), "ratingsdb", nil)
		if err != nil {
			log.Fatal(err)
		}
	} else if err != nil {
		log.Fatal(err)
	}

	colConn, err := dbConn.Collection(ctx.Background(), "ratings")
	if err != nil && arangodb.IsNotFoundGeneral(err) {
		colConn, err = dbConn.CreateCollection(ctx.Background(), "ratings", nil)
		if err != nil {
			log.Fatal(err)
		}
	} else if err != nil {
		log.Fatal(err)
	}

	app := &Application{
		ArangoClient:     arangoClient,
		ArangoCollection: colConn,
	}

	// Webserver.
	log.Println("Initializing webserver...")
	router := mux.NewRouter()

	router.HandleFunc("/fountains/{fountainId}/rating/{ratingId}", app.RatingGetHandler).
		Methods("GET")
	router.HandleFunc("/fountains/{fountainId}/rating/{ratingId}", app.RatingDeleteHandler).
		Methods("DELETE")
	router.HandleFunc("/fountains/{fountainId}/rating", app.RatingPostHandler).
		Methods("POST")
	router.HandleFunc("/fountains/{fountainId}/rating", app.FountainRatingGetHandler).
		Methods("GET")

	router.HandleFunc("/liveness", app.LivenessHandler)
	router.HandleFunc("/readiness", app.ReadinessHandler)
	router.HandleFunc("/startup", app.StartupHandler)

	server := http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	go func() {
		log.Printf("Server listening at %s address", server.Addr)
		if err := server.ListenAndServe(); err != nil {
			if !errors.Is(err, http.ErrServerClosed) {
				log.Println(err)
			}
		}
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)

	<-c
	log.Println("Interruption singal received, stopping server...")

	if err := server.Shutdown(ctx.Background()); err != nil {
		log.Println(err)
	}
	log.Println("Server stopped")
	os.Exit(0)
}
