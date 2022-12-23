package it.treacque.web;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.ToString;
import lombok.extern.jackson.Jacksonized;

@AllArgsConstructor
@Jacksonized
@Builder
@ToString
public class FountainRequest {
    public final String name;
    public final double latitude;
    public final double longitude;
}
