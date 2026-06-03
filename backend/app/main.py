import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, resume, interview, coding, analytics, recruiter, drives

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InterviewAce API",
    description="AI-powered Mock Interview & Coding preparation assistant API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(coding.router)
app.include_router(analytics.router)
app.include_router(recruiter.router)
app.include_router(drives.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "InterviewAce API"}
