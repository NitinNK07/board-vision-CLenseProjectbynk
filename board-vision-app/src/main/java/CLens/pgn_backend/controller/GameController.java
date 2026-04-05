
package CLens.pgn_backend.controller;

import CLens.pgn_backend.service.*;
import CLens.pgn_backend.entity.*;
import CLens.pgn_backend.repository.*;
import CLens.pgn_backend.dto.*;
import CLens.pgn_backend.enums.Role;

import CLens.pgn_backend.dto.ChessGameDTO;
import CLens.pgn_backend.dto.GameSearchDTO;
import CLens.pgn_backend.dto.PlayerStatsDTO;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Chess Games Database
 */
@RestController
@RequestMapping("/api/games")
// CORS handled globally by SecurityConfig
public class GameController {

    private final ChessGameService gameService;
    private final PlayerStatisticsService statsService;
    private final UserService userService;

    public GameController(ChessGameService gameService,
                         PlayerStatisticsService statsService,
                         UserService userService) {
        this.gameService = gameService;
        this.statsService = statsService;
        this.userService = userService;
    }

    /**
     * Save imported PGN from frontend
     */
    @PostMapping("/import")
    public ResponseEntity<?> importPgn(@Valid @RequestBody Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            
            String pgnContent = (String) request.get("pgn");
            if (pgnContent == null || pgnContent.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "PGN content is required"
                ));
            }
            
            // Create game entity
            ChessGame game = new ChessGame();
            game.setPlayer(user);
            game.setPgnContent(pgnContent);
            game.setSource("IMPORT");
            game.setIsPublic(false);
            game.setGameDate(LocalDate.now());
            game.setSite("CLens PGN Import");
            game.setEvent((String) request.getOrDefault("event", "Imported Game"));
            
            // Extract optional fields
            if (request.containsKey("whitePlayer")) {
                game.setWhitePlayer((String) request.get("whitePlayer"));
            }
            if (request.containsKey("blackPlayer")) {
                game.setBlackPlayer((String) request.get("blackPlayer"));
            }
            if (request.containsKey("result")) {
                game.setResult((String) request.get("result"));
            }
            if (request.containsKey("eco")) {
                game.setEco((String) request.get("eco"));
            }
            if (request.containsKey("opening")) {
                game.setOpening((String) request.get("opening"));
            }
            
            // Save game
            ChessGame savedGame = gameService.saveGame(game);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "PGN imported successfully",
                "gameId", savedGame.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to import PGN: " + e.getMessage()
            ));
        }
    }

    /**
     * Get all games for current user
     */
    @GetMapping
    public ResponseEntity<List<ChessGame>> getMyGames() {
        User user = getCurrentUser();
        List<ChessGame> games = gameService.getPlayerGames(user.getId());
        return ResponseEntity.ok(games);
    }

    /**
     * Get paginated games for current user
     */
    @GetMapping("/my/paginated")
    public ResponseEntity<Page<ChessGame>> getMyGamesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = getCurrentUser();
        Page<ChessGame> games = gameService.getPlayerGamesPaginated(user.getId(), page, size);
        return ResponseEntity.ok(games);
    }

    /**
     * Get specific game by ID
     */
    @GetMapping("/{gameId}")
    public ResponseEntity<ChessGame> getGame(@PathVariable Long gameId) {
        return gameService.getGameById(gameId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Search games with filters
     */
    @PostMapping("/search")
    public ResponseEntity<Page<ChessGame>> searchGames(@RequestBody GameSearchDTO search) {
        User user = getCurrentUser();
        Page<ChessGame> games = gameService.searchGames(search, user.getId());
        return ResponseEntity.ok(games);
    }

    /**
     * Get public games database (community games)
     */
    @GetMapping("/public")
    public ResponseEntity<Page<ChessGame>> getPublicGames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ChessGame> games = gameService.getAllPublicGames(page, size);
        return ResponseEntity.ok(games);
    }

    /**
     * Get tournament games for current user
     */
    @GetMapping("/tournament")
    public ResponseEntity<List<ChessGame>> getTournamentGames() {
        User user = getCurrentUser();
        List<ChessGame> games = gameService.getTournamentGames(user.getId());
        return ResponseEntity.ok(games);
    }

    /**
     * Update game visibility (public/private)
     */
    @PatchMapping("/{gameId}/visibility")
    public ResponseEntity<ChessGame> updateVisibility(
            @PathVariable Long gameId,
            @RequestParam Boolean isPublic) {
        ChessGame game = gameService.updateGameVisibility(gameId, isPublic);
        return ResponseEntity.ok(game);
    }

    /**
     * Delete a game
     */
    @DeleteMapping("/{gameId}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long gameId) {
        gameService.deleteGame(gameId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get game count for current user
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getGameCount() {
        User user = getCurrentUser();
        Long count = gameService.getGameCount(user.getId());
        return ResponseEntity.ok(count);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userService.findByEmail(email);
    }
}

