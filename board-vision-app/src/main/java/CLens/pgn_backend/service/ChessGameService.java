package CLens.pgn_backend.service;

import CLens.pgn_backend.entity.ChessGame;
import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.entity.PlayerStatistics;
import CLens.pgn_backend.entity.GameAnalysis;
import CLens.pgn_backend.repository.ChessGameRepository;
import CLens.pgn_backend.repository.PlayerStatisticsRepository;
import CLens.pgn_backend.repository.GameAnalysisRepository;
import CLens.pgn_backend.dto.ChessGameDTO;
import CLens.pgn_backend.dto.GameSearchDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChessGameService {

    private final ChessGameRepository gameRepository;
    private final PlayerStatisticsRepository statsRepository;
    
    public ChessGameService(ChessGameRepository gameRepository, 
                           PlayerStatisticsRepository statsRepository) {
        this.gameRepository = gameRepository;
        this.statsRepository = statsRepository;
    }
    
    /**
     * Save a new chess game from scan
     */
    public ChessGame saveGame(ChessGame game) {
        return gameRepository.save(game);
    }
    
    /**
     * Get game by ID
     */
    @Transactional(readOnly = true)
    public Optional<ChessGame> getGameById(Long gameId) {
        return gameRepository.findById(gameId);
    }
    
    /**
     * Get all games for a player
     */
    @Transactional(readOnly = true)
    public List<ChessGame> getPlayerGames(Long playerId) {
        return gameRepository.findByPlayerIdOrderByCreatedAtDesc(playerId);
    }
    
    /**
     * Get paginated games for a player
     */
    @Transactional(readOnly = true)
    public Page<ChessGame> getPlayerGamesPaginated(Long playerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return gameRepository.findByPlayerId(playerId, pageable);
    }
    
    /**
     * Search games with filters
     */
    @Transactional(readOnly = true)
    public Page<ChessGame> searchGames(GameSearchDTO search, Long playerId) {
        Pageable pageable = createPageable(search);
        
        return gameRepository.searchGames(
            search.getPlayer(),
            search.getOpening(),
            search.getEco(),
            search.getResult(),
            search.getDateFrom(),
            search.getDateTo(),
            search.getIsTournament(),
            search.getTournamentName(),
            pageable
        );
    }
    
    /**
     * Get all public games (for community database)
     */
    @Transactional(readOnly = true)
    public Page<ChessGame> getAllPublicGames(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return gameRepository.findAllPublicGames(pageable);
    }
    
    /**
     * Update game visibility
     */
    public ChessGame updateGameVisibility(Long gameId, Boolean isPublic) {
        ChessGame game = gameRepository.findById(gameId)
            .orElseThrow(() -> new RuntimeException("Game not found"));
        game.setIsPublic(isPublic);
        return gameRepository.save(game);
    }
    
    /**
     * Delete a game
     */
    public void deleteGame(Long gameId) {
        gameRepository.deleteById(gameId);
    }
    
    /**
     * Get tournament games for a player
     */
    @Transactional(readOnly = true)
    public List<ChessGame> getTournamentGames(Long playerId) {
        return gameRepository.findByPlayerIdAndIsTournament(playerId, true);
    }
    
    /**
     * Get game count for a player
     */
    @Transactional(readOnly = true)
    public Long getGameCount(Long playerId) {
        return gameRepository.countGamesByPlayerId(playerId);
    }
    
    private Pageable createPageable(GameSearchDTO search) {
        String sortBy = search.getSortBy() != null ? search.getSortBy() : "gameDate";
        String order = search.getSortOrder() != null ? search.getSortOrder() : "desc";
        Sort.Direction direction = order.equalsIgnoreCase("asc") ? 
            Sort.Direction.ASC : Sort.Direction.DESC;
        
        int page = search.getPage() != null ? search.getPage() : 0;
        int size = search.getSize() != null ? search.getSize() : 20;
        
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }
}
