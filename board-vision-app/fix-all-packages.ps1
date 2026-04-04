# Complete Backend Fix Script
# Run this in PowerShell as Administrator

$base = "D:\New folder\CLens\board-vision-app\src\main\java\CLens\pgn_backend"
cd $base

Write-Host "=== Fixing All Package Declarations ===" -ForegroundColor Green

# 1. Fix entity files
Write-Host "Fixing entity files..." -ForegroundColor Cyan
Get-ChildItem entity\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.entity;'
    Set-Content $_.FullName -Value $content -NoNewline
}

# 2. Fix service files
Write-Host "Fixing service files..." -ForegroundColor Cyan
Get-ChildItem service\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.service;'
    # Add entity imports where needed
    if ($_.Name -like "*Service.java") {
        $content = Get-Content $_.FullName -Raw
        if ($content -notmatch "import CLens\.pgn_backend\.entity\.") {
            $content = $content -replace '(package CLens\.pgn_backend\.service;\r?\n)', "$1`nimport CLens.pgn_backend.entity.ChessGame;`nimport CLens.pgn_backend.entity.User;`nimport CLens.pgn_backend.entity.GameAnalysis;`nimport CLens.pgn_backend.entity.PlayerStatistics;`n"
            Set-Content $_.FullName -Value $content -NoNewline
        }
    }
}

# 3. Fix repository files (already done manually, but ensure all are fixed)
Write-Host "Fixing repository files..." -ForegroundColor Cyan
Get-ChildItem repository\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.repository;'
    Set-Content $_.FullName -Value $content -NoNewline
}

# 4. Fix controller files
Write-Host "Fixing controller files..." -ForegroundColor Cyan
Get-ChildItem controller\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.controller;'
    Set-Content $_.FullName -Value $content -NoNewline
}

# 5. Fix enums files
Write-Host "Fixing enums files..." -ForegroundColor Cyan
Get-ChildItem enums\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.enums;'
    Set-Content $_.FullName -Value $content -NoNewline
}

# 6. Fix security files
Write-Host "Fixing security files..." -ForegroundColor Cyan
Get-ChildItem security\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.security;'
    Set-Content $_.FullName -Value $content -NoNewline
}

# 7. Fix config files
Write-Host "Fixing config files..." -ForegroundColor Cyan
Get-ChildItem config\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.config;'
    Set-Content $_.FullName -Value $content -NoNewline
}

# 8. Move PgnResult to dto if it exists in root
if (Test-Path "PgnResult.java") {
    Write-Host "Moving PgnResult to dto folder..." -ForegroundColor Cyan
    Move-Item PgnResult.java dto\ -Force
    $content = Get-Content dto\PgnResult.java -Raw
    $content = $content -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.dto;'
    Set-Content dto\PgnResult.java -Value $content -NoNewline
}

Write-Host "`n=== All Package Declarations Fixed! ===" -ForegroundColor Green
Write-Host "`nNow compile with: .\mvnw.cmd clean compile" -ForegroundColor Yellow
