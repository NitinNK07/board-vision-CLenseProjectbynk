# CLens Board Vision - API Quick Reference

Base URL: `http://localhost:8082`

---

## 🔐 Authentication

### Signup
```bash
curl -X POST http://localhost:8082/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "PLAYER",
    "phoneNumber": "+1234567890"
  }'
```

**Response:**
```json
{
  "message": "Signup successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "PLAYER"
  }
}
```

### Login
```bash
curl -X POST http://localhost:8082/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:8082/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## ♟️ Chess Games

### Get All My Games
```bash
curl -X GET http://localhost:8082/api/games \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Import PGN
```bash
curl -X POST http://localhost:8082/api/games/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "pgn": "[Event \"My Game\"]\n[Site \"Home\"]\n[Result \"1-0\"]\n1. e4 e5 1-0",
    "event": "Friendly Match",
    "whitePlayer": "John Doe",
    "blackPlayer": "Jane Smith",
    "result": "1-0",
    "eco": "C50",
    "opening": "Italian Game"
  }'
```

### Get Specific Game
```bash
curl -X GET http://localhost:8082/api/games/123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Search Games
```bash
curl -X POST http://localhost:8082/api/games/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "result": "1-0",
    "eco": "C50",
    "sortBy": "gameDate",
    "sortOrder": "desc",
    "page": 0,
    "size": 20
  }'
```

### Delete Game
```bash
curl -X DELETE http://localhost:8082/api/games/123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📸 Vision Scan (Protected)

### Scan Image (Multipart)
```bash
curl -X POST http://localhost:8082/api/scan/vision \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/chess-board.jpg"
```

### Scan Image (Base64)
```bash
curl -X POST http://localhost:8082/api/scan/vision/base64 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

**Response:**
```json
{
  "success": true,
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
  "pgn": "[Event \"Scanned Game\"]\n1. e4 e5 0-1",
  "gameId": 123,
  "gameSaved": true,
  "message": "Position scanned successfully!",
  "allowance": {
    "trialRemainingToday": 2,
    "adCredits": 0,
    "paidCredits": 0
  }
}
```

---

## 📊 Player Statistics

### Get My Stats
```bash
curl -X GET http://localhost:8082/api/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Stats
```bash
curl -X POST http://localhost:8082/api/stats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "playerId": 1
  }'
```

---

## 🔍 FIDE Lookup (Public)

### Search FIDE Player
```bash
curl -X GET "http://localhost:8082/api/fide/search?name=Carlsen"
```

---

## 📝 Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "PGN content is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "No scans remaining. Watch an ad to earn more!"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to scan image: Connection timeout"
}
```

---

## 🔑 Token Usage

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- **Access Token:** 60 minutes
- **Refresh Token:** 24 hours

### Refresh Flow
```javascript
// 1. Check if access token is expired
// 2. If expired, call /auth/refresh with refresh token
// 3. Get new access token
// 4. Retry original request with new token
```

---

## 📋 Validation Rules

### Signup
- **Name:** 2-50 characters
- **Email:** Valid email format
- **Password:** 6-128 characters
- **Phone:** E.164 format (+1234567890)
- **Role:** PLAYER or ARBITER

### PGN Import
- **PGN Content:** Required, minimum 10 characters
- **Result:** 1-0, 0-1, 1/2-1/2, or *
- **ECO Code:** Format A00-E99
- **Elo Ratings:** 0-3000

### Game Search
- **ECO Code:** Format A00-E99
- **Result:** 1-0, 0-1, 1/2-1/2, or *
- **Accuracy:** 0-100
- **Page Size:** 1-100

---

## 🌐 CORS Configuration

Allowed Origins:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`

Allowed Methods:
- GET, POST, PUT, DELETE, OPTIONS, PATCH

---

## 🐛 Troubleshooting

### 401 Unauthorized
- Check if token is present in Authorization header
- Check if token is valid (not expired)
- Try refreshing token using /auth/refresh

### 403 Forbidden
- User doesn't have required permissions
- No scan credits remaining

### Connection Refused
- Ensure backend is running on port 8082
- Check if PostgreSQL is running

### Database Error
- Check PostgreSQL connection in application.properties
- Verify database `clens_chess_db` exists
