package dev.utfpr.daedalusshadow.user;

import dev.utfpr.daedalusshadow.exception.exceptiontypes.EmailAlreadyInUseException;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.UserNotFoundException;
import dev.utfpr.daedalusshadow.user.dto.UserCreationDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should find an user by id")
    void findEntityByIdWithExistingId() {
        UUID userId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        user.setUsername("PedroPaulo");
        user.setEmail("pedro@gmail.com");

        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(user));

        User result = userService.findEntityById(userId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(userId);

        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("Should find an user by email")
    void findEntityByEmailWithExistingEmail() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("Pedro Paulo");
        user.setEmail("pedro@gmail.com");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(java.util.Optional.of(user));

        Optional<User> result = userService.findEntityByEmail(user.getEmail());

        assertThat(result).isNotNull();
        assertThat(result.get().getEmail()).isEqualTo(user.getEmail());
        assertThat(result.get().getUsername()).isEqualTo(user.getUsername());

        verify(userRepository).findByEmail(user.getEmail());
    }

    @Test
    @DisplayName("Should not find an user by id - UserNotFoundException")
    void findEntityByIdWithNonExistingId() {
        UUID userId = UUID.randomUUID();

        when(userRepository.findById(userId)).thenReturn(java.util.Optional.empty());

        assertThrows(
                UserNotFoundException.class, () -> userService.findEntityById(userId)
        );

        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("Should successfully save an user")
    void saveWithNonUsedEmail() {
        UserCreationDto userCreationDto = new UserCreationDto(
                "Pedro Paulo",
                "pedro@gmail.com",
                "MinhaSenha!@123"
        );

        when(userRepository.existsByEmail(userCreationDto.email())).thenReturn(false);

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setUsername(userCreationDto.username());
        savedUser.setEmail(userCreationDto.email());

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userService.saveLocal(userCreationDto);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(userCreationDto.email());
        assertThat(result.getUsername()).isEqualTo(userCreationDto.username());

        verify(userRepository).existsByEmail(userCreationDto.email());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should not save an user - EmailAlreadyInUse")
    void saveWithUsedEmail() {
        UserCreationDto userCreationDto = new UserCreationDto(
                "Pedro Paulo",
                "pedro@gmail.com",
                "MinhaSenha!@123"
        );

        when(userRepository.existsByEmail(userCreationDto.email())).thenReturn(true);


        assertThrows(
                EmailAlreadyInUseException.class, () -> userService.saveLocal(userCreationDto)
        );

        verify(userRepository).existsByEmail(userCreationDto.email());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete an user")
    void deleteExistingUser() {
        UUID userId = UUID.randomUUID();

        doNothing()
                .when(userRepository)
                .deleteById(userId);

        userService.delete(userId);

        verify(userRepository).deleteById(userId);
    }
}