# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from routers import auth, topics, quiz, progress
# from db.postgres import engine, Base
# from db.neo4j_db import init_graph
# import os

# Base.metadata.create_all(bind=engine)

# app = FastAPI(title="Adaptive Learning API", version="1.0.0")

# ALLOWED_ORIGINS = [
#     "http://localhost:5173",
#     "http://localhost:4173",
#     "http://localhost:3000",
# ]
# frontend_url = os.getenv("FRONTEND_URL", "")
# if frontend_url:
#     ALLOWED_ORIGINS.append(frontend_url)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=ALLOWED_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth.router,     prefix="/api/auth",     tags=["auth"])
# app.include_router(topics.router,   prefix="/api/topics",   tags=["topics"])
# app.include_router(quiz.router,     prefix="/api/quiz",     tags=["quiz"])
# app.include_router(progress.router, prefix="/api/progress", tags=["progress"])

# @app.on_event("startup")
# async def startup():
#     try:
#         init_graph()
#     except Exception as e:
#         print(f"Warning: Could not init Neo4j graph: {e}")

# @app.get("/")
# def root():
#     return {"message": "Adaptive Learning API is running", "docs": "/docs"}

# @app.get("/health")
# def health():
#     return {"status": "ok"}



from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import auth, topics, quiz, progress
from db.postgres import engine, Base
from db.neo4j_db import init_graph
import traceback
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Adaptive Learning API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("GLOBAL ERROR:", traceback.format_exc())
    return JSONResponse(status_code=500, content={"detail": str(exc)})

app.include_router(auth.router,     prefix="/api/auth",     tags=["auth"])
app.include_router(topics.router,   prefix="/api/topics",   tags=["topics"])
app.include_router(quiz.router,     prefix="/api/quiz",     tags=["quiz"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])

@app.on_event("startup")
async def startup():
    try:
        init_graph()
    except Exception as e:
        print(f"Warning: Could not init Neo4j graph: {e}")

@app.get("/")
def root():
    return {"message": "Adaptive Learning API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}