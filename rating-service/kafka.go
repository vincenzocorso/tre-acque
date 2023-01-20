package main

import (
	ctx "context"
	"os"
	"os/signal"
)

func (app *Application) kafkaHandler(kafkaClosed chan<- bool) {

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	// TODO: Handle signal Interrupt
	exit := false
	for !exit {
		msg, err := app.KafkaConn.ReadMessage(ctx.Background)
		if err != nil {
			log.Println(err)
			exit = true
		}
	}

	close(kafkaClosed)
}
