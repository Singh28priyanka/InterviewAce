from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, security
from ..services import code_runner, ai_service

router = APIRouter(prefix="/api/coding", tags=["coding"])

@router.get("/problems")
def get_problems():
    problems_list = []
    for title, data in code_runner.PROBLEMS.items():
        problems_list.append({
            "title": title,
            "description": data["description"],
            "templates": data["templates"]
        })
    return problems_list

@router.post("/submit", response_model=schemas.CodingSubmissionResponse)
def submit_code(
    payload: schemas.CodingSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if payload.problem_title not in code_runner.PROBLEMS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
        
    # 1. Run local subprocess execution for test cases
    exec_result = code_runner.execute_code(
        problem_title=payload.problem_title,
        language=payload.language,
        code=payload.code
    )
    
    if exec_result.get("error") and "Compilation Error" in exec_result["error"]:
        # Code did not compile, save with zero score
        db_sub = models.CodingSubmission(
            user_id=current_user.id,
            problem_title=payload.problem_title,
            language=payload.language,
            code=payload.code,
            test_cases_passed=0,
            total_test_cases=len(code_runner.PROBLEMS[payload.problem_title]["test_cases"]),
            time_complexity="N/A",
            space_complexity="N/A",
            readability_feedback=exec_result["error"],
            optimization_feedback="Please fix compilation errors to analyze optimizations.",
            score=0.0
        )
        db.add(db_sub)
        db.commit()
        db.refresh(db_sub)
        return db_sub

    # 2. Call AI evaluator for code structure, complexity, and feedback
    ai_result = ai_service.review_code(
        problem_title=payload.problem_title,
        language=payload.language,
        code=payload.code
    )
    
    passed = exec_result.get("passed", 0)
    total = exec_result.get("total", 3)
    error_msg = exec_result.get("error")
    
    # Custom scoring: combining passing ratio and AI quality score
    pass_ratio = passed / total if total > 0 else 0.0
    quality_score = ai_result.get("score", 0.0) / 10.0 # scale to 0-1
    
    # 70% passing test cases, 30% AI code quality
    final_score = round(((pass_ratio * 7.0) + (quality_score * 3.0)) * 1.0, 2)
    if error_msg:
        final_score = round(final_score * 0.5, 2) # penalty for runtime errors
        readability = f"Runtime Error:\n{error_msg}\n\n{ai_result.get('readability_feedback', '')}"
    else:
        readability = ai_result.get("readability_feedback", "")
        
    db_sub = models.CodingSubmission(
        user_id=current_user.id,
        problem_title=payload.problem_title,
        language=payload.language,
        code=payload.code,
        test_cases_passed=passed,
        total_test_cases=total,
        time_complexity=ai_result.get("time_complexity", "Unknown"),
        space_complexity=ai_result.get("space_complexity", "Unknown"),
        readability_feedback=readability,
        optimization_feedback=ai_result.get("optimization_feedback", ""),
        score=final_score
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub
