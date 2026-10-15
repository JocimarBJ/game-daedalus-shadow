package dev.utfpr.daedalusshadow.authentication.oauth2;

import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProvider;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProviderService;
import dev.utfpr.daedalusshadow.email.EmailService;
import dev.utfpr.daedalusshadow.user.User;
import dev.utfpr.daedalusshadow.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleOAuth2UserServiceTest {

    private static final String GOOGLE_SUB = "google-sub";
    private static final String EMAIL = "pedro@gmail.com";
    private static final String NAME = "Pedro Paulo";

    @Mock
    private UserService userService;

    @Mock
    private AuthenticationProviderService authenticationProviderService;

    @Mock
    private EmailService emailService;

    @Mock
    private OidcUserRequest userRequest;

    @Mock
    private OidcUser oidcUser;

    private GoogleOAuth2UserService googleOAuth2UserService;

    @BeforeEach
    void setUp() {
        googleOAuth2UserService = spy(
                new GoogleOAuth2UserService(
                        userService,
                        authenticationProviderService,
                        emailService
                )
        );

        when(oidcUser.getSubject()).thenReturn(GOOGLE_SUB);
        when(oidcUser.getEmail()).thenReturn(EMAIL);
        when(oidcUser.getFullName()).thenReturn(NAME);

        doReturn(oidcUser)
                .when(googleOAuth2UserService)
                .loadOidcUser(userRequest);
    }

    @Test
    @DisplayName("Should return existing Google user without creating a new user")
    void shouldReturnExistingGoogleUser() {
        AuthenticationProvider provider = mock(AuthenticationProvider.class);

        when(authenticationProviderService.findGoogleProvider(GOOGLE_SUB)).thenReturn(Optional.of(provider));

        OidcUser result = googleOAuth2UserService.loadUser(userRequest);

        assertSame(oidcUser, result);

        verify(authenticationProviderService).findGoogleProvider(GOOGLE_SUB);
        verify(userService, never()).saveGoogle(anyString(), anyString());
        verify(authenticationProviderService, never()).createGoogleProvider(any(User.class), anyString());
        verifyNoInteractions(emailService);
    }

    @Test
    @DisplayName("Should register a new Google user and send welcome email")
    void shouldRegisterNewGoogleUserSuccessfully() {
        User savedUser = new User();

        when(authenticationProviderService.findGoogleProvider(GOOGLE_SUB)).thenReturn(Optional.empty());
        when(userService.saveGoogle(EMAIL, NAME)).thenReturn(savedUser);

        OidcUser result = googleOAuth2UserService.loadUser(userRequest);

        assertSame(oidcUser, result);

        InOrder inOrder = inOrder(
                authenticationProviderService,
                userService,
                emailService
        );

        inOrder.verify(authenticationProviderService).findGoogleProvider(GOOGLE_SUB);
        inOrder.verify(userService).saveGoogle(EMAIL, NAME);
        inOrder.verify(authenticationProviderService).createGoogleProvider(savedUser, GOOGLE_SUB);
        inOrder.verify(emailService).sendWelcomeEmail(EMAIL, NAME);
    }

    @Test
    @DisplayName("Should not create Google provider when user registration fails")
    void shouldNotCreateProviderWhenUserRegistrationFails() {
        when(authenticationProviderService.findGoogleProvider(GOOGLE_SUB)).thenReturn(Optional.empty());

        when(userService.saveGoogle(EMAIL, NAME)).thenThrow(new IllegalStateException("User registration failed"));

        assertThrows(
                IllegalStateException.class,
                () -> googleOAuth2UserService.loadUser(userRequest)
        );

        verify(authenticationProviderService, never()).createGoogleProvider(any(User.class), anyString());
        verifyNoInteractions(emailService);
    }

    @Test
    @DisplayName("Should not send welcome email when Google provider creation fails")
    void shouldNotSendWelcomeEmailWhenProviderCreationFails() {
        User savedUser = new User();

        when(authenticationProviderService.findGoogleProvider(GOOGLE_SUB)).thenReturn(Optional.empty());
        when(userService.saveGoogle(EMAIL, NAME)).thenReturn(savedUser);
        when(authenticationProviderService.createGoogleProvider(savedUser, GOOGLE_SUB))
                .thenThrow(new IllegalStateException("Provider creation failed"));

        assertThrows(
                IllegalStateException.class,
                () -> googleOAuth2UserService.loadUser(userRequest)
        );

        verify(emailService, never()).sendWelcomeEmail(anyString(), anyString());
    }
}