package dev.utfpr.daedalusshadow.authentication.oauth2;

import dev.utfpr.daedalusshadow.AppProperties;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProvider;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProviderService;
import dev.utfpr.daedalusshadow.authentication.model.OAuth2TokenExchange;
import dev.utfpr.daedalusshadow.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final AppProperties appProperties;
    private final OAuth2ExchangeStorageService storageService;
    private final AuthenticationProviderService authenticationProviderService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();

        AuthenticationProvider provider = authenticationProviderService.findGoogleProvider(oidcUser.getSubject())
                .orElseThrow(() -> new IllegalStateException("Authentication provider not found"));

        User user = provider.getUser();
        String exchangeCode = UUID.randomUUID().toString();

        storageService.save(
                exchangeCode,
                new OAuth2TokenExchange(user.getId(), Instant.now().plusSeconds(30))
        );

        response.sendRedirect(appProperties.frontendUrl() + "/auth/login?code=" + exchangeCode);
    }
}