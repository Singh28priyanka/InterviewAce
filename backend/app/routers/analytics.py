import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models, schemas, security
from ..services import ai_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Interviews stats
    interviews = db.query(models.Interview).filter(
        models.Interview.user_id == current_user.id,
        models.Interview.status == "Completed"
    ).all()
    
    total_interviews = len(interviews)
    avg_score = round(sum(i.score for i in interviews) / total_interviews, 2) if total_interviews > 0 else 0.0
    
    # Coding stats
    submissions = db.query(models.CodingSubmission).filter(
        models.CodingSubmission.user_id == current_user.id
    ).all()
    
    total_coding = len(submissions)
    avg_coding_score = round(sum(s.score for s in submissions) / total_coding, 2) if total_coding > 0 else 0.0
    
    # Weekly performance metrics mock data generator or raw db date aggregations
    # Let's create a dynamic trend list based on history, or simple mock trends if history is empty
    weekly_scores = []
    if total_interviews > 0:
        # Sort interviews by date and get up to last 5
        sorted_ints = sorted(interviews, key=lambda x: x.created_at)
        for idx, val in enumerate(sorted_ints[-5:]):
            weekly_scores.append({
                "week": f"Intv {val.id}",
                "score": val.score,
                "coding": 0.0
            })
    else:
        # default template
        weekly_scores = [
            {"week": "Week 1", "score": 6.0, "coding": 5.5},
            {"week": "Week 2", "score": 7.2, "coding": 7.0},
            {"week": "Week 3", "score": 8.0, "coding": 8.2}
        ]
        
    # Topics scores map
    # We can parse topics based on interview_type
    topics_scores = []
    topic_map = {}
    for val in interviews:
        t = val.interview_type
        if t not in topic_map:
            topic_map[t] = []
        topic_map[t].append(val.score)
        
    for k, v in topic_map.items():
        topics_scores.append({
            "topic": k,
            "score": round(sum(v)/len(v), 2)
        })
        
    if not topics_scores:
        topics_scores = [
            {"topic": "HR", "score": 7.5},
            {"topic": "Java", "score": 6.8},
            {"topic": "DBMS", "score": 7.0},
            {"topic": "DSA", "score": 8.0}
        ]
        
    # Strong/Weak area extraction from feedback
    strong_areas = ["Theoretical concepts explanation", "Problem-solving structured approach"]
    weak_areas = ["Communication details under stress", "Edge cases in coding submissions"]
    
    # Extract from actual questions if available
    strengths_extracted = []
    weaknesses_extracted = []
    for val in interviews:
        for q in val.questions:
            if q.score >= 8.0 and q.feedback_strengths:
                strengths_extracted.append(q.feedback_strengths.split(",")[0])
            elif q.score < 6.0 and q.feedback_weaknesses:
                weaknesses_extracted.append(q.feedback_weaknesses.split(",")[0])
                
    if strengths_extracted:
        strong_areas = list(set(strengths_extracted))[:3]
    if weaknesses_extracted:
        weak_areas = list(set(weaknesses_extracted))[:3]
        
    return {
        "total_interviews": total_interviews,
        "average_score": avg_score,
        "total_coding_submissions": total_coding,
        "average_coding_score": avg_coding_score,
        "weekly_performance": weekly_scores,
        "topic_scores": topics_scores,
        "strong_areas": strong_areas,
        "weak_areas": weak_areas
    }

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    interviews = db.query(models.Interview).filter(
        models.Interview.user_id == current_user.id
    ).order_by(models.Interview.created_at.desc()).all()
    
    submissions = db.query(models.CodingSubmission).filter(
        models.CodingSubmission.user_id == current_user.id
    ).order_by(models.CodingSubmission.created_at.desc()).all()
    
    return {
        "interviews": [
            {
                "id": i.id,
                "interview_type": i.interview_type,
                "difficulty": i.difficulty,
                "score": i.score,
                "status": i.status,
                "created_at": i.created_at
            } for i in interviews
        ],
        "coding_submissions": [
            {
                "id": s.id,
                "problem_title": s.problem_title,
                "language": s.language,
                "test_cases_passed": s.test_cases_passed,
                "total_test_cases": s.total_test_cases,
                "score": s.score,
                "created_at": s.created_at
            } for s in submissions
        ]
    }

@router.get("/roadmap", response_model=schemas.RoadmapResponse)
def get_roadmap(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_roadmap = db.query(models.Roadmap).filter(models.Roadmap.user_id == current_user.id).first()
    if db_roadmap:
        return db_roadmap
        
    # Generate new roadmap based on performance
    interviews = db.query(models.Interview).filter(
        models.Interview.user_id == current_user.id,
        models.Interview.status == "Completed"
    ).all()
    
    skills = []
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if resume and resume.parsed_skills:
        try:
            skills = json.loads(resume.parsed_skills)
        except Exception:
            pass
            
    summary = f"Candidate has uploaded resume containing: {', '.join(skills) if skills else 'None'}. "
    if interviews:
        avg = sum(i.score for i in interviews)/len(interviews)
        summary += f"Candidate completed {len(interviews)} mock interviews with average score {avg}/10."
    else:
        summary += "Candidate has not taken any mock interviews yet."
        
    roadmap_data = ai_service.generate_roadmap(summary)
    
    db_roadmap = models.Roadmap(
        user_id=current_user.id,
        roadmap_data=json.dumps(roadmap_data)
    )
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)
    return db_roadmap

@router.post("/roadmap/regenerate", response_model=schemas.RoadmapResponse)
def regenerate_roadmap(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_roadmap = db.query(models.Roadmap).filter(models.Roadmap.user_id == current_user.id).first()
    
    # Generate new roadmap based on performance
    interviews = db.query(models.Interview).filter(
        models.Interview.user_id == current_user.id,
        models.Interview.status == "Completed"
    ).all()
    
    skills = []
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if resume and resume.parsed_skills:
        try:
            skills = json.loads(resume.parsed_skills)
        except Exception:
            pass
            
    summary = f"Candidate has uploaded resume containing: {', '.join(skills) if skills else 'None'}. "
    if interviews:
        avg = sum(i.score for i in interviews)/len(interviews)
        summary += f"Candidate completed {len(interviews)} mock interviews with average score {avg}/10."
    else:
        summary += "Candidate has not taken any mock interviews yet."
        
    roadmap_data = ai_service.generate_roadmap(summary)
    
    if db_roadmap:
        db_roadmap.roadmap_data = json.dumps(roadmap_data)
    else:
        db_roadmap = models.Roadmap(
            user_id=current_user.id,
            roadmap_data=json.dumps(roadmap_data)
        )
        db.add(db_roadmap)
        
    db.commit()
    db.refresh(db_roadmap)
    return db_roadmap
