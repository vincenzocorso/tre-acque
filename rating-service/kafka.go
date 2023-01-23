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
			log.Printf("kafkaHandler: %s", err)
			continue
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
