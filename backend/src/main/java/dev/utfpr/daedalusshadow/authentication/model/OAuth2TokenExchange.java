package dev.utfpr.daedalusshadow.authentication.model;

import java.time.Instant;

public record OAuth2TokenExchange(
        Long userId,
        Instant expiresAt
) {}