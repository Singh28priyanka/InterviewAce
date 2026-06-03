import json
import random
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
    # 1. Map interview_type to relevant question bank categories
    target_categories = []
    if "HR" in payload.interview_type.upper():
        target_categories = ["HR"]
    else:
        # Technical or Company Mode
        target_categories = ["Java", "DBMS", "OOP", "DSA", "OS", "CN"]

    # 2. Get user's previously asked questions IDs
    user_history = db.query(models.UserQuestionHistory).filter(
        models.UserQuestionHistory.user_id == current_user.id
    ).all()
    
    asked_ids = [h.question_bank_id for h in user_history]

    # Query all matching questions from bank
    all_bank_questions = db.query(models.QuestionBank).filter(
        models.QuestionBank.category.in_(target_categories)
    ).all()

    if not all_bank_questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions available in the question bank for this category"
        )

    # 3. Categorize into unseen and seen
    unseen = [q for q in all_bank_questions if q.id not in asked_ids]

    # 4. Selection algorithm (pull 2 questions from bank, prioritize unseen)
    selected_bank_objs = []
    
    if len(unseen) >= 2:
        selected_bank_objs = random.sample(unseen, 2)
    elif len(unseen) == 1:
        selected_bank_objs.append(unseen[0])
        # Pool exhausted, clear history for user in these categories to reshuffle
        db.query(models.UserQuestionHistory).filter(
            models.UserQuestionHistory.user_id == current_user.id,
            models.UserQuestionHistory.question_bank_id.in_([q.id for q in all_bank_questions])
        ).delete(synchronize_session=False)
        db.commit()
        
        # Pull remaining 1 from the freshly reset pool
        reset_pool = [q for q in all_bank_questions if q.id != selected_bank_objs[0].id]
        if reset_pool:
            selected_bank_objs.append(random.choice(reset_pool))
    else:
        # Fully exhausted, clear history for user in these categories to reshuffle
        db.query(models.UserQuestionHistory).filter(
            models.UserQuestionHistory.user_id == current_user.id,
            models.UserQuestionHistory.question_bank_id.in_([q.id for q in all_bank_questions])
        ).delete(synchronize_session=False)
        db.commit()
        
        # Sample 2 from the freshly reset pool
        selected_bank_objs = random.sample(all_bank_questions, min(2, len(all_bank_questions)))

    # Save selected questions to UserQuestionHistory
    for bq in selected_bank_objs:
        hist_entry = models.UserQuestionHistory(
            user_id=current_user.id,
            question_bank_id=bq.id
        )
        db.add(hist_entry)
    db.commit()

    # 5. Fetch user skills from resume to customize Gemini dynamic generation
    skills = []
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if resume and resume.parsed_skills:
        try:
            skills = json.loads(resume.parsed_skills)
        except Exception:
            pass

    # 6. Generate 2 dynamic custom questions using Gemini API
    dynamic_questions = ai_service.generate_dynamic_questions(
        interview_type=payload.interview_type,
        difficulty=payload.difficulty,
        skills=skills,
        count=2
    )

    # 7. Save Interview
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

    # 8. Save combined questions
    # Combined list: 2 from bank + 2 dynamic
    for q_obj in selected_bank_objs:
        db_q = models.Question(
            interview_id=db_interview.id,
            question_text=q_obj.question_text,
            ideal_answer=q_obj.ideal_answer,
            score=0.0
        )
        db.add(db_q)

    for q_dict in dynamic_questions:
        db_q = models.Question(
            interview_id=db_interview.id,
            question_text=q_dict.get("question_text", ""),
            ideal_answer=q_dict.get("ideal_answer", ""),
            score=0.0
        )
        db.add(db_q)

    db.commit()
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
        
    answers_objs = {ans.question_id: ans for ans in payload.answers}
    
    total_score = 0.0
    evaluated_count = 0
    
    for db_q in db_interview.questions:
        ans_obj = answers_objs.get(db_q.id)
        user_ans = ans_obj.answer_text if ans_obj else ""
        wpm = ans_obj.wpm if ans_obj else None
        filler_cnt = ans_obj.filler_words_count if ans_obj else None
        
        db_q.user_answer = user_ans
        
        eval_result = ai_service.evaluate_answer(
            question_text=db_q.question_text,
            user_answer=user_ans,
            ideal_answer=db_q.ideal_answer,
            wpm=wpm,
            filler_words_count=filler_cnt
        )
        
        db_q.score = eval_result.get("score", 0.0)
        db_q.feedback_accuracy = eval_result.get("feedback_accuracy", "")
        db_q.feedback_communication = eval_result.get("feedback_communication", "")
        db_q.feedback_depth = eval_result.get("feedback_depth", "")
        db_q.feedback_confidence = eval_result.get("feedback_confidence", "")
        db_q.feedback_clarity = eval_result.get("feedback_clarity", "")
        db_q.feedback_strengths = eval_result.get("feedback_strengths", "")
        db_q.feedback_weaknesses = eval_result.get("feedback_weaknesses", "")
        
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
