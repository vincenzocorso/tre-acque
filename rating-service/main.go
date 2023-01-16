package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"

	"github.com/gorilla/mux"
	arangodb "github.com/arangodb/go-driver"
	arangohttp "github.com/arangodb/go-driver/http"
)

type Application struct {
	ArangoClient arangodb.Client
}

func main() {
	// ArangoDB
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

	app := &Application{
		ArangoClient: arangoClient,
	}

	// Webserver.
	router := mux.NewRouter()

	router.HandleFunc("/fountains/{fountainId}/rating/{ratingId}", app.ratingGetHandler).
		Methods("GET")
	router.HandleFunc("/fountains/{fountainId}/rating/{ratingId}", app.ratingDeleteHandler).
		Methods("DELETE")
	router.HandleFunc("/fountains/{fountainId}/rating", app.ratingPostHandler).
		Methods("POST")
	router.HandleFunc("/fountains/{fountainId}/rating", app.fountainRatingGetHandler).
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

	if err := server.Shutdown(context.Background()); err != nil {
		log.Println(err)
	}
	log.Println("Server stopped")
	os.Exit(0)
}
