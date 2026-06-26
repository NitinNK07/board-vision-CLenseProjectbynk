# OCR Benchmark Dataset

This directory contains the ground truth and test images for measuring the accuracy of the CLens OCR pipeline.

## Structure

*   `images/`: Place your raw scoresheet photos here (e.g., `game_001.jpg`).
*   `ground-truth/`: Place the correct, perfectly transcribed PGN for each image here (e.g., `game_001.pgn`).

## How to use

1.  Add at least 10-50 pairs of images and `.pgn` files. Ensure the base filenames match exactly.
2.  Run the benchmark using the `OcrBenchmarkTest` or via a custom API endpoint.
3.  The framework will compare the OCR output against your ground truth and produce a comprehensive report.
