package dev.utfpr.daedalusshadow.exception.exceptiontypes;

public class ExpiredTokenException extends RuntimeException {
    public ExpiredTokenException(String message) {super(message);}
}