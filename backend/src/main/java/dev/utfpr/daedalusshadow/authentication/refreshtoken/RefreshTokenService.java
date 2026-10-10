package dev.utfpr.daedalusshadow.authentication.refreshtoken;

import dev.utfpr.daedalusshadow.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;
    private final RefreshTokenRepository refreshTokenRepository;
    private final Clock clock;

    public RefreshToken generateRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now(clock).plusMillis(refreshTokenExpiration));
        refreshToken.setRefreshToken(UUID.randomUUID().toString());

        return refreshTokenRepository.save(refreshToken);
    }
}