package it.treacque.web;

import it.treacque.exceptions.EntityNotFoundException;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import java.util.List;

@Provider
public class EntityNotFoundHandler implements ExceptionMapper<EntityNotFoundException> {
    @Override
    public Response toResponse(EntityNotFoundException exception) {
        ErrorResponse responseBody = ErrorResponse.builder()
                .type("NOT_FOUND_ERROR")
                .message("The entity with the given id (" + exception.getEntityId() + ") was not found")
                .issues(List.of())
                .build();
        return Response.status(Response.Status.NOT_FOUND).entity(responseBody).build();
    }
}
