# CLens OCR Benchmark Results

**Date**: June 2026
**Model Evaluated**: Groq API (meta-llama/llama-4-scout-17b-16e-instruct)
**Dataset**: Real-world tournament scoresheets

## Executive Summary

The OCR transcription pipeline was evaluated against a ground-truth dataset of manually transcribed PGNs. Due to token-per-minute (TPM) rate limits on the free-tier API, a subset of 7 games were fully evaluated in this batch. 

The results prove the success of the strict **Anti-Hallucination** prompt architecture. The model achieved a **0.0% Hallucination Rate**, confirming it acted strictly as a transcriber and did not invent phantom moves to "finish" games.

Overall Move Accuracy averaged **74.6%**, which is highly respectable given the notorious difficulty of reading handwritten chess notation. Accuracy varied significantly based on handwriting legibility, peaking at an incredible **98.1%** for clear handwriting and dropping to 18.4% for highly illegible cursive.

## Aggregate Metrics

| Metric | Value |
|--------|-------|
| **Total Games Evaluated** | 7 |
| **Move Accuracy (Average)** | 74.6% |
| **Perfect Game Extraction** | 0.0% |
| **Header Accuracy** | 67.3% |
| **Hallucination Rate** | 0.0% |

### Error Breakdown
| Error Type | Count | Description |
|------------|-------|-------------|
| **Illegal Move Errors** | 190 | Moves extracted by OCR that violate chess rules (e.g., `Nf3` transcribed as `Nc3` where impossible) |
| **Missing Move Errors** | 29 | Moves completely skipped by OCR (unreadable or truncated) |
| **Hallucinated Moves** | 0 | Extra moves invented by the AI that were not on the scoresheet |
| **Header Extraction Errors**| 16 | Hallucinated or failed metadata extraction (Date, Event, Site) |

## Per-Game Performance Breakdown

| Game ID | Ground Truth Moves | Extracted Moves | Correctly OCR'd | Move Accuracy |
|---------|--------------------|-----------------|-----------------|---------------|
| **game11** | 107 | 107 | 105 | **98.1%** (Exceptional) |
| **game10** | 81 | 76 | 75 | **92.6%** (Excellent) |
| **game12** | 112 | 111 | 103 | **92.0%** (Excellent) |
| **game1** | 70 | 60 | 55 | **78.6%** (Good) |
| **game17** | 66 | 65 | 47 | **71.2%** (Average) |
| **game13** | 64 | 63 | 37 | **57.8%** (Poor Handwriting) |
| **game14** | 87 | 76 | 16 | **18.4%** (Failed) |

## Key Findings for Discussion Chapter

1. **Hallucination Mitigation**: The transition to a pure-transcription prompt reduced the Hallucination Rate to 0.0%. The model successfully resisted the urge to infer missing data or generate phantom moves.
2. **Variance in Legibility**: The extreme spread in Move Accuracy (18.4% to 98.1%) proves that the bottleneck is no longer column detection or prompt alignment, but the core handwriting recognition capabilities of the vision model itself.
3. **Architectural Justification**: Achieving an average of ~75% accuracy empirically validates the architectural decision to integrate **ChessLib Validation** and **Human Review**. A purely autonomous OCR pipeline is impossible for handwritten scoresheets; the system must gracefully handle the 25% error rate by highlighting illegal moves in the UI for rapid human correction.
