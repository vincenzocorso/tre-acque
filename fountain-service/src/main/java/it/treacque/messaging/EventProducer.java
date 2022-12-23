package it.treacque.messaging;

import it.treacque.domain.FountainAddedEvent;
import it.treacque.domain.FountainDeletedEvent;
import org.eclipse.microprofile.reactive.messaging.*;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

@ApplicationScoped
public class EventProducer {
    @Inject
    @Channel("fountain-added-events")
    Emitter<FountainAddedEvent> fountainAddedEmitter;

    @Inject
    @Channel("fountain-deleted-events")
    Emitter<FountainDeletedEvent> fountainDeletedEmitter;

    public void sendEvent(FountainAddedEvent event) {
        this.fountainAddedEmitter.send(Message.of(event));
    }

    public void sendEvent(FountainDeletedEvent event) {
        this.fountainDeletedEmitter.send(Message.of(event));
    }
}
