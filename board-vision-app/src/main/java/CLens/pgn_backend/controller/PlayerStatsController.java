
package CLens.pgn_backend.controller;

import CLens.pgn_backend.service.*;
import CLens.pgn_backend.entity.*;
import CLens.pgn_backend.repository.*;
import CLens.pgn_backend.dto.*;
import CLens.pgn_backend.enums.Role;

import CLens.pgn_backend.dto.PlayerStatsDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Player Statistics
 */
@RestController
@RequestMapping("/api/stats")
// CORS handled globally by SecurityConfig
public class PlayerStatsController {
    
    private final PlayerStatisticsService statsService;
    private final UserService userService;
    
    public PlayerStatsController(PlayerStatisticsService statsService,
                                UserService userService) {
        this.statsService = statsService;
        this.userService = userService;
    }
    
    /**
     * Get current user's statistics
     */
    @GetMapping("/me")
    public ResponseEntity<PlayerStatsDTO> getMyStats() {
        User user = getCurrentUser();
        PlayerStatistics stats = statsService.getOrCreateStats(user);
        
        // Recalculate to ensure fresh data
        stats = statsService.recalculateStats(user);
        
        PlayerStatsDTO dto = convertToDTO(stats, user);
        return ResponseEntity.ok(dto);
    }
    
    /**
     * Refresh/recalculate statistics
     */
    @PostMapping("/refresh")
    public ResponseEntity<PlayerStatsDTO> refreshStats() {
        User user = getCurrentUser();
        PlayerStatistics stats = statsService.recalculateStats(user);
        
        PlayerStatsDTO dto = convertToDTO(stats, user);
        return ResponseEntity.ok(dto);
    }
    
    private PlayerStatsDTO convertToDTO(PlayerStatistics stats, User user) {
        PlayerStatsDTO dto = new PlayerStatsDTO();
        dto.setPlayerId(user.getId());
        dto.setPlayerName(user.getName());
        dto.setTotalGames(stats.getTotalGames());
        dto.setWins(stats.getWins());
        dto.setLosses(stats.getLosses());
        dto.setDraws(stats.getDraws());
        dto.setWinRate(stats.getWinRate());
        dto.setGamesAsWhite(stats.getGamesAsWhite());
        dto.setWinsAsWhite(stats.getWinsAsWhite());
        dto.setWinRateAsWhite(stats.getWinRateAsWhite());
        dto.setGamesAsBlack(stats.getGamesAsBlack());
        dto.setWinsAsBlack(stats.getWinsAsBlack());
        dto.setWinRateAsBlack(stats.getWinRateAsBlack());
        dto.setAverageAccuracy(stats.getAverageAccuracy());
        dto.setAverageBlundersPerGame(stats.getAverageBlundersPerGame());
        dto.setAverageMistakesPerGame(stats.getAverageMistakesPerGame());
        dto.setMostPlayedOpening(stats.getMostPlayedOpening());
        dto.setMostPlayedEco(stats.getMostPlayedEco());
        dto.setBestOpening(stats.getBestOpening());
        dto.setRecentForm(stats.getRecentForm());
        dto.setCurrentStreak(stats.getCurrentStreak());
        dto.setLongestWinStreak(stats.getLongestWinStreak());
        return dto;
    }
    
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userService.findByEmail(email);
    }
}

