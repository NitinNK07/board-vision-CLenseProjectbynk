package CLens.pgn_backend.dto;

import java.util.List;

/**
 * Complete validation result returned after ChessLib board replay of OCR-extracted PGN.
 *
 * @param status             Overall validation status (VALID, VALID_WITH_WARNINGS, INVALID)
 * @param cleanedPgn         The sanitized PGN text after cleaning
 * @param totalMoves         Total number of move tokens extracted from the PGN
 * @param validMoves         Number of moves that passed legality check
 * @param moveAccuracy       Percentage: validMoves / totalMoves * 100
 * @param errors             List of MoveError objects for each illegal/unparseable move
 * @param warnings           List of non-fatal warnings (e.g. missing headers)
 * @param fenPositions       FEN string after each legal move (for future Stockfish integration)
 * @param illegalMoveCount   Count of moves classified as ILLEGAL_MOVE
 * @param parseErrorCount    Count of moves classified as PARSE_ERROR
 */
public record PgnValidationResult(
    ValidationStatus status,
    String cleanedPgn,
    int totalMoves,
    int validMoves,
    double moveAccuracy,
    List<MoveError> errors,
    List<String> warnings,
    List<String> fenPositions,
    int illegalMoveCount,
    int parseErrorCount
) {

    /**
     * Convenience check: are there zero errors?
     */
    /**
     * Executes the isFullyValid operation.
     */
    public boolean isFullyValid() {
        return status != ValidationStatus.INVALID;
    }
}
