# Fix all remaining service files

$base = "D:\New folder\CLens\board-vision-app\src\main\java\CLens\pgn_backend\service"

# Fix StockfishAnalysisService
$file = "$base\StockfishAnalysisService.java"
$content = Get-Content $file -Raw
$content = $content -replace '^package CLens\.pgn_backend;', 'package CLens.pgn_backend.service;'
$content = $content -replace '(package CLens\.pgn_backend\.service;\r?\n)', "$1`nimport CLens.pgn_backend.dto.GameAnalysisDTO;`nimport CLens.pgn_backend.dto.GameAnalysisDTO.MoveEvaluation;`n"
Set-Content $file -Value $content -NoNewline
Write-Host "✅ Fixed StockfishAnalysisService"

# Fix VisionScanService  
$file = "$base\VisionScanService.java"
$content = Get-Content $file -Raw
if ($content -notmatch '^package') {
    $content = "package CLens.pgn_backend.service;`n`n" + $content
}
Set-Content $file -Value $content -NoNewline
Write-Host "✅ Fixed VisionScanService"

Write-Host "`n=== Service Files Fixed! ===" -ForegroundColor Green
