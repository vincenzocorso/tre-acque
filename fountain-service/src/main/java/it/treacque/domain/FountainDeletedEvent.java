package it.treacque.domain;

import lombok.Builder;

@Builder
public class FountainDeletedEvent {
    public final String id;
    public final String name;
    public final double latitude;
    public final double longitude;
}
