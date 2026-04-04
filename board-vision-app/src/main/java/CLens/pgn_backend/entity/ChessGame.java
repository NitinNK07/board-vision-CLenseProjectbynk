package CLens.pgn_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Chess Game entity - stores analyzed games from scans
 */
@Entity
@Table(name = "chess_games")
@Getter
@Setter
public class ChessGame {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User player;
    
    @Column(name = "white_player", length = 100)
    private String whitePlayer;
    
    @Column(name = "black_player", length = 100)
    private String blackPlayer;
    
    @Column(name = "pgn_content", columnDefinition = "TEXT")
    private String pgnContent;
    
    @Column(name = "event", length = 200)
    private String event;
    
    @Column(name = "site", length = 200)
    private String site;
    
    @Column(name = "game_date")
    private LocalDate gameDate;
    
    @Column(name = "round", length = 50)
    private String round;
    
    @Column(name = "result", length = 10)
    private String result;
    
    @Column(name = "white_elo")
    private Integer whiteElo;
    
    @Column(name = "black_elo")
    private Integer blackElo;
    
    @Column(name = "eco", length = 10)
    private String eco; // Encyclopedia of Chess Openings code
    
    @Column(name = "opening", length = 200)
    private String opening;
    
    @Column(name = "time_control", length = 50)
    private String timeControl;
    
    @Column(name = "termination", length = 100)
    private String termination;
    
    @Column(name = "total_moves")
    private Integer totalMoves;
    
    @Column(name = "source", length = 50)
    private String source; // "SCAN", "UPLOAD", "IMPORT"
    
    @Column(name = "is_public")
    private Boolean isPublic = false;
    
    @Column(name = "is_tournament")
    private Boolean isTournament = false;
    
    @Column(name = "tournament_name", length = 200)
    private String tournamentName;
    
    @Column(name = "original_image_url", length = 500)
    private String originalImageUrl;
    
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
