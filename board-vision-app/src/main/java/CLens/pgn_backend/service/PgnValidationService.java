package CLens.pgn_backend.service;

import CLens.pgn_backend.dto.MoveError;
import CLens.pgn_backend.dto.PgnValidationResult;
import CLens.pgn_backend.dto.ValidationStatus;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Side;
import com.github.bhlangonijr.chesslib.Square;
import com.github.bhlangonijr.chesslib.move.Move;
import com.github.bhlangonijr.chesslib.move.MoveList;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Three-stage PGN validation pipeline using chesslib for move legality.
 *
 * Stage 1 — Clean: strip headers, comments, normalize notation
 * Stage 2 — Replay: play each move on a Board, detect illegals
 * Stage 3 — Report: build PgnValidationResult with accuracy metrics
 */
@Service
public class PgnValidationService {

    // ================================================================
    // PUBLIC API
    // ================================================================

    /**
     * Validate a PGN string by replaying all moves on a chesslib Board.
     * Never throws — always returns a result with errors listed inside.
     */
    /**
     * Executes the validatePgn operation.
     */
    public PgnValidationResult validatePgn(String rawPgn) {
        if (rawPgn == null || rawPgn.isBlank()) {
            return buildEmptyResult("PGN input is null or empty");
        }

        // Stage 1: Clean
        List<String> warnings = new ArrayList<>();
        checkHeaders(rawPgn, warnings);
        String movesText = cleanPgn(rawPgn);

        // Extract individual move tokens
        List<String> moveTokens = extractMoveTokens(movesText);
        if (moveTokens.isEmpty()) {
            return buildEmptyResult("No move tokens found after cleaning");
        }

        // Stage 2: Replay on board
        Board board = new Board();
        List<MoveError> errors = new ArrayList<>();
        List<String> fenPositions = new ArrayList<>();
        int validMoves = 0;
        int illegalCount = 0;
        int parseErrorCount = 0;

        // Add starting position FEN
        fenPositions.add(board.getFen());

        for (int i = 0; i < moveTokens.size(); i++) {
            String san = moveTokens.get(i);
            int moveNumber = (i / 2) + 1; // Human-readable move number

            try {
                // Try to parse the SAN move in the current board context
                Move move = parseSanMove(board, san);

                if (move == null) {
                    // Could not parse — collect legal alternatives
                    List<String> alternatives = getLegalMoveSanList(board);
                    errors.add(new MoveError(
                        moveNumber,
                        san,
                        MoveError.ErrorType.ILLEGAL_MOVE,
                        String.format("Move '%s' is not legal at move %d (%s to play)",
                            san, moveNumber, board.getSideToMove() == Side.WHITE ? "White" : "Black"),
                        alternatives.subList(0, Math.min(10, alternatives.size()))
                    ));
                    illegalCount++;
                    // Do NOT advance the board — stop replay here since board state is now uncertain
                    // Continue processing remaining tokens for error reporting only
                    continue;
                }

                // Move is legal — execute it
                board.doMove(move);
                fenPositions.add(board.getFen());
                validMoves++;

            } catch (Exception e) {
                // SAN parsing failure (malformed notation)
                List<String> alternatives = getLegalMoveSanList(board);
                errors.add(new MoveError(
                    moveNumber,
                    san,
                    MoveError.ErrorType.PARSE_ERROR,
                    String.format("Cannot parse '%s' as chess notation: %s", san, e.getMessage()),
                    alternatives.subList(0, Math.min(10, alternatives.size()))
                ));
                parseErrorCount++;
            }
        }

        // Stage 3: Build result
        int totalMoves = moveTokens.size();
        double moveAccuracy = totalMoves > 0 ? (double) validMoves / totalMoves * 100.0 : 0.0;
        moveAccuracy = Math.round(moveAccuracy * 10.0) / 10.0; // 1 decimal place

        ValidationStatus status;
        if (errors.isEmpty() && warnings.isEmpty()) {
            status = ValidationStatus.VALID;
        } else if (errors.isEmpty()) {
            status = ValidationStatus.VALID_WITH_WARNINGS;
        } else {
            status = ValidationStatus.INVALID;
        }

        return new PgnValidationResult(
            status,
            movesText,
            totalMoves,
            validMoves,
            moveAccuracy,
            errors,
            warnings,
            fenPositions,
            illegalCount,
            parseErrorCount
        );
    }

    // ================================================================
    // STAGE 1: PGN CLEANING
    // ================================================================

    /**
     * Strip headers, comments, variations, move numbers, results.
     * Normalize castling notation.
     */
    /**
     * Executes the cleanPgn operation.
     */
    public String cleanPgn(String rawPgn) {
        String cleaned = rawPgn;

        // Remove PGN headers [Tag "Value"]
        cleaned = cleaned.replaceAll("\\[.*?\\]", "");

        // Remove block comments {text}
        cleaned = cleaned.replaceAll("\\{[^}]*\\}", "");

        // Remove line comments starting with ;
        cleaned = cleaned.replaceAll(";[^\n]*", "");

        // Remove variations (text) — handle nested by repeating
        for (int i = 0; i < 5; i++) {
            cleaned = cleaned.replaceAll("\\([^()]*\\)", "");
        }

        // Remove NAGs (Numeric Annotation Glyphs) like $1, $14
        cleaned = cleaned.replaceAll("\\$\\d+", "");

        // Remove result tokens
        cleaned = cleaned.replaceAll("\\b(1-0|0-1|1/2-1/2|\\*)\\b", "");

        // Remove move numbers: "1." "12." "1..." "12..."
        cleaned = cleaned.replaceAll("\\d+\\.{1,3}\\s*", "");

        // Remove timestamps like // Generated on ...
        cleaned = cleaned.replaceAll("//.*", "");

        // Normalize castling: 0-0-0 → O-O-O, 0-0 → O-O (must be done in this order)
        cleaned = cleaned.replaceAll("0-0-0", "O-O-O");
        cleaned = cleaned.replaceAll("0-0", "O-O");

        // Normalize whitespace
        cleaned = cleaned.replaceAll("\\s+", " ").trim();

        return cleaned;
    }

    /**
     * Extract individual move tokens from cleaned PGN text.
     */
    /**
     * Executes the extractMoveTokens operation.
     */
    public List<String> extractMoveTokens(String cleanedMoves) {
        List<String> tokens = new ArrayList<>();
        if (cleanedMoves == null || cleanedMoves.isBlank()) return tokens;

        String[] parts = cleanedMoves.split("\\s+");
        for (String part : parts) {
            String t = part.trim();
            if (!t.isEmpty() && isLikelyMoveToken(t)) {
                tokens.add(t);
            }
        }
        return tokens;
    }

    // ================================================================
    // STAGE 2: BOARD REPLAY
    // ================================================================

    /**
     * Attempt to parse a SAN string into a legal Move on the given board.
     * Returns null if the move is not legal or unparseable.
     */
    private Move parseSanMove(Board board, String san) {
        try {
            // Use chesslib's robust MoveList parser to parse the single SAN move in current context
            MoveList ml = new MoveList(board.getFen());
            ml.loadFromSan(san);
            if (!ml.isEmpty()) {
                Move move = ml.get(0);
                // Verify it's in the list of legal moves
                if (board.legalMoves().contains(move)) {
                    return move;
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Build SAN notation from a Move and Board state.
     */
    private String buildSan(Board board, Move move) {
        Square from = move.getFrom();
        Square to = move.getTo();
        var piece = board.getPiece(from);

        if (piece == null) return move.toString();

        String pieceName = piece.getPieceType().name();
        boolean isCapture = board.getPiece(to) != com.github.bhlangonijr.chesslib.Piece.NONE;
        boolean isPawn = pieceName.equals("PAWN");

        // Castling
        if (pieceName.equals("KING")) {
            int fileDiff = to.getFile().ordinal() - from.getFile().ordinal();
            if (fileDiff == 2) return "O-O";
            if (fileDiff == -2) return "O-O-O";
        }

        StringBuilder sb = new StringBuilder();

        if (isPawn) {
            if (isCapture || isEnPassant(board, from, to)) {
                sb.append(from.getFile().getNotation()); // file letter
                sb.append("x");
            }
            sb.append(to.getFile().getNotation());
            sb.append(to.getRank().getNotation());

            // Promotion
            if (move.getPromotion() != com.github.bhlangonijr.chesslib.Piece.NONE
                && move.getPromotion() != null) {
                sb.append("=");
                sb.append(getPromotionLetter(move.getPromotion()));
            }
        } else {
            // Piece letter
            sb.append(getPieceLetter(pieceName));

            // Disambiguation
            String disambig = getDisambiguation(board, move, piece);
            sb.append(disambig);

            if (isCapture) sb.append("x");

            sb.append(to.getFile().getNotation());
            sb.append(to.getRank().getNotation());
        }

        // Check / checkmate detection
        Board testBoard = board.clone();
        testBoard.doMove(move);
        if (testBoard.isKingAttacked()) {
            if (testBoard.isMated()) {
                sb.append("#");
            } else {
                sb.append("+");
            }
        }

        return sb.toString();
    }

    /**
     * Determine disambiguation needed for a piece move.
     */
    private String getDisambiguation(Board board, Move move, com.github.bhlangonijr.chesslib.Piece piece) {
        List<Move> legalMoves = board.legalMoves();
        List<Move> samePieceSameTarget = new ArrayList<>();

        for (Move m : legalMoves) {
            if (m.getTo() == move.getTo()
                && board.getPiece(m.getFrom()) == piece
                && !m.getFrom().equals(move.getFrom())) {
                samePieceSameTarget.add(m);
            }
        }

        if (samePieceSameTarget.isEmpty()) return "";

        boolean sameFile = false;
        boolean sameRank = false;
        for (Move m : samePieceSameTarget) {
            if (m.getFrom().getFile() == move.getFrom().getFile()) sameFile = true;
            if (m.getFrom().getRank() == move.getFrom().getRank()) sameRank = true;
        }

        if (!sameFile) {
            return String.valueOf(move.getFrom().getFile().getNotation());
        } else if (!sameRank) {
            return String.valueOf(move.getFrom().getRank().getNotation());
        } else {
            return "" + move.getFrom().getFile().getNotation() + move.getFrom().getRank().getNotation();
        }
    }

    private boolean isEnPassant(Board board, Square from, Square to) {
        if (board.getEnPassant() != Square.NONE && to == board.getEnPassant()) {
            return true;
        }
        return false;
    }

    /**
     * Get all legal moves as SAN strings for the current board position.
     */
    public List<String> getLegalMoveSanList(Board board) {
        List<String> sanMoves = new ArrayList<>();
        try {
            List<Move> legals = board.legalMoves();
            for (Move m : legals) {
                sanMoves.add(buildSan(board, m));
            }
        } catch (Exception e) {
            // If encoding fails, return empty list
        }
        return sanMoves;
    }

    // ================================================================
    // HEADER CHECKING
    // ================================================================

    /**
     * Check for missing PGN headers and add warnings.
     */
    private void checkHeaders(String rawPgn, List<String> warnings) {
        String[] requiredTags = {"Event", "Site", "Date", "Round", "White", "Black", "Result"};
        for (String tag : requiredTags) {
            Pattern p = Pattern.compile("\\[" + tag + "\\s+\"([^\"]*?)\"\\]");
            Matcher m = p.matcher(rawPgn);
            if (!m.find()) {
                warnings.add("Missing PGN header: [" + tag + "]");
            } else {
                String value = m.group(1);
                if (value.equals("?") || value.equals("????.??.??") || value.equals("Not Mentioned") || value.isBlank()) {
                    warnings.add("PGN header [" + tag + "] has placeholder value: \"" + value + "\"");
                }
            }
        }
    }

    // ================================================================
    // HELPERS
    // ================================================================

    /**
     * Check if a token looks like a chess move (not noise, not a result, not a number).
     */
    private boolean isLikelyMoveToken(String token) {
        if (token.length() < 2) return false;
        // Must start with a piece letter, file letter (a-h), or O (castling)
        char first = token.charAt(0);
        return "KQRBNabcdefghO".indexOf(first) >= 0;
    }

    /**
     * Compare two SAN strings for equality, ignoring check/checkmate symbols
     * and being flexible with castling notation.
     */
    private boolean sanEquals(String input, String generated) {
        if (input == null || generated == null) return false;

        // Strip check/checkmate symbols for comparison
        String a = input.replaceAll("[+#!?]", "").trim();
        String b = generated.replaceAll("[+#!?]", "").trim();

        return a.equals(b);
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

    private String getPromotionLetter(com.github.bhlangonijr.chesslib.Piece promotion) {
        if (promotion == null) return "";
        String name = promotion.getPieceType().name();
        return getPieceLetter(name);
    }

    private PgnValidationResult buildEmptyResult(String warning) {
        List<String> warnings = new ArrayList<>();
        warnings.add(warning);
        return new PgnValidationResult(
            ValidationStatus.INVALID,
            "",
            0, 0, 0.0,
            List.of(),
            warnings,
            List.of(),
            0, 0
        );
    }
}
