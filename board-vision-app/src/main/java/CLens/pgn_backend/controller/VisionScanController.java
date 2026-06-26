package CLens.pgn_backend.controller;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.entity.ChessGame;
import CLens.pgn_backend.dto.MoveError;
import CLens.pgn_backend.dto.PgnValidationResult;
import CLens.pgn_backend.service.VisionScanService;
import CLens.pgn_backend.service.PgnValidationService;
import CLens.pgn_backend.service.PgnCorrectionService;
import CLens.pgn_backend.service.ScanService;
import CLens.pgn_backend.service.UserService;
import CLens.pgn_backend.service.ChessGameService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/scan")
// CORS handled globally by SecurityConfig
public class VisionScanController {

    private final VisionScanService visionService;
    private final PgnValidationService validationService;
    private final PgnCorrectionService correctionService;
    private final ScanService scanService;
    private final UserService userService;
    private final ChessGameService gameService;

    public VisionScanController(VisionScanService visionService,
                                PgnValidationService validationService,
                                PgnCorrectionService correctionService,
                                ScanService scanService,
                                UserService userService,
                                ChessGameService gameService) {
        this.visionService = visionService;
        this.validationService = validationService;
        this.correctionService = correctionService;
        this.scanService = scanService;
        this.userService = userService;
        this.gameService = gameService;
    }

    /**
     * Scan chess board image using AI Vision API
     * Returns FEN notation and PGN
     * Accepts multipart file upload (actual image file)
     * Saves the game to database for history tracking
     */
    @PostMapping("/vision")
    public ResponseEntity<?> scanWithVision(@RequestParam("image") MultipartFile image) {
        log.info("========== CONTROLLER: VISION SCAN REQUEST RECEIVED ==========");

        try {
            User user = currentUser();
            log.info("👤 User: {}", user.getEmail());

            // Check if user has scans remaining
            ScanService.Allowance allowance = scanService.getAllowance(user);
            long totalScans = allowance.trialRemainingToday() + allowance.adCredits() + allowance.paidCredits();
            log.info("📊 User scans: {}", totalScans);

            if (totalScans <= 0) {
                log.warn("❌ No scans remaining");
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "No scans remaining. Watch an ad to earn more!"
                ));
            }

            // Validate image
            if (image.isEmpty()) {
                log.warn("❌ Image file is empty");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Image file cannot be empty"
                ));
            }

            log.info("📸 Received file: {}", image.getOriginalFilename());
            log.info("📊 File size: {} bytes", image.getSize());
            log.info("📄 Content type: {}", image.getContentType());

            // Consume one scan
            scanService.consumeOne(user);
            log.info("✅ Scan consumed");

            // Extract chess data using Vision AI
            log.info("🔄 Calling Vision AI with file...");
            String fen = visionService.extractFENFromImage(image);
            log.info("🔙 Vision AI returned: {}", fen.substring(0, Math.min(100, fen.length())));

            // Convert FEN/moves to PGN format
            log.info("🔄 Converting to PGN...");
            String pgn = visionService.fenToPGN(fen);
            log.info("📄 PGN generated: {}", pgn.substring(0, Math.min(100, pgn.length())));

            // DON'T auto-save — return PGN for user confirmation/editing first
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fen", fen);
            response.put("pgn", pgn);
            response.put("message", "Position scanned successfully! Review and confirm below.");
            response.put("gameSaved", false);

            // Validate PGN using ChessLib
            PgnValidationResult validation = validationService.validatePgn(pgn);
            response.put("validationPassed", validation.isFullyValid());
            response.put("validationStatus", validation.status().name());
            response.put("moveAccuracy", validation.moveAccuracy());
            response.put("totalMoves", validation.totalMoves());
            response.put("validMoves", validation.validMoves());

            if (!validation.isFullyValid()) {
                // Get correction suggestions for illegal moves
                List<MoveError> enrichedErrors = correctionService.suggestCorrections(validation);
                response.put("validationErrors", enrichedErrors.stream().map(e -> Map.of(
                    "moveNumber", e.moveNumber(),
                    "move", e.moveSan(),
                    "errorType", e.errorType().name(),
                    "message", e.message(),
                    "suggestions", e.legalAlternatives()
                )).collect(Collectors.toList()));
            }

            if (!validation.warnings().isEmpty()) {
                response.put("validationWarnings", validation.warnings());
            }

            // Include updated allowance
            ScanService.Allowance updatedAllowance = scanService.getAllowance(user);
            response.put("allowance", Map.of(
                "trialRemainingToday", updatedAllowance.trialRemainingToday(),
                "adCredits", updatedAllowance.adCredits(),
                "paidCredits", updatedAllowance.paidCredits()
            ));

            log.info("========== CONTROLLER: SCAN COMPLETE ==========");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Vision scan error", e);
            log.error("========== CONTROLLER: SCAN FAILED ==========");

            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to scan image: " + e.getMessage()
            ));
        }
    }

    /**
     * Scan chess board image using AI Vision API (Base64 version)
     * Compatible with existing frontend ScanRequest format
     * Saves the game to database for history tracking
     */
    @PostMapping("/vision/base64")
    public ResponseEntity<?> scanWithVisionBase64(@RequestBody Map<String, String> request) {
        log.info("========== CONTROLLER: VISION SCAN REQUEST RECEIVED ==========");

        try {
            User user = currentUser();
            log.info("👤 User: {}", user.getEmail());

            // Check if user has scans remaining
            ScanService.Allowance allowance = scanService.getAllowance(user);
            long totalScans = allowance.trialRemainingToday() + allowance.adCredits() + allowance.paidCredits();
            log.info("📊 User scans: {}", totalScans);

            if (totalScans <= 0) {
                log.warn("❌ No scans remaining");
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "No scans remaining. Watch an ad to earn more!"
                ));
            }

            // Validate image data
            String base64Image = request.get("imageBase64");
            log.info("📸 Received image (base64 length): {}", (base64Image != null ? base64Image.length() : "null"));

            if (base64Image == null || base64Image.trim().isEmpty()) {
                log.warn("❌ Image data is empty");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Image data cannot be empty"
                ));
            }

            // Consume one scan
            scanService.consumeOne(user);
            log.info("✅ Scan consumed");

            // Extract FEN using Vision API
            log.info("🔄 Calling Vision AI service...");
            String fen = visionService.extractFENFromImage(base64Image);
            log.info("🔙 Vision AI returned: {}", fen.substring(0, Math.min(100, fen.length())));

            // Convert FEN to PGN format
            log.info("🔄 Converting to PGN...");
            String pgn = visionService.fenToPGN(fen);
            log.info("📄 PGN generated: {}", pgn.substring(0, Math.min(100, pgn.length())));

            // Validate PGN using ChessLib
            log.info("🔍 Validating PGN with ChessLib...");
            PgnValidationResult validation = validationService.validatePgn(pgn);
            log.info("✅ Validation: {} | Accuracy: {}%", validation.status(), validation.moveAccuracy());

            // Save game to database for history tracking (with validation status)
            ChessGame savedGame = null;
            try {
                savedGame = saveGameToDatabase(user, pgn, fen, "SCAN", validation);
                log.info("💾 Game saved to database with ID: {}", savedGame.getId());
            } catch (Exception e) {
                log.warn("⚠️ Failed to save game to database", e);
                // Continue anyway - don't fail the whole request if save fails
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fen", fen);
            response.put("pgn", pgn);
            response.put("message", "Position scanned successfully!");

            // Validation details
            response.put("validationPassed", validation.isFullyValid());
            response.put("validationStatus", validation.status().name());
            response.put("moveAccuracy", validation.moveAccuracy());
            response.put("totalMoves", validation.totalMoves());
            response.put("validMoves", validation.validMoves());

            if (!validation.isFullyValid()) {
                List<MoveError> enrichedErrors = correctionService.suggestCorrections(validation);
                response.put("validationErrors", enrichedErrors.stream().map(e -> Map.of(
                    "moveNumber", e.moveNumber(),
                    "move", e.moveSan(),
                    "errorType", e.errorType().name(),
                    "message", e.message(),
                    "suggestions", e.legalAlternatives()
                )).collect(Collectors.toList()));
            }

            if (!validation.warnings().isEmpty()) {
                response.put("validationWarnings", validation.warnings());
            }
            
            // Include game ID if saved
            if (savedGame != null) {
                response.put("gameId", savedGame.getId());
                response.put("gameSaved", true);
            } else {
                response.put("gameSaved", false);
                response.put("gameSaveError", "Failed to save game to database");
            }
            
            log.info("✅ Sending response to frontend");

            // Include updated allowance
            ScanService.Allowance updatedAllowance = scanService.getAllowance(user);
            response.put("allowance", Map.of(
                "trialRemainingToday", updatedAllowance.trialRemainingToday(),
                "adCredits", updatedAllowance.adCredits(),
                "paidCredits", updatedAllowance.paidCredits()
            ));

            log.info("========== CONTROLLER: SCAN COMPLETE ==========");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Vision scan error", e);
            log.error("========== CONTROLLER: SCAN FAILED ==========");

            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to scan image: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Helper method to save scanned game to database (with validation status)
     */
    private ChessGame saveGameToDatabase(User user, String pgn, String fen, String source, PgnValidationResult validation) {
        ChessGame game = new ChessGame();
        game.setPlayer(user);
        game.setPgnContent(pgn);
        game.setSource(source);
        game.setIsPublic(false); // Default to private
        game.setGameDate(LocalDate.now());
        game.setSite("CLens AI Vision");
        game.setEvent("Scanned Game");
        game.setTotalMoves(validation != null ? validation.totalMoves() : null);
        
        // Store validation status
        if (validation != null) {
            game.setValidationPassed(validation.isFullyValid());
            if (!validation.errors().isEmpty()) {
                // Serialize errors as simple JSON string
                StringBuilder errJson = new StringBuilder("[");
                for (int i = 0; i < validation.errors().size(); i++) {
                    MoveError e = validation.errors().get(i);
                    if (i > 0) errJson.append(",");
                    errJson.append(String.format(
                        "{\"moveNumber\":%d,\"move\":\"%s\",\"type\":\"%s\",\"message\":\"%s\"}",
                        e.moveNumber(), e.moveSan(), e.errorType().name(),
                        e.message().replace("\"", "\\\"")
                    ));
                }
                errJson.append("]");
                game.setValidationErrors(errJson.toString());
            }
        }
        
        // Try to extract result from PGN
        if (pgn.contains("1-0")) {
            game.setResult("1-0");
        } else if (pgn.contains("0-1")) {
            game.setResult("0-1");
        } else if (pgn.contains("1/2-1/2")) {
            game.setResult("1/2-1/2");
        } else {
            game.setResult("*"); // Ongoing or unknown
        }
        
        return gameService.saveGame(game);
    }

    // Helper method to get current authenticated user
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userService.findByEmail(email);
    }

    /**
     * Confirm and save a scanned PGN to the database
     * Called AFTER user reviews and optionally edits the PGN
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmScan(@RequestBody Map<String, String> request) {
        try {
            User user = currentUser();
            String pgn = request.get("pgn");
            String fen = request.get("fen");

            if (pgn == null || pgn.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "PGN content is required"
                ));
            }

            // Validate the (potentially edited) PGN before saving
            PgnValidationResult validation = validationService.validatePgn(pgn);

            ChessGame savedGame = saveGameToDatabase(user, pgn, fen, "SCAN", validation);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Game saved successfully!",
                "gameId", savedGame.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to save game: " + e.getMessage()
            ));
        }
    }

    /**
     * Get scan history — all games with source=SCAN for current user
     */
    @GetMapping("/history")
    public ResponseEntity<?> getScanHistory() {
        try {
            User user = currentUser();
            var games = gameService.getPlayerGames(user.getId());
            var scanGames = games.stream()
                .filter(g -> "SCAN".equals(g.getSource()))
                .toList();
            return ResponseEntity.ok(scanGames);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to load history: " + e.getMessage()
            ));
        }
    }
}
