package CLens.pgn_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Enterprise implementation of ScanRequest.
 * Provides core functionality and business logic.
 */
public record ScanRequest(
        @NotBlank(message = "Image data cannot be blank")
        String imageBase64
) {}
