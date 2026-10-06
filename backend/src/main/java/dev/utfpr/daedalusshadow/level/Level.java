package dev.utfpr.daedalusshadow.level;

import dev.utfpr.daedalusshadow.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "level",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_level_user_level_number",
                        columnNames = {"user_id", "level_number"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer levelNumber;

    @Column(nullable = false, unique = true)
    private String seed;

    @Column(nullable = false)
    private Integer height;

    @Column(nullable = false)
    private Integer width;


    @Column(nullable = false)
    private Instant createdAt;
    private Instant updatedAt;
}
