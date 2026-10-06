package dev.utfpr.daedalusshadow.authentication.authenticationprovider;

import dev.utfpr.daedalusshadow.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface AuthenticationProviderRepository extends JpaRepository<AuthenticationProvider, UUID> {
    Optional<AuthenticationProvider> findByUserAndProvider(User user, AuthenticationProviderType provider);

    Optional<AuthenticationProvider> findByProviderAndProviderUserId(
            AuthenticationProviderType provider, String providerUserId
    );

    @Query("""
    SELECT p
    FROM AuthenticationProvider p
    JOIN FETCH p.user
    WHERE p.provider = :provider
    AND p.providerUserId = :providerUserId
    """)
    Optional<AuthenticationProvider> findWithUser(
            AuthenticationProviderType provider,
            String providerUserId
    );
}