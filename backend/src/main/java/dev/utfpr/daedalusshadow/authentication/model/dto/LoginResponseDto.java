package dev.utfpr.daedalusshadow.authentication.model.dto;

public record LoginResponseDto(
        String accessToken,
        String refreshToken
) {}
