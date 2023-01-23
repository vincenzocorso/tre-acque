package main

import (
	ctx "context"
	"log"
	"os"
	"os/signal"
)

func (app *Application) kafkaHandler(kafkaClosed chan<- bool) {
	ctxKafka, cancel := ctx.WithCancel(ctx.Background())

	go func() {
		interrupt := make(chan os.Signal, 1)
		signal.Notify(interrupt, os.Interrupt)

		<-interrupt
		cancel()
	}()

	// TODO: Handle signal Interrupt
	exit := false
	for !exit {
		select {
		case <-ctxKafka.Done():
			exit = true
			continue
		default: // To do not block if there is not interrupt signal.
		}

		msg, err := app.KafkaConn.ReadMessage(ctx.Background())
		log.Printf("kafkaConn.Brokers: %v", app.KafkaConn.Config().Brokers)
		if err != nil {
			log.Printf("kafkaHandler: %s", err)
			continue
		}
		log.Printf("Kafka message: Key = %q Value = %q", msg.Key, msg.Value)
	}

	close(kafkaClosed)
}
