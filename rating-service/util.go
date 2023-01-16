package main

import (
	"context"
	"log"
	"net/http"
)

func (app *Application) LivenessHandler(w http.ResponseWriter, r *http.Request) {
	health := true

	if _, err := app.ArangoClient.Version(context.Background()); err != nil {
		log.Println(err)
		health = false
	}

	if health {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

func (app *Application) ReadinessHandler(w http.ResponseWriter, r *http.Request) {
	ready := true

	if _, err := app.ArangoClient.Version(context.Background()); err != nil {
		log.Println(err)
		ready = false
	}

	if ready {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

func (app *Application) StartupHandler(w http.ResponseWriter, r *http.Request) {
	started := true

	if _, err := app.ArangoClient.Version(context.Background()); err != nil {
		log.Println(err)
		started = false
	}

	if started {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}
