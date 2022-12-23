package it.treacque.exceptions;

public class FountainNotFoundException extends RuntimeException {
    private String fountainId;
    public FountainNotFoundException(String fountainId) {
        super("Fountain with id " + fountainId + " not found");
    }
}
