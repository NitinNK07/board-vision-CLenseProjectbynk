package CLens.pgn_backend.service;

import CLens.pgn_backend.entity.ChessGame;
import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.entity.GameAnalysis;
import CLens.pgn_backend.entity.PlayerStatistics;
import CLens.pgn_backend.enums.Role;
import CLens.pgn_backend.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", 
        Pattern.CASE_INSENSITIVE
    );
    
    private static final int MIN_PASSWORD_LENGTH = 6;
    private static final int MAX_PASSWORD_LENGTH = 128;
    private static final int MIN_NAME_LENGTH = 2;
    private static final int MAX_NAME_LENGTH = 50;

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User signup(String name, String email, String password, Role role, String phoneNumber) {
        // Validate name
        if (name == null || name.trim().length() < MIN_NAME_LENGTH || name.trim().length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException("Name must be between " + MIN_NAME_LENGTH + " and " + MAX_NAME_LENGTH + " characters");
        }

        // Validate email format
        if (email == null || !isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Check if email already exists
        if (userRepo.findByEmail(email.toLowerCase().trim()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Validate password strength
        if (password == null || password.length() < MIN_PASSWORD_LENGTH || password.length() > MAX_PASSWORD_LENGTH) {
            throw new IllegalArgumentException("Password must be between " + MIN_PASSWORD_LENGTH + " and " + MAX_PASSWORD_LENGTH + " characters");
        }

        // Validate role
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }

        // Validate phone number if provided
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            if (!isValidPhoneNumber(phoneNumber)) {
                throw new IllegalArgumentException("Invalid phone number format. Use E.164 format (e.g., +1234567890)");
            }

            // Check if phone number already exists
            if (userRepo.findByPhoneNumber(phoneNumber).isPresent()) {
                throw new IllegalArgumentException("Phone number already registered");
            }
        }

        User u = new User();
        u.setName(name.trim());
        u.setEmail(email.toLowerCase().trim());
        u.setPasswordHash(passwordEncoder.encode(password));
        u.setRole(role);
        u.setPhoneNumber(phoneNumber);
        u.setEmailVerified(false);
        u.setPhoneVerified(false);

        return userRepo.save(u);
    }

    @Transactional(readOnly = true)
    public User login(String email, String password) {
        User u = userRepo.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(password, u.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return u;
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepo.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    /**
     * Validate email format using regex
     */
    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email.trim()).matches();
    }
    
    /**
     * Validate phone number in E.164 format
     */
    private boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) return false;
        // E.164 format: +[country code][number] (max 15 digits)
        return phoneNumber.matches("^\\+[1-9]\\d{1,14}$");
    }

    @Transactional
    public void updateUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        userRepo.save(user);
    }

    @Transactional
    public boolean verifyEmail(String email) {
        User user = userRepo.findByEmail(email.toLowerCase().trim()).orElse(null);
        if (user != null) {
            user.setEmailVerified(true);
            userRepo.save(user);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean verifyPhone(String phoneNumber) {
        User user = userRepo.findByPhoneNumber(phoneNumber).orElse(null);
        if (user != null) {
            user.setPhoneVerified(true);
            userRepo.save(user);
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public User findByEmailOrPhone(String email, String phoneNumber) {
        if (email != null && !email.trim().isEmpty()) {
            return userRepo.findByEmail(email.toLowerCase().trim()).orElse(null);
        } else if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            return userRepo.findByPhoneNumber(phoneNumber).orElse(null);
        }
        return null;
    }
    
    /**
     * Check if user exists by email
     */
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepo.findByEmail(email.toLowerCase().trim()).isPresent();
    }
    
    /**
     * Check if user exists by phone number
     */
    @Transactional(readOnly = true)
    public boolean existsByPhoneNumber(String phoneNumber) {
        return userRepo.findByPhoneNumber(phoneNumber).isPresent();
    }
}
