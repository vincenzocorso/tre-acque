package it.treacque.domain;

import it.treacque.exceptions.EntityNotFoundException;
import it.treacque.messaging.EventProducer;
import it.treacque.web.FountainRequest;
import lombok.AllArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

import javax.enterprise.context.ApplicationScoped;
import javax.transaction.Transactional;
import java.util.List;

@ApplicationScoped
@AllArgsConstructor
public class FountainService {
    private final GeometryFactory geometryFactory = new GeometryFactory();
    final EventProducer eventProducer;

    public List<Fountain> getAllFountains() {
        return Fountain.findAll().list();
    }

    public List<Fountain> getAllFountainsWithinArea(Double longitude, Double latitude, Double radius) {
        var point = this.createPoint(longitude, latitude);
        return Fountain.find("SELECT f FROM Fountain f WHERE distance(f.location, ?1) < ?2", point, radius).list();
    }

    public Fountain getFountain(Long fountainId) {
        return Fountain.<Fountain>findByIdOptional(fountainId)
                .orElseThrow(() -> new EntityNotFoundException(fountainId.toString()));
    }

    @Transactional
    public Fountain addFountain(FountainRequest fountainDetails) {
        // Persist the fountain
        var location = this.createPoint(fountainDetails.longitude, fountainDetails.latitude);
        var fountain = new Fountain(fountainDetails.name, location);
        fountain.persist();

        // Publish the event
        var event = FountainAddedEvent.builder()
                .id(fountain.id.toString())
                .name(fountain.getName())
                .longitude(fountain.getLocation().getX())
                .latitude(fountain.getLocation().getY())
                .build();
        this.eventProducer.sendEvent(event);

        return fountain;
    }

    @Transactional
    public void deleteFountain(Long fountainId) {
        // Delete the fountain
        var fountain = Fountain.<Fountain>findByIdOptional(fountainId)
                .orElseThrow(() -> new EntityNotFoundException(fountainId.toString()));
        fountain.delete();

        // Publish the event
        var event = FountainDeletedEvent.builder()
                .id(fountain.id.toString())
                .name(fountain.getName())
                .longitude(fountain.getLocation().getX())
                .latitude(fountain.getLocation().getY())
                .build();
        this.eventProducer.sendEvent(event);
    }

    private Point createPoint(Double longitude, Double latitude) {
        return this.geometryFactory.createPoint(new Coordinate(longitude, latitude));
    }
}
