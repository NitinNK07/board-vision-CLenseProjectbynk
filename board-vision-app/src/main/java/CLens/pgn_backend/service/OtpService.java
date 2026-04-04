package CLens.pgn_backend.service;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.repository.UserRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    // In a real application, you'd use Redis or a database to store OTPs
    // For this implementation, we'll use in-memory storage
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    private final JavaMailSender mailSender;

    @Value("${twilio.account.sid:#{null}}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:#{null}}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number:#{null}}")
    private String twilioPhoneNumber;

    @Value("${spring.mail.username:#{null}}")
    private String fromEmail;

    public OtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        
        // Initialize Twilio if credentials are provided
        if (twilioAccountSid != null && twilioAuthToken != null) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
        }
    }

    public String generateAndSendOtp(String email, String phoneNumber) {
        String otp = String.format("%06d", random.nextInt(1000000)); // 6-digit OTP

        // Store OTP with expiration time (5 minutes)
        OtpData otpData = new OtpData(otp, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5));
        String key = generateKey(email, phoneNumber);
        otpStore.put(key, otpData);

        // Send OTP via email or SMS
        if (email != null) {
            sendEmailOtp(email, otp);
        }
        
        if (phoneNumber != null) {
            sendSmsOtp(phoneNumber, otp);
        }

        return otp;
    }

    public boolean verifyOtp(String email, String phoneNumber, String otp) {
        String key = generateKey(email, phoneNumber);
        OtpData otpData = otpStore.get(key);

        if (otpData == null) {
            return false; // OTP doesn't exist
        }

        // Check if OTP is expired
        if (System.currentTimeMillis() > otpData.expiryTime()) {
            otpStore.remove(key); // Clean up expired OTP
            return false;
        }

        // Verify OTP value
        boolean isValid = otpData.otp().equals(otp);

        // Clean up after verification attempt
        otpStore.remove(key);

        return isValid;
    }

    private void sendEmailOtp(String email, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail != null ? fromEmail : "noreply@clens.com");
            helper.setTo(email);
            helper.setSubject("CLens - OTP Verification");
            helper.setText("Your OTP for CLens verification is: " + otp + "\n\nThis OTP is valid for 5 minutes.");

            mailSender.send(message);
            System.out.println("OTP sent to email: " + email);
        } catch (MessagingException e) {
            System.err.println("Failed to send OTP email to " + email + ": " + e.getMessage());
            // In a real app, you might want to log this properly or handle it differently
        }
    }

    private void sendSmsOtp(String phoneNumber, String otp) {
        // Format phone number to E.164 format (with +)
        String formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : "+" + phoneNumber;

        try {
            if (twilioAccountSid != null && twilioAuthToken != null) {
                Message message = Message.creator(
                        new PhoneNumber(formattedPhoneNumber),
                        new PhoneNumber(twilioPhoneNumber),
                        "Your CLens OTP is: " + otp + ". Valid for 5 minutes."
                ).create();

                System.out.println("OTP sent via SMS to: " + phoneNumber + ", SID: " + message.getSid());
            } else {
                // For development purposes without Twilio credentials, log the OTP
                System.out.println("SMS Service not configured. OTP for " + phoneNumber + " is: " + otp);
                // In a real app, you'd want to throw an exception or use an alternative service
            }
        } catch (Exception e) {
            System.err.println("Failed to send OTP SMS to " + phoneNumber + ": " + e.getMessage());
        }
    }

    private String generateKey(String email, String phoneNumber) {
        if (email != null) {
            return "email:" + email.toLowerCase().trim();
        } else if (phoneNumber != null) {
            // Format the phone number for consistent key generation
            String formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : "+" + phoneNumber;
            return "phone:" + formattedNumber;
        }
        throw new IllegalArgumentException("Either email or phone number must be provided");
    }

    // Inner record to store OTP data
    public record OtpData(String otp, long expiryTime) {}
}