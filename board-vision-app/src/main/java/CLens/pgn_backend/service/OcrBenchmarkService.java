package CLens.pgn_backend.service;

import CLens.pgn_backend.dto.BenchmarkReport;
import CLens.pgn_backend.dto.BenchmarkReport.GameBenchmarkResult;
import CLens.pgn_backend.dto.PgnValidationResult;
import CLens.pgn_backend.dto.ValidationStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Enterprise implementation of OcrBenchmarkService.
 * Provides core functionality and business logic.
 */
@Service
public class OcrBenchmarkService {

    private final PgnValidationService validationService;

    public OcrBenchmarkService(PgnValidationService validationService) {
        this.validationService = validationService;
    }

    /**

     * Executes the runBenchmark operation.

     */

    public BenchmarkReport runBenchmark(Path groundTruthDir, Set<String> allGameIds, Map<String, String> extractedPgns, Map<String, String> extractionErrors) throws IOException {
        List<GameBenchmarkResult> perGameResults = new ArrayList<>();

        int successfullyProcessedCount = 0;
        int apiRateLimitedCount = 0;
        int failedGamesCount = 0;

        int totalCorrectMoves = 0;
        int totalGroundTruthMoves = 0; // only for processed games
        int totalIllegalMoves = 0;
        int totalMissingMoves = 0;
        int totalHallucinatedMoves = 0;
        int totalExtractedMoves = 0;
        int totalHeaderErrors = 0;
        int totalHeaders = 0;

        for (String gameId : allGameIds) {
            Path groundTruthFile = groundTruthDir.resolve(gameId + ".pgn");
            if (!Files.exists(groundTruthFile)) {
                System.err.println("⚠️ No ground truth file for: " + gameId);
                continue;
            }
            String groundTruthPgn = Files.readString(groundTruthFile);
            
            boolean processed = extractedPgns.containsKey(gameId);
            String extractedPgn = processed ? extractedPgns.get(gameId) : null;
            String errorReason = processed ? null : extractionErrors.getOrDefault(gameId, "NOT_PROCESSED");

            GameBenchmarkResult result = compareGame(gameId, processed, extractedPgn, groundTruthPgn, errorReason);
            perGameResults.add(result);

            if (processed) {
                successfullyProcessedCount++;
                totalCorrectMoves += result.correctMoves();
                totalGroundTruthMoves += result.groundTruthMoves();
                totalIllegalMoves += result.illegalMoves();
                totalMissingMoves += result.missingMoves();
                totalHallucinatedMoves += result.hallucinatedMoves();
                totalExtractedMoves += result.extractedMoves();
                totalHeaderErrors += result.headerErrors().size();
                totalHeaders += 7;
            } else {
                if ("API_RATE_LIMIT".equals(errorReason)) {
                    apiRateLimitedCount++;
                } else {
                    failedGamesCount++;
                }
            }
        }

        double moveAccuracy = totalGroundTruthMoves > 0
            ? round((double) totalCorrectMoves / totalGroundTruthMoves * 100.0)
            : 0.0;
        double headerAccuracy = totalHeaders > 0
            ? round((double) (totalHeaders - totalHeaderErrors) / totalHeaders * 100.0)
            : 0.0;
        double hallucinationRate = totalExtractedMoves > 0
            ? round((double) totalHallucinatedMoves / totalExtractedMoves * 100.0)
            : 0.0;

        return new BenchmarkReport(
            allGameIds.size(),
            successfullyProcessedCount,
            apiRateLimitedCount,
            failedGamesCount,
            moveAccuracy,
            headerAccuracy,
            totalIllegalMoves,
            totalMissingMoves,
            totalHallucinatedMoves,
            hallucinationRate,
            totalHeaderErrors,
            perGameResults
        );
    }

    /**

     * Executes the compareGame operation.

     */

    public GameBenchmarkResult compareGame(String gameId, boolean processed, String extractedPgn, String groundTruthPgn, String errorReason) {
        String cleanedGroundTruth = validationService.cleanPgn(groundTruthPgn);
        List<String> groundTruthMoves = validationService.extractMoveTokens(cleanedGroundTruth);

        if (!processed) {
            return new GameBenchmarkResult(
                gameId, false, groundTruthMoves.size(), 0, 0, 0, groundTruthMoves.size(), 0, 0.0, 0.0,
                List.of(), null, errorReason
            );
        }

        String cleanedExtracted = validationService.cleanPgn(extractedPgn);
        List<String> extractedMoves = validationService.extractMoveTokens(cleanedExtracted);

        PgnValidationResult validation = validationService.validatePgn(extractedPgn);

        int correctMoves = 0;
        int minLen = Math.min(extractedMoves.size(), groundTruthMoves.size());
        for (int i = 0; i < minLen; i++) {
            if (normalizeSan(extractedMoves.get(i)).equals(normalizeSan(groundTruthMoves.get(i)))) {
                correctMoves++;
            }
        }

        int missingMoves = Math.max(0, groundTruthMoves.size() - extractedMoves.size());
        int hallucinatedMoves = Math.max(0, extractedMoves.size() - groundTruthMoves.size());

        double moveAccuracy = groundTruthMoves.size() > 0
            ? round((double) correctMoves / groundTruthMoves.size() * 100.0)
            : 0.0;

        List<String> headerErrors = compareHeaders(extractedPgn, groundTruthPgn);
        double headerAccuracy = round((7.0 - headerErrors.size()) / 7.0 * 100.0);

        String observationCategory;
        if (moveAccuracy < 60.0) {
            observationCategory = "LOW_MOVE_ACCURACY";
        } else if (missingMoves > 10 && extractedMoves.size() < groundTruthMoves.size() * 0.8) {
            observationCategory = "EARLY_TERMINATION";
        } else if (validation.status() == ValidationStatus.INVALID) {
            observationCategory = "ILLEGAL_MOVES_DETECTED";
        } else if (headerAccuracy < 50.0) {
            observationCategory = "LOW_HEADER_ACCURACY";
        } else {
            observationCategory = "SUCCESSFUL_TRANSCRIPTION";
        }

        return new GameBenchmarkResult(
            gameId,
            true,
            groundTruthMoves.size(),
            extractedMoves.size(),
            correctMoves,
            validation.illegalMoveCount(),
            missingMoves,
            hallucinatedMoves,
            moveAccuracy,
            headerAccuracy,
            headerErrors,
            validation.status(),
            observationCategory
        );
    }

    private List<String> compareHeaders(String extractedPgn, String groundTruthPgn) {
        List<String> errors = new ArrayList<>();
        String[] tags = {"Event", "Site", "Date", "Round", "White", "Black", "Result"};
        for (String tag : tags) {
            String extracted = extractHeader(extractedPgn, tag);
            String groundTruth = extractHeader(groundTruthPgn, tag);
            if (groundTruth != null && !groundTruth.equals("?")) {
                if (extracted == null || !normalizeHeader(extracted).equals(normalizeHeader(groundTruth))) {
                    errors.add(tag);
                }
            }
        }
        return errors;
    }

    private String extractHeader(String pgn, String tag) {
        Pattern p = Pattern.compile("\\[" + tag + "\\s+\"([^\"]*?)\"\\]");
        Matcher m = p.matcher(pgn);
        return m.find() ? m.group(1) : null;
    }

    private String normalizeSan(String san) {
        return san.replaceAll("[+#!?]", "").trim();
    }

    private String normalizeHeader(String value) {
        return value.trim().toLowerCase().replaceAll("\\s+", " ");
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    /**

     * Executes the formatReportMarkdown operation.

     */

    public String formatReportMarkdown(BenchmarkReport report) {
        StringBuilder sb = new StringBuilder();
        sb.append("# CLens OCR Benchmark Report\n\n");
        sb.append("## Dataset Summary\n\n");
        sb.append("| Metric | Count |\n");
        sb.append("|--------|-------|\n");
        sb.append("| Total Dataset Size | ").append(report.totalDatasetSize()).append(" |\n");
        sb.append("| Successfully Processed | ").append(report.successfullyProcessedCount()).append(" |\n");
        sb.append("| API Rate-Limited | ").append(report.apiRateLimitedCount()).append(" |\n");
        sb.append("| Failed Games | ").append(report.failedGamesCount()).append(" |\n\n");

        if (report.successfullyProcessedCount() > 0) {
            sb.append("## Aggregate Metrics (Processed Games Only)\n\n");
            sb.append("| Metric | Value |\n");
            sb.append("|--------|-------|\n");
            sb.append("| Move Accuracy | ").append(report.moveAccuracy()).append("% |\n");
            sb.append("| Header Accuracy | ").append(report.headerAccuracy()).append("% |\n");
            sb.append("| Hallucination Rate | ").append(report.hallucinationRate()).append("% |\n");
            sb.append("| Total Illegal Moves | ").append(report.illegalMoveCount()).append(" |\n");
            sb.append("| Total Missing Moves | ").append(report.missingMoveCount()).append(" |\n");
            sb.append("| Total Hallucinated Moves | ").append(report.hallucinatedMoveCount()).append(" |\n\n");
            sb.append("*Note: A **Hallucinated Move** is defined mathematically as a move present in the OCR output but absent from the ground-truth PGN.*\n\n");
        }

        sb.append("## Successfully Processed Games\n\n");
        sb.append("| Game | Total Moves | Correct Moves | Move Accuracy | Header Accuracy | Validation Status | Hallucinated Moves | Observation Category |\n");
        sb.append("|------|-------------|---------------|---------------|-----------------|-------------------|--------------------|----------------------|\n");
        
        List<GameBenchmarkResult> processed = report.perGameResults().stream().filter(GameBenchmarkResult::processed).toList();
        for (GameBenchmarkResult g : processed) {
            sb.append(String.format("| %s | %d | %d | %.1f%% | %.1f%% | %s | %d | %s |\n",
                g.gameId(), g.groundTruthMoves(), g.correctMoves(), g.moveAccuracy(), g.headerAccuracy(),
                g.validationStatus(), g.hallucinatedMoves(), g.observationCategory()));
        }
        sb.append("\n");

        sb.append("## Unprocessed / Failed Games\n\n");
        sb.append("| Game | Reason |\n");
        sb.append("|------|--------|\n");
        List<GameBenchmarkResult> unprocessed = report.perGameResults().stream().filter(g -> !g.processed()).toList();
        for (GameBenchmarkResult g : unprocessed) {
            sb.append(String.format("| %s | %s |\n", g.gameId(), g.observationCategory()));
        }
        sb.append("\n");

        return sb.toString();
    }
}
