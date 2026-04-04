package CLens.pgn_backend.dto;

import CLens.pgn_backend.enums.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record SignupRequest(
        @NotBlank(message = "Name cannot be blank")
        @Size(min = 2, max = 50, message = "Name should be between 2 and 50 characters")
        String name,
        @Email(message = "Email should be valid")
        @NotBlank(message = "Email cannot be blank")
        String email,
        @NotBlank(message = "Password cannot be blank")
        @Size(min = 6, max = 128, message = "Password should be between 6 and 128 characters")
        String password,
        @NotNull(message = "Role cannot be null")
        @JsonProperty("role")
        Role role,
        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number should be valid") // E.164 format
        String phoneNumber
) {}
