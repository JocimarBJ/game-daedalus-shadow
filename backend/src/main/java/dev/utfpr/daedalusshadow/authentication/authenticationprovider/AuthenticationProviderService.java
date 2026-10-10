package dev.utfpr.daedalusshadow.authentication.authenticationprovider;

import dev.utfpr.daedalusshadow.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationProviderService {
    private final AuthenticationProviderRepository repository;
    private final PasswordEncoder passwordEncoder;


    @Transactional
    public AuthenticationProvider createLocalProvider(User user, String rawPassword) {
        AuthenticationProvider provider = new AuthenticationProvider();
        provider.setUser(user);
        provider.setProvider(AuthenticationProviderType.LOCAL);
        provider.setPasswordHash(passwordEncoder.encode(rawPassword));
        return repository.save(provider);
    }

    @Transactional(readOnly = true)
    public Optional<AuthenticationProvider> findLocalProvider(User user) {
        return repository.findByUserAndProvider(user, AuthenticationProviderType.LOCAL);
    }


    // createGoogleProvider
    // findGoogleProvider
}
