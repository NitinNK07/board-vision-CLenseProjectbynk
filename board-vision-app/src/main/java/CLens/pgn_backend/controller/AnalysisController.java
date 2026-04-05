
package CLens.pgn_backend.controller;

import CLens.pgn_backend.service.*;
import CLens.pgn_backend.entity.*;
import CLens.pgn_backend.repository.*;
import CLens.pgn_backend.dto.*;
import CLens.pgn_backend.enums.Role;

import CLens.pgn_backend.dto.GameAnalysisDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;

/**
 * REST Controller for Chess Game Analysis
 */
@RestController
@RequestMapping("/api/analysis")
// CORS handled globally by SecurityConfig — do NOT add @CrossOrigin here
public class AnalysisController {
    
    private final StockfishAnalysisService analysisService;
    private final ChessGameService gameService;
    private final GameAnalysisRepository analysisRepository;
    private final PlayerStatisticsService statsService;
    private final UserService userService;
    
    public AnalysisController(StockfishAnalysisService analysisService,
                            ChessGameService gameService,
                            GameAnalysisRepository analysisRepository,
                            PlayerStatisticsService statsService,
                            UserService userService) {
        this.analysisService = analysisService;
        this.gameService = gameService;
        this.analysisRepository = analysisRepository;
        this.statsService = statsService;
        this.userService = userService;
    }
    
    /**
     * Analyze a game by ID
     */
    @PostMapping("/game/{gameId}")
    public ResponseEntity<GameAnalysisDTO> analyzeGame(@PathVariable Long gameId) {
        User user = getCurrentUser();
        
        Optional<ChessGame> gameOpt = gameService.getGameById(gameId);
        if (gameOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ChessGame game = gameOpt.get();
        
        // Check if analysis already exists
        Optional<GameAnalysis> existingAnalysis = analysisRepository.findByGameId(gameId);
        if (existingAnalysis.isPresent()) {
            return ResponseEntity.ok(convertToDTO(existingAnalysis.get()));
        }
        
        // Perform analysis
        GameAnalysisDTO analysis = analysisService.analyzeGame(game.getPgnContent());
        analysis.setGameId(gameId);
        
        // Save analysis to database
        GameAnalysis savedAnalysis = new GameAnalysis();
        savedAnalysis.setGame(game);
        savedAnalysis.setAccuracyWhite(analysis.getAccuracyWhite());
        savedAnalysis.setAccuracyBlack(analysis.getAccuracyBlack());
        savedAnalysis.setBestMovesWhite(analysis.getBestMovesWhite());
        savedAnalysis.setBestMovesBlack(analysis.getBestMovesBlack());
        savedAnalysis.setBlundersWhite(analysis.getBlundersWhite());
        savedAnalysis.setBlundersBlack(analysis.getBlundersBlack());
        savedAnalysis.setMistakesWhite(analysis.getMistakesWhite());
        savedAnalysis.setMistakesBlack(analysis.getMistakesBlack());
        savedAnalysis.setInaccuraciesWhite(analysis.getInaccuraciesWhite());
        savedAnalysis.setInaccuraciesBlack(analysis.getInaccuraciesBlack());
        savedAnalysis.setEvaluationData(analysisService.getEvaluationDataJson(analysis.getMoveEvaluations()));
        savedAnalysis.setBestLine(analysis.getBestLine());
        savedAnalysis.setAnalysisDepth(15);
        savedAnalysis.setAnalysisTimeMs(500L);
        savedAnalysis.setStockfishVersion("16.0");
        savedAnalysis.setAnalyzedAt(Instant.now());
        
        analysisRepository.save(savedAnalysis);
        
        // Recalculate player statistics with new analysis
        statsService.recalculateStats(user);
        
        return ResponseEntity.ok(analysis);
    }
    
    /**
     * Get analysis for a game
     */
    @GetMapping("/game/{gameId}")
    public ResponseEntity<GameAnalysisDTO> getAnalysis(@PathVariable Long gameId) {
        Optional<GameAnalysis> analysisOpt = analysisRepository.findByGameId(gameId);
        
        if (analysisOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(convertToDTO(analysisOpt.get()));
    }
    
    /**
     * Analyze PGN directly (without saving game)
     */
    @PostMapping("/pgn")
    public ResponseEntity<GameAnalysisDTO> analyzePgn(@RequestBody String pgn) {
        GameAnalysisDTO analysis = analysisService.analyzeGame(pgn);
        return ResponseEntity.ok(analysis);
    }
    
    /**
     * Get recent analyses for current user
     */
    @GetMapping("/recent")
    public ResponseEntity<java.util.List<GameAnalysisDTO>> getRecentAnalyses() {
        User user = getCurrentUser();
        java.util.List<GameAnalysis> analyses = analysisRepository.findRecentAnalysisByPlayerId(user.getId());
        
        java.util.List<GameAnalysisDTO> dtos = new java.util.ArrayList<>();
        for (GameAnalysis analysis : analyses) {
            dtos.add(convertToDTO(analysis));
        }
        
        return ResponseEntity.ok(dtos);
    }
    
    private GameAnalysisDTO convertToDTO(GameAnalysis analysis) {
        GameAnalysisDTO dto = new GameAnalysisDTO();
        dto.setGameId(analysis.getGame().getId());
        dto.setAccuracyWhite(analysis.getAccuracyWhite());
        dto.setAccuracyBlack(analysis.getAccuracyBlack());
        dto.setBestMovesWhite(analysis.getBestMovesWhite());
        dto.setBestMovesBlack(analysis.getBestMovesBlack());
        dto.setBlundersWhite(analysis.getBlundersWhite());
        dto.setBlundersBlack(analysis.getBlundersBlack());
        dto.setMistakesWhite(analysis.getMistakesWhite());
        dto.setMistakesBlack(analysis.getMistakesBlack());
        dto.setInaccuraciesWhite(analysis.getInaccuraciesWhite());
        dto.setInaccuraciesBlack(analysis.getInaccuraciesBlack());
        dto.setBestLine(analysis.getBestLine());
        // Parse stored move evaluations from JSON
        if (analysis.getEvaluationData() != null && !analysis.getEvaluationData().isEmpty()) {
            dto.setMoveEvaluations(analysisService.parseEvaluationDataJson(analysis.getEvaluationData()));
        }
        return dto;
    }
    
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userService.findByEmail(email);
    }
}

