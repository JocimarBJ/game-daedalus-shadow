package dev.utfpr.daedalusshadow.user;

import dev.utfpr.daedalusshadow.exception.exceptiontypes.EmailAlreadyInUseException;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.UserNotFoundException;
import dev.utfpr.daedalusshadow.user.dto.UserCreationDto;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Optional<User> findEntityByEmail(String email){
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public User findEntityById(UUID userId){
        return userRepository.findById(userId)
                .orElseThrow(
                        () -> new UserNotFoundException("No user found with id " + userId)
                );
    }

    @Transactional
    public User saveLocal(UserCreationDto userCreationDto){
        if(userRepository.existsByEmail(userCreationDto.email())){
            throw new EmailAlreadyInUseException();
        }

        User user = new User();
        user.setUsername(userCreationDto.username());
        user.setEmail(userCreationDto.email());
        user.setEnabled(false);
        user.setCreatedAt(Instant.now());

        return userRepository.save(user);
    }

    @Transactional
    public void delete(UUID userId){
        userRepository.deleteById(userId);
    }
}
