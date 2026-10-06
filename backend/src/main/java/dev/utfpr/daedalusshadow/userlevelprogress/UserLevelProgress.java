package dev.utfpr.daedalusshadow.userlevelprogress;

import dev.utfpr.daedalusshadow.level.Level;
import dev.utfpr.daedalusshadow.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "user_level_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_level_progress_user_level",
                        columnNames = {"user_id", "level_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class UserLevelProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "level_id", nullable = false)
    private Level level;

    @Column(nullable = false)
    private boolean unlocked = false;

    @Column(nullable = false)
    private boolean completed = false;

    private Integer bestTimeSeconds;

    @Column(nullable = false)
    private Integer attemptsCount = 0;

    @Column(nullable = false)
    private Instant createdAt;
    private Instant updatedAt;
}