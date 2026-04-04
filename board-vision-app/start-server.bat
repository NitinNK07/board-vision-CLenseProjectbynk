@echo off
REM =====================================================
REM CLens Board Vision - Start Server Script
REM =====================================================

echo.
echo =============================================
echo Starting CLens Board Vision Backend
echo =============================================
echo.

REM Check if PostgreSQL is running
echo Checking PostgreSQL service...
sc query postgresql | findstr "RUNNING" >nul
if %errorlevel% neq 0 (
    echo PostgreSQL is not running. Starting it now...
    net start postgresql
    if %errorlevel% neq 0 (
        echo ERROR: Failed to start PostgreSQL!
        echo Please start PostgreSQL manually and try again.
        pause
        exit /b 1
    )
    echo PostgreSQL started successfully.
) else (
    echo PostgreSQL is running.
)
echo.

REM Start the Spring Boot application
echo Starting Spring Boot application...
echo Press Ctrl+C to stop the server.
echo.

call mvnw.cmd spring-boot:run

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Application failed to start!
    echo Check the logs above for details.
    pause
)
