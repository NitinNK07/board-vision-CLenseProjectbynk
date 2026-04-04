package CLens.pgn_backend.repository;

import CLens.pgn_backend.entity.GameAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface GameAnalysisRepository extends JpaRepository<GameAnalysis, Long> {

    Optional<GameAnalysis> findByGameId(Long gameId);
    
    @Query("SELECT ga FROM GameAnalysis ga JOIN ga.game g WHERE g.player.id = :playerId ORDER BY ga.analyzedAt DESC")
    java.util.List<GameAnalysis> findRecentAnalysisByPlayerId(@Param("playerId") Long playerId);
    
    boolean existsByGameId(Long gameId);
}
