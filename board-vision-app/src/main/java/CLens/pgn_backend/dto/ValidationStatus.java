package CLens.pgn_backend.dto;

/**
 * Validation status for PGN legality checking.
 *
 * VALID           — All moves are legal, all headers present.
 * VALID_WITH_WARNINGS — All moves are legal, but headers are missing or incomplete.
 * INVALID         — One or more moves are illegal or unparseable.
 */
public enum ValidationStatus {
    VALID,
    VALID_WITH_WARNINGS,
    INVALID
}
