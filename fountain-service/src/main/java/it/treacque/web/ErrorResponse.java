package it.treacque.web;

import lombok.Builder;

@Builder
public class ErrorResponse {
    public final String type;
    public final String message;
}
