package CLens.pgn_backend.controller;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.entity.ChessGame;
import CLens.pgn_backend.service.VisionScanService;
import CLens.pgn_backend.service.ScanService;
import CLens.pgn_backend.service.UserService;
import CLens.pgn_backend.service.ChessGameService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/scan")
@CrossOrigin(origins = "http://localhost:5173")
public class VisionScanController {

    private final VisionScanService visionService;
    private final ScanService scanService;
    private final UserService userService;
    private final ChessGameService gameService;

    public VisionScanController(VisionScanService visionService,
                               ScanService scanService,
                               UserService userService,
                               ChessGameService gameService) {
        this.visionService = visionService;
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
        System.out.println("========== CONTROLLER: VISION SCAN REQUEST RECEIVED ==========");

        try {
            User user = currentUser();
            System.out.println("👤 User: " + user.getEmail());

            // Check if user has scans remaining
            ScanService.Allowance allowance = scanService.getAllowance(user);
            long totalScans = allowance.trialRemainingToday() + allowance.adCredits() + allowance.paidCredits();
            System.out.println("📊 User scans: " + totalScans);

            if (totalScans <= 0) {
                System.out.println("❌ No scans remaining");
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "No scans remaining. Watch an ad to earn more!"
                ));
            }

            // Validate image
            if (image.isEmpty()) {
                System.out.println("❌ Image file is empty");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Image file cannot be empty"
                ));
            }

            System.out.println("📸 Received file: " + image.getOriginalFilename());
            System.out.println("📊 File size: " + image.getSize() + " bytes");
            System.out.println("📄 Content type: " + image.getContentType());

            // Consume one scan
            scanService.consumeOne(user);
            System.out.println("✅ Scan consumed");

            // Extract chess data using Vision AI (Gemini primary, HuggingFace fallback)
            System.out.println("🔄 Calling Vision AI with file...");
            String fen = visionService.extractFENFromImage(image);
            System.out.println("🔙 Vision AI returned: " + fen.substring(0, Math.min(100, fen.length())));

            // Convert FEN/moves to PGN format
            System.out.println("🔄 Converting to PGN...");
            String pgn = visionService.fenToPGN(fen);
            System.out.println("📄 PGN generated: " + pgn.substring(0, Math.min(100, pgn.length())));

            // DON'T auto-save — return PGN for user confirmation/editing first
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fen", fen);
            response.put("pgn", pgn);
            response.put("message", "Position scanned successfully! Review and confirm below.");
            response.put("gameSaved", false);

            // Include updated allowance
            ScanService.Allowance updatedAllowance = scanService.getAllowance(user);
            response.put("allowance", Map.of(
                "trialRemainingToday", updatedAllowance.trialRemainingToday(),
                "adCredits", updatedAllowance.adCredits(),
                "paidCredits", updatedAllowance.paidCredits()
            ));

            System.out.println("========== CONTROLLER: SCAN COMPLETE ==========");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Vision scan error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("========== CONTROLLER: SCAN FAILED ==========");

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
        System.out.println("========== CONTROLLER: VISION SCAN REQUEST RECEIVED ==========");

        try {
            User user = currentUser();
            System.out.println("👤 User: " + user.getEmail());

            // Check if user has scans remaining
            ScanService.Allowance allowance = scanService.getAllowance(user);
            long totalScans = allowance.trialRemainingToday() + allowance.adCredits() + allowance.paidCredits();
            System.out.println("📊 User scans: " + totalScans);

            if (totalScans <= 0) {
                System.out.println("❌ No scans remaining");
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "No scans remaining. Watch an ad to earn more!"
                ));
            }

            // Validate image data
            String base64Image = request.get("imageBase64");
            System.out.println("📸 Received image (base64 length): " + (base64Image != null ? base64Image.length() : "null"));

            if (base64Image == null || base64Image.trim().isEmpty()) {
                System.out.println("❌ Image data is empty");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Image data cannot be empty"
                ));
            }

            // Consume one scan
            scanService.consumeOne(user);
            System.out.println("✅ Scan consumed");

            // Extract FEN using Vision API
            System.out.println("🔄 Calling Vision AI service...");
            String fen = visionService.extractFENFromImage(base64Image);
            System.out.println("🔙 Vision AI returned: " + fen.substring(0, Math.min(100, fen.length())));

            // Convert FEN to PGN format
            System.out.println("🔄 Converting to PGN...");
            String pgn = visionService.fenToPGN(fen);
            System.out.println("📄 PGN generated: " + pgn.substring(0, Math.min(100, pgn.length())));

            // Save game to database for history tracking
            ChessGame savedGame = null;
            try {
                savedGame = saveGameToDatabase(user, pgn, fen, "SCAN");
                System.out.println("💾 Game saved to database with ID: " + savedGame.getId());
            } catch (Exception e) {
                System.err.println("⚠️ Failed to save game to database: " + e.getMessage());
                // Continue anyway - don't fail the whole request if save fails
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fen", fen);
            response.put("pgn", pgn);
            response.put("message", "Position scanned successfully!");
            
            // Include game ID if saved
            if (savedGame != null) {
                response.put("gameId", savedGame.getId());
                response.put("gameSaved", true);
            } else {
                response.put("gameSaved", false);
                response.put("gameSaveError", "Failed to save game to database");
            }
            
            System.out.println("✅ Sending response to frontend");

            // Include updated allowance
            ScanService.Allowance updatedAllowance = scanService.getAllowance(user);
            response.put("allowance", Map.of(
                "trialRemainingToday", updatedAllowance.trialRemainingToday(),
                "adCredits", updatedAllowance.adCredits(),
                "paidCredits", updatedAllowance.paidCredits()
            ));

            System.out.println("========== CONTROLLER: SCAN COMPLETE ==========");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Vision scan error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("========== CONTROLLER: SCAN FAILED ==========");

            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to scan image: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Helper method to save scanned game to database
     */
    private ChessGame saveGameToDatabase(User user, String pgn, String fen, String source) {
        ChessGame game = new ChessGame();
        game.setPlayer(user);
        game.setPgnContent(pgn);
        game.setSource(source);
        game.setIsPublic(false); // Default to private
        game.setGameDate(LocalDate.now());
        game.setSite("CLens AI Vision");
        game.setEvent("Scanned Game");
        
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

            ChessGame savedGame = saveGameToDatabase(user, pgn, fen, "SCAN");

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
