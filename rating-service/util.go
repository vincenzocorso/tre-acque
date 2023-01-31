// Copyright (c) 2022-2023, Tre Acque.
//
// This file is part of Tre Acque.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
		log.Print("liveness: ", err)
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
		log.Print("readiness: ", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
	}
}

// It is called on GET /startup.
func (app *Application) StartupHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}
