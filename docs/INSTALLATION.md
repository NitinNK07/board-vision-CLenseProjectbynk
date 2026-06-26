# Installation & Setup Guide

## 1. Prerequisites
- **Node.js** (v18+)
- **Java** (v17+)
- **Maven** (v3.8+)
- **PostgreSQL** (v15+)

## 2. Environment Variables
You must set the following environment variable on your system for the OCR to function:
```bash
GROQ_API_KEY="gsk_your_api_key_here"
```

## 3. Database Setup
Create a PostgreSQL database named `clens_chess_db` on `localhost:5432` with username/password `postgres`/`postgres`.

## 4. Backend Setup
```bash
cd board-vision-app
./mvnw clean install
./mvnw spring-boot:run
```
The backend will start on `http://localhost:8082`.

## 5. Frontend Setup
```bash
cd board-vision
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.
