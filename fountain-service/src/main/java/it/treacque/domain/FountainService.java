package it.treacque.domain;

import it.treacque.exceptions.FountainNotFoundException;
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
    private final EventProducer eventProducer;

    public List<Fountain> getAllFountains() {
        return Fountain.findAll().list();
    }

    public List<Fountain> getAllFountainsWithinArea(Double longitude, Double latitude, Double radius) {
        var point = this.geometryFactory.createPoint(new Coordinate(longitude, latitude));
        return Fountain.find("SELECT f FROM Fountain f WHERE distance(f.location, ?1) < ?2", point, radius).list();
    }

    public Fountain getFountain(Long fountainId) {
        Fountain fountain = Fountain.findById(fountainId);
        if(fountain == null) {
            throw new FountainNotFoundException(fountainId.toString());
        }
        return fountain;
    }

    @Transactional
    public Fountain addFountain(FountainRequest fountainDetails) {
        // Persist the fountain
        Coordinate coordinates = new Coordinate(fountainDetails.longitude, fountainDetails.latitude);
        Point location = this.geometryFactory.createPoint(coordinates);
        Fountain fountain = new Fountain(fountainDetails.name, location);
        fountain.persist();

        // Publish the event
        FountainAddedEvent event = FountainAddedEvent.builder()
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
        Fountain fountain = Fountain.findById(fountainId);

        if(fountain == null)
            throw new FountainNotFoundException(fountainId.toString());

        // Delete the fountain
        fountain.delete();

        // Publish the event
        FountainDeletedEvent event = FountainDeletedEvent.builder()
                .id(fountain.id.toString())
                .name(fountain.getName())
                .longitude(fountain.getLocation().getX())
                .latitude(fountain.getLocation().getY())
                .build();
        this.eventProducer.sendEvent(event);
    }
}
