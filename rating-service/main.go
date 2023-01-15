package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func livenessHandler(w http.ResponseWriter, r *http.Request) {
	health := true

	if health {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

func readinessHandler(w http.ResponseWriter, r *http.Request) {
	ready := true

	if ready {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

func startupHandler(w http.ResponseWriter, r *http.Request) {
	started := true

	if started {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/liveness", livenessHandler)
	router.HandleFunc("/readiness", readinessHandler)
	router.HandleFunc("/startup", startupHandler)

	log.Fatal(http.ListenAndServe(":8000", router))
}
