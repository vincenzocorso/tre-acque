package it.treacque.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;

import javax.persistence.Column;
import javax.persistence.Entity;

@Entity
@NoArgsConstructor
@Getter
public class Fountain extends PanacheEntity {
    private String name;
    private Point location;

    public Fountain(String name, Point location) {
        this.name = name;
        this.location = location;
    }
}
