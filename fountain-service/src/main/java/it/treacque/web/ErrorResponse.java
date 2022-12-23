package it.treacque.web;

import lombok.Builder;

import java.util.List;

@Builder
public class ErrorResponse {
    public final String type;
    public final String message;
    public final List<String> issues;
}
