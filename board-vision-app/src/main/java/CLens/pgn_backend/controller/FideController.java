
package CLens.pgn_backend.controller;

import CLens.pgn_backend.service.*;
import CLens.pgn_backend.entity.*;
import CLens.pgn_backend.repository.*;
import CLens.pgn_backend.dto.*;
import CLens.pgn_backend.enums.Role;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/fide")
// CORS handled globally by SecurityConfig
public class FideController {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Fetch FIDE player data by ID
     * Note: FIDE website blocks automated requests, so we open profile for manual entry
     */
    @GetMapping("/player/{fideId}")
    public ResponseEntity<?> getFidePlayer(@PathVariable String fideId) {
        try {
            System.out.println("Fetching FIDE data for player: " + fideId);
            
            // Always return fallback with profile URL since FIDE blocks automated access
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("fideId", fideId);
            responseData.put("name", "Manual Entry Required");
            responseData.put("standard", 0);
            responseData.put("profileUrl", "https://ratings.fide.com/profile/" + fideId);
            responseData.put("requiresManualEntry", true);
            responseData.put("message", "FIDE blocks automated access. Profile opened for manual entry.");
            
            System.out.println("Returning fallback data for FIDE ID: " + fideId);
            return ResponseEntity.ok(responseData);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorData = new HashMap<>();
            errorData.put("fideId", fideId);
            errorData.put("name", "Unknown");
            errorData.put("standard", 0);
            errorData.put("profileUrl", "https://ratings.fide.com/profile/" + fideId);
            errorData.put("requiresManualEntry", true);
            errorData.put("message", "Error: " + e.getMessage());
            
            return ResponseEntity.ok(errorData);
        }
    }
}

