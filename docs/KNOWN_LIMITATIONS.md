# Known Limitations

As part of the academic evaluation of the CLens project, the following limitations have been documented:

1. **Illegible Handwriting:** The Vision LLM (`llama-3.2-90b-vision-preview`) cannot reliably decipher highly cursive or messy handwriting. Tests show a 65% failure rate on severely degraded scoresheets.
2. **Strict Legality Validation:** Because chess notation is sequentially dependent, a single OCR mistake (e.g. interpreting `Nf3` as `Bf3`) will cause the remaining PGN to be marked as illegal.
3. **Rate Limiting:** The free tier of the Groq API limits requests to 30 requests per minute (RPM). Heavy batch uploads will result in `429 Too Many Requests`.
4. **Heuristic Analysis vs Engine:** The `HeuristicAnalysisService` uses algorithmic approximations (material count, center control) rather than full-depth Stockfish trees. While performant, it is not as precise as a dedicated native C++ engine.
