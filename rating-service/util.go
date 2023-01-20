package main

import (
	"context"
	ctx "context"
	"log"
	"net/http"
	"time"

	kafka "github.com/segmentio/kafka-go"
)

// probeHandler does some checks in common for both LivenessHandler and
// ReadinessHandler.
func (app *Application) probeHandler() bool {
	// We do not expect more than one database (even if it can be distribuited).
	if _, err := app.ArangoClient.Version(context.Background()); err != nil {
		log.Println(err)
		return false
	}

	for _, broker := range app.KafkaConn.Config().Brokers {
		client := kafka.Client{Addr: broker, Timeout: 10 * time.Second}
		req := kafka.HeartbeatRequest{Addr: broker,
			GroupID: kafkaConn.Config().GroupID(),
		}

		res, err := client.Heartbeat(ctx.Background(), req)
		if err != nil {
			log.Println(err)
			return false
		}
		if res.Error != nil {
			log.Println(err)
			return false
		}
	}

	return true
}

// It is called on GET /liveness.
func (app *Application) LivenessHandler(w http.ResponseWriter, r *http.Request) {
	if app.probeHandler() {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

// It is called on GET /readiness.
func (app *Application) ReadinessHandler(w http.ResponseWriter, r *http.Request) {
	if app.probeHandler() {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

// It is called on GET /startup.
func (app *Application) StartupHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}
