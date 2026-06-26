package CLens.pgn_backend.dto;

/**
 * Enterprise implementation of AuthResponse.
 * Provides core functionality and business logic.
 */
public record AuthResponse(
        String message,
        String token
) {}
