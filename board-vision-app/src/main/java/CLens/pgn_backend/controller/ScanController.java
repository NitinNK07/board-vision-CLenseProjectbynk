package CLens.pgn_backend.controller;

import CLens.pgn_backend.dto.ScanRequest;
import CLens.pgn_backend.dto.PgnResult;
import CLens.pgn_backend.entity.ChessGame;
import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.service.UserService;
import CLens.pgn_backend.service.ScanService;
import CLens.pgn_backend.service.OcrService;
import CLens.pgn_backend.service.PgnService;
import CLens.pgn_backend.service.ChessGameService;
import CLens.pgn_backend.service.PlayerStatisticsService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/scan")
public class ScanController {

    private final UserService users;
    private final ScanService scans;
    private final OcrService ocr;
    private final PgnService pgn;
    private final ChessGameService gameService;
    private final PlayerStatisticsService statsService;

    public ScanController(UserService users, ScanService scans, OcrService ocr,
                         PgnService pgn, ChessGameService gameService,
                         PlayerStatisticsService statsService) {
        this.users = users;
        this.scans = scans;
        this.ocr = ocr;
        this.pgn = pgn;
        this.gameService = gameService;
        this.statsService = statsService;
    }

    @GetMapping("/allowance")
    public ScanService.Allowance allowance() {
        User u = currentUser();
        return scans.getAllowance(u);
    }

    @PostMapping
    public PgnResult scan(@Valid @RequestBody ScanRequest request) {
        User u = currentUser();

        // Validate image base64 format
        if (request.imageBase64() == null || request.imageBase64().trim().isEmpty()) {
            throw new IllegalArgumentException("Image data cannot be empty");
        }

        // 1) consume one scan (trial/ad/paid priority)
        scans.consumeOne(u);

        // 2) OCR
        String rawText = ocr.extractBase64(request.imageBase64());

        // 3) PGN parse/validate
        PgnResult result = pgn.parseAndValidate(rawText);

        // 4) Save game to database if PGN is valid
        if ("OK".equals(result.status())) {
            ChessGame game = new ChessGame();
            game.setPlayer(u);
            game.setPgnContent(result.pgn());
            game.setSource("SCAN");
            game.setIsPublic(false);
            game.setIsTournament(false);

            // Parse basic PGN info if available
            if (result.pgn() != null && !result.pgn().isEmpty()) {
                // Extract result if present
                if (result.pgn().contains("1-0")) {
                    game.setResult("1-0");
                } else if (result.pgn().contains("0-1")) {
                    game.setResult("0-1");
                } else if (result.pgn().contains("1/2-1/2")) {
                    game.setResult("1/2-1/2");
                } else {
                    game.setResult("*");
                }
            }

            ChessGame savedGame = gameService.saveGame(game);

            // Recalculate player statistics
            statsService.recalculateStats(u);
        }

        return result;
    }

    @PostMapping("/watch-ad")
    public ScanService.Allowance watchAd() {
        User u = currentUser();
        
        // Grant 1 ad credit for watching an ad
        ScanService.Allowance allowance = scans.grantAd(u, 1);
        return allowance;
    }

    // helper
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return users.findByEmail(email);
    }
}

