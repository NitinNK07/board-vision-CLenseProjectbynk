package CLens.pgn_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * VisionScanService - AI-Powered Chess Scoresheet/Board Scanner
 *
 * Priority order:
 *   1. Groq API (FREE, no billing, Llama 4 Scout vision - excellent OCR)
 *   2. Google Gemini (needs billing in some regions)
 *   3. HuggingFace Qwen2.5-VL (fallback)
 *
 * Groq Free Tier: 30 req/min, 14400 req/day — best free option!
 */
@Service
public class VisionScanService {

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(30))
        .build();

    // ============================================
    // Groq API Configuration (PRIMARY - 100% FREE)
    // Get free key: https://console.groq.com/keys
    // ============================================
    @Value("${groq.api.key:}")
    private String groqApiKey;

    private static final String GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

    // ============================================
    // Gemini API Configuration (SECONDARY)
    // ============================================
    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private static final String GEMINI_ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

    // ============================================
    // HuggingFace API Configuration (FALLBACK)
    // ============================================
    @Value("${huggingface.api.token:}")
    private String huggingFaceToken;

    private static final String HUGGINGFACE_ENDPOINT =
        "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-VL-72B-Instruct";

    // ============================================
    // Chess-Optimized Vision Prompt
    // ============================================
    private static final String CHESS_SCORESHEET_PROMPT =
        "You are an expert chess scoresheet reader and OCR specialist.\n\n" +
        "TASK: Read this chess scoresheet image and extract ALL moves in standard algebraic notation (SAN).\n\n" +
        "IMPORTANT RULES:\n" +
        "1. Read EVERY move carefully - both White and Black columns, from move 1 to the last move.\n" +
        "2. Output moves in standard algebraic notation (SAN), NOT descriptive notation.\n" +
        "   - If the scoresheet uses DESCRIPTIVE notation (e.g., P-K4, N-KB3, PxP), convert to SAN (e.g., e4, Nf3, exd5).\n" +
        "3. Piece symbols: K=King, Q=Queen, R=Rook, B=Bishop, N=Knight. Pawns have no symbol.\n" +
        "4. Captures use 'x': Nxe5, Bxc6, exd5\n" +
        "5. Castling: O-O (kingside), O-O-O (queenside). Use capital letter O, not zero.\n" +
        "6. Check: + (e.g., Qd3+). Checkmate: # (e.g., Qxc5#)\n" +
        "7. Pawn promotion: e.g., e8=Q\n" +
        "8. Common OCR confusions to watch for:\n" +
        "   - 'l' or 'I' might be '1'\n" +
        "   - '0' (zero) in castling should be 'O' (letter O)\n" +
        "   - 'S' might be '5'\n" +
        "   - 'B' might be '8' in move numbers\n" +
        "   - Smudged or crossed-out moves - try to read the correction\n\n" +
        "ALSO EXTRACT if visible:\n" +
        "- Event name, Date, White player, Black player, Result (1-0, 0-1, 1/2-1/2, or *), Round\n\n" +
        "OUTPUT FORMAT (strict PGN only):\n" +
        "[Event \"Tournament Name\"]\n" +
        "[Site \"Location\"]\n" +
        "[Date \"2026.01.01\"]\n" +
        "[Round \"1\"]\n" +
        "[White \"Player1\"]\n" +
        "[Black \"Player2\"]\n" +
        "[Result \"1-0\"]\n\n" +
        "1. e4 c5 2. Nf3 d6 1-0\n\n" +
        "If you cannot read a move with confidence, use chess knowledge to infer the most likely legal move.\n" +
        "Do NOT include any explanation text - output ONLY the PGN.";

    // ================================================================
    // MAIN ENTRY POINTS
    // ================================================================

    /**
     * Extract chess data from uploaded image file (MultipartFile)
     */
    public String extractFENFromImage(org.springframework.web.multipart.MultipartFile imageFile) {
        System.out.println("========== VISION SCAN STARTED ==========");
        System.out.println("\uD83D\uDCF8 File: " + imageFile.getOriginalFilename());
        System.out.println("\uD83D\uDCCA Size: " + imageFile.getSize() + " bytes");

        try {
            Path tempFile = Files.createTempFile("chess-scan-", "." + getFileExtension(imageFile.getOriginalFilename()));
            imageFile.transferTo(tempFile);

            byte[] imageBytes = Files.readAllBytes(tempFile);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String mimeType = imageFile.getContentType() != null ? imageFile.getContentType() : "image/jpeg";

            String result = tryAllProviders(base64Image, mimeType);

            Files.deleteIfExists(tempFile);

            if (result != null && !result.isEmpty()) {
                System.out.println("\u2705 Vision scan successful!");
                System.out.println("========== VISION SCAN COMPLETE ==========");
                return result;
            }
        } catch (Exception e) {
            System.err.println("\u274C Vision scan error: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("\u26A0\uFE0F All providers failed, using fallback PGN");
        System.out.println("========== VISION SCAN FAILED ==========");
        return generateFallbackPGN();
    }

    /**
     * Extract from base64 string (legacy API compatibility)
     */
    public String extractFENFromImage(String base64Image) {
        System.out.println("========== VISION SCAN STARTED (Base64) ==========");

        String result = tryAllProviders(base64Image, "image/jpeg");

        if (result != null && !result.isEmpty()) {
            System.out.println("\u2705 Extracted: " + result.substring(0, Math.min(200, result.length())));
            return result;
        }

        System.out.println("\u26A0\uFE0F Using fallback PGN");
        return generateFallbackPGN();
    }

    /**
     * Try all AI providers in priority order
     */
    private String tryAllProviders(String base64Image, String mimeType) {
        // 1. Try Groq (FREE, no billing needed)
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            System.out.println("\uD83D\uDE80 Trying Groq API (primary - free)...");
            String result = callGroqVision(base64Image, mimeType);
            if (result != null && !result.isEmpty()) return result;
        }

        // 2. Try Gemini
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            System.out.println("\uD83D\uDD04 Trying Gemini API...");
            String result = callGeminiVision(base64Image, mimeType);
            if (result != null && !result.isEmpty()) return result;
        }

        // 3. Try HuggingFace
        if (huggingFaceToken != null && !huggingFaceToken.isBlank()) {
            System.out.println("\uD83D\uDD04 Trying HuggingFace API (fallback)...");
            String result = callHuggingFaceVision(base64Image);
            if (result != null && !result.isEmpty()) return result;
        }

        return null;
    }

    // ================================================================
    // GROQ VISION API (PRIMARY - 100% FREE)
    // ================================================================

    private String callGroqVision(String base64Image, String mimeType) {
        try {
            String escapedPrompt = escapeJson(CHESS_SCORESHEET_PROMPT);

            String requestBody = String.format(
                "{\"model\":\"%s\",\"messages\":[{\"role\":\"user\",\"content\":[" +
                "{\"type\":\"image_url\",\"image_url\":{\"url\":\"data:%s;base64,%s\"}}," +
                "{\"type\":\"text\",\"text\":\"%s\"}" +
                "]}],\"max_tokens\":2048,\"temperature\":0.1}",
                GROQ_MODEL, mimeType, base64Image, escapedPrompt
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GROQ_ENDPOINT))
                .header("Authorization", "Bearer " + groqApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(60))
                .build();

            System.out.println("\uD83D\uDCE4 Sending to Groq API (" + GROQ_MODEL + ")...");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("\uD83D\uDCE5 Groq Status: " + response.statusCode());

            if (response.statusCode() == 200) {
                String chessData = parseOpenAIStyleResponse(response.body());
                if (chessData != null && !chessData.isEmpty()) {
                    System.out.println("\u2705 Groq extracted chess data successfully!");
                    return chessData;
                }
            } else {
                System.err.println("\u274C Groq error: " + response.statusCode());
                System.err.println("Response: " + response.body().substring(0, Math.min(300, response.body().length())));
            }
        } catch (Exception e) {
            System.err.println("\u274C Groq exception: " + e.getMessage());
        }
        return null;
    }

    // ================================================================
    // GEMINI VISION API (SECONDARY)
    // ================================================================

    private String callGeminiVision(String base64Image, String mimeType) {
        try {
            String escapedPrompt = escapeJson(CHESS_SCORESHEET_PROMPT);
            String requestBody = String.format(
                "{\"contents\":[{\"parts\":[" +
                "{\"inlineData\":{\"mimeType\":\"%s\",\"data\":\"%s\"}}," +
                "{\"text\":\"%s\"}" +
                "]}],\"generationConfig\":{\"temperature\":0.1,\"maxOutputTokens\":2048}}",
                mimeType, base64Image, escapedPrompt
            );

            String url = GEMINI_ENDPOINT + "?key=" + geminiApiKey;

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(60))
                .build();

            System.out.println("\uD83D\uDCE4 Sending to Gemini API...");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("\uD83D\uDCE5 Gemini Status: " + response.statusCode());

            if (response.statusCode() == 200) {
                // Parse Gemini response: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
                Pattern textPattern = Pattern.compile("\"text\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
                Matcher matcher = textPattern.matcher(response.body());
                if (matcher.find()) {
                    String content = matcher.group(1)
                        .replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
                    content = content.replaceAll("```pgn\\s*", "").replaceAll("```\\s*", "").trim();
                    System.out.println("\u2705 Gemini extracted chess data!");
                    return content;
                }
            } else {
                System.err.println("\u274C Gemini error: " + response.statusCode());
                System.err.println("Response: " + response.body().substring(0, Math.min(300, response.body().length())));
            }
        } catch (Exception e) {
            System.err.println("\u274C Gemini exception: " + e.getMessage());
        }
        return null;
    }

    // ================================================================
    // HUGGINGFACE VISION API (FALLBACK)
    // ================================================================

    private String callHuggingFaceVision(String base64Image) {
        try {
            String escapedPrompt = escapeJson(CHESS_SCORESHEET_PROMPT);
            String requestBody = String.format(
                "{\"model\":\"Qwen/Qwen2.5-VL-72B-Instruct\",\"messages\":[{\"role\":\"user\",\"content\":[" +
                "{\"type\":\"image_url\",\"image_url\":{\"url\":\"data:image/jpeg;base64,%s\"}}," +
                "{\"type\":\"text\",\"text\":\"%s\"}" +
                "]}],\"max_tokens\":2048}",
                base64Image, escapedPrompt
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(HUGGINGFACE_ENDPOINT))
                .header("Authorization", "Bearer " + huggingFaceToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(60))
                .build();

            System.out.println("\uD83D\uDCE4 Sending to HuggingFace API...");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("\uD83D\uDCE5 HuggingFace Status: " + response.statusCode());

            if (response.statusCode() == 200) {
                return parseOpenAIStyleResponse(response.body());
            }

            if (response.statusCode() == 503) {
                System.out.println("\u23F3 Model loading, retrying in 5s...");
                Thread.sleep(5000);
                HttpResponse<String> retry = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (retry.statusCode() == 200) return parseOpenAIStyleResponse(retry.body());
            }
        } catch (Exception e) {
            System.err.println("\u274C HuggingFace error: " + e.getMessage());
        }
        return null;
    }

    // ================================================================
    // RESPONSE PARSERS
    // ================================================================

    /**
     * Parse OpenAI-compatible response (used by Groq and HuggingFace)
     * Format: { choices: [{ message: { content: "..." } }] }
     */
    private String parseOpenAIStyleResponse(String responseBody) {
        try {
            // Extract content from: "content": "..."
            Pattern contentPattern = Pattern.compile("\"content\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
            Matcher matcher = contentPattern.matcher(responseBody);
            if (matcher.find()) {
                String content = matcher.group(1);
                content = content.replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
                content = content.replaceAll("```pgn\\s*", "").replaceAll("```\\s*", "");
                return content.trim();
            }

            // Try finding content in a different format (some APIs)
            Pattern altPattern = Pattern.compile("\"content\"\\s*:\\s*\"(.*?)\"", Pattern.DOTALL);
            Matcher altMatcher = altPattern.matcher(responseBody);
            if (altMatcher.find()) {
                return altMatcher.group(1).replace("\\n", "\n").replace("\\\"", "\"").trim();
            }
        } catch (Exception e) {
            System.err.println("\u274C Error parsing response: " + e.getMessage());
        }
        return null;
    }

    // ================================================================
    // UTILITY METHODS
    // ================================================================

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    /**
     * Convert AI response to proper PGN format
     */
    public String fenToPGN(String aiResponse) {
        if (aiResponse == null || aiResponse.isEmpty()) {
            return generateFallbackPGN();
        }

        // Already looks like PGN with headers
        if (aiResponse.contains("[Event")) {
            return aiResponse;
        }

        // Has move numbers — wrap with headers
        if (aiResponse.matches("(?s).*\\d+\\.\\s*[A-Za-z].*")) {
            String result = extractResult(aiResponse);
            return "[Event \"Scanned Game\"]\n" +
                   "[Site \"CLens\"]\n" +
                   "[Date \"????.??.??\"]\n" +
                   "[Round \"?\"]\n" +
                   "[White \"?\"]\n" +
                   "[Black \"?\"]\n" +
                   "[Result \"" + result + "\"]\n\n" +
                   aiResponse;
        }

        // Contains "/" — it's a FEN position
        if (aiResponse.contains("/") && aiResponse.split("/").length >= 7) {
            return "[Event \"Scanned Position\"]\n" +
                   "[Site \"CLens\"]\n" +
                   "[Date \"????.??.??\"]\n" +
                   "[Round \"?\"]\n" +
                   "[White \"?\"]\n" +
                   "[Black \"?\"]\n" +
                   "[Result \"*\"]\n" +
                   "[FEN \"" + aiResponse.trim() + "\"]\n" +
                   "[SetUp \"1\"]\n\n*";
        }

        // Fallback: wrap whatever we got
        return "[Event \"Scanned Game\"]\n" +
               "[Site \"CLens\"]\n" +
               "[Date \"????.??.??\"]\n" +
               "[Round \"?\"]\n" +
               "[White \"?\"]\n" +
               "[Black \"?\"]\n" +
               "[Result \"*\"]\n\n" +
               aiResponse;
    }

    private String extractResult(String pgn) {
        if (pgn.contains("1-0")) return "1-0";
        if (pgn.contains("0-1")) return "0-1";
        if (pgn.contains("1/2-1/2")) return "1/2-1/2";
        return "*";
    }

    private String generateFallbackPGN() {
        return "[Event \"Scanned Game\"]\n" +
               "[Site \"CLens\"]\n" +
               "[Date \"????.??.??\"]\n" +
               "[Round \"?\"]\n" +
               "[White \"?\"]\n" +
               "[Black \"?\"]\n" +
               "[Result \"*\"]\n\n*";
    }
}
