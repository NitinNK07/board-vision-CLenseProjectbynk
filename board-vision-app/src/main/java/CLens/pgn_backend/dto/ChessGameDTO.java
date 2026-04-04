package CLens.pgn_backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * DTO for Chess Game creation and updates
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChessGameDTO {

    private Long id;
    
    @Size(max = 100, message = "White player name cannot exceed 100 characters")
    private String whitePlayer;
    
    @Size(max = 100, message = "Black player name cannot exceed 100 characters")
    private String blackPlayer;
    
    @NotBlank(message = "PGN content is required")
    @Size(min = 10, message = "PGN content seems too short")
    private String pgnContent;
    
    @Size(max = 200, message = "Event name cannot exceed 200 characters")
    private String event;
    
    @Size(max = 200, message = "Site name cannot exceed 200 characters")
    private String site;
    
    @PastOrPresent(message = "Game date cannot be in the future")
    private LocalDate gameDate;
    
    @Size(max = 50, message = "Round cannot exceed 50 characters")
    private String round;
    
    @Pattern(regexp = "^(1-0|0-1|1/2-1/2|\\*)$", message = "Result must be 1-0, 0-1, 1/2-1/2, or *")
    private String result;
    
    @Min(value = 0, message = "White Elo cannot be negative")
    @Max(value = 3000, message = "White Elo seems unrealistic (max 3000)")
    private Integer whiteElo;
    
    @Min(value = 0, message = "Black Elo cannot be negative")
    @Max(value = 3000, message = "Black Elo seems unrealistic (max 3000)")
    private Integer blackElo;
    
    @Pattern(regexp = "^[A-E][0-9]{2}$", message = "ECO code must be in format A00-E99")
    private String eco;
    
    @Size(max = 200, message = "Opening name cannot exceed 200 characters")
    private String opening;
    
    @Size(max = 50, message = "Time control cannot exceed 50 characters")
    private String timeControl;
    
    @Size(max = 100, message = "Termination cannot exceed 100 characters")
    private String termination;
    
    @Min(value = 1, message = "Total moves must be at least 1")
    private Integer totalMoves;
    
    @Pattern(regexp = "^(SCAN|UPLOAD|IMPORT)$", message = "Source must be SCAN, UPLOAD, or IMPORT")
    private String source;
    
    private Boolean isPublic;
    
    private Boolean isTournament;
    
    @Size(max = 200, message = "Tournament name cannot exceed 200 characters")
    private String tournamentName;
    
    /**
     * Validate that Elo ratings are consistent with each other
     */
    public boolean isValidEloRange() {
        if (whiteElo != null && blackElo != null) {
            int diff = Math.abs(whiteElo - blackElo);
            return diff <= 500; // Reasonable Elo difference
        }
        return true;
    }
}
