from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="candidate") # candidate or recruiter
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    submissions = relationship("CodingSubmission", back_populates="user", cascade="all, delete-orphan")
    roadmap = relationship("Roadmap", uselist=False, back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    parsed_skills = Column(Text, nullable=True)          # JSON string
    parsed_education = Column(Text, nullable=True)       # JSON string
    parsed_projects = Column(Text, nullable=True)        # JSON string
    parsed_certifications = Column(Text, nullable=True)  # JSON string
    ats_score = Column(Float, default=0.0)
    career_guidance = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="resumes")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    interview_type = Column(String(50), nullable=False) # e.g. HR, Technical, Amazon, Google
    difficulty = Column(String(20), nullable=False)     # Easy, Medium, Hard
    score = Column(Float, default=0.0)
    status = Column(String(20), default="In_Progress")   # In_Progress, Completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="interviews")
    questions = relationship("Question", back_populates="interview", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    ideal_answer = Column(Text, nullable=True)
    score = Column(Float, default=0.0)
    feedback_accuracy = Column(Text, nullable=True)
    feedback_communication = Column(Text, nullable=True)
    feedback_depth = Column(Text, nullable=True)
    feedback_confidence = Column(Text, nullable=True)
    feedback_clarity = Column(Text, nullable=True)
    feedback_strengths = Column(Text, nullable=True)
    feedback_weaknesses = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    interview = relationship("Interview", back_populates="questions")

class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_title = Column(String(100), nullable=False)
    language = Column(String(20), nullable=False) # python, java, cpp
    code = Column(Text, nullable=False)
    test_cases_passed = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    time_complexity = Column(String(50), nullable=True)
    space_complexity = Column(String(50), nullable=True)
    readability_feedback = Column(Text, nullable=True)
    optimization_feedback = Column(Text, nullable=True)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="submissions")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    roadmap_data = Column(Text, nullable=False) # JSON string
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="roadmap")
