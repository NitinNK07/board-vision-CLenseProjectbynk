# PostgreSQL Database Setup Guide for CLens Board Vision

This guide will help you set up PostgreSQL database for the CLens Board Vision backend.

## Why PostgreSQL?

PostgreSQL was chosen over MySQL for this project because:
- **Better JSON support** - Perfect for storing chess analysis data and move variations
- **Advanced full-text search** - Search PGN content, opening names, tournament data efficiently
- **Superior concurrency** - Multiple users can scan games simultaneously without performance issues
- **Complex query support** - Player statistics, game search with multiple filters work better
- **Data integrity** - Strict ACID compliance for critical game records and user data
- **Scalability** - Better for growing user base and analytics features

---

## Step 1: Install PostgreSQL

### Windows

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (postgresql-15.x-windows.exe)
3. During installation:
   - Set password for `postgres` superuser (remember this!)
   - Default port: 5432
   - Default locale: English
4. Add PostgreSQL bin directory to PATH (optional but recommended):
   ```
   C:\Program Files\PostgreSQL\15\bin
   ```

### Alternative: Using Docker

If you prefer Docker:

```bash
docker run --name clens-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=clens_chess_db \
  -p 5432:5432 \
  -d postgres:15
```

---

## Step 2: Create Database

### Option A: Using pgAdmin (GUI)

1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect to PostgreSQL server (use password set during installation)
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `clens_chess_db`
5. Click "Save"

### Option B: Using Command Line

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Create database
CREATE DATABASE clens_chess_db;

# Exit psql
\q
```

### Option C: Using PowerShell/Command Prompt

```bash
# Create database (you'll be prompted for password)
createdb -U postgres clens_chess_db
```

---

## Step 3: Configure Database User (Optional but Recommended)

For production, create a dedicated user instead of using `postgres` superuser:

```bash
psql -U postgres -d clens_chess_db

-- Create a new user
CREATE USER clens_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE clens_chess_db TO clens_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO clens_user;

-- Exit
\q
```

Then update `application.properties`:
```properties
spring.datasource.username=clens_user
spring.datasource.password=your_secure_password
```

---

## Step 4: Update Application Configuration

The `application.properties` file is already configured for PostgreSQL:

```properties
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/clens_chess_db
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Hibernate DDL Auto - 'update' preserves data on restart
spring.jpa.hibernate.ddl-auto=update
```

**Important:** Change the password in production!

---

## Step 5: Environment Variables (Recommended for Production)

Instead of hardcoding credentials in `application.properties`, use environment variables:

### Windows (PowerShell)

```powershell
$env:DB_PASSWORD="your_secure_password"
$env:JWT_SECRET="your_very_long_and_secure_jwt_secret_key_here"
$env:MAIL_PASSWORD="your_gmail_app_password"
```

### Linux/Mac

```bash
export DB_PASSWORD="your_secure_password"
export JWT_SECRET="your_very_long_and_secure_jwt_secret_key_here"
export MAIL_PASSWORD="your_gmail_app_password"
```

### Using .env File (with spring-dotenv)

Create a `.env` file in the project root:

```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
MAIL_PASSWORD=your_gmail_app_password
```

---

## Step 6: Run Database Initialization Script (Optional)

The application will auto-create tables using Hibernate, but you can also run the initialization script manually:

```bash
psql -U postgres -d clens_chess_db -f src/main/resources/db/init.sql
```

This script creates:
- Custom enum types (role, source)
- All tables with constraints
- Indexes for performance
- Full-text search indexes for PGN content
- Triggers for auto-updating timestamps

---

## Step 7: Start the Application

### Using Maven

```bash
cd board-vision-app
mvn spring-boot:run
```

### Using JAR

```bash
cd board-vision-app
mvn clean package
java -jar target/pgn-backend-0.0.1-SNAPSHOT.jar
```

### Using IDE

Run `Application.java` from your IDE (IntelliJ, Eclipse, VS Code)

---

## Step 8: Verify Database Connection

### Check Application Logs

You should see:
```
Hibernate: create table users (...)
Hibernate: create table chess_games (...)
Hibernate: create table game_analysis (...)
Hibernate: create table player_statistics (...)
```

### Using pgAdmin

1. Open pgAdmin
2. Connect to `clens_chess_db`
3. Expand "Schemas" → "public" → "Tables"
4. You should see: `users`, `chess_games`, `game_analysis`, `player_statistics`, `otp_codes`

### Using Command Line

```bash
psql -U postgres -d clens_chess_db

# List all tables
\dt

# View table structure
\d users
\d chess_games

# Exit
\q
```

---

## Step 9: Test User Registration

Test that data persists after server restart:

```bash
# Register a new user
curl -X POST http://localhost:8082/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "PLAYER"
  }'
```

**Expected Response:**
```json
{
  "message": "Signup successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "PLAYER"
  }
}
```

### Verify Data Persistence

1. **Stop the application** (Ctrl+C)
2. **Restart the application**
3. **Try logging in** with the same credentials:

```bash
curl -X POST http://localhost:8082/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

✅ **If login succeeds, data is persisting correctly!**

---

## Troubleshooting

### Error: "Connection refused"

**Cause:** PostgreSQL is not running

**Solution:**
```bash
# Windows - Check Services
services.msc
# Find "postgresql-x64-15" and start it

# Or using command line
net start postgresql-x64-15

# Linux
sudo systemctl start postgresql
```

### Error: "Database does not exist"

**Cause:** Database `clens_chess_db` was not created

**Solution:**
```bash
psql -U postgres -c "CREATE DATABASE clens_chess_db;"
```

### Error: "Password authentication failed"

**Cause:** Wrong password in `application.properties`

**Solution:** Update password in `application.properties` or reset PostgreSQL password:
```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'new_password';
\q
```

### Error: "Port 5432 already in use"

**Cause:** Another PostgreSQL instance is running

**Solution:**
```bash
# Find process using port 5432
netstat -ano | findstr :5432

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Hibernate creates tables but data is lost on restart

**Cause:** `ddl-auto` is set to `create` or `create-drop`

**Solution:** Ensure `application.properties` has:
```properties
spring.jpa.hibernate.ddl-auto=update
```

---

## Database Schema Overview

```
users
├── id (BIGSERIAL, PK)
├── name (VARCHAR)
├── email (VARCHAR, UNIQUE)
├── email_verified (BOOLEAN)
├── phone_number (VARCHAR)
├── phone_verified (BOOLEAN)
├── password_hash (VARCHAR)
├── role (ENUM: PLAYER, ARBITER)
├── trial_start (DATE)
├── trial_days (INTEGER)
├── trial_daily_limit (INTEGER)
├── trial_counter_day (DATE)
├── trial_used_today (INTEGER)
├── ad_scan_credits (INTEGER)
├── paid_scan_credits (INTEGER)
└── created_at (TIMESTAMP)

chess_games
├── id (BIGSERIAL, PK)
├── user_id (BIGINT, FK → users.id)
├── white_player (VARCHAR)
├── black_player (VARCHAR)
├── pgn_content (TEXT)
├── event (VARCHAR)
├── site (VARCHAR)
├── game_date (DATE)
├── round (VARCHAR)
├── result (VARCHAR: 1-0, 0-1, 1/2-1/2, *)
├── white_elo (INTEGER)
├── black_elo (INTEGER)
├── eco (VARCHAR)
├── opening (VARCHAR)
├── total_moves (INTEGER)
├── source (ENUM: SCAN, UPLOAD, IMPORT)
├── is_public (BOOLEAN)
├── is_tournament (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

game_analysis
├── id (BIGSERIAL, PK)
├── game_id (BIGINT, UNIQUE FK → chess_games.id)
├── accuracy_white (DOUBLE)
├── accuracy_black (DOUBLE)
├── blunders_white/black (INTEGER)
├── mistakes_white/black (INTEGER)
├── inaccuracies_white/black (INTEGER)
├── evaluation_data (TEXT, JSON)
└── analyzed_at (TIMESTAMP)

player_statistics
├── id (BIGSERIAL, PK)
├── player_id (BIGINT, UNIQUE FK → users.id)
├── total_games (INTEGER)
├── wins/losses/draws (INTEGER)
├── win_rate (DOUBLE)
├── games_as_white/black (INTEGER)
├── average_accuracy (DOUBLE)
├── most_played_opening (VARCHAR)
├── recent_form (VARCHAR)
└── updated_at (TIMESTAMP)
```

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Add `application.properties` to `.gitignore`
   - Use `application.properties.example` with placeholder values

2. **Use environment variables in production**
   ```properties
   spring.datasource.password=${DB_PASSWORD}
   app.jwt.secret=${JWT_SECRET}
   ```

3. **Use strong passwords**
   - Database password: minimum 16 characters
   - JWT secret: minimum 64 characters, base64 encoded

4. **Enable SSL for PostgreSQL (production)**
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/clens_chess_db?ssl=true
   ```

5. **Restrict database user privileges**
   - Don't use `postgres` superuser in production
   - Create dedicated user with limited privileges

---

## Next Steps

After setting up the database:

1. ✅ Test user registration and login
2. ✅ Test PGN import and scan functionality
3. ✅ Verify data persists after server restart
4. ✅ Test game history retrieval
5. ✅ Test player statistics calculation

---

**Support:** If you encounter any issues, check the application logs and PostgreSQL logs:
- Application logs: Console output or `logs/` directory
- PostgreSQL logs: `C:\Program Files\PostgreSQL\15\data\log\` (Windows) or `/var/log/postgresql/` (Linux)
