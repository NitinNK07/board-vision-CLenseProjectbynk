package CLens.pgn_backend.repository;

import CLens.pgn_backend.entity.PlayerStatistics;
import CLens.pgn_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface PlayerStatisticsRepository extends JpaRepository<PlayerStatistics, Long> {
    
    Optional<PlayerStatistics> findByPlayerId(Long playerId);
    
    @Modifying
    @Query("UPDATE PlayerStatistics ps SET " +
           "ps.totalGames = :totalGames, " +
           "ps.wins = :wins, " +
           "ps.losses = :losses, " +
           "ps.draws = :draws, " +
           "ps.winRate = :winRate, " +
           "ps.gamesAsWhite = :gamesAsWhite, " +
           "ps.winsAsWhite = :winsAsWhite, " +
           "ps.winRateAsWhite = :winRateAsWhite, " +
           "ps.gamesAsBlack = :gamesAsBlack, " +
           "ps.winsAsBlack = :winsAsBlack, " +
           "ps.winRateAsBlack = :winRateAsBlack, " +
           "ps.averageAccuracy = :averageAccuracy, " +
           "ps.averageBlundersPerGame = :averageBlundersPerGame, " +
           "ps.averageMistakesPerGame = :averageMistakesPerGame, " +
           "ps.mostPlayedOpening = :mostPlayedOpening, " +
           "ps.mostPlayedEco = :mostPlayedEco, " +
           "ps.bestOpening = :bestOpening, " +
           "ps.recentForm = :recentForm, " +
           "ps.currentStreak = :currentStreak, " +
           "ps.longestWinStreak = :longestWinStreak, " +
           "ps.lastGameDate = :lastGameDate " +
           "WHERE ps.player.id = :playerId")
    void updateStatistics(
        @Param("playerId") Long playerId,
        @Param("totalGames") Integer totalGames,
        @Param("wins") Integer wins,
        @Param("losses") Integer losses,
        @Param("draws") Integer draws,
        @Param("winRate") Double winRate,
        @Param("gamesAsWhite") Integer gamesAsWhite,
        @Param("winsAsWhite") Integer winsAsWhite,
        @Param("winRateAsWhite") Double winRateAsWhite,
        @Param("gamesAsBlack") Integer gamesAsBlack,
        @Param("winsAsBlack") Integer winsAsBlack,
        @Param("winRateAsBlack") Double winRateAsBlack,
        @Param("averageAccuracy") Double averageAccuracy,
        @Param("averageBlundersPerGame") Double averageBlundersPerGame,
        @Param("averageMistakesPerGame") Double averageMistakesPerGame,
        @Param("mostPlayedOpening") String mostPlayedOpening,
        @Param("mostPlayedEco") String mostPlayedEco,
        @Param("bestOpening") String bestOpening,
        @Param("recentForm") String recentForm,
        @Param("currentStreak") Integer currentStreak,
        @Param("longestWinStreak") Integer longestWinStreak,
        @Param("lastGameDate") java.time.Instant lastGameDate
    );
}
