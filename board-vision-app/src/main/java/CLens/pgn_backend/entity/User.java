package CLens.pgn_backend.entity;

import CLens.pgn_backend.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.time.LocalDate;

// User.java
@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private boolean emailVerified = false;  // New field for email verification

    private String phoneNumber;             // New field for phone number

    @Column(nullable = false)
    private boolean phoneVerified = false;  // New field for phone verification

    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    private LocalDate trialStart;
    private Integer trialDays = 2;
    private Integer trialDailyLimit = 3;
    private LocalDate trialCounterDay;
    private Integer trialUsedToday = 0;

    private Integer adScanCredits = 0;
    private Integer paidScanCredits = 0;

    private Instant createdAt = Instant.now();
}
