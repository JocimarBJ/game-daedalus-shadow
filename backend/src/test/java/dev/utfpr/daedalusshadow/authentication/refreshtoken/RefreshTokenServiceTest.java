package dev.utfpr.daedalusshadow.authentication.refreshtoken;

import dev.utfpr.daedalusshadow.authentication.model.dto.LoginResponseDto;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.ExpiredTokenException;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.InvalidTokenException;
import dev.utfpr.daedalusshadow.security.JwtService;
import dev.utfpr.daedalusshadow.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private Clock clock;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private Instant fixedNow;

    @BeforeEach
    void setUp() {
        fixedNow = Instant.now();

        Clock fixedClock = Clock.fixed(
                fixedNow,
                ZoneOffset.UTC
        );

        refreshTokenService = new RefreshTokenService(
                refreshTokenRepository,
                fixedClock,
                jwtService
        );

        ReflectionTestUtils.setField(
                refreshTokenService,
                "refreshTokenExpiration",
                604800000L // 7 dias
        );
    }

    @Test
    void shouldGenerateAndSaveRefreshToken() {
        User user = new User();

        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Instant before = Instant.now();

        RefreshToken result = refreshTokenService.generateRefreshToken(user);

        Instant after = Instant.now();

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);

        verify(refreshTokenRepository).save(captor.capture());

        RefreshToken savedToken = captor.getValue();

        assertEquals(user, savedToken.getUser());
        assertNotNull(savedToken.getRefreshToken());
        assertFalse(savedToken.getRefreshToken().isBlank());

        assertEquals(
                fixedNow.plusMillis(604800000L),
                savedToken.getExpiryDate()
        );

        assertSame(savedToken, result);
    }

    @Test
    void shouldGenerateDifferentTokensForDifferentCalls() {
        User user = new User();

        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken first = refreshTokenService.generateRefreshToken(user);

        RefreshToken second = refreshTokenService.generateRefreshToken(user);

        assertNotEquals(
                first.getRefreshToken(),
                second.getRefreshToken()
        );
    }

    @Test
    void shouldRefreshAccessTokenSuccessfully() {
        User user = new User();

        RefreshToken oldToken = new RefreshToken();
        oldToken.setUser(user);
        oldToken.setRefreshToken("old-refresh-token");
        oldToken.setExpiryDate(fixedNow.plusSeconds(3600));
        oldToken.setRevoked(false);

        when(refreshTokenRepository.findByRefreshToken("old-refresh-token"))
                .thenReturn(java.util.Optional.of(oldToken));

        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(jwtService.generateAccessToken(user)).thenReturn("new-access-token");

        LoginResponseDto result = refreshTokenService.refreshAccessToken("old-refresh-token");

        assertNotNull(result);
        assertNotNull(result.accessToken());
        assertNotNull(result.refreshToken());

        assertNotEquals("old-refresh-token", result.refreshToken());

        assertTrue(oldToken.isRevoked());

        verify(refreshTokenRepository).findByRefreshToken("old-refresh-token");
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    void shouldThrowInvalidTokenExceptionWhenRefreshTokenDoesNotExist() {
        when(refreshTokenRepository.findByRefreshToken("invalid-token"))
                .thenReturn(java.util.Optional.empty());

        assertThrows(
                InvalidTokenException.class,
                () -> refreshTokenService.refreshAccessToken("invalid-token")
        );

        verify(refreshTokenRepository).findByRefreshToken("invalid-token");
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
        verify(refreshTokenRepository, never()).delete(any(RefreshToken.class));
    }

    @Test
    void shouldThrowInvalidTokenExceptionWhenRefreshTokenIsRevoked() {
        RefreshToken revokedToken = new RefreshToken();
        revokedToken.setRefreshToken("revoked-token");
        revokedToken.setRevoked(true);

        when(refreshTokenRepository.findByRefreshToken("revoked-token"))
                .thenReturn(java.util.Optional.of(revokedToken));

        InvalidTokenException exception = assertThrows(
                InvalidTokenException.class,
                () -> refreshTokenService.refreshAccessToken("revoked-token")
        );

        assertEquals("Refresh token already revoked.", exception.getMessage());

        verify(refreshTokenRepository).findByRefreshToken("revoked-token");
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
        verify(refreshTokenRepository, never()).delete(any(RefreshToken.class));
    }

    @Test
    void shouldThrowExpiredTokenExceptionAndDeleteTokenWhenExpired() {
        User user = new User();

        RefreshToken expiredToken = new RefreshToken();
        expiredToken.setUser(user);
        expiredToken.setRefreshToken("expired-token");
        expiredToken.setExpiryDate(fixedNow.minusSeconds(1));
        expiredToken.setRevoked(false);

        when(refreshTokenRepository.findByRefreshToken("expired-token"))
                .thenReturn(java.util.Optional.of(expiredToken));

        ExpiredTokenException exception = assertThrows(
                ExpiredTokenException.class,
                () -> refreshTokenService.refreshAccessToken("expired-token")
        );

        assertEquals(
                "Refresh token expired. Please login again.",
                exception.getMessage()
        );

        verify(refreshTokenRepository).delete(expiredToken);
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }

    @Test
    void shouldRevokeOldTokenBeforeSavingNewRefreshToken() {
        User user = new User();

        RefreshToken oldToken = new RefreshToken();
        oldToken.setUser(user);
        oldToken.setRefreshToken("old-refresh-token");
        oldToken.setExpiryDate(fixedNow.plusSeconds(3600));
        oldToken.setRevoked(false);

        when(refreshTokenRepository.findByRefreshToken("old-refresh-token"))
                .thenReturn(java.util.Optional.of(oldToken));

        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        refreshTokenService.refreshAccessToken("old-refresh-token");

        ArgumentCaptor<RefreshToken> captor =
                ArgumentCaptor.forClass(RefreshToken.class);

        verify(refreshTokenRepository, times(2))
                .save(captor.capture());

        java.util.List<RefreshToken> savedTokens = captor.getAllValues();

        assertSame(oldToken, savedTokens.get(0));
        assertTrue(savedTokens.get(0).isRevoked());

        assertNotSame(oldToken, savedTokens.get(1));
        assertEquals(user, savedTokens.get(1).getUser());
        assertFalse(savedTokens.get(1).isRevoked());
    }
}