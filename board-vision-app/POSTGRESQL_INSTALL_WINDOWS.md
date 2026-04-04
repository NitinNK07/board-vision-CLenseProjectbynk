# PostgreSQL Installation Guide - Windows

## Step-by-Step Installation

### Step 1: Download PostgreSQL

1. **Visit the download page:**
   - Go to: https://www.postgresql.org/download/windows/
   - OR directly to EnterpriseDB: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Choose the latest version:**
   - Click "Download PostgreSQL 15.x" (or latest stable version)
   - Select "Windows x86-64" installer
   - File will be named: `postgresql-15.x-1-windows-x64.exe`

---

### Step 2: Run the Installer

1. **Double-click the downloaded .exe file**

2. **Installation Directory:**
   - Default: `C:\Program Files\PostgreSQL\15`
   - Click **Next**

3. **Select Components:**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (GUI for database management)
   - ✅ Command Line Tools
   - ✅ Stack Builder (optional, can skip)
   - Click **Next**

4. **Data Directory:**
   - Default: `C:\Program Files\PostgreSQL\15\data`
   - Click **Next**

5. **Password Configuration** ⚠️ **IMPORTANT**
   - Enter password for `postgres` superuser
   - **Recommended:** `postgres` (for development)
   - **Production:** Use a strong password (16+ characters)
   - **Write this down!** You'll need it later
   - Click **Next**

6. **Port:**
   - Default: `5432`
   - Keep this default (used in application.properties)
   - Click **Next**

7. **Locale:**
   - Default: `Default locale`
   - Click **Next**

8. **Review and Install:**
   - Click **Next** to start installation
   - Wait for installation to complete (5-10 minutes)

9. **Stack Builder:**
   - Uncheck "Launch Stack Builder"
   - Click **Finish**

---

### Step 3: Verify Installation

#### Method 1: Check Windows Services

1. Press `Win + R`
2. Type: `services.msc`
3. Press Enter
4. Look for: `postgresql-x64-15`
5. Status should be: **Running**

#### Method 2: Using Command Line

```bash
# Open Command Prompt or PowerShell
psql --version

# Expected output:
# psql (PostgreSQL) 15.x
```

#### Method 3: Open pgAdmin

1. Press `Win` key
2. Search for: `pgAdmin 4`
3. Click to open
4. You'll see a browser-based interface
5. Expand "Servers" → "PostgreSQL 15"
6. Enter password you set during installation
7. ✅ If connected successfully, you'll see databases list

---

### Step 4: Create Database for CLens

#### Option A: Using pgAdmin (GUI - Recommended)

1. **Open pgAdmin 4**

2. **Connect to PostgreSQL:**
   - Click on "PostgreSQL 15"
   - Enter password
   - Click "OK"

3. **Create Database:**
   - Right-click on "Databases"
   - Select "Create" → "Database..."
   - Database name: `clens_chess_db`
   - Owner: `postgres`
   - Click "Save"

4. **Verify:**
   - You should see `clens_chess_db` in the databases list

#### Option B: Using Command Line

```bash
# Open Command Prompt
cd "C:\Program Files\PostgreSQL\15\bin"

# Connect to PostgreSQL
psql -U postgres

# Enter password when prompted

# Create database
CREATE DATABASE clens_chess_db;

# Verify database was created
\l

# Exit
\q
```

---

### Step 5: Update CLens Application Configuration

1. **Open file:**
   ```
   D:\New folder\CLens\board-vision-app\src\main\resources\application.properties
   ```

2. **Update password (line 6):**
   ```properties
   # If you used 'postgres' as password during installation:
   spring.datasource.password=postgres
   
   # If you used a different password, use that instead:
   spring.datasource.password=YOUR_PASSWORD_HERE
   ```

3. **Save the file**

---

### Step 6: Add PostgreSQL to PATH (Optional but Convenient)

This allows you to run `psql` from any directory.

1. **Find PostgreSQL bin directory:**
   ```
   C:\Program Files\PostgreSQL\15\bin
   ```

2. **Add to PATH:**
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Press Enter
   - Click "Advanced" tab
   - Click "Environment Variables"
   - Under "System variables", find and select "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\PostgreSQL\15\bin`
   - Click "OK" on all windows

3. **Verify:**
   - Open a NEW Command Prompt
   - Type: `psql --version`
   - Should show version (works from any directory now)

---

### Step 7: Start the CLens Backend

```bash
# Open Command Prompt or PowerShell
cd "D:\New folder\CLens\board-vision-app"

# Run the application
.\mvnw.cmd spring-boot:run
```

**Expected Output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.4.11)

... (various startup logs)

Hibernate: create table users (...)
Hibernate: create table chess_games (...)
Hibernate: create table game_analysis (...)
Hibernate: create table player_statistics (...)

... (more logs)

Started Application in X.XXX seconds
```

✅ **If you see "Started Application", everything is working!**

---

### Step 8: Test User Registration & Persistence

#### Test 1: Register a New User

```bash
curl -X POST http://localhost:8082/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"role\":\"PLAYER\"}"
```

**Expected Response:**
```json
{
  "message": "Signup successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "PLAYER"
  }
}
```

#### Test 2: Verify in Database

1. **Open pgAdmin 4**
2. **Navigate to:**
   - Servers → PostgreSQL 15 → Databases → clens_chess_db
   - Right-click on `clens_chess_db` → "Query Tool"
3. **Run query:**
   ```sql
   SELECT id, name, email, role, created_at FROM users;
   ```
4. **Expected:** You should see your newly created user!

#### Test 3: Restart Server & Login

1. **Stop the application** (Ctrl+C in terminal)

2. **Restart the application:**
   ```bash
   .\mvnw.cmd spring-boot:run
   ```

3. **Login with same credentials:**
   ```bash
   curl -X POST http://localhost:8082/auth/login ^
     -H "Content-Type: application/json" ^
     -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
   ```

4. **Expected Response:**
   ```json
   {
     "message": "Login successful",
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "name": "John Doe",
       "email": "john@example.com",
       "role": "PLAYER"
     }
   }
   ```

✅ **If login succeeds, data persistence is working!**

---

## 🔧 Troubleshooting

### Error: "Connection refused" or "Cannot connect to database"

**Cause:** PostgreSQL service is not running

**Solution:**
```bash
# Method 1: Using Services
1. Press Win + R
2. Type: services.msc
3. Find: postgresql-x64-15
4. Right-click → Start

# Method 2: Using Command Line (Admin)
net start postgresql-x64-15
```

---

### Error: "Password authentication failed"

**Cause:** Wrong password in application.properties

**Solution:**
1. Open `application.properties`
2. Update password to match what you set during installation
3. Restart application

---

### Error: "Database does not exist"

**Cause:** Database `clens_chess_db` was not created

**Solution:**
```bash
psql -U postgres -c "CREATE DATABASE clens_chess_db;"
```

---

### Error: "Port 5432 already in use"

**Cause:** Another PostgreSQL instance is running

**Solution:**
```bash
# Find process using port 5432
netstat -ano | findstr :5432

# Stop the conflicting service
# (be careful not to stop the wrong service)
```

---

### Error: "psql is not recognized"

**Cause:** PostgreSQL bin directory not in PATH

**Solution:**
1. Use full path: `"C:\Program Files\PostgreSQL\15\bin\psql.exe"`
2. OR add to PATH (see Step 6 above)

---

## 📊 Verify Database Tables

After running the application, verify tables were created:

### Using pgAdmin:

1. Open pgAdmin 4
2. Navigate to: `clens_chess_db` → Schemas → public → Tables
3. You should see:
   - ✅ users
   - ✅ chess_games
   - ✅ game_analysis
   - ✅ player_statistics
   - ✅ otp_codes

### Using Command Line:

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

## 🎯 Quick Reference

### PostgreSQL Service Commands (Admin Command Prompt)

```bash
# Start PostgreSQL
net start postgresql-x64-15

# Stop PostgreSQL
net stop postgresql-x64-15

# Restart PostgreSQL
net restart postgresql-x64-15
```

### Common psql Commands

```bash
# Connect to database
psql -U postgres -d clens_chess_db

# List databases
\l

# List tables
\dt

# Describe table
\d users

# Run SQL query
SELECT * FROM users;

# Exit
\q
```

---

## ✅ Installation Checklist

- [ ] Downloaded PostgreSQL installer
- [ ] Installed PostgreSQL with default settings
- [ ] Set password for `postgres` user
- [ ] Verified PostgreSQL service is running
- [ ] Created database `clens_chess_db`
- [ ] Updated password in `application.properties`
- [ ] Started CLens backend application
- [ ] Registered test user
- [ ] Verified user in database (pgAdmin)
- [ ] Restarted server and logged in successfully

---

## 📞 Need Help?

If you encounter any issues:

1. **Check application logs** - Look for error messages
2. **Check PostgreSQL logs** - Located at:
   ```
   C:\Program Files\PostgreSQL\15\data\log\
   ```
3. **Verify service is running** - Check Windows Services
4. **Double-check password** - Ensure it matches in application.properties

---

**You're all set! PostgreSQL is now running and your CLens backend is connected!** 🎉
