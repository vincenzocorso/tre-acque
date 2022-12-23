package it.treacque.web;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

@Provider
public class ConstraintViolationExceptionHandler implements ExceptionMapper<ConstraintViolationException> {
    @Override
    public Response toResponse(ConstraintViolationException exception) {
        var issues = exception.getConstraintViolations()
                .stream()
                .map(ConstraintViolation::getMessage)
                .toList();

        ErrorResponse responseBody = ErrorResponse.builder()
                .type("VALIDATION_EXCEPTION")
                .message("There was an error during the validation of the request")
                .issues(issues)
                .build();
        return Response.status(Response.Status.BAD_REQUEST).entity(responseBody).build();
    }
}
