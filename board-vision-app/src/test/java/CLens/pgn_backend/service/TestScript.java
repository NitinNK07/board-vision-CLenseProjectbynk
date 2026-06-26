package CLens.pgn_backend.service;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.move.Move;
import com.github.bhlangonijr.chesslib.move.MoveList;

public class TestScript {
    public static void main(String[] args) throws Exception {
        Board board = new Board();
        MoveList ml = new MoveList(board.getFen());
        Move e4 = new Move(com.github.bhlangonijr.chesslib.Square.E2, com.github.bhlangonijr.chesslib.Square.E4);
        ml.add(e4);
        System.out.println("MoveList SAN: " + java.util.Arrays.toString(ml.toSanArray()));
    }
}
