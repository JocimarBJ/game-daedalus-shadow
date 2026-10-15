package dev.utfpr.daedalusshadow.authentication.oauth2;

import dev.utfpr.daedalusshadow.AppProperties;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProvider;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProviderService;
import dev.utfpr.daedalusshadow.authentication.model.OAuth2TokenExchange;
import dev.utfpr.daedalusshadow.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class OAuth2AuthenticationSuccessHandlerTest {
    @InjectMocks
    private OAuth2AuthenticationSuccessHandler successHandler;

    @Mock
    private AppProperties appProperties;

    @Mock
    private AuthenticationProviderService authenticationProviderService;

    @Mock
    private OAuth2ExchangeStorageService storageService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should generate exchange code and redirect user after successful authentication")
    void shouldGenerateExchangeCodeAndRedirectUser() throws Exception {

        OidcUser oidcUser = mock(OidcUser.class);
        Authentication authentication = mock(Authentication.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);

        User user = new User();
        UUID userId = UUID.randomUUID();
        user.setId(userId);

        AuthenticationProvider provider = new AuthenticationProvider();
        provider.setUser(user);

        when(authentication.getPrincipal()).thenReturn(oidcUser);
        when(oidcUser.getSubject()).thenReturn("google-sub");
        when(authenticationProviderService.findGoogleProvider("google-sub")).thenReturn(Optional.of(provider));
        when(appProperties.frontendUrl()).thenReturn("http://localhost:4200");

        successHandler.onAuthenticationSuccess(
                request,
                response,
                authentication
        );

        ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<OAuth2TokenExchange> exchangeCaptor = ArgumentCaptor.forClass(OAuth2TokenExchange.class);

        verify(storageService).save(
                codeCaptor.capture(),
                exchangeCaptor.capture()
        );

        String exchangeCode = codeCaptor.getValue();
        OAuth2TokenExchange exchange = exchangeCaptor.getValue();

        assertNotNull(exchangeCode);
        assertFalse(exchangeCode.isBlank());

        assertEquals(userId, exchange.userId());

        assertTrue(
                exchange.expiresAt().isAfter(Instant.now())
        );

        verify(response).sendRedirect(
                "http://localhost:4200/auth/login?code=" + exchangeCode
        );
    }

    @Test
    @DisplayName("Should throw exception when authentication provider is not found")
    void shouldThrowExceptionWhenProviderIsNotFound() {

        OidcUser oidcUser = mock(OidcUser.class);
        Authentication authentication = mock(Authentication.class);

        when(authentication.getPrincipal()).thenReturn(oidcUser);
        when(oidcUser.getSubject()).thenReturn("google-sub");
        when(authenticationProviderService.findGoogleProvider("google-sub")).thenReturn(Optional.empty());

        assertThrows(
                IllegalStateException.class,
                () -> successHandler.onAuthenticationSuccess(
                        mock(HttpServletRequest.class),
                        mock(HttpServletResponse.class),
                        authentication
                )
        );

        verifyNoInteractions(storageService);
    }
}