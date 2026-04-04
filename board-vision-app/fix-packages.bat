@echo off
REM Fix package declarations in all moved files

REM Fix entity package declarations
echo Fixing entity files...
(for %%f in (entity\*.java) do (
    powershell -Command "(Get-Content '%%f') -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.entity;' | Set-Content '%%f'"
))

REM Fix service package declarations  
echo Fixing service files...
(for %%f in (service\*.java) do (
    powershell -Command "(Get-Content '%%f') -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.service;' | Set-Content '%%f'"
))

REM Fix repository package declarations
echo Fixing repository files...
(for %%f in (repository\*.java) do (
    powershell -Command "(Get-Content '%%f') -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.repository;' | Set-Content '%%f'"
))

REM Fix enums package declarations
echo Fixing enum files...
(for %%f in (enums\*.java) do (
    powershell -Command "(Get-Content '%%f') -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.enums;' | Set-Content '%%f'"
))

REM Fix security package declarations
echo Fixing security files...
(for %%f in (security\*.java) do (
    powershell -Command "(Get-Content '%%f') -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.security;' | Set-Content '%%f'"
))

REM Fix config package declarations
echo Fixing config files...
(for %%f in (config\*.java) do (
    powershell -Command "(Get-Content '%%f') -replace 'package CLens\.pgn_backend;', 'package CLens.pgn_backend.config;' | Set-Content '%%f'"
))

echo Done! Package declarations updated.
pause
