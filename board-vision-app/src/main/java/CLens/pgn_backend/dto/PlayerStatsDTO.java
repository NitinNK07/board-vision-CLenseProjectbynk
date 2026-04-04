package CLens.pgn_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Player Statistics response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStatsDTO {
    
    private Long playerId;
    private String playerName;
    
    // Overall Stats
    private Integer totalGames;
    private Integer wins;
    private Integer losses;
    private Integer draws;
    private Double winRate;
    
    // As White
    private Integer gamesAsWhite;
    private Integer winsAsWhite;
    private Double winRateAsWhite;
    
    // As Black
    private Integer gamesAsBlack;
    private Integer winsAsBlack;
    private Double winRateAsBlack;
    
    // Performance Metrics
    private Double averageAccuracy;
    private Double averageBlundersPerGame;
    private Double averageMistakesPerGame;
    
    // Opening Stats
    private String mostPlayedOpening;
    private String mostPlayedEco;
    private String bestOpening;
    
    // Recent Form
    private String recentForm;
    private Integer currentStreak;
    private Integer longestWinStreak;
}
