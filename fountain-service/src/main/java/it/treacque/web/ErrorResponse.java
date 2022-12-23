package it.treacque.web;

import lombok.AllArgsConstructor;
import lombok.Builder;

@AllArgsConstructor
@Builder
public class ErrorResponse {
    public String type;
    public String message;
}
