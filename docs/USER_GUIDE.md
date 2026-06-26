# CLens User Guide

## 1. Registration & Authentication
Navigate to `/signup` to create a new account. After verifying your email OTP, you can log in to access the dashboard.

## 2. Scanning a Scoresheet
1. Click **Scan** on the sidebar.
2. Upload a clear, well-lit image of your chess scoresheet (`.jpg` or `.png`).
3. The system will upload the image securely to the Vision LLM.
4. Once completed, the raw PGN will be validated against chess engine rules.
5. If the game is fully valid, it is automatically saved to your game history.

## 3. Reviewing Games
Navigate to the **Games** tab to see your historical games. Click on any game to view the interactive chessboard replay.

## 4. Analyzing Games
Inside the game view, click **Analyze Game**. The heuristic engine will process the move list and return a classification of blunders, mistakes, and excellent moves to help improve your play.
