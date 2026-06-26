# System Architecture and Diagrams

## 1. Overall System Architecture
This diagram illustrates the end-to-end data flow from the React frontend, through the Spring Boot backend, out to the Groq Vision LLM, and back through the ChessLib validation engine.

```mermaid
graph TD
    UI[React Frontend] -->|Axios HTTP/REST| SEC[JWT Security Filter]
    SEC -->|Authenticated| SB[Spring Boot Backend]
    
    SB -->|VisionScanService| GROQ[Groq Vision API]
    GROQ -.->|Raw Markdown| SB
    
    SB -->|PgnService| CHESS[ChessLib Validation]
    CHESS -.->|Validation Errors| CORR[PgnCorrectionService]
    CORR -.->|Heuristic Fixes| CHESS
    
    CHESS -.->|Validated PGN| SB
    SB -->|Hibernate/JPA| DB[(PostgreSQL)]
    
    SB -->|JSON Response| UI
```

## 2. Entity-Relationship (ER) Diagram
The core data model representing Users, their Games, and their aggregated Statistics.

```mermaid
erDiagram
    User ||--o{ ChessGame : "owns"
    User ||--|| PlayerStatistics : "has"
    User {
        int id PK
        string email
        string password_hash
        string role
        int trial_days
        int ad_scan_credits
    }
    ChessGame {
        int id PK
        int user_id FK
        text pgn_content
        string source
        string result
        boolean is_public
    }
    PlayerStatistics {
        int id PK
        int user_id FK
        int total_games
        int wins
        int losses
        float win_rate
    }
```

## 3. Sequence Diagram: Image Scan Flow
This sequence demonstrates the orchestration of a scan request, from the user upload to the final validated PGN result.

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React UI
    participant API as VisionScanController
    participant Scan as VisionScanService
    participant Groq as Groq API
    participant PGN as PgnValidationService
    participant DB as PostgreSQL
    
    User->>Frontend: Upload Scoresheet Image
    Frontend->>API: POST /api/scan/vision (Base64)
    API->>Scan: extractFENFromImage(base64)
    Scan->>Groq: Request Vision LLM completion
    Groq-->>Scan: Return Raw PGN Text
    Scan->>PGN: parseAndValidate(rawText)
    PGN-->>Scan: Validated PgnResult
    Scan->>DB: Save Game (Source: SCAN)
    DB-->>Scan: Success
    Scan-->>API: Return PgnResult
    API-->>Frontend: HTTP 200 OK
    Frontend-->>User: Render Chessboard
```

## 4. Class Diagram (Core Services)
Simplified representation of the core AI and validation service logic in the backend.

```mermaid
classDiagram
    class VisionScanService {
        -String primaryApiKey
        +extractFENFromImage(String base64) PgnResult
        -callGroq(String base64) String
    }
    
    class PgnValidationService {
        +parseAndValidate(String pgnText) PgnResult
        -extractMoves(String text) List~String~
    }
    
    class PgnCorrectionService {
        +attemptCorrections(Board board, String moveText) String
    }
    
    class HeuristicAnalysisService {
        +analyzeGame(ChessGame game) GameAnalysis
        -evaluatePosition(Board board) int
    }
    
    VisionScanService --> PgnValidationService : uses
    PgnValidationService --> PgnCorrectionService : fallback
    GameController --> HeuristicAnalysisService : uses
```
