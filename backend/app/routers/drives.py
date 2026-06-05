import json
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, security
from ..services import ai_service, code_runner

router = APIRouter(prefix="/api/drives", tags=["drives"])

def generate_mcqs(company: str, difficulty: str) -> list:
    """Generates 5 multiple choice questions dynamically via Gemini"""
    mock_mcqs = [
        {
            "question": f"Which of the following is true about dynamic memory allocation at {company}?",
            "options": ["Garbage Collection is automatic in all languages", "Stack memory is larger than Heap memory", "Heap memory allocation occurs dynamically at runtime", "Stack memory is dynamic"],
            "answer": "Heap memory allocation occurs dynamically at runtime"
        },
        {
            "question": "What is the worst-case time complexity of sorting an array using QuickSort?",
            "options": ["O(N log N)", "O(N)", "O(N^2)", "O(1)"],
            "answer": "O(N^2)"
        },
        {
            "question": "In a DBMS, which property ensures that once a transaction commits, the changes are permanent?",
            "options": ["Atomicity", "Consistency", "Isolation", "Durability"],
            "answer": "Durability"
        },
        {
            "question": "Which layer of the OSI model is responsible for routing packets?",
            "options": ["Physical Layer", "Network Layer", "Transport Layer", "Application Layer"],
            "answer": "Network Layer"
        },
        {
            "question": "Which of the following OOP principles refers to hiding implementation details and showing only functionality?",
            "options": ["Inheritance", "Polymorphism", "Abstraction", "Encapsulation"],
            "answer": "Abstraction"
        }
    ]
    if ai_service.use_mock:
        return mock_mcqs

    prompt = f"""
    Generate exactly 5 high-quality technical Multiple Choice Questions (MCQs) for a recruitment drive at {company} at {difficulty} difficulty.
    Topics should cover: Data Structures, Algorithms, DBMS, Operating Systems, or Computer Networks.
    
    Provide the output in JSON format as a list of objects. Each object must have:
    - question (string)
    - options (list of 4 strings)
    - answer (string, which must exactly match one of the options)
    """
    
    response = ai_service.call_gemini(prompt, response_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass
    return mock_mcqs

@router.post("/start", response_model=schemas.PlacementDriveResponse)
def start_drive(
    payload: schemas.PlacementDriveCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # 1. Generate 5 MCQs
    mcqs = generate_mcqs(payload.company, payload.difficulty)
    
    # 2. Select 1 coding problem
    coding_problems = db.query(models.CodingProblem).filter(
        models.CodingProblem.company == payload.company,
        models.CodingProblem.difficulty == payload.difficulty
    ).all()
    if not coding_problems:
        coding_problems = db.query(models.CodingProblem).filter(
            models.CodingProblem.difficulty == payload.difficulty
        ).all()
    if not coding_problems:
        coding_problems = db.query(models.CodingProblem).all()
        
    selected_coding = random.choice(coding_problems) if coding_problems else None
    
    # 3. Select 2 verbal questions
    verbal_q_bank = db.query(models.QuestionBank).filter(
        models.QuestionBank.category.in_(["HR", "Java", "DBMS", "OOP", "DSA"])
    ).all()
    selected_verbal = random.sample(verbal_q_bank, min(2, len(verbal_q_bank))) if verbal_q_bank else []
    
    # Pack initial drive context into the feedback text field as JSON
    drive_data = {
        "mcqs": mcqs,
        "coding_problem": {
            "title": selected_coding.title if selected_coding else "Two Sum",
            "description": selected_coding.description if selected_coding else "Given an array...",
            "difficulty": selected_coding.difficulty if selected_coding else "Easy",
            "company": selected_coding.company if selected_coding else "Google",
            "templates": {
                "python": selected_coding.template_python if selected_coding else "",
                "java": selected_coding.template_java if selected_coding else "",
                "cpp": selected_coding.template_cpp if selected_coding else ""
            },
            "test_cases": json.loads(selected_coding.test_cases) if (selected_coding and selected_coding.test_cases) else []
        } if selected_coding else None,
        "verbal_questions": [
            {
                "id": idx + 1,
                "question_text": vq.question_text,
                "ideal_answer": vq.ideal_answer
            } for idx, vq in enumerate(selected_verbal)
        ]
    }
    
    db_drive = models.PlacementDrive(
        user_id=current_user.id,
        company=payload.company,
        difficulty=payload.difficulty,
        mcq_score=0.0,
        coding_score=0.0,
        verbal_score=0.0,
        overall_score=0.0,
        status="In_Progress",
        feedback=json.dumps(drive_data)
    )
    
    db.add(db_drive)
    db.commit()
    db.refresh(db_drive)
    return db_drive

@router.post("/{drive_id}/submit", response_model=schemas.PlacementDriveResponse)
def submit_drive(
    drive_id: int,
    payload: schemas.PlacementDriveSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_drive = db.query(models.PlacementDrive).filter(
        models.PlacementDrive.id == drive_id,
        models.PlacementDrive.user_id == current_user.id
    ).first()
    
    if not db_drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Placement drive not found"
        )
    if db_drive.status == "Completed":
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Placement drive already evaluated"
        )
         
    try:
        drive_data = json.loads(db_drive.feedback)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Corrupted drive configuration data"
        )
        
    # 1. Score MCQ Round
    mcq_map = {item["question"]: item["answer"] for item in payload.mcq_answers}
    correct_count = 0
    total_mcqs = len(drive_data.get("mcqs", []))
    mcq_review = []
    
    for q_item in drive_data.get("mcqs", []):
        user_choice = mcq_map.get(q_item["question"], "")
        is_correct = user_choice.strip().lower() == q_item["answer"].strip().lower()
        if is_correct:
            correct_count += 1
        mcq_review.append({
            "question": q_item["question"],
            "options": q_item["options"],
            "correct_answer": q_item["answer"],
            "user_answer": user_choice,
            "is_correct": is_correct
        })
        
    mcq_score_val = round((correct_count / total_mcqs * 10.0) if total_mcqs > 0 else 0.0, 2)
    
    # 2. Score Coding Round
    coding_eval = code_runner.execute_code(
        problem_title=payload.problem_title,
        language=payload.language,
        code=payload.code
    )
    
    coding_ai = ai_service.review_code(
        problem_title=payload.problem_title,
        language=payload.language,
        code=payload.code
    )
    
    passed = coding_eval.get("passed", 0)
    total_tc = coding_eval.get("total", 3)
    pass_ratio = passed / total_tc if total_tc > 0 else 0.0
    quality_score = coding_ai.get("score", 0.0) / 10.0
    
    coding_score_val = round(((pass_ratio * 7.0) + (quality_score * 3.0)) * 1.0, 2)
    if coding_eval.get("error") and "Compilation Error" in coding_eval["error"]:
        coding_score_val = 0.0
    elif coding_eval.get("error"):
        coding_score_val = round(coding_score_val * 0.5, 2)
        
    # 3. Score Verbal Round
    verbal_total_score = 0.0
    verbal_count = len(drive_data.get("verbal_questions", []))
    verbal_review = []
    
    verbal_ans_map = {item.question_id: item for item in payload.answers}
    for vq in drive_data.get("verbal_questions", []):
        ans_obj = verbal_ans_map.get(vq["id"])
        user_ans = ans_obj.answer_text if ans_obj else ""
        wpm = ans_obj.wpm if ans_obj else None
        filler = ans_obj.filler_words_count if ans_obj else None
        
        eval_res = ai_service.evaluate_answer(
            question_text=vq["question_text"],
            user_answer=user_ans,
            ideal_answer=vq["ideal_answer"],
            wpm=wpm,
            filler_words_count=filler
        )
        v_score = eval_res.get("score", 0.0)
        verbal_total_score += v_score
        
        verbal_review.append({
            "question_text": vq["question_text"],
            "user_answer": user_ans,
            "ideal_answer": vq["ideal_answer"],
            "score": v_score,
            "feedback_strengths": eval_res.get("feedback_strengths", ""),
            "feedback_weaknesses": eval_res.get("feedback_weaknesses", ""),
            "feedback_communication": eval_res.get("feedback_communication", ""),
            "wpm": wpm,
            "filler_words_count": filler
        })
        
    verbal_score_val = round(verbal_total_score / verbal_count if verbal_count > 0 else 0.0, 2)
    
    # 4. Overall Score (weighted average: 20% MCQ, 50% Coding, 30% Verbal)
    overall_score_val = round((mcq_score_val * 0.2) + (coding_score_val * 0.5) + (verbal_score_val * 0.3), 2)
    
    submission_feedback = {
        "mcq_review": mcq_review,
        "coding_review": {
            "language": payload.language,
            "code": payload.code,
            "test_cases_passed": passed,
            "total_test_cases": total_tc,
            "time_complexity": coding_ai.get("time_complexity", "O(N)"),
            "space_complexity": coding_ai.get("space_complexity", "O(1)"),
            "readability_feedback": coding_ai.get("readability_feedback", ""),
            "optimization_feedback": coding_ai.get("optimization_feedback", ""),
            "error": coding_eval.get("error")
        },
        "verbal_review": verbal_review
    }
    
    db_drive.mcq_score = mcq_score_val
    db_drive.coding_score = coding_score_val
    db_drive.verbal_score = verbal_score_val
    db_drive.overall_score = overall_score_val
    db_drive.status = "Completed"
    db_drive.feedback = json.dumps(submission_feedback)
    
    db.commit()
    db.refresh(db_drive)
    return db_drive

@router.get("/my-drives", response_model=list[schemas.PlacementDriveResponse])
def get_my_drives(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    return db.query(models.PlacementDrive).filter(
        models.PlacementDrive.user_id == current_user.id
    ).order_by(models.PlacementDrive.created_at.desc()).all()

@router.get("/{drive_id}", response_model=schemas.PlacementDriveResponse)
def get_drive_details(
    drive_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    drive = db.query(models.PlacementDrive).filter(
        models.PlacementDrive.id == drive_id,
        models.PlacementDrive.user_id == current_user.id
    ).first()
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Placement drive not found"
        )
    return drive
