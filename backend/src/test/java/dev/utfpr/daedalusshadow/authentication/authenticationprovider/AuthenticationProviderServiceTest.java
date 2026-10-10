package dev.utfpr.daedalusshadow.authentication.authenticationprovider;

import dev.utfpr.daedalusshadow.user.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationProviderServiceTest {

    @InjectMocks
    private AuthenticationProviderService providerService;

    @Mock
    private AuthenticationProviderRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Should create local authentication provider")
    void shouldCreateLocalProvider() {

        User user = new User();
        user.setId(UUID.randomUUID());

        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");

        AuthenticationProvider savedProvider = new AuthenticationProvider();
        savedProvider.setUser(user);
        savedProvider.setProvider(AuthenticationProviderType.LOCAL);
        savedProvider.setPasswordHash("encoded-password");

        when(repository.save(any(AuthenticationProvider.class))).thenReturn(savedProvider);

        AuthenticationProvider result = providerService.createLocalProvider(user, "password123");

        assertNotNull(result);
        assertEquals(AuthenticationProviderType.LOCAL, result.getProvider());
        assertEquals("encoded-password", result.getPasswordHash());
        assertEquals(user, result.getUser());

        verify(passwordEncoder).encode("password123");
        verify(repository).save(any(AuthenticationProvider.class));
    }

    @Test
    @DisplayName("Should encode password before saving local provider")
    void shouldEncodePasswordBeforeSavingLocalProvider() {

        User user = new User();

        when(passwordEncoder.encode("raw-password")).thenReturn("hashed-password");

        providerService.createLocalProvider(user, "raw-password");

        ArgumentCaptor<AuthenticationProvider> captor = ArgumentCaptor.forClass(AuthenticationProvider.class);

        verify(repository).save(captor.capture());

        AuthenticationProvider saved = captor.getValue();

        assertEquals("hashed-password", saved.getPasswordHash());
        assertEquals(AuthenticationProviderType.LOCAL, saved.getProvider());
    }

    @Test
    @DisplayName("Should find local authentication provider")
    void shouldFindLocalProvider() {
        User user = new User();

        AuthenticationProvider provider = new AuthenticationProvider();

        when(repository.findByUserAndProvider(
                user,
                AuthenticationProviderType.LOCAL
        )).thenReturn(Optional.of(provider));

        AuthenticationProvider result = providerService.findLocalProvider(user).get();

        assertEquals(provider, result);

        verify(repository).findByUserAndProvider(
                user,
                AuthenticationProviderType.LOCAL
        );
    }

    @Test
    @DisplayName("Should return empty when local authentication provider is not found")
    void shouldReturnEmptyWhenLocalProviderIsNotFound() {

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("pedro@gmail.com");

        when(repository.findByUserAndProvider(
                user,
                AuthenticationProviderType.LOCAL
        )).thenReturn(Optional.empty());

        Optional<AuthenticationProvider> result = providerService.findLocalProvider(user);

        assertTrue(result.isEmpty());

        verify(repository).findByUserAndProvider(
                user,
                AuthenticationProviderType.LOCAL
        );
    }
}