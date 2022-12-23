package it.treacque.web;

import lombok.Builder;

@Builder
public class FountainResponse {
    public final String id;
    public final String name;
    public final double latitude;
    public final double longitude;
}
