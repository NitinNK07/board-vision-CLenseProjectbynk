# Fix ALL controller imports

$base = "D:\New folder\CLens\board-vision-app\src\main\java\CLens\pgn_backend\controller"

Get-ChildItem $base\*.java | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    
    # Add package if missing
    if ($content -notmatch '^package CLens\.pgn_backend\.controller') {
        $content = "package CLens.pgn_backend.controller;`n`n" + $content
    }
    
    # Add all necessary imports
    $imports = @"
import CLens.pgn_backend.service.*;
import CLens.pgn_backend.entity.*;
import CLens.pgn_backend.repository.*;
import CLens.pgn_backend.dto.*;
import CLens.pgn_backend.enums.Role;
"@
    
    # Check if imports section exists, if not add it after package
    if ($content -notmatch 'import CLens\.pgn_backend\.service') {
        $content = $content -replace '(package CLens\.pgn_backend\.controller;\r?\n)', "$1`n$imports`n"
    }
    
    Set-Content $file -Value $content -NoNewline
    Write-Host "✅ Fixed $($_.Name)"
}

Write-Host "`n=== All Controllers Fixed! ===" -ForegroundColor Green
