package CLens.pgn_backend.exceptionHandler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle OCR provider failures — all AI vision providers are unavailable.
     * Returns HTTP 503 Service Unavailable.
     */
    /**
     * Executes the handleOcrException operation.
     */
    @ExceptionHandler(OcrException.class)
    public ResponseEntity<Object> handleOcrException(OcrException ex, WebRequest request) {
        Map<String, Object> body = createErrorBody(
            "OCR Service Unavailable",
            ex.getMessage(),
            HttpStatus.SERVICE_UNAVAILABLE.value(),
            request.getDescription(false)
        );
        body.put("success", false);
        return new ResponseEntity<>(body, HttpStatus.SERVICE_UNAVAILABLE);
    }

    /**
     * Handle duplicate email/phone registration
     */
    /**
     * Executes the handleIllegalArgument operation.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        String message = ex.getMessage();
        
        // Provide clearer error messages for common validation errors
        if (message.contains("already registered")) {
            message = "User with this email already exists. Please login or use a different email.";
        } else if (message.contains("Invalid email")) {
            message = "Invalid email format. Please enter a valid email address.";
        } else if (message.contains("Password")) {
            message = ex.getMessage(); // Keep password validation messages as-is
        } else if (message.contains("Phone")) {
            message = ex.getMessage(); // Keep phone validation messages as-is
        }
        
        Map<String, Object> body = createErrorBody("Validation Error", message, HttpStatus.BAD_REQUEST.value(), request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle illegal state exceptions
     */
    /**
     * Executes the handleIllegalState operation.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Object> handleIllegalState(IllegalStateException ex, WebRequest request) {
        Map<String, Object> body = createErrorBody("Validation failed", ex.getMessage(), HttpStatus.BAD_REQUEST.value(), request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle bad credentials (login failures)
     */
    /**
     * Executes the handleBadCredentials operation.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentials(BadCredentialsException ex, WebRequest request) {
        Map<String, Object> body = createErrorBody("Authentication failed", "Invalid email or password", HttpStatus.UNAUTHORIZED.value(), request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle runtime exceptions
     */
    /**
     * Executes the handleRuntime operation.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntime(RuntimeException ex, WebRequest request) {
        Map<String, Object> body = createErrorBody("Internal server error", ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), request.getDescription(false));

        // Log the exception for debugging
        log.error("Runtime exception: {}", ex.getMessage(), ex);

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle general exceptions
     */
    /**
     * Executes the handleGeneral operation.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneral(Exception ex, WebRequest request) {
        Map<String, Object> body = createErrorBody("Unexpected error", ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), request.getDescription(false));

        // Log the exception for debugging
        log.error("General exception: {}", ex.getMessage(), ex);

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private Map<String, Object> createErrorBody(String errorType, String message, int status, String path) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status);
        body.put("error", errorType);
        body.put("message", message);
        body.put("path", path);
        return body;
    }
}
