package CLens.pgn_backend.controller;

import CLens.pgn_backend.service.OtpService;
import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/verification")
public class VerificationController {

    private final UserService userService;
    private final OtpService otpService;

    public VerificationController(UserService userService, OtpService otpService) {
        this.userService = userService;
        this.otpService = otpService;
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String email, @RequestParam String otp) {
        User user = userService.findByEmail(email);

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "User not found"
            ));
        }

        // Check if already verified
        if (user.isEmailVerified()) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email already verified"
            ));
        }

        boolean isValid = otpService.verifyOtp(email, null, otp);

        if (isValid) {
            user.setEmailVerified(true);
            userService.updateUser(user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email verified successfully"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Invalid or expired OTP"
            ));
        }
    }

    @PostMapping("/verify-phone")
    public String verifyPhone(@RequestParam String phoneNumber, @RequestParam String otp) {
        User user = userService.findByEmailOrPhone(null, phoneNumber);

        if (user == null) {
            return "User not found";
        }

        boolean isValid = otpService.verifyOtp(null, phoneNumber, otp);

        if (isValid) {
            user.setPhoneVerified(true);
            userService.updateUser(user);
            return "Phone number verified successfully";
        } else {
            return "Invalid or expired OTP";
        }
    }
}
