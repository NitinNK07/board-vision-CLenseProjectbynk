# Board Vision - AI Chess Position Scanner

AI-powered chess position scanning and analysis application.

## ✨ Features

- 📸 **OCR Position Scanning** - Upload chess position images and convert to PGN
- 📚 **Games Database** - Store, search, and manage your scanned games
- 📊 **Player Statistics** - Track performance with charts and win rates
- ⚡ **Game Analysis** - Get move-by-move evaluation with accuracy stats
- 🌙 **Dark Mode** - Full dark/light theme support
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## 🎨 UI Features (Matching Emergine AI Design)

- **Board Vision** branding with crown logo
- Gradient text effects (Purple → Blue → Green → Yellow)
- Violet primary color (#7C3AED)
- Clean, modern card-based design
- Smooth animations and transitions
- Toast notifications for all actions

## Prerequisites

- Node.js 18+ 
- Spring Boot backend running on `http://localhost:8082`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd board-vision
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Run Backend

Make sure your Spring Boot backend is running on port 8082:

```bash
cd ../pgn-backend
./mvnw spring-boot:run
```

## 📁 Project Structure

```
board-vision/
├── src/
│   ├── components/
│   │   ├── layout/       # Header, Footer
│   │   ├── auth/         # Login, Signup forms
│   │   ├── scan/         # Scan components
│   │   ├── result/       # Result components
│   │   ├── games/        # Games database components
│   │   ├── stats/        # Statistics components
│   │   ├── analysis/     # Analysis components
│   │   └── profile/      # Profile components
│   ├── pages/            # Page components
│   │   ├── Landing.jsx   # Landing page (hero, features, pricing)
│   │   ├── Login.jsx     # Login page
│   │   ├── Signup.jsx    # Signup page
│   │   ├── Scan.jsx      # Chess position scanner
│   │   ├── Result.jsx    # Scan result with chess board
│   │   ├── Games.jsx     # Games database
│   │   ├── Stats.jsx     # Player statistics
│   │   ├── Analysis.jsx  # Game analysis
│   │   └── NotFound.jsx  # 404 page
│   ├── lib/              # API client
│   ├── store/            # Zustand stores
│   ├── hooks/            # Custom hooks
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## API Endpoints

The app connects to Spring Boot backend at `http://localhost:8082`:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/me` - Get current user

### Scan
- `GET /scan/allowance` - Get scan allowance
- `POST /scan` - Scan chess position
- `POST /scan/watch-ad` - Watch ad for free scan

### Games
- `GET /api/games` - Get user's games
- `POST /api/games/search` - Search games
- `DELETE /api/games/:id` - Delete game

### Statistics
- `GET /api/stats/me` - Get user statistics

### Analysis
- `POST /api/analysis/game/:id` - Analyze game

## Environment Variables

Create `.env` file if needed:

```env
VITE_API_URL=http://localhost:8082
```

## Build for Production

```bash
npm run build
```

## License

MIT
