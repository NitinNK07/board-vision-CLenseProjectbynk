package CLens.pgn_backend.service;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.entity.ChessGame;
import CLens.pgn_backend.entity.PlayerStatistics;
import CLens.pgn_backend.entity.GameAnalysis;
import CLens.pgn_backend.repository.PlayerStatisticsRepository;
import CLens.pgn_backend.repository.ChessGameRepository;
import CLens.pgn_backend.repository.GameAnalysisRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlayerStatisticsService {

    private final PlayerStatisticsRepository statsRepository;
    private final ChessGameRepository gameRepository;
    private final GameAnalysisRepository analysisRepository;
    
    public PlayerStatisticsService(PlayerStatisticsRepository statsRepository,
                                   ChessGameRepository gameRepository,
                                   GameAnalysisRepository analysisRepository) {
        this.statsRepository = statsRepository;
        this.gameRepository = gameRepository;
        this.analysisRepository = analysisRepository;
    }
    
    /**
     * Get or create statistics for a player
     */
    @Transactional
    public PlayerStatistics getOrCreateStats(User player) {
        return statsRepository.findByPlayerId(player.getId())
            .orElseGet(() -> createInitialStats(player));
    }
    
    /**
     * Recalculate all statistics for a player based on their games
     */
    public PlayerStatistics recalculateStats(User player) {
        List<ChessGame> games = gameRepository.findByPlayerIdOrderByCreatedAtDesc(player.getId());
        
        if (games.isEmpty()) {
            return getOrCreateStats(player);
        }
        
        // Calculate overall stats
        int totalGames = games.size();
        int wins = 0, losses = 0, draws = 0;
        int gamesAsWhite = 0, winsAsWhite = 0;
        int gamesAsBlack = 0, winsAsBlack = 0;
        
        Map<String, Integer> openingCounts = new HashMap<>();
        Map<String, Integer> ecoCounts = new HashMap<>();
        Map<String, Integer> openingWins = new HashMap<>();
        
        List<String> recentResults = new ArrayList<>();
        int currentStreak = 0;
        int longestWinStreak = 0;
        int tempStreak = 0;
        
        double totalAccuracy = 0;
        int totalBlunders = 0;
        int totalMistakes = 0;
        int gamesWithAnalysis = 0;
        
        // Process games (most recent first)
        for (ChessGame game : games) {
            boolean isWin = false;
            boolean isLoss = false;
            boolean isDraw = false;
            
            // Determine result
            if ("1-0".equals(game.getResult())) {
                isWin = true;
                isLoss = false;
            } else if ("0-1".equals(game.getResult())) {
                isWin = false;
                isLoss = true;
            } else if ("1/2-1/2".equals(game.getResult()) || "*".equals(game.getResult())) {
                isDraw = true;
            }
            
            // Count by color
            String whitePlayer = game.getWhitePlayer();
            String blackPlayer = game.getBlackPlayer();
            boolean isPlayerWhite = false;
            
            if (whitePlayer != null) {
                isPlayerWhite = whitePlayer.toLowerCase().contains(player.getEmail().toLowerCase()) ||
                    whitePlayer.equals(player.getName());
            }
            
            if (isPlayerWhite) {
                gamesAsWhite++;
                if (isWin) winsAsWhite++;
            } else {
                gamesAsBlack++;
                if (isWin) winsAsBlack++;
            }
            
            if (isWin) {
                wins++;
                recentResults.add("W");
                tempStreak = tempStreak > 0 ? tempStreak + 1 : 1;
            } else if (isLoss) {
                losses++;
                recentResults.add("L");
                tempStreak = tempStreak < 0 ? tempStreak - 1 : -1;
            } else {
                draws++;
                recentResults.add("D");
                tempStreak = 0;
            }
            
            currentStreak = tempStreak;
            if (tempStreak > longestWinStreak) {
                longestWinStreak = tempStreak;
            }
            
            // Track openings
            if (game.getOpening() != null) {
                openingCounts.put(game.getOpening(), 
                    openingCounts.getOrDefault(game.getOpening(), 0) + 1);
                if (isWin) {
                    openingWins.put(game.getOpening(),
                        openingWins.getOrDefault(game.getOpening(), 0) + 1);
                }
            }
            if (game.getEco() != null) {
                ecoCounts.put(game.getEco(),
                    ecoCounts.getOrDefault(game.getEco(), 0) + 1);
            }
            
            // Get analysis data
            Optional<GameAnalysis> analysisOpt = analysisRepository.findByGameId(game.getId());
            if (analysisOpt.isPresent()) {
                GameAnalysis analysis = analysisOpt.get();
                gamesWithAnalysis++;

                // Get accuracy for the player's color
                Double accuracy = isPlayerWhite
                    ? analysis.getAccuracyWhite() : analysis.getAccuracyBlack();

                if (accuracy != null) {
                    totalAccuracy += accuracy;
                }

                totalBlunders += (isPlayerWhite
                    ? analysis.getBlundersWhite() : analysis.getBlundersBlack()) != null
                    ? (isPlayerWhite
                        ? analysis.getBlundersWhite() : analysis.getBlundersBlack()) : 0;
                totalMistakes += (isPlayerWhite
                    ? analysis.getMistakesWhite() : analysis.getMistakesBlack()) != null
                    ? (isPlayerWhite
                        ? analysis.getMistakesWhite() : analysis.getMistakesBlack()) : 0;
            }
        }
        
        // Calculate rates
        double winRate = totalGames > 0 ? (double) wins / totalGames * 100 : 0;
        double winRateWhite = gamesAsWhite > 0 ? (double) winsAsWhite / gamesAsWhite * 100 : 0;
        double winRateBlack = gamesAsBlack > 0 ? (double) winsAsBlack / gamesAsBlack * 100 : 0;
        double avgAccuracy = gamesWithAnalysis > 0 ? totalAccuracy / gamesWithAnalysis : 0;
        double avgBlunders = gamesWithAnalysis > 0 ? (double) totalBlunders / gamesWithAnalysis : 0;
        double avgMistakes = gamesWithAnalysis > 0 ? (double) totalMistakes / gamesWithAnalysis : 0;
        
        // Find most played and best openings
        String mostPlayedOpening = openingCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(null);
        
        String mostPlayedEco = ecoCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(null);
        
        String bestOpening = openingWins.entrySet().stream()
            .filter(e -> openingCounts.get(e.getKey()) >= 3) // Min 3 games
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(mostPlayedOpening);
        
        // Get recent form (last 10 games)
        String recentForm = recentResults.stream()
            .limit(10)
            .collect(Collectors.joining(""));
        
        // Get or create stats
        PlayerStatistics stats = getOrCreateStats(player);
        
        // Update stats
        stats.setTotalGames(totalGames);
        stats.setWins(wins);
        stats.setLosses(losses);
        stats.setDraws(draws);
        stats.setWinRate(winRate);
        stats.setGamesAsWhite(gamesAsWhite);
        stats.setWinsAsWhite(winsAsWhite);
        stats.setWinRateAsWhite(winRateWhite);
        stats.setGamesAsBlack(gamesAsBlack);
        stats.setWinsAsBlack(winsAsBlack);
        stats.setWinRateAsBlack(winRateBlack);
        stats.setAverageAccuracy(avgAccuracy);
        stats.setAverageBlundersPerGame(avgBlunders);
        stats.setAverageMistakesPerGame(avgMistakes);
        stats.setMostPlayedOpening(mostPlayedOpening);
        stats.setMostPlayedEco(mostPlayedEco);
        stats.setBestOpening(bestOpening);
        stats.setRecentForm(recentForm);
        stats.setCurrentStreak(currentStreak);
        stats.setLongestWinStreak(longestWinStreak);
        stats.setLastGameDate(Instant.now());
        
        return statsRepository.save(stats);
    }
    
    private boolean isPlayerWhite(ChessGame game, User player) {
        String whitePlayer = game.getWhitePlayer();
        return whitePlayer != null &&
            (whitePlayer.equals(player.getName()) ||
             whitePlayer.toLowerCase().contains(player.getEmail().toLowerCase()));
    }
    
    private PlayerStatistics createInitialStats(User player) {
        PlayerStatistics stats = new PlayerStatistics();
        stats.setPlayer(player);
        stats.setTotalGames(0);
        stats.setWins(0);
        stats.setLosses(0);
        stats.setDraws(0);
        stats.setWinRate(0.0);
        stats.setGamesAsWhite(0);
        stats.setWinsAsWhite(0);
        stats.setWinRateAsWhite(0.0);
        stats.setGamesAsBlack(0);
        stats.setWinsAsBlack(0);
        stats.setWinRateAsBlack(0.0);
        stats.setAverageAccuracy(0.0);
        stats.setAverageBlundersPerGame(0.0);
        stats.setAverageMistakesPerGame(0.0);
        stats.setCurrentStreak(0);
        stats.setLongestWinStreak(0);
        return statsRepository.save(stats);
    }
}
