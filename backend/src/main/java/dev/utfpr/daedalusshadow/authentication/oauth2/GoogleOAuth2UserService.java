package dev.utfpr.daedalusshadow.authentication.oauth2;

import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProvider;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProviderService;
import dev.utfpr.daedalusshadow.email.EmailService;
import dev.utfpr.daedalusshadow.user.User;
import dev.utfpr.daedalusshadow.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GoogleOAuth2UserService extends OidcUserService { // Posteriormente fazer teste de INTEGRAÇÃO
    private final UserService userService;
    private final AuthenticationProviderService authenticationProviderService;
    private final EmailService emailService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest){
        OidcUser oidcUser = super.loadUser(userRequest);

        String sub = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();

        AuthenticationProvider provider = authenticationProviderService.findGoogleProvider(sub).orElse(null);

        // Cadastro o usuário caso ele não esteja cadastrado
        if(provider == null){
            User savedUser = userService.saveGoogle(email, name);
            authenticationProviderService.createGoogleProvider(savedUser, sub);
            emailService.sendWelcomeEmail(email, name);
        }

        return oidcUser;
    }
}
