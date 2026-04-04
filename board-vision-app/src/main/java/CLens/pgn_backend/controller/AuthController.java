package CLens.pgn_backend.controller;

import CLens.pgn_backend.dto.AuthRequest;
import CLens.pgn_backend.dto.SignupRequest;
import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.service.UserService;
import CLens.pgn_backend.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService users;
    private final JwtService jwt;
    private final AuthenticationManager authManager;

    public AuthController(UserService users, JwtService jwt, AuthenticationManager authManager) {
        this.users = users;
        this.jwt = jwt;
        this.authManager = authManager;
    }

    /**
     * Register a new user
     * Returns access token, refresh token, and user info
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignupRequest req) {
        User user = users.signup(req.name(), req.email(), req.password(), req.role(), req.phoneNumber());

        // Generate access token (60 minutes)
        String accessToken = jwt.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().name(), "uid", user.getId()),
                60L
        );

        // Generate refresh token (24 hours)
        String refreshToken = jwt.generateRefreshToken(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Signup successful");
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole().name()
        ));
        return ResponseEntity.ok(response);
    }

    /**
     * Login user
     * Returns access token, refresh token, and user info
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody AuthRequest req) {
        try {
            User u = users.login(req.email(), req.password());
            
            // Generate access token (60 minutes)
            String accessToken = jwt.generateToken(
                    u.getEmail(),
                    Map.of("role", u.getRole().name(), "uid", u.getId()),
                    60L
            );
            
            // Generate refresh token (24 hours)
            String refreshToken = jwt.generateRefreshToken(u.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("user", Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole().name()
            ));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Refresh access token using refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Refresh token is required"
            ));
        }
        
        // Validate refresh token
        if (!jwt.isValid(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Invalid refresh token"
            ));
        }
        
        // Check if token is actually a refresh token
        String tokenType = jwt.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Token is not a refresh token"
            ));
        }
        
        // Check if token is expired
        if (jwt.isExpired(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Refresh token has expired"
            ));
        }
        
        // Extract email and generate new access token
        String email = jwt.extractSubject(refreshToken);
        User user = users.findByEmail(email);
        
        // Generate new access token (60 minutes)
        String newAccessToken = jwt.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().name(), "uid", user.getId()),
                60L
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
        response.put("message", "Token refreshed successfully");
        return ResponseEntity.ok(response);
    }
}

