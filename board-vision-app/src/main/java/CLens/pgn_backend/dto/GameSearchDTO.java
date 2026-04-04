package CLens.pgn_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * DTO for searching games
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameSearchDTO {

    private String player; // White or black player name
    
    private String opening;
    
    @Pattern(regexp = "^[A-E][0-9]{2}$", message = "ECO code must be in format A00-E99")
    private String eco;
    
    @Pattern(regexp = "^(1-0|0-1|1/2-1/2|\\*)$", message = "Result must be 1-0, 0-1, 1/2-1/2, or *")
    private String result;
    
    private LocalDate dateFrom;
    
    private LocalDate dateTo;
    
    private Boolean isTournament;
    
    private String tournamentName;
    
    @Min(value = 0, message = "Minimum accuracy cannot be negative")
    @Max(value = 100, message = "Maximum accuracy cannot exceed 100")
    private Integer minAccuracy;
    
    @Min(value = 0, message = "Maximum accuracy cannot be negative")
    @Max(value = 100, message = "Maximum accuracy cannot exceed 100")
    private Integer maxAccuracy;
    
    @Pattern(regexp = "^(gameDate|accuracy|elo|createdAt)$", message = "Sort by must be gameDate, accuracy, elo, or createdAt")
    private String sortBy; // "date", "accuracy", "elo"
    
    @Pattern(regexp = "^(asc|desc)$", message = "Sort order must be 'asc' or 'desc'")
    private String sortOrder; // "asc", "desc"
    
    @Min(value = 0, message = "Page number cannot be negative")
    private Integer page;
    
    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size cannot exceed 100")
    private Integer size;
    
    /**
     * Validate that dateFrom is before dateTo
     */
    public boolean isValidDateRange() {
        if (dateFrom != null && dateTo != null) {
            return !dateFrom.isAfter(dateTo);
        }
        return true;
    }
    
    /**
     * Validate that minAccuracy is not greater than maxAccuracy
     */
    public boolean isValidAccuracyRange() {
        if (minAccuracy != null && maxAccuracy != null) {
            return minAccuracy <= maxAccuracy;
        }
        return true;
    }
}
