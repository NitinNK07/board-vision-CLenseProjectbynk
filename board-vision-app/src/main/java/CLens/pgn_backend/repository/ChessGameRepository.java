package CLens.pgn_backend.repository;

import CLens.pgn_backend.entity.ChessGame;
import CLens.pgn_backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ChessGameRepository extends JpaRepository<ChessGame, Long> {
    
    Page<ChessGame> findByPlayerId(Long playerId, Pageable pageable);
    
    List<ChessGame> findByPlayerIdOrderByCreatedAtDesc(Long playerId);
    
    @Query("SELECT g FROM ChessGame g WHERE g.player.id = :playerId AND g.isPublic = true")
    Page<ChessGame> findPublicGamesByPlayerId(@Param("playerId") Long playerId, Pageable pageable);
    
    @Query("SELECT g FROM ChessGame g WHERE " +
           "(:player IS NULL OR g.whitePlayer LIKE %:player% OR g.blackPlayer LIKE %:player%) AND " +
           "(:opening IS NULL OR g.opening LIKE %:opening%) AND " +
           "(:eco IS NULL OR g.eco = :eco) AND " +
           "(:result IS NULL OR g.result = :result) AND " +
           "(:dateFrom IS NULL OR g.gameDate >= :dateFrom) AND " +
           "(:dateTo IS NULL OR g.gameDate <= :dateTo) AND " +
           "(:isTournament IS NULL OR g.isTournament = :isTournament) AND " +
           "(:tournamentName IS NULL OR g.tournamentName LIKE %:tournamentName%)")
    Page<ChessGame> searchGames(
        @Param("player") String player,
        @Param("opening") String opening,
        @Param("eco") String eco,
        @Param("result") String result,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo,
        @Param("isTournament") Boolean isTournament,
        @Param("tournamentName") String tournamentName,
        Pageable pageable
    );
    
    @Query("SELECT g FROM ChessGame g WHERE g.isPublic = true")
    Page<ChessGame> findAllPublicGames(Pageable pageable);
    
    List<ChessGame> findByPlayerIdAndIsTournament(Long playerId, Boolean isTournament);
    
    @Query("SELECT COUNT(g) FROM ChessGame g WHERE g.player.id = :playerId")
    Long countGamesByPlayerId(@Param("playerId") Long playerId);
    
    @Query("SELECT g FROM ChessGame g WHERE g.eco IS NOT NULL GROUP BY g.eco ORDER BY COUNT(g) DESC")
    List<ChessGame> findMostPlayedOpenings(Pageable pageable);
}
