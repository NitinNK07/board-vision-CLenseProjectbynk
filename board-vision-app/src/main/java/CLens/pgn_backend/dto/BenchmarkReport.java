package CLens.pgn_backend.dto;

import java.util.List;

/**
 * Aggregate benchmark report produced by running the OCR pipeline
 * against a dataset of scoresheet images with known ground-truth PGN.
 */
public record BenchmarkReport(
    int totalDatasetSize,
    int successfullyProcessedCount,
    int apiRateLimitedCount,
    int failedGamesCount,
    double moveAccuracy,
    double headerAccuracy,
    int illegalMoveCount,
    int missingMoveCount,
    int hallucinatedMoveCount,
    double hallucinationRate,
    int headerExtractionErrors,
    List<GameBenchmarkResult> perGameResults
) {

    /**
     * Per-game benchmark result comparing OCR output against ground truth.
     */
    public record GameBenchmarkResult(
        String gameId,
        boolean processed,
        int groundTruthMoves,
        int extractedMoves,
        int correctMoves,
        int illegalMoves,
        int missingMoves,
        int hallucinatedMoves,
        double moveAccuracy,
        double headerAccuracy,
        List<String> headerErrors,
        ValidationStatus validationStatus,
        String observationCategory
    ) {}
}
