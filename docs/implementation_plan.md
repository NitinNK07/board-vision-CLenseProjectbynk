# Final Documentation & JavaDoc Implementation Plan

This plan covers the final 4 documentation tasks to make CLens submission-ready for your viva and thesis. 

## User Review Required

> [!IMPORTANT]
> **PDF Generation Limitation:** I cannot natively generate a `.pdf` file. I will generate `benchmark_report.md` and `benchmark_report.csv`. You can simply open the `.md` file in VS Code or GitHub and click "Print to PDF" to get a perfect PDF for your thesis. Is this acceptable?
> 
> **JavaDoc Changes:** Adding JavaDocs will require modifying every single Controller, Service, Repository, and DTO file. While no functional logic will change, it will touch dozens of files. Please approve this bulk modification under the Code Freeze.

## Proposed Changes

### 1. API Documentation (Appendix A)
I will generate an `api_documentation.md` artifact containing:
- Complete REST endpoints.
- Methods, Request/Response Bodies, and JWT Requirements.
- Validation rules, Error Codes, and Sample JSON for each endpoint.

### 2. Architecture & Diagrams
I will generate an `architecture_diagrams.md` artifact containing Mermaid.js diagrams for:
- Overall Architecture (React -> Spring Boot -> Groq -> ChessLib -> PostgreSQL)
- Entity-Relationship (ER) Diagram (User, ChessGame, PlayerStatistics)
- Class Diagram (Core Services)
- Sequence Diagram (Scan Flow)

### 3. JavaDocs
I will add industry-grade block comments (`/** ... */`) to:
- **12 Controllers**
- **12 Services**
- **4 Entities & Repositories**
- **DTOs**

#### [MODIFY] Multiple Backend Files
This will be a massive search-and-replace operation across the backend to insert class-level and method-level documentation. No code logic will be altered.

### 4. Benchmark Report Generator
I will run a script to parse the `OcrBenchmarkTest` logs and output:
#### [NEW] benchmark_report.md
Markdown report with graphs (represented as markdown charts or tables), error distribution, and observations.
#### [NEW] benchmark_report.csv
Raw data in CSV format for importing into Excel/Sheets.

## Verification Plan
1. Ensure `mvnw compile` still passes after all JavaDocs are injected.
2. Verify all markdown files render correctly in the IDE.
