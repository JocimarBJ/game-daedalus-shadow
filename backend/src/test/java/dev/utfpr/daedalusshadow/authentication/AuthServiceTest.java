package dev.utfpr.daedalusshadow.authentication;

import dev.utfpr.daedalusshadow.AppProperties;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProvider;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProviderService;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProviderType;
import dev.utfpr.daedalusshadow.authentication.emailverificationtoken.EmailVerificationToken;
import dev.utfpr.daedalusshadow.authentication.emailverificationtoken.EmailVerificationTokenRepository;
import dev.utfpr.daedalusshadow.authentication.model.dto.LoginRequestDto;
import dev.utfpr.daedalusshadow.authentication.model.dto.LoginResponseDto;
import dev.utfpr.daedalusshadow.authentication.refreshtoken.RefreshToken;
import dev.utfpr.daedalusshadow.authentication.refreshtoken.RefreshTokenService;
import dev.utfpr.daedalusshadow.email.EmailService;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.*;
import dev.utfpr.daedalusshadow.security.JwtService;
import dev.utfpr.daedalusshadow.user.User;
import dev.utfpr.daedalusshadow.user.UserService;
import dev.utfpr.daedalusshadow.user.dto.UserCreationDto;
import dev.utfpr.daedalusshadow.user.dto.UserResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.verifyNoInteractions;

@ActiveProfiles("test")
class AuthServiceTest {
    @InjectMocks
    private AuthService authService;

    @Mock
    private UserService userService;

    @Mock
    private EmailService emailService;

    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Mock
    private AppProperties appProperties;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AuthenticationProviderService authenticationProviderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should successfully local register an user")
    void register() {
        ArgumentCaptor<EmailVerificationToken> tokenCaptor = ArgumentCaptor.forClass(EmailVerificationToken.class);

        UserCreationDto userCreationDto = new UserCreationDto(
                "Pedro Paulo",
                "pedro@gmail.com",
                "MinhaSenha!@123"
        );

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setUsername(userCreationDto.username());
        savedUser.setEmail(userCreationDto.email());

        when(userService.saveLocal(userCreationDto)).thenReturn(savedUser);
        when(appProperties.backendUrl()).thenReturn("http://localhost:8080");


        UserResponseDto response = authService.localRegister(userCreationDto);

        assertAll(
                () -> assertNotNull(response),
                () -> assertEquals(savedUser.getId(), response.id()),
                () -> assertEquals(savedUser.getUsername(), response.fullName()),
                () -> assertEquals(savedUser.getEmail(), response.email())
        );

        verify(userService).saveLocal(userCreationDto);
        verify(emailVerificationTokenRepository).save(tokenCaptor.capture());
        verify(authenticationProviderService).createLocalProvider(
                savedUser,
                userCreationDto.password()
        );

        EmailVerificationToken savedToken = tokenCaptor.getValue();

        assertAll(
                () -> assertNotNull(savedToken.getToken()),
                () -> assertEquals(savedUser, savedToken.getUser()),
                () -> assertNotNull(savedToken.getExpiresAt()),
                () -> assertTrue(savedToken.getExpiresAt().isAfter(Instant.now()))
        );

        verify(emailService)
                .sendVerificationEmail(
                        eq(savedUser.getEmail()),
                        contains("token="),
                        eq(savedUser.getUsername())
                );
    }

    @Test
    @DisplayName("Should not register user when email is already in use")
    void registerWithUsedEmail() {
        UserCreationDto userCreationDto = new UserCreationDto(
                "Pedro Paulo",
                "pedro@gmail.com",
                "MinhaSenha!@123"
        );

        when(userService.saveLocal(userCreationDto)).thenThrow(new EmailAlreadyInUseException());

        assertThrows(
                EmailAlreadyInUseException.class,
                () -> authService.localRegister(userCreationDto)
        );

        verify(userService).saveLocal(userCreationDto);
        verify(emailVerificationTokenRepository, never()).save(any());
        verify(emailService, never()).sendVerificationEmail(any(), any(), any());
    }

    @Test
    @DisplayName("Should verify email successfully")
    void verifyEmailSuccessfully() {
        String token = "valid-token";

        User user = new User();
        user.setUsername("Pedro Paulo");
        user.setEmail("pedro@gmail.com");
        user.setEnabled(false);

        EmailVerificationToken tokenEntity = new EmailVerificationToken();
        tokenEntity.setToken(token);
        tokenEntity.setUser(user);
        tokenEntity.setUsed(false);
        tokenEntity.setExpiresAt(Instant.now().plus(48, ChronoUnit.HOURS));

        when(emailVerificationTokenRepository.findByToken(token)).thenReturn(Optional.of(tokenEntity));

        authService.verifyEmail(token);

        assertAll(
                () -> assertTrue(tokenEntity.isUsed()),
                () -> assertTrue(user.isEnabled())
        );

        verify(emailVerificationTokenRepository).findByToken(token);
        verify(emailVerificationTokenRepository).save(tokenEntity);
        verify(emailService).sendWelcomeEmail(user.getEmail(), user.getUsername());
    }

    @Test
    @DisplayName("Should throw InvalidTokenException when token does not exist")
    void verifyEmailWithInvalidToken() {
        String token = "invalid-token";

        when(emailVerificationTokenRepository.findByToken(token)).thenReturn(Optional.empty());

        assertThrows(
                InvalidTokenException.class,
                () -> authService.verifyEmail(token)
        );

        verify(emailVerificationTokenRepository).findByToken(token);
        verify(emailVerificationTokenRepository, never()).save(any());
        verify(emailService, never()).sendWelcomeEmail(any(), any());
    }

    @Test
    @DisplayName("Should throw ExpiredTokenException when token is expired")
    void verifyEmailWithExpiredToken() {
        String token = "expired-token";

        EmailVerificationToken tokenEntity = new EmailVerificationToken();
        tokenEntity.setToken(token);
        tokenEntity.setUsed(false);
        tokenEntity.setExpiresAt(
                Instant.now().minus(1, ChronoUnit.MINUTES)
        );

        when(emailVerificationTokenRepository.findByToken(token)).thenReturn(Optional.of(tokenEntity));

        assertThrows(
                ExpiredTokenException.class,
                () -> authService.verifyEmail(token)
        );

        verify(emailVerificationTokenRepository).findByToken(token);
        verify(emailVerificationTokenRepository, never()).save(any());
        verify(emailService, never()).sendWelcomeEmail(any(), any());
    }

    @Test
    @DisplayName("Should throw EmailAlreadyVerifiedException when email is already verified")
    void verifyEmailAlreadyVerified() {
        String token = "used-token";

        EmailVerificationToken tokenEntity = new EmailVerificationToken();
        tokenEntity.setToken(token);
        tokenEntity.setUsed(true);
        tokenEntity.setExpiresAt(
                Instant.now().plus(48, ChronoUnit.HOURS)
        );

        when(emailVerificationTokenRepository.findByToken(token)).thenReturn(Optional.of(tokenEntity));

        assertThrows(
                EmailAlreadyVerifiedException.class,
                () -> authService.verifyEmail(token)
        );

        verify(emailVerificationTokenRepository).findByToken(token);
        verify(emailVerificationTokenRepository, never()).save(any());
        verify(emailService, never()).sendWelcomeEmail(any(), any());
    }

    @Test
    @DisplayName("Should resend verification email successfully")
    void resendVerificationEmailSuccessfully() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@example.com");
        user.setUsername("User Example");

        EmailVerificationToken oldToken = new EmailVerificationToken();
        oldToken.setToken("old-token");
        oldToken.setUser(user);
        oldToken.setUsed(false);
        oldToken.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));

        when(emailVerificationTokenRepository.findByUserEmail(user.getEmail())).thenReturn(Optional.of(oldToken));
        when(appProperties.frontendUrl()).thenReturn("http://localhost:4200");

        ArgumentCaptor<EmailVerificationToken> newTokenCaptor = ArgumentCaptor.forClass(EmailVerificationToken.class);

        authService.resendVerificationEmail(user.getEmail());

        verify(emailVerificationTokenRepository).findByUserEmail(user.getEmail());
        verify(emailVerificationTokenRepository).delete(oldToken);
        verify(emailVerificationTokenRepository).flush();
        verify(emailVerificationTokenRepository).save(newTokenCaptor.capture());

        EmailVerificationToken savedNewToken = newTokenCaptor.getValue();
        assertAll(
                () -> assertNotNull(savedNewToken.getToken()),
                () -> assertEquals(user, savedNewToken.getUser()),
                () -> assertNotNull(savedNewToken.getExpiresAt()),
                () -> assertTrue(savedNewToken.getExpiresAt().isAfter(Instant.now()))
        );

        verify(emailService).sendVerificationEmail(
                eq(user.getEmail()),
                contains("token="),
                eq(user.getUsername())
        );
    }

    @Test
    @DisplayName("Should throw InvalidTokenException when there is no token for given email")
    void resendVerificationEmailWithNoToken() {
        String email = "notfound@example.com";

        when(emailVerificationTokenRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(InvalidTokenException.class, () -> authService.resendVerificationEmail(email));

        verify(emailVerificationTokenRepository).findByUserEmail(email);
        verify(emailVerificationTokenRepository, never()).flush();
        verify(emailVerificationTokenRepository, never()).delete(any());
        verify(emailVerificationTokenRepository, never()).save(any());
        verify(emailService, never()).sendVerificationEmail(any(), any(), any());
    }

    @Test
    @DisplayName("Should throw EmailAlreadyVerifiedException when email is already verified")
    void resendVerificationEmailWhenAlreadyVerified() {
        User user = new User();
        user.setEmail("used@example.com");

        EmailVerificationToken oldToken = new EmailVerificationToken();
        oldToken.setToken("used-token");
        oldToken.setUser(user);
        oldToken.setUsed(true);
        oldToken.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));

        when(emailVerificationTokenRepository.findByUserEmail(user.getEmail())).thenReturn(Optional.of(oldToken));

        assertThrows(EmailAlreadyVerifiedException.class, () -> authService.resendVerificationEmail(user.getEmail()));

        verify(emailVerificationTokenRepository).findByUserEmail(user.getEmail());
        verify(emailVerificationTokenRepository, never()).flush();
        verify(emailVerificationTokenRepository, never()).delete(any());
        verify(emailVerificationTokenRepository, never()).save(any());
        verify(emailService, never()).sendVerificationEmail(any(), any(), any());
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void loginSuccessfully() {

        LoginRequestDto loginRequestDto = new LoginRequestDto(
                "pedro@gmail.com",
                "MinhaSenha!@123"
        );

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("pedro@gmail.com");
        user.setEnabled(true);

        AuthenticationProvider provider = new AuthenticationProvider();
        provider.setUser(user);
        provider.setProvider(AuthenticationProviderType.LOCAL);
        provider.setPasswordHash("encodedPassword");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setRefreshToken("refresh-token");


        when(userService.findEntityByEmail(loginRequestDto.email())).thenReturn(Optional.of(user));

        when(authenticationProviderService.findLocalProvider(user)).thenReturn(Optional.of(provider));

        when(passwordEncoder.matches(
                loginRequestDto.password(),
                provider.getPasswordHash()
        )).thenReturn(true);

        when(jwtService.generateAccessToken(user)).thenReturn("access-token");

        when(refreshTokenService.generateRefreshToken(user)).thenReturn(refreshToken);

        LoginResponseDto response = authService.localLogin(loginRequestDto);

        assertAll(
                () -> assertNotNull(response),
                () -> assertEquals("access-token", response.accessToken()),
                () -> assertEquals("refresh-token", response.refreshToken())
        );

        verify(userService).findEntityByEmail(loginRequestDto.email());

        verify(authenticationProviderService).findLocalProvider(user);

        verify(passwordEncoder).matches(
                loginRequestDto.password(),
                provider.getPasswordHash()
        );

        verify(jwtService).generateAccessToken(user);

        verify(refreshTokenService).generateRefreshToken(user);
    }

    @Test
    @DisplayName("Should not login when local provider does not exist")
    void shouldNotLoginWhenLocalProviderDoesNotExist() {

        LoginRequestDto loginRequest = new LoginRequestDto(
                "pedro@gmail.com",
                "MinhaSenha123"
        );

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("Pedro Paulo");
        user.setEmail("pedro@gmail.com");
        user.setEnabled(true);

        when(userService.findEntityByEmail(loginRequest.email())).thenReturn(Optional.of(user));

        when(authenticationProviderService.findLocalProvider(user)).thenReturn(Optional.empty());

        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.localLogin(loginRequest)
        );

        verify(userService).findEntityByEmail(loginRequest.email());
        verify(authenticationProviderService).findLocalProvider(user);
        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
        verifyNoInteractions(refreshTokenService);
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException when password is invalid")
    void loginWithInvalidPassword() {

        LoginRequestDto request = new LoginRequestDto(
                "pedro@gmail.com",
                "wrong-password"
        );

        User user = new User();
        user.setEmail("pedro@gmail.com");
        user.setEnabled(true);

        AuthenticationProvider provider = new AuthenticationProvider();
        provider.setPasswordHash("encoded-password");

        when(userService.findEntityByEmail(request.email())).thenReturn(Optional.of(user));

        when(authenticationProviderService.findLocalProvider(user)).thenReturn(Optional.of(provider));

        when(passwordEncoder.matches(
                request.password(),
                provider.getPasswordHash()
        )).thenReturn(false);

        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.localLogin(request)
        );

        verify(jwtService, never()).generateAccessToken(any());
        verify(refreshTokenService, never()).generateRefreshToken(any());
    }

    @Test
    @DisplayName("Should throw DisabledException when user email is not verified")
    void loginWithDisabledUser() {

        LoginRequestDto loginRequestDto = new LoginRequestDto(
                "pedro@gmail.com",
                "MinhaSenha!@123"
        );

        User user = new User();
        user.setEmail("pedro@gmail.com");
        user.setEnabled(false);

        AuthenticationProvider provider = new AuthenticationProvider();
        provider.setUser(user);
        provider.setProvider(AuthenticationProviderType.LOCAL);
        provider.setPasswordHash("encodedPassword");

        when(userService.findEntityByEmail(loginRequestDto.email())).thenReturn(Optional.of(user));

        when(authenticationProviderService.findLocalProvider(user)).thenReturn(Optional.of(provider));

        when(passwordEncoder.matches(
                loginRequestDto.password(),
                provider.getPasswordHash()
        )).thenReturn(true);

        assertThrows(
                DisabledException.class,
                () -> authService.localLogin(loginRequestDto)
        );

        verify(userService).findEntityByEmail(loginRequestDto.email());

        verify(authenticationProviderService).findLocalProvider(user);

        verify(passwordEncoder).matches(
                loginRequestDto.password(),
                provider.getPasswordHash()
        );

        verify(jwtService, never()).generateAccessToken(any());
        verify(refreshTokenService, never()).generateRefreshToken(any());
    }

    @Test
    @DisplayName("Should throw exception when user email does not exist")
    void loginWithNonExistingEmail() {

        LoginRequestDto loginRequestDto = new LoginRequestDto(
                "unknown@gmail.com",
                "password"
        );

        when(userService.findEntityByEmail(loginRequestDto.email())).thenReturn(Optional.empty());


        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.localLogin(loginRequestDto)
        );

        verify(userService).findEntityByEmail(loginRequestDto.email());
        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
        verifyNoInteractions(refreshTokenService);
    }
}