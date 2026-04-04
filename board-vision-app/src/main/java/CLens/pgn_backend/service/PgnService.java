package CLens.pgn_backend.service;

import CLens.pgn_backend.dto.PgnResult;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class PgnService {

    public PgnResult parseAndValidate(String rawText) {
        // Basic validation for PGN format
        if (rawText == null || rawText.trim().isEmpty()) {
            return new PgnResult("", "Error: Empty or null PGN data");
        }

        // Check if the PGN has basic structure (optional headers and moves)
        if (!isValidPGNFormat(rawText)) {
            return new PgnResult("", "Error: Invalid PGN format");
        }

        // Additional validations could go here:
        // - Validate move syntax
        // - Check if moves are in proper SAN notation
        // - Validate game termination markers
        // - etc.

        // Return the validated PGN
        return new PgnResult(rawText, "OK");
    }

    // Basic validation for PGN format
    private boolean isValidPGNFormat(String pgn) {
        // Check if it's at least a basic PGN with moves
        // This is a simplified validation - a full implementation would be more complex
        String trimmed = pgn.trim();
        
        // Check if it has moves (at least one move number followed by moves)
        if (!trimmed.matches("(?s).*\\d+\\s*\\.\\s*[KQRBNP]?[a-h]?[1-8]?[x@]?[a-h][1-8].*")) {
            // If it doesn't have SAN notation moves, check for common endings
            if (!trimmed.matches("(?s).*(1-0|0-1|1/2-1/2|\\*).*")) {
                return false;
            }
        }

        // Additional basic checks could be added here
        return true;
    }
}
