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

package it.treacque.messaging;

import io.smallrye.reactive.messaging.kafka.KafkaRecord;
import it.treacque.domain.FountainAddedEvent;
import it.treacque.domain.FountainDeletedEvent;
import it.treacque.domain.FountainEvent;
import org.eclipse.microprofile.reactive.messaging.*;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.util.concurrent.CompletableFuture;

@ApplicationScoped
public class EventProducer {
    public static final String FOUNTAIN_EVENTS = "fountain_events";

    @Inject
    @Channel(FOUNTAIN_EVENTS)
    Emitter<FountainEvent> fountainEventsEmitter;

    public void sendEvent(FountainAddedEvent event) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        var message = KafkaRecord.of(FOUNTAIN_EVENTS, event.id, event)
                .withHeader("type", "FOUNTAIN_ADDED_EVENT")
                .withAck(() -> {
                    future.complete(null);
                    return CompletableFuture.completedFuture(null);
                })
                .withNack((t) -> {
                    future.completeExceptionally(t);
                    return CompletableFuture.completedFuture(null);
                });

        this.fountainEventsEmitter.send(message);
        future.join();
    }

    public void sendEvent(FountainDeletedEvent event) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        var message = KafkaRecord.of(FOUNTAIN_EVENTS, event.id, event)
                .withHeader("type", "FOUNTAIN_DELETED_EVENT")
                .withAck(() -> {
                    future.complete(null);
                    return CompletableFuture.completedFuture(null);
                })
                .withNack((t) -> {
                    future.completeExceptionally(t);
                    return CompletableFuture.completedFuture(null);
                });

        this.fountainEventsEmitter.send(message);
        future.join();
    }
}
