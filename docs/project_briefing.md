# CLens Project Briefing & Architectural Analysis

This document provides a comprehensive briefing of the **CLens** chess scoresheet scanner and analysis application. It is designed to be shared with ChatGPT or other AI engines to audit the architecture, pinpoint bugs, identify implementation mistakes, and suggest enhancements.

---

## 1. Project Overview & Purposes

**CLens** is a full-stack software application designed to help chess players digitize, record, and analyze their games:
- **Vision Scan (OCR)**: Scans physical chess scoresheets (images or camera uploads) to extract played moves and metadata in standard chess notation.
- **Game Database**: Organizes and stores scanned or imported games (PGN format) for registered users.
- **Game Analysis**: Evaluates game moves to identify Blunders, Mistakes, Inaccuracies, Great Moves, and Brilliant Moves, calculating an overall accuracy score (similar to Chess.com or Lichess).
- **Player Statistics**: Computes win rates, streaks, opening distribution, and performance metrics.

---

## 2. System Architecture & Components

The repository is divided into three main components, but contains redundancy and configuration mismatches:

### Component A: React Frontend (`web-app`)
- **Technology**: React 18 (Create React App), React Router, Axios, and Tailwind CSS.
- **Working**: Allows users to sign up, verify their emails/phones, upload scoresheet images, view scanned games, and access analytical dashboards.
- **Key Mismatch**: The API service layer ([api.js](file:///d:/New%20folder/CLens/web-app/src/services/api.js)) is hardcoded to target `http://localhost:9090` (the legacy `pgn-backend`), bypassing the newer production-ready features of `board-vision-app` on port `8082`.

---

### Component B: Legacy Backend (`pgn-backend`)
- **Technology**: Java Spring Boot, running on port `9090`.
- **Database**: H2 (In-memory, all data is lost when the server restarts).
- **OCR Engine**: Local **Tesseract OCR** (via `tess4j` JNI).
  - Preprocesses base64 images (grayscale, contrast adjustment, scaling, adaptive thresholding).
  - Uses fuzzy regex patterns to parse OCR text, correcting common digit/letter misreads.
  - Very fragile and prone to native Tesseract DLL/library loading errors on Windows.

---

### Component C: Advanced Backend (`board-vision-app`)
- **Technology**: Spring Boot 3.4.11, running on port `8082`.
- **Database**: PostgreSQL (`jdbc:postgresql://localhost:5432/clens_chess_db`) with persistent schema storage (`ddl-auto=update`).
- **Security**: JWT with **Refresh Token support** (24-hour expiration) and protected scan/game APIs.
- **AI-Powered OCR**: Replaces local Tesseract with external LLM APIs (Groq's Llama 4 Scout Vision [primary], Google Gemini 2.0 Flash Lite, and Hugging Face Qwen2.5-VL as a fallback) to interpret scoresheet images directly into structured PGN strings.
- **Analysis Engine**: Analyzes moves and provides chess statistics.

---

## 3. Detailed Implementation Highlights

### A. The OCR & AI Vision Strategy
Inside `board-vision-app`, [VisionScanService.java](file:///d:/New%20folder/CLens/board-vision-app/src/main/java/CLens/pgn_backend/service/VisionScanService.java) orchestrates the scanning sequence:
1. **Image Capture**: Accepts a multipart file or base64 string.
2. **LLM Chain-of-Thought Prompting**: Sends the image with a custom system prompt instructuring the LLM on how to extract chess moves, correct OCR noise (e.g., zero `0` vs letter `O` in castling), and format the output as pure PGN.
3. **Multi-Provider Fallback**:
   - Tries **Groq** (free rate limit tier with Llama 4 Scout).
   - If Groq fails/times out, calls **Google Gemini**.
   - If Gemini fails, tries **Hugging Face Inference**.

### B. The Mocked "Stockfish" Analysis Engine
Inside `board-vision-app`, [StockfishAnalysisService.java](file:///d:/New%20folder/CLens/board-vision-app/src/main/java/CLens/pgn_backend/service/StockfishAnalysisService.java) runs when a user requests game analysis:
- **How it's claimed to work**: Replays the PGN, queries Lichess Cloud Eval API (`https://lichess.org/api/cloud-eval`), compares played moves to best moves, and returns CAPS accuracy.
- **Actual Implementation**: Bypasses the API! It uses a custom **heuristic pattern recognizer** on the raw move text strings:
  - Gives bonus points for checkmate symbols (`#`), check symbols (`+`), early castling, etc.
  - Applies penalties for moving the Queen too early or voluntarially moving the King early.
  - Uses a **deterministic hash value** based on the move string and its index to simulate "time pressure errors" (randomly assigning inaccuracies, mistakes, and blunders in the middlegame/endgame).
  - Accuracy is mathematically derived from this simulated evaluation via a CAPS-like exponential decay formula.

---

## 4. Key Architectural Flaws, Mistakes & Bugs

### 1. Hardcoded Web-App Base URL Mismatch
- **Mistake**: The React frontend (`web-app`) communicates with port `9090` (`pgn-backend`).
- **Impact**: When users scan or query via the React UI, they interact with the old H2 in-memory DB and fragile local Tesseract OCR, failing to use the PostgreSQL DB, LLM-based Vision scan, and Stockfish analysis modules of `board-vision-app` (on port `8082`).

### 2. Fake Stockfish Analysis
- **Mistake**: The analysis engine simulates evaluation using string heuristics and random/hashed blunder generation instead of calling Lichess Cloud Eval or a local Stockfish executable.
- **Impact**: The move quality classification (e.g., calling a move a "Blunder" or "Brilliant") is completely artificial. If a player submits a perfect game, the simulator will still inject blunders under the guise of "time pressure simulation" for moves after index 14.

### 3. Missing Chess Rules Engine (Illegal Moves Ignored)
- **Mistake**: Neither backend contains an actual JVM chess library (e.g., `chesslib` or `bhb`).
- **Impact**: The backend checks if a move *looks* like chess notation using regex (e.g., matches `Nf3`), but it has no way to verify if the move is legal on the board. If the OCR misreads a move (e.g., outputs `Nf4` when the Knight is pinned, or `e5` when a pawn is on `e6`), the system accepts it as a valid chess move.

### 4. Code Redundancy and Diverged Endpoints
- **Mistake**: Keeping two active Spring Boot applications (`pgn-backend` and `board-vision-app`) leads to duplicate logic for JWT filters, UserController, OTP, and Scan routes. It makes deployment, testing, and upkeep highly convoluted.

### 5. Lack of Transactional Integrity & Error Handling
- In `VisionScanController`, games are automatically saved to PostgreSQL, but error handling is decoupled: if the database save fails, it prints a stack trace and returns success anyway.
- Credentials and API keys (Groq, Gemini, Twilio) are hardcoded with fallbacks or left blank, instead of using robust Spring `@ConfigurationProperties` and profiles.

---

## 5. Focus Areas for ChatGPT Audit & Recommendations

When auditing this codebase, ChatGPT should focus on providing guidance on:
1. **How to merge the backends**: Recommendations on sunsetting `pgn-backend` and pointing the React frontend to `board-vision-app` (port `8082`).
2. **Replacing Heuristics with a Real Chess Library**: Suggesting lightweight Java libraries (like [chesslib](https://github.com/bhlangonijr/chesslib)) to replay PGNs, calculate legal moves, and catch OCR reading errors (such as illegal moves).
3. **Connecting a Real Stockfish Engine**:
   - Implementing asynchronous background threads to query Lichess Cloud Eval API.
   - Alternatively, setting up a local Stockfish process runner on the server using Java `ProcessBuilder` without incurring hosting charges.
4. **Standardizing JWT Token Expiry & Rotation**: Reviewing the Refresh Token implementation in `JwtService` and securing the cookies vs headers communication.
5. **OCR Error Correction with LLMs**: Enhancing the LLM prompt to include the legal moves list at each step (if the backend has a chess engine) so the LLM can make perfect fuzzy corrections.
