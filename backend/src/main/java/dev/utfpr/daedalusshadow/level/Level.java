package dev.utfpr.daedalusshadow.level;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "level")
@Getter
@Setter
@NoArgsConstructor
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private Integer levelNumber;

    @Column(nullable = false, unique = true)
    private String seed;



    @Column(nullable = false)
    private Instant createdAt;
    private Instant updatedAt;
}
