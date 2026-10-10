package dev.utfpr.daedalusshadow.exception.response;

import java.time.Instant;

public record StandardError(
    Instant timestamp,
    Integer statusCode,
    String error,
    String message,
    String path
) { }
