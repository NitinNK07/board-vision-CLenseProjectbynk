package CLens.pgn_backend.dto;

import java.util.List;

/**
 * Represents a single move validation error detected during ChessLib board replay.
 *
 * @param moveNumber      The sequential move number (1-indexed, counting both white and black)
 * @param moveSan         The SAN string that was attempted (e.g. "Nf4")
 * @param errorType       Category of the error
 * @param message         Human-readable description
 * @param legalAlternatives  List of legal SAN moves at that board position (for correction suggestions)
 */
public record MoveError(
    int moveNumber,
    String moveSan,
    ErrorType errorType,
    String message,
    List<String> legalAlternatives
) {

    /**
     * Classification of move validation errors.
     */
    public enum ErrorType {
        /** Move is syntactically valid SAN but illegal on the current board position */
        ILLEGAL_MOVE,
        /** Move string could not be parsed as SAN notation at all */
        PARSE_ERROR,
        /** Move is ambiguous — multiple pieces could make the move */
        AMBIGUOUS_MOVE
    }
}
