package dev.utfpr.daedalusshadow.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsById(Long id);
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
}
