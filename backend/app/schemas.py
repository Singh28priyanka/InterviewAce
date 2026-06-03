from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "candidate"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeResponse(BaseModel):
    id: int
    filename: str
    ats_score: float
    parsed_skills: Optional[str] = None
    parsed_education: Optional[str] = None
    parsed_projects: Optional[str] = None
    parsed_certifications: Optional[str] = None
    career_guidance: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    user_answer: Optional[str] = None
    ideal_answer: Optional[str] = None
    score: float
    feedback_accuracy: Optional[str] = None
    feedback_communication: Optional[str] = None
    feedback_depth: Optional[str] = None
    feedback_confidence: Optional[str] = None
    feedback_clarity: Optional[str] = None
    feedback_strengths: Optional[str] = None
    feedback_weaknesses: Optional[str] = None

    class Config:
        from_attributes = True

class InterviewCreate(BaseModel):
    interview_type: str # HR, Technical, Amazon, Google, Microsoft, TCS, Infosys
    difficulty: str     # Easy, Medium, Hard

class InterviewResponse(BaseModel):
    id: int
    interview_type: str
    difficulty: str
    score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewDetailResponse(InterviewResponse):
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True

class AnswerSubmit(BaseModel):
    question_id: int
    answer_text: str

class InterviewSubmit(BaseModel):
    answers: List[AnswerSubmit]

class CodingSubmissionCreate(BaseModel):
    problem_title: str
    language: str # python, java, cpp
    code: str

class CodingSubmissionResponse(BaseModel):
    id: int
    problem_title: str
    language: str
    code: str
    test_cases_passed: int
    total_test_cases: int
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None
    readability_feedback: Optional[str] = None
    optimization_feedback: Optional[str] = None
    score: float
    created_at: datetime

    class Config:
        from_attributes = True

class RoadmapResponse(BaseModel):
    id: int
    roadmap_data: str
    updated_at: datetime

    class Config:
        from_attributes = True
