import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, security
from ..services import ai_service

router = APIRouter(prefix="/api/interview", tags=["interview"])

@router.post("/start", response_model=schemas.InterviewDetailResponse)
def start_interview(
    payload: schemas.InterviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Fetch skills from user's latest resume if exists
    skills = []
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if resume and resume.parsed_skills:
        try:
            skills = json.loads(resume.parsed_skills)
        except Exception:
            pass
            
    # Generate questions using AI
    questions_data = ai_service.generate_questions(
        interview_type=payload.interview_type,
        difficulty=payload.difficulty,
        skills=skills
    )
    
    # Save Interview
    db_interview = models.Interview(
        user_id=current_user.id,
        interview_type=payload.interview_type,
        difficulty=payload.difficulty,
        score=0.0,
        status="In_Progress"
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    # Save Questions
    db_questions = []
    for q in questions_data:
        db_q = models.Question(
            interview_id=db_interview.id,
            question_text=q.get("question_text", ""),
            ideal_answer=q.get("ideal_answer", ""),
            score=0.0
        )
        db.add(db_q)
        db_questions.append(db_q)
        
    db.commit()
    
    # Refresh to return full relationships
    db.refresh(db_interview)
    return db_interview

@router.post("/{interview_id}/submit", response_model=schemas.InterviewDetailResponse)
def submit_answers(
    interview_id: int,
    payload: schemas.InterviewSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.user_id == current_user.id
    ).first()
    
    if not db_interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
        
    if db_interview.status == "Completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview already evaluated and completed"
        )
        
    # Map answers by question_id
    answers_map = {ans.question_id: ans.answer_text for ans in payload.answers}
    
    total_score = 0.0
    evaluated_count = 0
    
    for db_q in db_interview.questions:
        user_ans = answers_map.get(db_q.id, "")
        db_q.user_answer = user_ans
        
        # Call AI evaluator
        eval_result = ai_service.evaluate_answer(
            question_text=db_q.question_text,
            user_answer=user_ans,
            ideal_answer=db_q.ideal_answer
        )
        
        db_q.score = eval_result.get("score", 0.0)
        db_q.feedback_accuracy = eval_result.get("feedback_accuracy", "")
        db_q.feedback_communication = eval_result.get("feedback_communication", "")
        db_q.feedback_depth = eval_result.get("feedback_depth", "")
        db_q.feedback_confidence = eval_result.get("feedback_confidence", "")
        db_q.feedback_clarity = eval_result.get("feedback_clarity", "")
        db_q.feedback_strengths = eval_result.get("feedback_strengths", "")
        db_q.feedback_weaknesses = eval_result.get("feedback_weaknesses", "")
        
        # If suggested answer returned, update ideal_answer
        if eval_result.get("suggested_answer"):
            db_q.ideal_answer = eval_result.get("suggested_answer")
            
        total_score += db_q.score
        evaluated_count += 1
        
    db_interview.score = round(total_score / evaluated_count, 2) if evaluated_count > 0 else 0.0
    db_interview.status = "Completed"
    
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.get("/{interview_id}", response_model=schemas.InterviewDetailResponse)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.user_id == current_user.id
    ).first()
    
    if not db_interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    return db_interview
