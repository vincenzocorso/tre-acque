package it.treacque.web;

import it.treacque.domain.Fountain;
import it.treacque.domain.FountainService;
import lombok.AllArgsConstructor;
import lombok.extern.java.Log;

import javax.validation.Valid;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URI;

@Path("/fountains")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@AllArgsConstructor
@Log
public class FountainController {
    FountainService fountainService;

    @GET
    public Response getAllFountains(@Valid @BeanParam SearchParameters parameters) {
        var fountains = (parameters.longitude == null) ?
                this.fountainService.getAllFountains() :
                this.fountainService.getAllFountainsWithinArea(parameters.longitude, parameters.latitude, parameters.radius);
        var fountainsResponse = fountains.stream()
                .map(this::convertToResponse)
                .toList();
        return Response.ok(fountainsResponse).build();
    }

    @GET
    @Path("/{fountainId}")
    public Response getFountainById(@PathParam("fountainId") String fountainId) {
        var fountain = this.fountainService.getFountain(Long.parseLong(fountainId));
        var fountainResponse = this.convertToResponse(fountain);
        return Response.ok(fountainResponse).build();
    }
    
    @POST
    public Response addFountain(@Valid FountainRequest fountainDetails) {
        var fountain = this.fountainService.addFountain(fountainDetails);
        var fountainResponse = this.convertToResponse(fountain);
        return Response.created(URI.create("/fountains/id")).entity(fountainResponse).build();
    }

    @DELETE
    @Path("/{fountainId}")
    public Response deleteFountain(@PathParam("fountainId") String fountainId) {
        this.fountainService.deleteFountain(Long.parseLong(fountainId));
        return Response.ok().build();
    }

    private FountainResponse convertToResponse(Fountain fountain) {
        return FountainResponse.builder()
                .id(fountain.id.toString())
                .name(fountain.getName())
                .longitude(fountain.getLocation().getX())
                .latitude(fountain.getLocation().getY())
                .build();
    }
}
