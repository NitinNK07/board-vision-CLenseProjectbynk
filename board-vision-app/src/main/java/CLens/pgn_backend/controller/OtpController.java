
package CLens.pgn_backend.controller;

import CLens.pgn_backend.service.*;
import CLens.pgn_backend.entity.*;
import CLens.pgn_backend.repository.*;
import CLens.pgn_backend.dto.*;
import CLens.pgn_backend.enums.Role;

import CLens.pgn_backend.dto.OtpRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/otp")
public class OtpController {

    private final OtpService otpService;
    private final UserService userService;

    public OtpController(OtpService otpService, UserService userService) {
        this.otpService = otpService;
        this.userService = userService;
    }

    @PostMapping("/request")
    public ResponseEntity<String> requestOtp(@Valid @RequestBody OtpRequest request) {
        // Validate that either email or phone number is provided
        if ((request.email() == null || request.email().trim().isEmpty()) &&
            (request.phoneNumber() == null || request.phoneNumber().trim().isEmpty())) {
            return ResponseEntity.badRequest().body("Either email or phone number must be provided");
        }

        // Generate and send OTP
        String otp = otpService.generateAndSendOtp(request.email(), request.phoneNumber());

        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody OtpRequest request, @RequestParam String otp) {
        // Validate that either email or phone number is provided
        if ((request.email() == null || request.email().trim().isEmpty()) &&
            (request.phoneNumber() == null || request.phoneNumber().trim().isEmpty())) {
            return ResponseEntity.badRequest().body("Either email or phone number must be provided");
        }

        boolean isValid = otpService.verifyOtp(request.email(), request.phoneNumber(), otp);

        if (isValid) {
            // Update user verification status
            if (request.email() != null) {
                userService.verifyEmail(request.email());
            }
            if (request.phoneNumber() != null) {
                userService.verifyPhone(request.phoneNumber());
            }
            return ResponseEntity.ok("OTP verified successfully");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }
    }
}
