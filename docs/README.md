# CLens: AI-Powered Chess Scoresheet Digitizer

CLens (Board Vision) is a comprehensive web application designed to automatically digitize handwritten chess scoresheets using Vision Large Language Models (LLMs). It validates chess games using standard PGN rules and provides an intuitive UI for game database management, heuristic analysis, and player statistics.

## ✨ Core Features
- **📸 Vision LLM OCR:** Extracts PGN notation directly from physical scoresheet images using the Groq Vision API (Llama 3.2).
- **✅ Strict PGN Validation:** Validates move legality in real-time using `chesslib`.
- **📊 Player Analytics:** Tracks win rates, accuracy, and overall player performance.
- **⚡ Heuristic Engine:** Analyzes completed games to identify blunders, mistakes, and brilliant moves without requiring heavy external engines.

## 🏗️ Architecture
- **Frontend:** React, Vite, Tailwind CSS, Zustand
- **Backend:** Spring Boot 3, Java 17, Spring Security (JWT)
- **Database:** PostgreSQL (Production) / H2 (Fallback/Testing)
- **AI/OCR:** Groq Vision API (`llama-3.2-90b-vision-preview`)

## 🚀 Quick Start
See [INSTALLATION.md](INSTALLATION.md) for complete setup instructions.

## 📖 Documentation Directory
- [INSTALLATION.md](INSTALLATION.md): Setup and environment instructions.
- [USER_GUIDE.md](USER_GUIDE.md): End-user flow instructions.
- [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md): Edge cases and OCR constraints.
- `api_documentation.md`: Complete backend REST mapping.
- `architecture_diagrams.md`: Mermaid flow charts.
