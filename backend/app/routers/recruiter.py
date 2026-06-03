import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, security
from ..services import ai_service

router = APIRouter(prefix="/api/recruiter", tags=["recruiter"])

def check_recruiter_role(user: models.User = Depends(security.get_current_user)):
    if user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with recruiter privileges can access this portal"
        )
    return user

@router.get("/candidates")
def get_candidates(
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(check_recruiter_role)
):
    candidates = db.query(models.User).filter(models.User.role == "candidate").all()
    report = []
    
    for c in candidates:
        # Get resume
        resume = db.query(models.Resume).filter(models.Resume.user_id == c.id).first()
        # Get interview scores
        interviews = db.query(models.Interview).filter(
            models.Interview.user_id == c.id,
            models.Interview.status == "Completed"
        ).all()
        
        avg_score = round(sum(i.score for i in interviews) / len(interviews), 2) if interviews else 0.0
        
        # Get coding submissions
        coding_subs = db.query(models.CodingSubmission).filter(
            models.CodingSubmission.user_id == c.id
        ).all()
        
        avg_coding = round(sum(s.score for s in coding_subs) / len(coding_subs), 2) if coding_subs else 0.0
        
        skills = []
        ats = 0.0
        if resume:
            ats = resume.ats_score
            try:
                skills = json.loads(resume.parsed_skills)
            except Exception:
                pass
                
        report.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "ats_score": ats,
            "skills": skills,
            "interviews_taken": len(interviews),
            "average_interview_score": avg_score,
            "coding_submissions": len(coding_subs),
            "average_coding_score": avg_coding,
            "last_active": c.created_at
        })
        
    return report

@router.get("/candidates/compare")
def compare_candidates(
    db: Session = Depends(get_db),
    recruiter: models.User = Depends(check_recruiter_role)
):
    # Fetch all candidates data
    candidates_list = get_candidates(db, recruiter)
    if len(candidates_list) < 2:
        return {
            "comparison_insight": "Not enough candidate data to produce comparison reports. Please ensure at least two candidate profiles are registered and active.",
            "ranking": candidates_list
        }
        
    # Rank candidates by average of interview and coding scores
    for c in candidates_list:
        c["rank_score"] = round((c["average_interview_score"] + c["average_coding_score"]) / 2, 2)
        
    ranked = sorted(candidates_list, key=lambda x: x["rank_score"], reverse=True)
    
    # Run comparison insights using AI if possible
    # Create simple readable profiles
    profiles_summary = "\n".join(
        [f"- Name: {c['name']}, Skills: {', '.join(c['skills'])}, ATS: {c['ats_score']}, Avg Interview: {c['average_interview_score']}, Avg Coding: {c['average_coding_score']}"
         for c in ranked[:5]] # compare top 5
    )
    
    prompt = f"""
    Analyze these software engineering candidate profiles and generate a comparative report:
    {profiles_summary}
    
    List strengths, gaps, and recommendations on who is best suited for a Software Engineering internship based on their interview results, skills, and coding scores. Keep it concise, structured, and recruiter-focused.
    """
    
    ai_insights = ai_service.call_gemini(prompt, response_json=False)
    if not ai_insights:
        # High fidelity fallback insights
        ai_insights = (
            "### Candidate Comparison & Hiring Recommendation\n\n"
            "1. **Top Recommendation**: Candidates with strong coding average scores and higher ATS scores are best positioned for immediate technical interviews.\n"
            "2. **Skill Coverage**: Ensure candidates have matching database (SQL) and web framework (React/FastAPI) skills for fullstack roles.\n"
            "3. **Interview Performance**: Candidates who show strong conceptual clarity in mock interviews are recommended for customer-facing and systems engineering roles."
        )
        
    return {
        "comparison_insight": ai_insights,
        "ranking": ranked
    }
