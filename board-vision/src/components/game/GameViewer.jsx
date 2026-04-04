import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/game/ChessBoard';
import EvalBar from '@/components/analysis/EvalBar';
import EvalGraph from '@/components/analysis/EvalGraph';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Play, Pause } from 'lucide-react';

/**
 * GameViewer — interactive PGN replay with optional analysis overlay
 *
 * Props:
 *  - pgn: string (PGN text)
 *  - analysis: GameAnalysisDTO (optional — if present, shows eval bar, move colors, graph)
 *  - width: board width
 */
const GameViewer = ({ pgn, analysis = null, width = 420 }) => {
  const [game] = useState(() => {
    const g = new Chess();
    if (pgn) {
      try { g.load_pgn(pgn); } catch (e) { console.warn('PGN load failed:', e); }
    }
    return g;
  });

  const [moves, setMoves] = useState([]);
  const [positions, setPositions] = useState(['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1']);
  const [currentMove, setCurrentMove] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const moveListRef = useRef(null);

  // Build positions array on mount
  useEffect(() => {
    if (!pgn) return;
    try {
      const g2 = new Chess();
      g2.load_pgn(pgn);
      const history = g2.history();
      setMoves(history);

      const fens = [];
      const g3 = new Chess();
      fens.push(g3.fen());
      for (const m of history) {
        g3.move(m);
        fens.push(g3.fen());
      }
      setPositions(fens);
      setCurrentMove(0);
    } catch (e) {
      console.warn('Error building positions:', e);
    }
  }, [pgn]);

  // Navigate to move
  const goToMove = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(idx, moves.length));
    setCurrentMove(clamped);
  }, [moves.length]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    if (currentMove >= moves.length) { setIsPlaying(false); return; }
    const timer = setTimeout(() => goToMove(currentMove + 1), 800);
    return () => clearTimeout(timer);
  }, [isPlaying, currentMove, moves.length, goToMove]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToMove(currentMove - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goToMove(currentMove + 1); }
      if (e.key === 'Home') { e.preventDefault(); goToMove(0); }
      if (e.key === 'End') { e.preventDefault(); goToMove(moves.length); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentMove, moves.length, goToMove]);

  // Auto-scroll active move into view
  useEffect(() => {
    const active = document.getElementById(`move-${currentMove}`);
    if (active && moveListRef.current) {
      active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentMove]);

  // Get last move for highlight
  const lastMove = currentMove > 0 ? (() => {
    try {
      const g2 = new Chess(positions[currentMove - 1]);
      const verboseMoves = g2.moves({ verbose: true });
      const played = moves[currentMove - 1];
      const found = verboseMoves.find(m => m.san === played);
      if (found) return { from: found.from, to: found.to };
    } catch (e) { /* ignore */ }
    return { from: null, to: null };
  })() : { from: null, to: null };

  // Get eval for current position
  const currentEval = analysis?.moveEvaluations?.[currentMove - 1]?.score ?? 0;

  // Classification helpers
  const getClassColor = (cls) => {
    if (cls === 'BLUNDER') return 'bg-red-500/20 text-red-600 dark:text-red-400';
    if (cls === 'MISTAKE') return 'bg-orange-500/15 text-orange-600 dark:text-orange-400';
    if (cls === 'INACCURACY') return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400';
    if (cls === 'BRILLIANT') return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400';
    if (cls === 'GREAT') return 'bg-green-500/15 text-green-600 dark:text-green-400';
    return '';
  };
  const getClassIcon = (cls) => {
    if (cls === 'BLUNDER') return '??';
    if (cls === 'MISTAKE') return '?';
    if (cls === 'INACCURACY') return '?!';
    if (cls === 'BRILLIANT') return '💎';
    if (cls === 'GREAT') return '!';
    return '';
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Board + EvalBar row */}
      <div className="flex gap-2 justify-center">
        {analysis && <EvalBar score={currentEval} height={width} />}
        <ChessBoard
          position={positions[currentMove] || 'start'}
          width={width}
          lastMove={lastMove}
          orientation="white"
        />
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => goToMove(0)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Start">
          <ChevronsLeft className="w-5 h-5" />
        </button>
        <button onClick={() => goToMove(currentMove - 1)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Previous (←)">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)}
          className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Auto-play'}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button onClick={() => goToMove(currentMove + 1)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Next (→)">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={() => goToMove(moves.length)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="End">
          <ChevronsRight className="w-5 h-5" />
        </button>
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
          {currentMove}/{moves.length}
        </span>
      </div>

      {/* Eval Graph */}
      {analysis?.moveEvaluations?.length > 0 && (
        <EvalGraph
          moveEvaluations={analysis.moveEvaluations}
          currentMove={currentMove}
          onMoveClick={goToMove}
        />
      )}

      {/* Move list — color coded */}
      <div
        ref={moveListRef}
        className="max-h-52 overflow-y-auto rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3"
      >
        <div className="flex flex-wrap gap-x-1 gap-y-0.5 text-sm">
          {moves.map((move, i) => {
            const isWhite = i % 2 === 0;
            const moveNum = Math.floor(i / 2) + 1;
            const isActive = currentMove === i + 1;
            const evalData = analysis?.moveEvaluations?.[i];
            const cls = evalData?.classification;
            const icon = cls ? getClassIcon(cls) : '';
            const colorClass = cls ? getClassColor(cls) : '';

            return (
              <span key={i} className="inline-flex items-center">
                {isWhite && (
                  <span className="text-gray-400 dark:text-gray-500 font-mono mr-0.5 text-xs">
                    {moveNum}.
                  </span>
                )}
                <button
                  id={`move-${i + 1}`}
                  onClick={() => goToMove(i + 1)}
                  className={`
                    px-1.5 py-0.5 rounded font-mono text-sm cursor-pointer transition-all
                    ${isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md'
                      : colorClass || 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {move}
                  {icon && <span className="ml-0.5 text-xs">{icon}</span>}
                </button>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameViewer;
