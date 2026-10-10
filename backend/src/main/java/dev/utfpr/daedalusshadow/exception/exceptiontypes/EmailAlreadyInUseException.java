package dev.utfpr.daedalusshadow.exception.exceptiontypes;

public class EmailAlreadyInUseException extends RuntimeException {
    public EmailAlreadyInUseException() {
        super("Email already in use");
    }
}