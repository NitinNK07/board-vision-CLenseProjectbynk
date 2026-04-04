import { Chessboard } from 'react-chessboard';

/**
 * ChessBoard component — wraps react-chessboard v5 with highlight logic.
 *
 * IMPORTANT: react-chessboard v5.10+ uses an `options` prop object!
 * All configuration is passed via: <Chessboard options={{...}} />
 *
 * Props:
 *  - position: FEN string or 'start'
 *  - onSquareClick: (square) => void
 *  - onPieceDrop: (from, to) => boolean  (optional drag-drop)
 *  - orientation: 'white' | 'black'
 *  - width: number
 *  - selectedSquare: string | null
 *  - validMoves: string[]
 *  - lastMove: { from, to }
 *  - arePiecesDraggable: boolean
 *  - analysisHighlights: object
 */
const ChessBoard = ({
  position = 'start',
  onSquareClick,
  onPieceDrop,
  orientation = 'white',
  width = 400,
  selectedSquare = null,
  validMoves = [],
  lastMove = { from: null, to: null },
  arePiecesDraggable = false,
  analysisHighlights = {},
}) => {

  // Build custom square styles for highlights
  const buildSquareStyles = () => {
    const styles = {};

    // Last move — soft blue
    if (lastMove?.from) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(155, 200, 255, 0.5)',
      };
    }
    if (lastMove?.to) {
      styles[lastMove.to] = {
        backgroundColor: 'rgba(155, 200, 255, 0.5)',
      };
    }

    // Selected piece — yellow glow
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
        boxShadow: 'inset 0 0 18px rgba(255, 255, 0, 0.7)',
      };
    }

    // Valid move targets — green dot overlay
    if (selectedSquare && validMoves.length > 0) {
      validMoves.forEach((sq) => {
        const target = typeof sq === 'string' ? sq : sq?.to;
        if (target) {
          styles[target] = {
            ...(styles[target] || {}),
            background:
              (styles[target]?.backgroundColor
                ? `radial-gradient(circle, rgba(0,0,0,0.25) 25%, transparent 26%), linear-gradient(${styles[target].backgroundColor}, ${styles[target].backgroundColor})`
                : 'radial-gradient(circle, rgba(0,0,0,0.25) 25%, transparent 26%)'),
            borderRadius: '50%',
          };
        }
      });
    }

    // Merge any analysis highlights
    Object.entries(analysisHighlights).forEach(([sq, style]) => {
      styles[sq] = { ...(styles[sq] || {}), ...style };
    });

    return styles;
  };

  // Adapter: react-chessboard v5 onSquareClick receives ({ piece, square })
  const handleSquareClick = onSquareClick
    ? ({ square }) => onSquareClick(square)
    : undefined;

  // Adapter: react-chessboard v5 onPieceDrop receives ({ piece, sourceSquare, targetSquare })
  const handlePieceDrop = onPieceDrop
    ? ({ sourceSquare, targetSquare }) => onPieceDrop(sourceSquare, targetSquare)
    : undefined;

  return (
    <div style={{ width: '100%', maxWidth: width }} className="chessboard-container">
      <Chessboard
        options={{
          id: 'clens-board',
          position: position === 'start' || !position ? 'start' : position,
          boardOrientation: orientation,
          allowDragging: arePiecesDraggable,
          onSquareClick: handleSquareClick,
          onPieceDrop: handlePieceDrop,
          squareStyles: buildSquareStyles(),
          animationDurationInMs: 200,
          boardStyle: {
            borderRadius: '6px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          },
          darkSquareStyle: { backgroundColor: '#779952' },
          lightSquareStyle: { backgroundColor: '#edeed1' },
        }}
      />
    </div>
  );
};

export { ChessBoard };
export default ChessBoard;
