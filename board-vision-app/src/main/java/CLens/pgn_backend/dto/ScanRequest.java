package CLens.pgn_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ScanRequest(
        @NotBlank(message = "Image data cannot be blank")
        String imageBase64
) {}
