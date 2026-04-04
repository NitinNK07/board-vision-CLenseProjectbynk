# 🚀 CLens Board Vision - Quick Start

## ✅ Setup Complete!

All backend work is done. Ready to start!

---

## 🎯 Start the Server (2 Easy Steps)

### Step 1: Open Command Prompt

Press `Win + R`, type `cmd`, press Enter

### Step 2: Run These Commands

```bash
cd "D:\New folder\CLens\board-vision-app"
start-server.bat
```

**That's it!** The server will start automatically.

---

## ✅ What You'll See

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.4.11)

... (logs) ...

Started Application in X.XXX seconds
```

**When you see "Started Application", the server is ready!** ✅

---

## 🧪 Quick Test

Open a **new** Command Prompt and run:

```bash
curl -X POST http://localhost:8082/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"password\":\"pass123\",\"role\":\"PLAYER\"}"
```

**Expected:** Signup successful with access token! 🎉

---

## 📋 Important Info

| Item | Value |
|------|-------|
| **Server URL** | http://localhost:8082 |
| **Database** | clens_chess_db |
| **DB Port** | 5432 |
| **DB User** | postgres |
| **DB Password** | postgres |

---

## 🛑 Stop the Server

Press `Ctrl + C` in the server window

---

## 📖 Full Documentation

- `SETUP_COMPLETE.md` - Complete setup summary
- `API_REFERENCE.md` - API usage examples
- `POSTGRESQL_SETUP_GUIDE.md` - Database details

---

## 🎯 Your Turn!

1. ✅ Run `start-server.bat`
2. ✅ Wait for "Started Application"
3. ✅ Test with curl command above
4. ✅ Connect frontend to backend

**Everything is ready! Just start the server!** 🚀
