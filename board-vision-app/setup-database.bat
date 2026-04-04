@echo off
REM =====================================================
REM CLens Board Vision - PostgreSQL Setup Script
REM =====================================================

echo.
echo =============================================
echo CLens Board Vision - PostgreSQL Setup
echo =============================================
echo.

REM Check if PostgreSQL is running
echo [1/5] Checking PostgreSQL service...
sc query postgresql | findstr "RUNNING" >nul
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL service is running
) else (
    echo ✗ PostgreSQL service is not running
    echo Starting PostgreSQL service...
    net start postgresql
    if %errorlevel% equ 0 (
        echo ✓ PostgreSQL started successfully
    ) else (
        echo ✗ Failed to start PostgreSQL. Please start it manually.
        pause
        exit /b 1
    )
)
echo.

REM Check if clens_chess_db exists
echo [2/5] Checking database 'clens_chess_db'...
"D:\sysrem\pgsql\bin\psql.exe" -U postgres -lqt | findstr "clens_chess_db" >nul
if %errorlevel% equ 0 (
    echo ✓ Database 'clens_chess_db' already exists
) else (
    echo Creating database 'clens_chess_db'...
    "D:\sysrem\pgsql\bin\createdb.exe" -U postgres clens_chess_db
    if %errorlevel% equ 0 (
        echo ✓ Database created successfully
    ) else (
        echo ✗ Failed to create database
        pause
        exit /b 1
    )
)
echo.

REM Verify database connection
echo [3/5] Verifying database connection...
"D:\sysrem\pgsql\bin\psql.exe" -U postgres -d clens_chess_db -c "SELECT version();" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Database connection successful
) else (
    echo ✗ Cannot connect to database
    pause
    exit /b 1
)
echo.

REM Check application.properties
echo [4/5] Checking application.properties...
if exist "src\main\resources\application.properties" (
    echo ✓ application.properties found
) else (
    echo ✗ application.properties not found
    pause
    exit /b 1
)
echo.

REM Build the application
echo [5/5] Building application...
call mvnw.cmd clean compile
if %errorlevel% equ 0 (
    echo ✓ Build successful
) else (
    echo ✗ Build failed
    pause
    exit /b 1
)
echo.

echo =============================================
echo Setup Complete!
echo =============================================
echo.
echo PostgreSQL is running with database: clens_chess_db
echo Application is ready to start.
echo.
echo To start the application, run:
echo   .\mvnw.cmd spring-boot:run
echo.
echo Or use the start-server.bat script.
echo.
pause
