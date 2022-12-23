package it.treacque.web;

import it.treacque.exceptions.FountainNotFoundException;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

@Provider
public class FountainNotFoundHandler implements ExceptionMapper<FountainNotFoundException> {
    @Override
    public Response toResponse(FountainNotFoundException exception) {
        ErrorResponse responseBody = ErrorResponse.builder()
                .type("FOUNTAIN_NOT_FOUND")
                .message("The fountain with the given id was not found")
                .build();
        return Response.status(Response.Status.NOT_FOUND).entity(responseBody).build();
    }
}
