package it.treacque.web;

import javax.validation.constraints.AssertTrue;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.QueryParam;

public class SearchParameters {
    @QueryParam("longitude")
    public Double longitude;

    @QueryParam("latitude")
    public Double latitude;

    @DefaultValue("500.0")
    @QueryParam("radius")
    public Double radius;

    @AssertTrue(message = "The query parameters longitude and latitude must be both present or both absent")
    public boolean isValid() {
        return (this.longitude == null) == (this.latitude == null);
    }
}
