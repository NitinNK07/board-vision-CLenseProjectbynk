import { Chess } from 'chess.js';

// Test all puzzles
const testPuzzles = () => {
  console.log('🧪 Testing all puzzles...\n');
  
  PUZZLES.forEach(puzzle => {
    console.log(`\n=== Puzzle #${puzzle.id}: ${puzzle.title} (${puzzle.color}) ===`);
    
    const chess = new Chess(puzzle.fen);
    console.log(`Turn: ${chess.turn() === 'w' ? 'White' : 'Black'}`);
    console.log(`In check: ${chess.in_check()}`);
    console.log(`Is checkmate: ${chess.is_checkmate()}`);
    
    // Test each move in solution
    let valid = true;
    const testGame = new Chess(puzzle.fen);
    
    puzzle.solution.forEach((moveSan, idx) => {
      try {
        const move = testGame.move(moveSan);
        if (move) {
          console.log(`✓ Move ${idx + 1}: ${moveSan} - VALID`);
        } else {
          console.log(`✗ Move ${idx + 1}: ${moveSan} - INVALID`);
          valid = false;
        }
      } catch (e) {
        console.log(`✗ Move ${idx + 1}: ${moveSan} - ERROR: ${e.message}`);
        valid = false;
      }
    });
    
    if (valid) {
      console.log(`✅ Puzzle #${puzzle.id} is VALID`);
    } else {
      console.log(`❌ Puzzle #${puzzle.id} has ISSUES`);
    }
  });
};

testPuzzles();
