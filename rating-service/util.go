package main

import (
	"context"
	ctx "context"
	"log"
	"net"
	"net/http"
	"time"

	kafka "github.com/segmentio/kafka-go"
)

// probeHandler does some checks in common for both LivenessHandler and
// ReadinessHandler.
func (app *Application) probeHandler() (bool, error) {
	// We do not expect more than one database (even if it can be distribuited).
	if _, err := app.ArangoClient.Version(context.Background()); err != nil {
		return false, err
	}

	client := kafka.Client{Timeout: 10 * time.Second}
	for _, broker := range app.KafkaConn.Config().Brokers {
		addr, err := net.ResolveTCPAddr("tcp", broker)
		if err != nil {
			return false, err
		}

		req := kafka.HeartbeatRequest{Addr: addr,
			GroupID: app.KafkaConn.Config().GroupID,
		}

		res, err := client.Heartbeat(ctx.Background(), &req)
		if err != nil {
			return false, err
		}
		if res.Error != nil {
			return false, err
		}
	}

	return true, nil
}

// It is called on GET /liveness.
func (app *Application) LivenessHandler(w http.ResponseWriter, r *http.Request) {
	if ok, err := app.probeHandler(); ok {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

// It is called on GET /readiness.
func (app *Application) ReadinessHandler(w http.ResponseWriter, r *http.Request) {
	if ok, err := app.probeHandler(); ok {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

// It is called on GET /startup.
func (app *Application) StartupHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}
