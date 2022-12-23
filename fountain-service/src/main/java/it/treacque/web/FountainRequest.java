package it.treacque.web;

import lombok.Builder;
import lombok.ToString;
import lombok.extern.jackson.Jacksonized;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Builder
@Jacksonized
@ToString
public class FountainRequest {
    @NotEmpty(message = "The name of the fountain must not be empty")
    public final String name;
    @NotNull(message = "The latitude of the fountain must not be null")
    public final Double latitude;
    @NotNull(message = "The longitude of the fountain must not be null")
    public final Double longitude;
}
