package dev.utfpr.daedalusshadow.authentication.authenticationprovider;

import dev.utfpr.daedalusshadow.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "authentication_provider")
@Getter
@Setter
@NoArgsConstructor
public class AuthenticationProvider {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private AuthenticationProviderType provider;

    private String providerUserId;

    private String passwordHash;
}
