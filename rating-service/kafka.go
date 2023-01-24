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
	ctx "context"
	"fmt"
	"log"
	"os"
	"os/signal"
)

func (app *Application) kafkaAddFountain(fountainId string) error {
	query := fmt.Sprintf("INSERT { _key: %q } IN ratings", fountainId)
	cursor, err := app.ArangoCollection.Database().Query(ctx.Background(), query, nil)
	if err != nil {
		return err
	}
	cursor.Close()

	return nil
}

func (app *Application) kafkaDeleteFountain(fountainId string) error {
	query := fmt.Sprintf("REMOVE %q IN ratings", fountainId)
	cursor, err := app.ArangoCollection.Database().Query(ctx.Background(), query, nil)
	if err != nil {
		return err
	}
	cursor.Close()

	return nil

}

func (app *Application) kafkaHandler(kafkaClosed chan<- bool) {
	ctxKafka, cancel := ctx.WithCancel(ctx.Background())

	go func() {
		interrupt := make(chan os.Signal, 1)
		signal.Notify(interrupt, os.Interrupt)

		<-interrupt
		cancel()
	}()

	exit := false
	for !exit {
		select {
		case <-ctxKafka.Done():
			exit = true
			continue
		default: // To do not block if there is not interrupt signal.
		}

		msg, err := app.KafkaConn.ReadMessage(ctx.Background())
		if err != nil {
			log.Fatalf("kafkaHandler: %s", err)
		}

		var msgType string
		for _, header := range msg.Headers {
			if header.Key == "type" {
				msgType = string(header.Value)
			}
		}

		switch msgType {
		case "FOUNTAIN_ADDED_EVENT":
			if err := app.kafkaAddFountain(string(msg.Key)); err != nil {
				log.Printf("kafkaHandler: failed to handle Kafka message: %s", err)
			}
		case "FOUNTAIN_DELETED_EVENT":
			if err := app.kafkaDeleteFountain(string(msg.Key)); err != nil {
				log.Printf("kafkaHandler: failed to handle Kafka message: %s", err)
			}
		default:
			log.Printf("kafkaHandler: unrecognized Kafka message type %q: Key = %s Value %q",
				msgType,
				msg.Key,
				msg.Value)
		}
	}

	if err := app.KafkaConn.Close(); err != nil {
		log.Print("Failed to close Kafka reader:", err)
	}

	close(kafkaClosed)
}
