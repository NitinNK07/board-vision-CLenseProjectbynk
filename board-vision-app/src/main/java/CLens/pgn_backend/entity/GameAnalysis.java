package CLens.pgn_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/**
 * Game Analysis entity - stores Stockfish analysis results
 */
@Entity
@Table(name = "game_analysis")
@Getter
@Setter
public class GameAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false, unique = true)
    private ChessGame game;
    
    @Column(name = "accuracy_white")
    private Double accuracyWhite;

    @Column(name = "accuracy_black")
    private Double accuracyBlack;
    
    @Column(name = "best_moves_white")
    private Integer bestMovesWhite;
    
    @Column(name = "best_moves_black")
    private Integer bestMovesBlack;
    
    @Column(name = "blunders_white")
    private Integer blundersWhite;
    
    @Column(name = "blunders_black")
    private Integer blundersBlack;
    
    @Column(name = "mistakes_white")
    private Integer mistakesWhite;
    
    @Column(name = "mistakes_black")
    private Integer mistakesBlack;
    
    @Column(name = "inaccuracies_white")
    private Integer inaccuraciesWhite;
    
    @Column(name = "inaccuracies_black")
    private Integer inaccuraciesBlack;
    
    @Column(name = "evaluation_data", columnDefinition = "TEXT")
    private String evaluationData; // JSON array of evaluations per move
    
    @Column(name = "best_line", length = 1000)
    private String bestLine;
    
    @Column(name = "analysis_depth")
    private Integer analysisDepth;
    
    @Column(name = "analysis_time_ms")
    private Long analysisTimeMs;
    
    @Column(name = "stockfish_version", length = 50)
    private String stockfishVersion;
    
    @Column(name = "analyzed_at")
    private Instant analyzedAt = Instant.now();
}
