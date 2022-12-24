package it.treacque.exceptions;

import lombok.Getter;

@Getter
public class EntityNotFoundException extends RuntimeException {
    private String entityId;
    public EntityNotFoundException(String entityId) {
        super(entityId);
    }
}
