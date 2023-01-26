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

    public Fountain getFountain(String fountainId) {
        return Fountain.<Fountain>findByIdOptional(fountainId)
                .orElseThrow(() -> new EntityNotFoundException(fountainId));
    }

    @Transactional
    public Fountain addFountain(FountainRequest fountainDetails) {
        // Persist the fountain
        var location = this.createPoint(fountainDetails.longitude(), fountainDetails.latitude());
        var fountain = new Fountain(fountainDetails.name(), location);
        fountain.persist();

        // Publish the event
        var event = FountainAddedEvent.builder()
                .id(fountain.getId())
                .name(fountain.getName())
                .longitude(fountain.getLocation().getX())
                .latitude(fountain.getLocation().getY())
                .build();
        this.eventProducer.sendEvent(event);

        return fountain;
    }

    @Transactional
    public void deleteFountain(String fountainId) {
        // Get the fountain
        var fountain = Fountain.<Fountain>findByIdOptional(fountainId)
                .orElseThrow(() -> new EntityNotFoundException(fountainId));

        // Publish the event
        var event = FountainDeletedEvent.builder()
                .id(fountain.getId())
                .name(fountain.getName())
                .longitude(fountain.getLocation().getX())
                .latitude(fountain.getLocation().getY())
                .build();
        this.eventProducer.sendEvent(event);

        // Delete the fountain
        fountain.delete();
    }

    private Point createPoint(Double longitude, Double latitude) {
        return this.geometryFactory.createPoint(new Coordinate(longitude, latitude));
    }
}
