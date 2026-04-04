package CLens.pgn_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/**
 * Player Statistics entity - aggregated stats for each user
 */
@Entity
@Table(name = "player_statistics")
@Getter
@Setter
public class PlayerStatistics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User player;
    
    // Overall Stats
    @Column(name = "total_games")
    private Integer totalGames = 0;
    
    @Column(name = "wins")
    private Integer wins = 0;
    
    @Column(name = "losses")
    private Integer losses = 0;
    
    @Column(name = "draws")
    private Integer draws = 0;
    
    @Column(name = "win_rate")
    private Double winRate = 0.0;

    // As White
    @Column(name = "games_as_white")
    private Integer gamesAsWhite = 0;

    @Column(name = "wins_as_white")
    private Integer winsAsWhite = 0;

    @Column(name = "win_rate_as_white")
    private Double winRateAsWhite = 0.0;

    // As Black
    @Column(name = "games_as_black")
    private Integer gamesAsBlack = 0;

    @Column(name = "wins_as_black")
    private Integer winsAsBlack = 0;

    @Column(name = "win_rate_as_black")
    private Double winRateAsBlack = 0.0;

    // Performance Metrics
    @Column(name = "average_accuracy")
    private Double averageAccuracy = 0.0;

    @Column(name = "average_blunders_per_game")
    private Double averageBlundersPerGame = 0.0;

    @Column(name = "average_mistakes_per_game")
    private Double averageMistakesPerGame = 0.0;
    
    // Opening Stats
    @Column(name = "most_played_opening", length = 200)
    private String mostPlayedOpening;
    
    @Column(name = "most_played_eco", length = 10)
    private String mostPlayedEco;
    
    @Column(name = "best_opening", length = 200)
    private String bestOpening;
    
    // Recent Form (last 10 games: W/L/D)
    @Column(name = "recent_form", length = 20)
    private String recentForm;
    
    @Column(name = "current_streak")
    private Integer currentStreak = 0; // Positive for wins, negative for losses
    
    @Column(name = "longest_win_streak")
    private Integer longestWinStreak = 0;
    
    // Time Period
    @Column(name = "last_game_date")
    private Instant lastGameDate;
    
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
