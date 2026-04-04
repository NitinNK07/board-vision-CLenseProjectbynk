package CLens.pgn_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpRequest(
    @Email(message = "Email should be valid")
    String email,

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number should be in E.164 format")
    String phoneNumber
) {
    // At least one of email or phoneNumber must be provided
    public OtpRequest {
        if ((email == null || email.trim().isEmpty()) && 
            (phoneNumber == null || phoneNumber.trim().isEmpty())) {
            throw new IllegalArgumentException("Either email or phone number must be provided");
        }
    }
}