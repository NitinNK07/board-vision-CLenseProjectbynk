package CLens.pgn_backend.service;

import CLens.pgn_backend.dto.MoveError;
import CLens.pgn_backend.dto.PgnValidationResult;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.move.Move;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Suggests corrections for illegal moves detected by PgnValidationService.
 *
 * When ChessLib detects an illegal move like "Nf4", this service:
 *   1. Computes all legal moves at that board position
 *   2. Ranks them by string similarity to the illegal move
 *   3. Returns the top candidates for user review or auto-correction
 *
 * This dramatically increases perceived intelligence of the OCR pipeline.
 */
@Service
public class PgnCorrectionService {

    private final PgnValidationService validationService;

    public PgnCorrectionService(PgnValidationService validationService) {
        this.validationService = validationService;
    }

    /**
     * For each illegal move in a validation result, compute ranked correction suggestions.
     * Returns a new list of MoveErrors with populated legalAlternatives sorted by similarity.
     */
    /**
     * Executes the suggestCorrections operation.
     */
    public List<MoveError> suggestCorrections(PgnValidationResult validationResult) {
        if (validationResult.isFullyValid()) {
            return List.of();
        }

        List<MoveError> enrichedErrors = new ArrayList<>();

        // Replay the board up to each error to get the correct position
        Board board = new Board();
        String cleanedPgn = validationResult.cleanedPgn();
        List<String> tokens = validationService.extractMoveTokens(cleanedPgn);

        int tokenIndex = 0;
        int errorIndex = 0;
        List<MoveError> originalErrors = validationResult.errors();

        for (int i = 0; i < tokens.size() && errorIndex < originalErrors.size(); i++) {
            String san = tokens.get(i);
            int moveNumber = (i / 2) + 1;
            MoveError currentError = originalErrors.get(errorIndex);

            if (currentError.moveNumber() == moveNumber && currentError.moveSan().equals(san)) {
                // This is an error position — suggest corrections
                List<String> legalMoves = validationService.getLegalMoveSanList(board);
                List<String> ranked = rankBySimilarity(san, legalMoves);

                enrichedErrors.add(new MoveError(
                    currentError.moveNumber(),
                    currentError.moveSan(),
                    currentError.errorType(),
                    currentError.message(),
                    ranked.subList(0, Math.min(5, ranked.size()))
                ));
                errorIndex++;
                // Don't advance board — position is uncertain after illegal move
                break; // Can't reliably continue after first illegal move
            } else {
                // Legal move — advance the board
                try {
                    Move move = findLegalMove(board, san);
                    if (move != null) {
                        board.doMove(move);
                    }
                } catch (Exception e) {
                    break; // Can't continue if a previous move fails
                }
            }
        }

        // Append remaining errors without re-ranking (board state unknown)
        while (errorIndex < originalErrors.size()) {
            enrichedErrors.add(originalErrors.get(errorIndex));
            errorIndex++;
        }

        return enrichedErrors;
    }

    /**
     * Rank legal moves by their string similarity to the illegal move.
     * Uses Levenshtein distance — closest matches first.
     */
    private List<String> rankBySimilarity(String illegalSan, List<String> legalMoves) {
        // Strip check/checkmate symbols for comparison
        String target = illegalSan.replaceAll("[+#!?]", "");

        List<String> sorted = new ArrayList<>(legalMoves);
        sorted.sort(Comparator.comparingInt(move -> {
            String clean = move.replaceAll("[+#!?]", "");
            return levenshteinDistance(target, clean);
        }));

        return sorted;
    }

    /**
     * Find a legal move matching the SAN string on the current board.
     */
    private Move findLegalMove(Board board, String san) {
        List<Move> legals = board.legalMoves();
        for (Move m : legals) {
            try {
                String mSan = buildSanQuick(board, m);
                if (sanEquals(san, mSan)) {
                    return m;
                }
            } catch (Exception e) {
                // skip
            }
        }
        return null;
    }

    /**
     * Quick SAN builder (simplified version for comparison purposes).
     */
    private String buildSanQuick(Board board, Move move) {
        // Delegate to PgnValidationService's logic via a Board clone
        var piece = board.getPiece(move.getFrom());
        if (piece == null) return move.toString();

        String pieceName = piece.getPieceType().name();
        var to = move.getTo();
        var from = move.getFrom();
        boolean isCapture = board.getPiece(to) != com.github.bhlangonijr.chesslib.Piece.NONE;

        // Castling
        if (pieceName.equals("KING")) {
            int fileDiff = to.getFile().ordinal() - from.getFile().ordinal();
            if (fileDiff == 2) return "O-O";
            if (fileDiff == -2) return "O-O-O";
        }

        StringBuilder sb = new StringBuilder();
        boolean isPawn = pieceName.equals("PAWN");

        if (isPawn) {
            if (isCapture || to == board.getEnPassant()) {
                sb.append(from.getFile().getNotation());
                sb.append("x");
            }
            sb.append(to.getFile().getNotation());
            sb.append(to.getRank().getNotation());
            if (move.getPromotion() != com.github.bhlangonijr.chesslib.Piece.NONE
                && move.getPromotion() != null) {
                sb.append("=");
                sb.append(getPieceLetter(move.getPromotion().getPieceType().name()));
            }
        } else {
            sb.append(getPieceLetter(pieceName));
            if (isCapture) sb.append("x");
            sb.append(to.getFile().getNotation());
            sb.append(to.getRank().getNotation());
        }

        return sb.toString();
    }

    private boolean sanEquals(String a, String b) {
        if (a == null || b == null) return false;
        return a.replaceAll("[+#!?]", "").equals(b.replaceAll("[+#!?]", ""));
    }

    private String getPieceLetter(String pieceType) {
        return switch (pieceType) {
            case "KING" -> "K";
            case "QUEEN" -> "Q";
            case "ROOK" -> "R";
            case "BISHOP" -> "B";
            case "KNIGHT" -> "N";
            default -> "";
        };
    }

    /**
     * Standard Levenshtein distance between two strings.
     */
    private int levenshteinDistance(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];

        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= b.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                    dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[a.length()][b.length()];
    }
}
