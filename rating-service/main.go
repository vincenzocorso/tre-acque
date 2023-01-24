package main

import (
	ctx "context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"

	arangodb "github.com/arangodb/go-driver"
	arangohttp "github.com/arangodb/go-driver/http"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	kafka "github.com/segmentio/kafka-go"
)

type Application struct {
	ArangoClient     arangodb.Client
	ArangoCollection arangodb.Collection

	KafkaConn *kafka.Reader
}

func main() {
	// Load environment variables for the configuration.
	if err := godotenv.Load(); err != nil {
		log.Print("Error loading file config, skipping it: ", err)
	}
	log.Print("Loaded configuration:")
	log.Printf("\tARANGODB_URL=%s", os.Getenv("ARANGODB_URL"))
	log.Printf("\tARANGODB_DB=%s", os.Getenv("ARANGODB_DB"))
	log.Printf("\tKAFKA_URL=%s", os.Getenv("KAFKA_URL"))
	log.Printf("\tKAFKA_GROUPID=%s", os.Getenv("KAFKA_GROUPID"))
	log.Printf("\tKAFKA_TOPIC=%s", os.Getenv("KAFKA_TOPIC"))
	log.Printf("\tSERVER_PORT=%s", os.Getenv("SERVER_PORT"))

	// ArangoDB.
	log.Println("Initializing ArangoDB connection...")
	arangoConn, err := arangohttp.NewConnection(arangohttp.ConnectionConfig{
		Endpoints: []string{os.Getenv("ARANGODB_URL")},
	})
	if err != nil {
		log.Fatal(err)
	}

	arangoClient, err := arangodb.NewClient(arangodb.ClientConfig{Connection: arangoConn})
	if err != nil {
		log.Fatal(err)
	}

	dbConn, err := arangoClient.Database(ctx.Background(), os.Getenv("ARANGODB_DB"))
	if err != nil && arangodb.IsNotFoundGeneral(err) {
		dbConn, err = arangoClient.CreateDatabase(ctx.Background(), os.Getenv("ARANGODB_DB"), nil)
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

	// Kafka.
	log.Println("Initializing Kafka connection...")
	kafkaConn := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{os.Getenv("KAFKA_URL")},
		GroupID: os.Getenv("KAFKA_GROUPID"),
		Topic:   os.Getenv("KAFKA_TOPIC"),
	})

	app := &Application{
		ArangoClient:     arangoClient,
		ArangoCollection: colConn,
		KafkaConn:        kafkaConn,
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
		Addr:    strings.Join([]string{":", os.Getenv("SERVER_PORT")}, ""),
		Handler: router,
	}

	// Prepare and start a goroutine that handles Kafka messages.
	// This channel is used to signal that the goroutine has exited.
	kafkaClosed := make(chan bool, 1)
	go app.kafkaHandler(kafkaClosed)

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
	<-kafkaClosed
	log.Println("Interruption singal received, stopping server...")

	if err := server.Shutdown(ctx.Background()); err != nil {
		log.Println(err)
	}
	log.Println("Server stopped")
	os.Exit(0)
}
