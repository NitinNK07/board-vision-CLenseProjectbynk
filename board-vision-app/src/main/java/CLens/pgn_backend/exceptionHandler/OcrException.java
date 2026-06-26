package CLens.pgn_backend.exceptionHandler;

/**
 * Thrown when all OCR/Vision AI providers (Groq, Gemini, HuggingFace)
 * fail to extract chess data from the uploaded image.
 *
 * Mapped to HTTP 503 Service Unavailable by GlobalExceptionHandler.
 */
public class OcrException extends RuntimeException {

    public OcrException(String message) {
        super(message);
    }

    public OcrException(String message, Throwable cause) {
        super(message, cause);
    }
}
