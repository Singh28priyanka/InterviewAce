import json
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from pypdf import PdfReader
from ..database import get_db
from .. import models, schemas, security
from ..services import ai_service
from ..config import settings

router = APIRouter(prefix="/api/resume", tags=["resume"])

@router.post("/upload", response_model=schemas.ResumeResponse)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resumes are supported currently"
        )
    
    # Save the file locally
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        
    # Extract text from PDF
    pdf_text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pdf_text += text + "\n"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read PDF file: {str(e)}"
        )
        
    # Parse resume using AI service
    parsed_data = ai_service.parse_resume(pdf_text)
    
    # Save to Database
    db_resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if db_resume:
        db_resume.filename = file.filename
        db_resume.parsed_skills = json.dumps(parsed_data.get("skills", []))
        db_resume.parsed_education = json.dumps(parsed_data.get("education", []))
        db_resume.parsed_projects = json.dumps(parsed_data.get("projects", []))
        db_resume.parsed_certifications = json.dumps(parsed_data.get("certifications", []))
        db_resume.ats_score = parsed_data.get("ats_score", 0.0)
        db_resume.career_guidance = parsed_data.get("career_guidance", "")
    else:
        db_resume = models.Resume(
            user_id=current_user.id,
            filename=file.filename,
            parsed_skills=json.dumps(parsed_data.get("skills", [])),
            parsed_education=json.dumps(parsed_data.get("education", [])),
            parsed_projects=json.dumps(parsed_data.get("projects", [])),
            parsed_certifications=json.dumps(parsed_data.get("certifications", [])),
            ats_score=parsed_data.get("ats_score", 0.0),
            career_guidance=parsed_data.get("career_guidance", "")
        )
        db.add(db_resume)
        
    db.commit()
    db.refresh(db_resume)
    return db_resume

@router.get("/my-resume", response_model=schemas.ResumeResponse)
def get_my_resume(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume uploaded yet"
        )
    return resume


@router.post("/match-jd", response_model=schemas.JobDescriptionMatchResponse)
def match_jd(
    payload: schemas.JobDescriptionMatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume uploaded yet. Please upload your resume first."
        )
    
    import json
    parsed_resume = {
        "skills": json.loads(resume.parsed_skills) if resume.parsed_skills else [],
        "projects": json.loads(resume.parsed_projects) if resume.parsed_projects else [],
        "certifications": json.loads(resume.parsed_certifications) if resume.parsed_certifications else [],
        "education": json.loads(resume.parsed_education) if resume.parsed_education else []
    }
    
    match_result = ai_service.match_resume_to_jd(parsed_resume, payload.jd_text)
    return match_result
