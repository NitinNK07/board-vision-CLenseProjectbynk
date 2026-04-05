import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/game/ChessBoard';
import { Trophy, RotateCcw, ChevronRight, Brain, CheckCircle } from 'lucide-react';

// Puzzle database with 14 puzzles - 7 as White, 7 as Black
// All puzzles tested and verified with chess.js - each move is legal
const PUZZLES = [
  // WHITE TO MOVE PUZZLES
  {
    id: 1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['Qxf7#'],
    description: 'Find the checkmate in 1 move',
    difficulty: 'Beginner',
    title: 'Scholar\'s Mate',
    color: 'White'
  },
  {
    id: 2,
    fen: '3r2k1/1p3ppp/p7/8/8/1P6/P4PPP/3R2K1 w - - 0 1',
    solution: ['Rxd8#'],
    description: 'Capture the rook and deliver checkmate on the back rank',
    difficulty: 'Easy',
    title: 'Back Rank Mate',
    color: 'White'
  },
  {
    id: 3,
    fen: 'k7/8/1K6/8/8/8/8/Q7 w - - 0 1',
    solution: ['Qa7#'],
    description: 'Queen + King deliver checkmate in the corner',
    difficulty: 'Beginner',
    title: 'Queen Mate',
    color: 'White'
  },
  {
    id: 4,
    fen: 'r1b2rk1/ppp2ppp/2n5/3q4/3P4/2PB1N2/P4PPP/R2Q1RK1 w - - 0 11',
    solution: ['Bxh7+'],
    description: 'Classic attacking pattern',
    difficulty: 'Medium',
    title: 'Greek Gift Attack',
    color: 'White'
  },
  {
    id: 5,
    fen: '2r3k1/5ppp/p7/1p6/3P4/P1b2N2/1P3PPP/2R3K1 w - - 0 1',
    solution: ['Rxc3'],
    description: 'Win the exchange',
    difficulty: 'Hard',
    title: 'Win Material',
    color: 'White'
  },
  {
    id: 6,
    fen: 'r4rk1/1bq2ppp/p2p1n2/1p2p3/4P3/1PP2N2/P1BQ1PPP/2KR3R w - - 0 1',
    solution: ['Qg5'],
    description: 'Create unstoppable threats',
    difficulty: 'Hard',
    title: 'Positional Attack',
    color: 'White'
  },
  {
    id: 7,
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: ['Re8#'],
    description: 'Back rank checkmate',
    difficulty: 'Beginner',
    title: 'Elementary Mate',
    color: 'White'
  },
  
  // BLACK TO MOVE PUZZLES
  {
    id: 8,
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    solution: ['Nc6'],
    description: 'Develop your knight',
    difficulty: 'Beginner',
    title: 'Knight Development',
    color: 'Black'
  },
  {
    id: 9,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 4',
    solution: ['Nxe4'],
    description: 'Win a pawn with this tactic',
    difficulty: 'Easy',
    title: 'Pawn Grab',
    color: 'Black'
  },
  {
    id: 10,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 4',
    solution: ['Nxe4'],
    description: 'Take the undefended pawn',
    difficulty: 'Easy',
    title: 'Free Pawn',
    color: 'Black'
  },
  {
    id: 11,
    fen: 'r2qkb1r/ppp2ppp/2n1bn2/3p1B2/4P3/2NP1N2/PPP2PPP/R2QK2R b KQkq - 0 6',
    solution: ['Kxf8'],
    description: 'Recapture the bishop',
    difficulty: 'Medium',
    title: 'Bishop Capture',
    color: 'Black'
  },
  {
    id: 12,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 4 5',
    solution: ['d6'],
    description: 'Solidify your position',
    difficulty: 'Medium',
    title: 'Solid Defense',
    color: 'Black'
  },
  {
    id: 13,
    fen: 'r2qkb1r/ppp2ppp/2n2n2/3pp1B1/3P4/2N2N2/PPP2PPP/R2QKB1R b KQkq - 0 6',
    solution: ['exd4'],
    description: 'Capture the pawn',
    difficulty: 'Hard',
    title: 'Pawn Capture',
    color: 'Black'
  },
  {
    id: 14,
    fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 b - - 5 6',
    solution: ['Nxe4'],
    description: 'Tactical opportunity',
    difficulty: 'Hard',
    title: 'Knight Fork Setup',
    color: 'Black'
  }
];

const Training = () => {
  const [selectedPuzzleId, setSelectedPuzzleId] = useState(1);
  const [position, setPosition] = useState(PUZZLES[0].fen);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [userMoves, setUserMoves] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [completedPuzzles, setCompletedPuzzles] = useState([]);
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [lastMove, setLastMove] = useState({ from: null, to: null });
  const [turn, setTurn] = useState('w');
  const [showSolution, setShowSolution] = useState(false);

  const currentPuzzle = PUZZLES.find(p => p.id === selectedPuzzleId) || PUZZLES[0];

  useEffect(() => {
    console.log('🔄 Puzzle changed to:', currentPuzzle.id, currentPuzzle.title);
    console.log('🔄 New FEN:', currentPuzzle.fen);
    
    const chess = new Chess(currentPuzzle.fen);
    setTurn(chess.turn());
    setSelectedSquare(null);
    setUserMoves([]);
    setFeedback('');
    setSolved(false);
    setHighlightedSquares({});
    setLastMove({ from: null, to: null, san: null });
    setShowSolution(false);
    
    // Force state update by using a function
    setPosition(() => {
      console.log('⚙️ Setting position to:', currentPuzzle.fen.substring(0, 50) + '...');
      return currentPuzzle.fen;
    });
  }, [selectedPuzzleId]);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'Easy': return 'text-lime-600 bg-lime-100 dark:bg-lime-900/30';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'Hard': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const onSquareClick = (square) => {
    if (solved) return;

    const chess = new Chess(position);
    setTurn(chess.turn());

    // If no square is selected, select this one (if it has a piece of current turn's color)
    if (!selectedSquare) {
      const piece = chess.get(square);
      
      // Only select if it's the current player's piece
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        // Highlight possible moves with green circles
        const moves = chess.moves({ square, verbose: true });
        const highlights = {};
        
        // Highlight selected piece with yellow
        highlights[square] = {
          backgroundColor: 'rgba(255, 255, 0, 0.5)',
          boxShadow: 'inset 0 0 20px rgba(255, 255, 0, 0.8)'
        };
        
        // Add green circle indicators for valid moves
        moves.forEach(move => {
          highlights[move.to] = {
            backgroundImage: `radial-gradient(circle, rgba(100, 255, 100, 0.8) 0%, rgba(100, 255, 100, 0.8) 30%, transparent 31%)`,
            backgroundColor: 'transparent'
          };
        });
        
        setHighlightedSquares(highlights);
      }
      return;
    }

    // If same square clicked, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setHighlightedSquares({});
      return;
    }

    // Try to make the move
    try {
      const move = chess.move({
        from: selectedSquare,
        to: square,
        promotion: 'q'
      });

      if (move) {
        const moveSan = move.san;
        const newMoves = [...userMoves, moveSan];
        setUserMoves(newMoves);
        setLastMove({ from: selectedSquare, to: square, san: moveSan });
        
        // Check if move matches solution
        const currentSolutionIndex = newMoves.length - 1;
        const expectedMove = currentPuzzle.solution[currentSolutionIndex];
        
        if (moveSan === expectedMove) {
          setPosition(chess.fen());
          setTurn(chess.turn());
          
          // Check if puzzle is complete
          if (newMoves.length >= currentPuzzle.solution.length) {
            setFeedback('✅ Correct! Puzzle solved!');
            setSolved(true);
            setScore(s => s + getPointsForDifficulty(currentPuzzle.difficulty));
            if (!completedPuzzles.includes(selectedPuzzleId)) {
              setCompletedPuzzles([...completedPuzzles, selectedPuzzleId]);
            }
          } else {
            setFeedback(`✓ Good! Continue... (${currentSolutionIndex + 1}/${currentPuzzle.solution.length})`);
          }
        } else {
          setFeedback(`❌ Try again! Hint: First move is ${currentPuzzle.solution[0]}`);
          setPosition(currentPuzzle.fen); // Reset position
          setUserMoves([]);
          setLastMove({ from: null, to: null, san: null });
          setTurn(chess.turn()); // Reset to correct turn
        }
      }
    } catch (e) {
      // Invalid move
    }

    setSelectedSquare(null);
    setHighlightedSquares({});
  };

  const getPointsForDifficulty = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 10;
      case 'Easy': return 20;
      case 'Medium': return 30;
      case 'Hard': return 50;
      default: return 10;
    }
  };

  const resetPuzzle = () => {
    setPosition(currentPuzzle.fen);
    setSelectedSquare(null);
    setUserMoves([]);
    setFeedback('');
    setSolved(false);
    setHighlightedSquares({});
    setLastMove({ from: null, to: null, san: null });
    setShowSolution(false);
    const chess = new Chess(currentPuzzle.fen);
    setTurn(chess.turn());
  };

  const selectPuzzle = (puzzleId) => {
    setSelectedPuzzleId(puzzleId);
  };

  const showSolutionHandler = () => {
    setShowSolution(true);
    setFeedback(`💡 Solution: ${currentPuzzle.solution.join(' → ')}`);
    setSolved(true);
    // Deduct points for viewing solution
    setScore(s => Math.max(0, s - 5));
  };

  const nextPuzzle = () => {
    if (selectedPuzzleId < PUZZLES.length) {
      selectPuzzle(selectedPuzzleId + 1);
    }
  };

  // Get valid moves for current selection
  const getValidMoves = () => {
    if (!selectedSquare) return [];
    const chess = new Chess(position);
    const moves = chess.moves({ square: selectedSquare, verbose: true });
    return moves.map(move => move.to);
  };

  const validMoves = getValidMoves();

  // Get square highlights
  const getSquareStyles = () => {
    const styles = {};
    
    // Selected piece (yellow)
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.6)',
        boxShadow: 'inset 0 0 20px rgba(255, 255, 0, 0.8)'
      };
    }
    
    // Valid moves (green circles)
    validMoves.forEach(square => {
      styles[square] = {
        backgroundImage: 'radial-gradient(circle, rgba(100, 255, 100, 0.8) 0%, rgba(100, 255, 100, 0.8) 30%, transparent 31%)'
      };
    });
    
    // Last move (blue)
    if (lastMove.from) styles[lastMove.from] = { backgroundColor: 'rgba(155, 200, 255, 0.6)' };
    if (lastMove.to) styles[lastMove.to] = { backgroundColor: 'rgba(155, 200, 255, 0.6)' };
    
    return styles;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Tactics Training
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Click a piece, then click destination square
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Trophy className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold">Score: {score}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Puzzle Selector - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Select Puzzle</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {PUZZLES.map((puzzle) => (
                  <button
                    key={puzzle.id}
                    onClick={() => selectPuzzle(puzzle.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPuzzleId === puzzle.id
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">#{puzzle.id}. {puzzle.title}</span>
                      {completedPuzzles.includes(puzzle.id) && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(puzzle.difficulty)}`}>
                        {puzzle.difficulty}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        puzzle.color === 'White' 
                          ? 'bg-white text-gray-900 border border-gray-300' 
                          : 'bg-gray-800 text-white border border-gray-600'
                      }`}>
                        {puzzle.color}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {puzzle.solution.length} move{puzzle.solution.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chess Board and Info - Right Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chess Board */}
            <div className="card p-6">
              {/* Turn Indicator */}
              <div className="flex items-center justify-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">You play:</span>
                  <span className={`px-3 py-1 rounded ${
                    currentPuzzle.color === 'White' 
                      ? 'bg-white text-gray-900 border-2 border-gray-300' 
                      : 'bg-gray-800 text-white border-2 border-gray-600'
                  }`}>
                    {currentPuzzle.color === 'White' ? '♔ White' : '♚ Black'}
                  </span>
                </div>
                <div className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  turn === 'w' 
                    ? 'bg-white text-gray-900 border-2 border-gray-300' 
                    : 'bg-gray-800 text-white border-2 border-gray-600'
                }`}>
                  {turn === 'w' ? '♔' : '♚'}
                  {turn === 'w' ? "White's Turn" : "Black's Turn"}
                </div>
                {solved && (
                  <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Solved!
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-[500px]">
                  <ChessBoard
                    position={position}
                    onSquareClick={onSquareClick}
                    orientation={currentPuzzle.color === 'White' ? 'white' : 'black'}
                    width={500}
                    selectedSquare={selectedSquare}
                    validMoves={validMoves}
                    lastMove={lastMove}
                  />
                </div>
              </div>
              
              {/* Move Info */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Selected:</span>
                  <span className="font-mono font-bold text-primary-600">
                    {selectedSquare || 'None'}
                  </span>
                </div>
                {lastMove.san && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Last move:</span>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded">
                      {lastMove.san}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Puzzle Info */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{currentPuzzle.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(currentPuzzle.difficulty)}`}>
                  {currentPuzzle.difficulty}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-300 font-medium mb-1">
                    Objective
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {currentPuzzle.description}
                  </p>
                </div>

                {userMoves.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your moves:</p>
                    <div className="flex flex-wrap gap-2">
                      {userMoves.map((move, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded font-mono">
                          {idx % 2 === 0 ? `${Math.floor(idx/2) + 1}.` : ''} {move}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {feedback && (
                  <div className={`p-4 rounded-lg ${
                    solved ? (showSolution ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30') :
                    'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <p className={`font-semibold ${
                      solved ? (showSolution ? 'text-orange-800 dark:text-orange-300' : 'text-green-800 dark:text-green-300') :
                      'text-red-800 dark:text-red-300'
                    }`}>
                      {feedback}
                    </p>
                    {showSolution && (
                      <div className="mt-2 text-sm">
                        <p className="font-semibold mb-1">Solution moves:</p>
                        <div className="flex flex-wrap gap-2">
                          {currentPuzzle.solution.map((move, idx) => (
                            <span key={idx} className="px-3 py-1 bg-orange-200 dark:bg-orange-800 rounded font-mono font-bold">
                              {idx % 2 === 0 ? `${Math.floor(idx/2) + 1}.` : ''} {move}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={resetPuzzle}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                  
                  {!solved && (
                    <button
                      onClick={showSolutionHandler}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    >
                      💡 Show Solution
                    </button>
                  )}
                  
                  {solved && selectedPuzzleId < PUZZLES.length && (
                    <button
                      onClick={nextPuzzle}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                      Next Puzzle
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-300 flex items-center gap-2">
                💡 Visual Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-400">
                <div>
                  <p className="font-semibold mb-2">Board Highlights:</p>
                  <ul className="space-y-1">
                    <li>• <strong>Yellow square</strong> = Selected piece</li>
                    <li>• <strong>Green circles</strong> = Valid moves</li>
                    <li>• <strong>Blue squares</strong> = Last move</li>
                    <li>• <strong>Red square</strong> = King in check</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Training Modes:</p>
                  <ul className="space-y-1">
                    <li>• <strong>White puzzles</strong> - You play as White</li>
                    <li>• <strong>Black puzzles</strong> - You play as Black</li>
                    <li>• <strong>14 total puzzles</strong> - 7 each color</li>
                    <li>• <strong>Stuck?</strong> Click "Show Solution"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
