package dev.utfpr.daedalusshadow.user.dto;


import dev.utfpr.daedalusshadow.user.User;
import dev.utfpr.daedalusshadow.user.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponseDto(
        UUID id,
        String fullName,
        String email,
        UserRole userRole,
        boolean enabled,
        Instant createdAt
) {
    public UserResponseDto(User user) {
        this(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}