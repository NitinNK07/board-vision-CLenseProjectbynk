package CLens.pgn_backend.service;

import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OcrService {

    // Base64 variant (for your current ScanRequest)
    public String extractBase64(String base64Image) {
        try {
            // In a real implementation, we would decode the base64 image and process it with OCR
            // For now, since Tesseract is causing native library issues, we'll return a placeholder
            // that can be replaced with actual OCR implementation later
            
            // Validate base64 format
            if (base64Image == null || base64Image.trim().isEmpty()) {
                return generateFallbackPGN();
            }
            
            // Attempt to decode the base64 to ensure it's valid
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            
            // In a real implementation, we would:
            // 1. Save the image temporarily
            // 2. Process it with an OCR engine like Tesseract
            // 3. Extract chess position information
            // 4. Convert to PGN format
            
            // For now, return a sample PGN as a placeholder
            // This will be replaced with actual image processing in a production environment
            return processChessNotation(generateMockAnalysis());
            
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid base64 image format: " + e.getMessage());
            return generateFallbackPGN();
        } catch (Exception e) {
            System.err.println("Error processing base64 image: " + e.getMessage());
            e.printStackTrace();
            return generateFallbackPGN();
        }
    }
    
    // Mock method to simulate chess position analysis
    // This would be replaced with actual OCR processing
    private String generateMockAnalysis() {
        // In a real implementation, this would be the result of OCR analysis
        return "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 " +
               "8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 " +
               "14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 " +
               "Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 24. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 " +
               "25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg6 28. Qe4+ Kf6 29. Qf4+ Kg7 30. h4";
    }
    
    // Process raw OCR text to extract valid chess moves
    private String processChessNotation(String rawText) {
        if (rawText == null || rawText.trim().isEmpty()) {
            return generateFallbackPGN();
        }
        
        // Clean up the OCR text with specific rules for handwritten chess notation
        String cleaned = rawText
            .replaceAll("[|Il]", "1")  // Fix common OCR confusions
            .replaceAll("0", "O")      // 0 to O for castling
            .replaceAll("5", "S")      // S might be misread as 5
            .replaceAll("9", "g")      // Common error
            .replaceAll("@", "O")      // @ to O
            .replaceAll("[\n\r]+", " ")
            .replaceAll("\\s+", " ")   // Normalize spaces
            .trim();
        
        // First, let's try to find chess move patterns with move numbers
        // Pattern: 1. e4 e5, 2. Nf3 Nc6, etc.
        StringBuilder result = new StringBuilder();
        
        // Look for patterns of move number followed by moves
        String pattern = "(\\d+)\\s*\\.\\s*([KQRBNPa-h][a-hxNBRQK]?[1-8]?[a-h]?[1-8]?[+#=]?[x@]?[a-h][1-8]=?[KQRBN]?[+#]?)\\s*([KQRBNPa-h][a-hxNBRQK]?[1-8]?[a-h]?[1-8]?[+#=]?[x@]?[a-h][1-8]=?[KQRBN]?[+#]?)?";
        Pattern p = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(cleaned);
        
        int lastMoveNum = 0;
        while (m.find()) {
            int moveNum = Integer.parseInt(m.group(1));
            String whiteMove = validateAndCorrectMove(m.group(2));
            String blackMove = m.group(3) != null ? validateAndCorrectMove(m.group(3)) : null;
            
            if (!whiteMove.isEmpty()) {
                if (moveNum > lastMoveNum + 1 && lastMoveNum > 0) {
                    // Fill in missing move numbers if there are gaps
                    for (int i = lastMoveNum + 1; i < moveNum; i++) {
                        result.append(i).append(". ... ... ");
                    }
                }
                
                result.append(moveNum).append(". ").append(whiteMove);
                
                if (blackMove != null && !blackMove.isEmpty()) {
                    result.append(" ").append(blackMove);
                }
                
                result.append(" ");
                lastMoveNum = moveNum;
            }
        }
        
        // If the pattern matching didn't find much, try a simpler approach
        if (result.length() < 10) { // If result is too short
            result = new StringBuilder();
            // Extract all potential moves and number them sequentially
            String movePattern = "([KQRBNPa-h][a-hxNBRQK]?[1-8]?[a-h]?[1-8]?[+#=]?[x@]?[a-h][1-8]=?[KQRBN]?[+#]?)";
            Pattern simplePattern = Pattern.compile(movePattern, Pattern.CASE_INSENSITIVE);
            Matcher simpleMatcher = simplePattern.matcher(cleaned);
            
            int moveNum = 1;
            boolean isWhiteMove = true;
            
            while (simpleMatcher.find()) {
                String move = simpleMatcher.group(1);
                String validatedMove = validateAndCorrectMove(move);
                
                if (!validatedMove.isEmpty()) {
                    if (isWhiteMove) {
                        result.append(moveNum).append(". ").append(validatedMove).append(" ");
                        isWhiteMove = false;
                    } else {
                        result.append(validatedMove).append(" ");
                        isWhiteMove = true;
                        moveNum++;
                    }
                }
            }
        }
        
        // Final cleanup
        String finalResult = result.toString().trim();
        
        // If still empty or too short, use fallback
        if (finalResult.isEmpty() || finalResult.split("\\s+").length < 3) {
            return generateFallbackPGN();
        }
        
        // Ensure proper PGN termination
        if (!finalResult.endsWith(" *") && !finalResult.endsWith(" 1-0") && 
            !finalResult.endsWith(" 0-1") && !finalResult.endsWith(" 1/2-1/2")) {
            finalResult += " *";
        }
        
        return finalResult;
    }
    
    // Validate and correct a single chess move
    private String validateAndCorrectMove(String move) {
        if (move == null) return "";
        
        // Clean the move of invalid characters
        String clean = move.replaceAll("[^KQRBNPa-hx1-8+#=O-]", "").trim();
        
        // Handle castling notation: 0-0 or 0-0-0 should be O-O or O-O-O
        if (clean.equals("0-0")) {
            return "O-O";
        } else if (clean.equals("0-0-0")) {
            return "O-O-O";
        }
        
        // Common validation for algebraic notation
        // e.g., e4, Nf3, Bb5, exd5, Nxd5, etc.
        if (clean.matches("^[KQRBNP]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[+#]?$")) {
            return clean;
        }
        
        // Special handling for different move types
        if (clean.matches("^[a-h][1-8]$")) {  // Simple pawn moves like e4
            return clean;
        } else if (clean.matches("^[KQRBN][a-h][1-8]$")) {  // Piece moves like Nf3
            return clean;
        } else if (clean.matches("^[KQRBN][a-h]?[1-8]?x[a-h][1-8]$")) {  // Captures
            return clean;
        } else if (clean.matches("^[a-h]x[a-h][1-8]$")) {  // Pawn captures
            return clean;
        }
        
        // If we can't validate it directly, make minimal corrections
        // Try to extract the most likely valid move from the string
        Pattern moveExtract = Pattern.compile("[KQRBNP]?[a-h]?[1-8]?x?[a-h][1-8]");
        Matcher extractMatcher = moveExtract.matcher(clean);
        
        if (extractMatcher.find()) {
            String extracted = extractMatcher.group();
            // Add any special characters (check, mate) that might be at the end
            if (clean.endsWith("+")) extracted += "+";
            if (clean.endsWith("#")) extracted += "#";
            
            return extracted;
        }
        
        return ""; // Invalid move
    }
    
    // Generate a fallback PGN in case OCR fails completely
    private String generateFallbackPGN() {
        return "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O *";
    }
}