# AdaptLearn — Adaptive Learning Platform

A full-stack AI-powered learning platform with knowledge graphs, personalized quizzes, and Bayesian Knowledge Tracing.

**Tech Stack:** React 18 · FastAPI · Neo4j · PostgreSQL · Groq AI (LLaMA 3) · JWT Auth · BKT Algorithm

---

## COMPLETE BEGINNER SETUP GUIDE

Read this from top to bottom. Don't skip steps.

---

## STEP 1 — What You Need to Install First

### 1A. Install Python 3.11+
- Go to https://www.python.org/downloads/
- Download Python 3.11 or newer
- During installation on Windows: CHECK the box "Add Python to PATH"
- Verify: open Terminal/Command Prompt and type: `python --version`
- You should see: `Python 3.11.x`

### 1B. Install Node.js 18+
- Go to https://nodejs.org
- Download the LTS version (Long Term Support)
- Install it (just click Next, Next, Finish)
- Verify: open Terminal and type: `node --version`
- You should see: `v18.x.x` or higher

### 1C. Install Docker Desktop
Docker lets you run databases without installing them manually.
- Go to https://www.docker.com/products/docker-desktop/
- Download for your OS (Windows/Mac/Linux)
- Install and START Docker Desktop
- Wait until the Docker whale icon in the taskbar says "Docker Desktop is running"
- Verify: open Terminal and type: `docker --version`
- You should see: `Docker version 24.x.x`

### 1D. Install Git
- Go to https://git-scm.com/downloads
- Download and install for your OS
- Verify: `git --version`

---

## STEP 2 — Get a FREE Groq API Key (for AI quiz generation)

1. Go to https://console.groq.com
2. Sign up with Google or GitHub (it's free)
3. Click "API Keys" in the left sidebar
4. Click "Create API Key"
5. Copy the key — it looks like: `gsk_xxxxxxxxxxxxxxxxxxxx`
6. Save it somewhere, you'll need it soon

---

## STEP 3 — Download This Project

Open Terminal (Mac/Linux) or Command Prompt (Windows) and run:

```bash
# If you have git:
git clone <your-repo-url>
cd adaptive-learning

# OR if you downloaded the zip file, just extract it and open Terminal inside the folder
cd adaptive-learning
```

---

## STEP 4 — Start the Databases (PostgreSQL + Neo4j)

Make sure Docker Desktop is RUNNING first, then:

```bash
docker-compose up -d
```

This downloads and starts two databases automatically. Wait about 30 seconds.

Verify they're running:
```bash
docker ps
```
You should see two containers: `postgres` and `neo4j`.

**Useful links after databases start:**
- Neo4j Browser (visual graph UI): http://localhost:7474
  - Username: `neo4j` | Password: `password123`

---

## STEP 5 — Set Up the Backend (FastAPI Python Server)

Open a NEW Terminal window:

```bash
cd adaptive-learning/backend

# Create a Python virtual environment (isolated Python for this project)
python -m venv venv

# Activate the virtual environment:
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# You should see (venv) at the start of your terminal line now

# Install all Python packages
pip install -r requirements.txt
```

### Create your .env file (configuration):

```bash
# Copy the example file
cp .env.example .env
```

Now open the `.env` file with any text editor (Notepad, VS Code, etc.) and:
1. Replace `your-groq-api-key-here` with your actual Groq API key from Step 2
2. Change `SECRET_KEY` to any random long string (e.g., `mysecretkey12345abcdefgh`)
3. Save the file

Your `.env` file should look like:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/adaptive_learning
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123
SECRET_KEY=mysecretkey12345abcdefgh
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GROQ_API_KEY=gsk_your_actual_key_here
FRONTEND_URL=
```

### Start the backend server:

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
Neo4j graph seeded successfully.
```

**Test it:** Open http://localhost:8000 in your browser. You should see:
```json
{"message": "Adaptive Learning API is running"}
```

**API Docs (auto-generated):** http://localhost:8000/docs

---

## STEP 6 — Set Up the Frontend (React App)

Open ANOTHER NEW Terminal window (keep the backend running):

```bash
cd adaptive-learning/frontend

# Install all JavaScript packages
npm install

# Start the development server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in 500ms
➜  Local:   http://localhost:5173/
```

**Open http://localhost:5173 in your browser.**

You should see the AdaptLearn login page! 🎉

---

## STEP 7 — Use the App

1. Click **Register** and create an account
2. On the **Onboarding** page, select topics you already know
3. Click **"Start Learning →"**
4. The **Dashboard** shows your progress and recommended topics
5. Click any topic to take an AI-generated quiz
6. The **Knowledge Graph** page shows all topics visually

---

## TROUBLESHOOTING

### "Cannot connect to Docker daemon"
→ Make sure Docker Desktop is open and running

### "connection refused" on port 5432 or 7687
→ Run `docker-compose up -d` again and wait 30 seconds

### "GROQ_API_KEY not set" or quiz generation fails
→ Check your .env file has the correct API key

### Port 8000 already in use
→ Kill whatever is using port 8000, or change to: `uvicorn main:app --reload --port 8001`

### npm install fails
→ Make sure you're in the `frontend/` folder, not the root

### bcrypt error on Windows
→ Run: `pip install bcrypt==4.0.1 --force-reinstall`

---

## DEPLOYMENT TO THE INTERNET (FREE)

### Overview:
- **Backend (FastAPI)** → Deploy on Railway.app (free tier)
- **Frontend (React)** → Deploy on Vercel.com (free tier)
- **PostgreSQL** → Use Neon.tech (free PostgreSQL in the cloud)
- **Neo4j** → Use Neo4j Aura (free cloud graph database)

---

### Deploy Step 1: Free Cloud PostgreSQL on Neon

1. Go to https://neon.tech and sign up (free)
2. Click "New Project"
3. Name it `adaptive-learning`
4. Click "Create Project"
5. Copy the connection string (looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb`)
6. Save it — this is your `DATABASE_URL` for production

---

### Deploy Step 2: Free Cloud Neo4j on Aura

1. Go to https://neo4j.com/cloud/platform/aura-graph-database/
2. Click "Start Free"
3. Sign up and create a free AuraDB instance
4. Select "Free" tier
5. Note your credentials:
   - **Connection URI** (looks like: `neo4j+s://xxxxxxxx.databases.neo4j.io`)
   - **Username:** `neo4j`
   - **Password:** shown once — COPY IT NOW
6. Save all three values

---

### Deploy Step 3: Backend on Railway

1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo and the `backend/` folder (or set root directory to `backend`)
4. Add these Environment Variables (click "Variables" tab):
   ```
   DATABASE_URL = (paste your Neon connection string)
   NEO4J_URI = (paste your Neo4j Aura URI)
   NEO4J_USER = neo4j
   NEO4J_PASSWORD = (your Aura password)
   SECRET_KEY = (any long random string, 32+ chars)
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 10080
   GROQ_API_KEY = (your Groq key)
   PORT = 8000
   ```
5. Railway auto-detects Python and deploys
6. Copy your Railway URL (e.g., `https://adaptive-learning-production.up.railway.app`)

---

### Deploy Step 4: Frontend on Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click "New Project" → Import your repo
3. Set **Root Directory** to `frontend`
4. Add Environment Variable:
   ```
   VITE_API_URL = (paste your Railway backend URL, no trailing slash)
   ```
   Example: `VITE_API_URL=https://adaptive-learning-production.up.railway.app`
5. Click Deploy
6. Your app is live at `https://your-project.vercel.app` 🚀

---

## PROJECT STRUCTURE

```
adaptive-learning/
├── docker-compose.yml          ← Starts local databases
├── README.md                   ← This file
├── backend/
│   ├── main.py                 ← FastAPI app entry point
│   ├── requirements.txt        ← Python dependencies
│   ├── .env.example            ← Environment variables template
│   ├── Procfile                ← For Railway deployment
│   ├── db/
│   │   ├── postgres.py         ← PostgreSQL connection
│   │   └── neo4j_db.py         ← Neo4j connection + 30 topic graph
│   ├── models/
│   │   └── models.py           ← Database table definitions
│   ├── routers/
│   │   ├── auth.py             ← /api/auth/* (register, login, me)
│   │   ├── topics.py           ← /api/topics/* (learning path)
│   │   ├── quiz.py             ← /api/quiz/* (generate, submit)
│   │   └── progress.py         ← /api/progress/* (dashboard)
│   └── services/
│       ├── bkt.py              ← Bayesian Knowledge Tracing algorithm
│       └── llm_quiz.py         ← Groq AI quiz generation
└── frontend/
    ├── index.html
    ├── package.json            ← JS dependencies
    ├── vite.config.js          ← Build + proxy config
    ├── vercel.json             ← For Vercel deployment
    └── src/
        ├── App.jsx             ← Routes + auth wrapper
        ├── main.jsx            ← React entry point
        ├── api/client.js       ← Axios API functions
        ├── hooks/useAuth.jsx   ← Auth context
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Onboarding.jsx  ← Pick known topics
            ├── Dashboard.jsx   ← Progress + recommendations
            ├── GraphPage.jsx   ← Interactive knowledge graph
            └── QuizPage.jsx    ← AI quiz + BKT results
```

---

## HOW IT WORKS

1. **Register** → JWT token created and stored in browser
2. **Onboarding** → Select known topics → saved to PostgreSQL + Neo4j path recalculated
3. **Dashboard** → FastAPI queries both databases → shows next 3 topics to learn
4. **Quiz** → Groq LLaMA 3 generates 3 MCQs → user answers → BKT updates mastery probability
5. **Pass (≥2/3)** → Topic marked completed → next topics unlocked
6. **Fail** → YouTube + MDN resources suggested → retry anytime
7. **Knowledge Graph** → All 30 topics visualized with prerequisite arrows + completion colors

---

## QUICK COMMAND REFERENCE

```bash
# Start databases (run once, or after restart)
docker-compose up -d

# Start backend (in backend/ folder, with venv activated)
uvicorn main:app --reload --port 8000

# Start frontend (in frontend/ folder)
npm run dev

# Stop databases
docker-compose down

# Check database logs
docker-compose logs postgres
docker-compose logs neo4j
```
