package CLens.pgn_backend.service;

import CLens.pgn_backend.dto.BenchmarkReport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class OcrBenchmarkTest {

    @Autowired
    private VisionScanService visionScanService;

    @Autowired
    private OcrBenchmarkService benchmarkService;

    @Test
    void runFullOcrBenchmark() throws IOException {
        Path imageDir = Path.of("src/test/resources/benchmark/images");
        Path groundTruthDir = Path.of("src/test/resources/benchmark/ground-truth");
        Path outputDir = Path.of("src/test/resources/benchmark/output");
        Path reportFile = Path.of("target/benchmark_report.md");
        
        if (!Files.exists(imageDir) || !Files.exists(groundTruthDir)) {
            System.err.println("Benchmark directories not found!");
            return;
        }
        
        if (!Files.exists(outputDir)) {
            Files.createDirectories(outputDir);
        }

        Set<String> allGameIds = new HashSet<>();
        Map<String, String> extractedPgns = new HashMap<>();
        Map<String, String> extractionErrors = new HashMap<>();

        System.out.println("Starting OCR Benchmark on " + imageDir.toAbsolutePath());
        
        try (Stream<Path> paths = Files.list(imageDir)) {
            paths.filter(Files::isRegularFile).forEach(imagePath -> {
                String filename = imagePath.getFileName().toString();
                String gameId = filename.substring(0, filename.lastIndexOf('.'));
                allGameIds.add(gameId);
                
                System.out.println("\n--- Processing " + filename + " (" + gameId + ") ---");
                try {
                    byte[] imageBytes = Files.readAllBytes(imagePath);
                    String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                    
                    String aiResponse = visionScanService.extractFENFromImage(base64Image);
                    String extractedPgn = visionScanService.fenToPGN(aiResponse); // convert to valid PGN
                    
                    // Save raw PGN to output directory
                    Files.writeString(outputDir.resolve(gameId + ".pgn"), extractedPgn);
                    extractedPgns.put(gameId, extractedPgn);
                    
                    System.out.println("Successfully extracted " + extractedPgn.split("\n").length + " lines of PGN");
                    
                    // Sleep briefly to avoid hitting free-tier rate limits
                    Thread.sleep(2000);
                } catch (Exception e) {
                    System.err.println("Error processing " + filename + ": " + e.getMessage());
                    if (e.getMessage() != null && e.getMessage().contains("429")) {
                        extractionErrors.put(gameId, "API_RATE_LIMIT");
                    } else {
                        extractionErrors.put(gameId, "FAILED");
                    }
                }
            });
        }

        System.out.println("\nAll images processed. Running benchmark comparison...");
        BenchmarkReport report = benchmarkService.runBenchmark(groundTruthDir, allGameIds, extractedPgns, extractionErrors);
        
        String formattedReport = benchmarkService.formatReportMarkdown(report);
        System.out.println(formattedReport);
        assertNotNull(formattedReport);
        
        Files.writeString(reportFile, formattedReport);
        System.out.println("\nSaved markdown report to " + reportFile.toAbsolutePath());
    }
}
