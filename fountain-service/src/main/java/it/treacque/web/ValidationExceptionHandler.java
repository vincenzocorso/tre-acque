package it.treacque.web;

import it.treacque.exceptions.ValidationException;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

@Provider
public class ValidationExceptionHandler implements ExceptionMapper<ValidationException> {
    @Override
    public Response toResponse(ValidationException exception) {
        ErrorResponse responseBody = ErrorResponse.builder()
                .type("VALIDATION_EXCEPTION")
                .message(exception.getMessage())
                .build();
        return Response.status(Response.Status.BAD_REQUEST).entity(responseBody).build();
    }
}