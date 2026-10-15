package dev.utfpr.daedalusshadow.exception.exceptiontypes;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super("User not found." + message);
    }
}