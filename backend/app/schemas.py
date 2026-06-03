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
    wpm: Optional[float] = None
    filler_words_count: Optional[int] = None

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

class CodingProblemResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    company: str
    template_python: str
    template_java: str
    template_cpp: str

    class Config:
        from_attributes = True


class CodingHintRequest(BaseModel):
    problem_title: str
    language: str
    code: str
    chat_history: Optional[List[dict]] = []
    message: str

class CodingHintResponse(BaseModel):
    hint: str

class JobDescriptionMatchRequest(BaseModel):
    jd_text: str

class JobDescriptionMatchResponse(BaseModel):
    match_score: float
    missing_keywords: List[str]
    resume_suggestions: List[str]
    ats_compatibility_feedback: str

class PlacementDriveCreate(BaseModel):
    company: str
    difficulty: str

class PlacementDriveSubmit(BaseModel):
    answers: List[AnswerSubmit]
    code: str
    problem_title: str
    language: str
    mcq_answers: List[dict]

class PlacementDriveResponse(BaseModel):
    id: int
    user_id: int
    company: str
    difficulty: str
    mcq_score: float
    coding_score: float
    verbal_score: float
    overall_score: float
    status: str
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
