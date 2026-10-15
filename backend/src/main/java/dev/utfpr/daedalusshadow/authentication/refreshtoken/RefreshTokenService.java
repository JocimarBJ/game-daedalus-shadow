package dev.utfpr.daedalusshadow.authentication.refreshtoken;

import dev.utfpr.daedalusshadow.authentication.model.dto.LoginResponseDto;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.ExpiredTokenException;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.InvalidTokenException;
import dev.utfpr.daedalusshadow.security.JwtService;
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
    private final JwtService jwtService;

    public RefreshToken generateRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now(clock).plusMillis(refreshTokenExpiration));
        refreshToken.setRefreshToken(UUID.randomUUID().toString());

        return refreshTokenRepository.save(refreshToken);
    }

    public LoginResponseDto refreshAccessToken(String refreshToken) {
        RefreshToken oldToken = refreshTokenRepository
                .findByRefreshToken(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token."));

        // Token ja foi revogado? Possível ataque
        if (oldToken.isRevoked()) {
            throw new InvalidTokenException("Refresh token already revoked.");
        }

        isTokenExpired(oldToken);

        User user = oldToken.getUser();

        // Revoga o refreshToken antigo
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        RefreshToken newRefreshToken = generateRefreshToken(user);
        String newAccessToken = jwtService.generateAccessToken(user);

        return new LoginResponseDto(newAccessToken, newRefreshToken.getRefreshToken());
    }

    public void isTokenExpired(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new ExpiredTokenException("Refresh token expired. Please login again.");
        }
    }
}