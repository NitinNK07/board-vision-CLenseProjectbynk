package CLens.pgn_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for Game Analysis results — chess.com-style move insights
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameAnalysisDTO {
    
    private Long gameId;
    private Double accuracyWhite;
    private Double accuracyBlack;
    private Integer bestMovesWhite;
    private Integer bestMovesBlack;
    private Integer blundersWhite;
    private Integer blundersBlack;
    private Integer mistakesWhite;
    private Integer mistakesBlack;
    private Integer inaccuraciesWhite;
    private Integer inaccuraciesBlack;
    private Integer brilliantWhite;
    private Integer brilliantBlack;
    private Integer greatWhite;
    private Integer greatBlack;
    private List<MoveEvaluation> moveEvaluations;
    private String bestLine;
    private String openingName;
    private String openingEco;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoveEvaluation {
        private Integer moveNumber;
        private String move;
        private String evaluation;     // "+0.45", "-1.20", "M3"
        private Double score;          // centipawn score (positive = white advantage)
        private String bestMove;       // engine's best move for this position
        private Boolean isBlunder;
        private Boolean isMistake;
        private Boolean isInaccuracy;
        private String classification;  // BRILLIANT, GREAT, GOOD, BOOK, INACCURACY, MISTAKE, BLUNDER
        private Boolean isWhite;        // true if this is white's move
    }
}
