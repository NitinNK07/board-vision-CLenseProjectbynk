# Appendix A: CLens REST API Documentation

This appendix details the REST API endpoints provided by the CLens Spring Boot backend. 

## Base URL
`http://localhost:8082`

---

## 1. Authentication (`AuthController`)

### `POST /auth/signup`
Registers a new user in the system.
- **JWT Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe",
    "phoneNumber": "1234567890"
  }
  ```
- **Response**: `200 OK` (Message indicating OTP sent).
- **Error Codes**: `400 Bad Request` (Email already exists).

### `POST /auth/verify`
Verifies the OTP sent to the user's email.
- **JWT Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "expiresIn": 3600
  }
  ```

### `POST /auth/login`
Authenticates a user and returns a JWT token.
- **JWT Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: `200 OK` (Token Payload).
- **Error Codes**: `401 Unauthorized` (Invalid credentials).

---

## 2. User & Profile (`AuthMeController`)

### `GET /auth/me`
Retrieves the currently authenticated user's profile.
- **JWT Required**: Yes
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "trialDays": 2,
    "adScanCredits": 0,
    "paidScanCredits": 0
  }
  ```

---

## 3. OCR Scanning (`VisionScanController` / `ScanController`)

### `POST /api/scan/vision`
Processes a base64 chess scoresheet image using the Groq Vision LLM API.
- **JWT Required**: Yes
- **Request Body**:
  ```json
  {
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSk..."
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "OK",
    "pgn": "[Event \"?\"]\n[White \"?\"]\n\n1. e4 e5...",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "validationErrors": []
  }
  ```
- **Error Codes**: `500 Internal Server Error` (OCR Provider Failed), `429 Too Many Requests` (Groq API Rate Limit).

### `GET /scan/allowance`
Returns the user's current scan credits (Trial, Ad, Paid).
- **JWT Required**: Yes

### `POST /scan/watch-ad`
Grants 1 additional Ad Credit.
- **JWT Required**: Yes

---

## 4. Game Database (`GameController`)

### `GET /api/games`
Retrieves a list of games belonging to the authenticated user.
- **JWT Required**: Yes
- **Response**: Array of `ChessGame` objects.

### `GET /api/games/{id}`
Retrieves a specific game.
- **JWT Required**: Yes

### `POST /api/games/search`
Searches the global game database based on filters (e.g., player name, event, opening).
- **JWT Required**: Yes
- **Request Body**:
  ```json
  {
    "white": "Magnus",
    "result": "1-0"
  }
  ```

---

## 5. Game Analysis (`AnalysisController`)

### `POST /api/analysis/game/{id}`
Runs a heuristic analysis on a specific game and returns move evaluations.
- **JWT Required**: Yes
- **Response**: `200 OK`
  ```json
  {
    "accuracy": 85.4,
    "brilliantMoves": 1,
    "greatMoves": 2,
    "blunders": 0,
    "mistakes": 1
  }
  ```

---

## 6. Player Statistics (`PlayerStatsController`)

### `GET /api/stats/me`
Retrieves aggregated statistics for the current user.
- **JWT Required**: Yes
- **Response**: `200 OK`
  ```json
  {
    "totalGames": 15,
    "wins": 10,
    "losses": 3,
    "draws": 2,
    "winRate": 66.6,
    "averageAccuracy": 82.5
  }
  ```
