package dev.utfpr.daedalusshadow.exception;

import dev.utfpr.daedalusshadow.exception.exceptiontypes.ExpiredTokenException;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.InvalidTokenException;
import dev.utfpr.daedalusshadow.exception.response.StandardError;
import org.springframework.http.HttpStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<StandardError> handleInvalidTokenException(
            InvalidTokenException ex,
            HttpServletRequest request
    ) {
        StandardError error = new StandardError(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "TOKEN_INVALID",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ExpiredTokenException.class)
    public ResponseEntity<StandardError>  handleExpiredTokenException(
            ExpiredTokenException ex,
            HttpServletRequest request
    ) {
        StandardError error = new StandardError(
                Instant.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "TOKEN_EXPIRED",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
