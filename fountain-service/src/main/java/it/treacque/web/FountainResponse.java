package it.treacque.web;

import lombok.AllArgsConstructor;
import lombok.Builder;

@AllArgsConstructor
@Builder
public class FountainResponse {
    public String id;
    public String name;
    public double latitude;
    public double longitude;
}
