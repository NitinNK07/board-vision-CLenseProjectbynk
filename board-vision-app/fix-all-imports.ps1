# PowerShell script to fix all remaining import issues

$base = "D:\New folder\CLens\board-vision-app\src\main\java\CLens\pgn_backend"
cd $base

Write-Host "=== Fixing Remaining Import Issues ===" -ForegroundColor Green

# Fix all service files - add Role import where missing
Write-Host "Fixing service files..." -ForegroundColor Cyan
Get-ChildItem service\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Add package declaration if missing
    if ($content -notmatch '^package') {
        $content = "package CLens.pgn_backend.service;`n`n" + $content
    }
    
    # Add Role import if missing and Role is used
    if ($content -match '\bRole\b' -and $content -notmatch 'import.*\.enums\.Role') {
        $content = $content -replace '(package CLens\.pgn_backend\.service;\r?\n)', "$1`nimport CLens.pgn_backend.enums.Role;`n"
    }
    
    # Fix repository imports
    $content = $content -replace 'import CLens\.pgn_backend\.UserRepository;', 'import CLens.pgn_backend.repository.UserRepository;'
    $content = $content -replace 'import CLens\.pgn_backend\.ChessGameRepository;', 'import CLens.pgn_backend.repository.ChessGameRepository;'
    $content = $content -replace 'import CLens\.pgn_backend\.PlayerStatisticsRepository;', 'import CLens.pgn_backend.repository.PlayerStatisticsRepository;'
    $content = $content -replace 'import CLens\.pgn_backend\.GameAnalysisRepository;', 'import CLens.pgn_backend.repository.GameAnalysisRepository;'
    
    # Fix entity imports
    $content = $content -replace 'import CLens\.pgn_backend\.User;', 'import CLens.pgn_backend.entity.User;'
    $content = $content -replace 'import CLens\.pgn_backend\.ChessGame;', 'import CLens.pgn_backend.entity.ChessGame;'
    $content = $content -replace 'import CLens\.pgn_backend\.GameAnalysis;', 'import CLens.pgn_backend.entity.GameAnalysis;'
    $content = $content -replace 'import CLens\.pgn_backend\.PlayerStatistics;', 'import CLens.pgn_backend.entity.PlayerStatistics;'
    
    Set-Content $_.FullName -Value $content -NoNewline
}

# Fix all controller files
Write-Host "Fixing controller files..." -ForegroundColor Cyan
Get-ChildItem controller\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Add package declaration if missing
    if ($content -notmatch '^package CLens\.pgn_backend\.controller') {
        $content = "package CLens.pgn_backend.controller;`n`n" + $content
    }
    
    # Fix service imports
    $content = $content -replace 'import CLens\.pgn_backend\.service\.', 'import CLens.pgn_backend.service.'
    
    # Fix entity imports
    $content = $content -replace 'import CLens\.pgn_backend\.User;', 'import CLens.pgn_backend.entity.User;'
    $content = $content -replace 'import CLens\.pgn_backend\.ChessGame;', 'import CLens.pgn_backend.entity.ChessGame;'
    $content = $content -replace 'import CLens\.pgn_backend\.PlayerStatistics;', 'import CLens.pgn_backend.entity.PlayerStatistics;'
    $content = $content -replace 'import CLens\.pgn_backend\.GameAnalysis;', 'import CLens.pgn_backend.entity.GameAnalysis;'
    
    # Fix repository imports
    $content = $content -replace 'import CLens\.pgn_backend\.UserRepository;', 'import CLens.pgn_backend.repository.UserRepository;'
    
    # Fix DTO imports
    $content = $content -replace 'import CLens\.pgn_backend\.dto\.', 'import CLens.pgn_backend.dto.'
    
    Set-Content $_.FullName -Value $content -NoNewline
}

# Fix security files
Write-Host "Fixing security files..." -ForegroundColor Cyan
Get-ChildItem security\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Add package declaration if missing
    if ($content -notmatch '^package CLens\.pgn_backend\.security') {
        $content = "package CLens.pgn_backend.security;`n`n" + $content
    }
    
    # Fix entity and repository imports
    $content = $content -replace 'import CLens\.pgn_backend\.User;', 'import CLens.pgn_backend.entity.User;'
    $content = $content -replace 'import CLens\.pgn_backend\.UserRepository;', 'import CLens.pgn_backend.repository.UserRepository;'
    
    Set-Content $_.FullName -Value $content -NoNewline
}

# Fix DTO files
Write-Host "Fixing DTO files..." -ForegroundColor Cyan
Get-ChildItem dto\*.java | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Add package declaration if missing
    if ($content -notmatch '^package CLens\.pgn_backend\.dto') {
        $content = "package CLens.pgn_backend.dto;`n`n" + $content
    }
    
    # Fix Role import
    $content = $content -replace 'import CLens\.pgn_backend\.Role;', 'import CLens.pgn_backend.enums.Role;'
    
    Set-Content $_.FullName -Value $content -NoNewline
}

Write-Host "`n=== All Imports Fixed! ===" -ForegroundColor Green
Write-Host "`nNow compile with: .\mvnw.cmd clean compile" -ForegroundColor Yellow
