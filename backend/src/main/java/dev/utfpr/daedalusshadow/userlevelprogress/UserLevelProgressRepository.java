package dev.utfpr.daedalusshadow.userlevelprogress;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserLevelProgressRepository extends JpaRepository<UserLevelProgress, UUID> {
}
