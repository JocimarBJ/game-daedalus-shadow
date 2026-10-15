package dev.utfpr.daedalusshadow.exception.exceptiontypes;

public class InvalidCredentialsException extends RuntimeException{
    public InvalidCredentialsException() {
        super("Incorrect email or password");
    }
}
