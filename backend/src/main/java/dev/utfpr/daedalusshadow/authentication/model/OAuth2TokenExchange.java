package dev.utfpr.daedalusshadow.authentication.model;

import java.time.Instant;
import java.util.UUID;

public record OAuth2TokenExchange(
        UUID userId,
        Instant expiresAt
) {}