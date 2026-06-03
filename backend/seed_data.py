import json
from datetime import datetime
from app.database import engine, Base, SessionLocal
from app.models import User, Resume, Interview, Question, CodingSubmission, Roadmap
from app.security import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Cleanup previous
db.query(Roadmap).delete()
db.query(CodingSubmission).delete()
db.query(Question).delete()
db.query(Interview).delete()
db.query(Resume).delete()
db.query(User).delete()
db.commit()

print("Seeding User Accounts...")
# 1. Users
candidate = User(
    name="Priyanka Singh",
    email="candidate@interviewace.com",
    password_hash=get_password_hash("password123"),
    role="candidate"
)
recruiter = User(
    name="HR Manager - Google",
    email="recruiter@interviewace.com",
    password_hash=get_password_hash("password123"),
    role="recruiter"
)
db.add(candidate)
db.add(recruiter)
db.commit()
db.refresh(candidate)
db.refresh(recruiter)

print("Seeding Resume...")
# 2. Resume
resume = Resume(
    user_id=candidate.id,
    filename="Priyanka_Singh_Resume.pdf",
    parsed_skills=json.dumps(["Java", "Python", "SQL", "Data Structures", "React", "FastAPI"]),
    parsed_education=json.dumps(["B.Tech in Computer Science and Engineering, GPA: 9.1"]),
    parsed_projects=json.dumps([
        "InterviewAce Assistant: AI interviewer built with React, FastAPI, and Gemini API.",
        "Database Query Engine: SQL parser and analyzer written in Python."
    ]),
    parsed_certifications=json.dumps(["AWS Certified Cloud Practitioner"]),
    ats_score=85.0,
    career_guidance=(
        "Your resume has strong foundations in Software Engineering and Web Development stack (Java, Python, React, SQL).\n"
        "To elevate your application for Google/Amazon technical interviews, emphasize system design concepts, microservice design, and code optimization. "
        "Practice core algorithmic problems involving trees, heaps, dynamic programming, and graphs."
    )
)
db.add(resume)
db.commit()

print("Seeding Interviews...")
# 3. Interviews & Questions
intv1 = Interview(
    user_id=candidate.id,
    interview_type="Technical",
    difficulty="Medium",
    score=8.5,
    status="Completed"
)
db.add(intv1)
db.commit()
db.refresh(intv1)

q1 = Question(
    interview_id=intv1.id,
    question_text="What is the difference between abstraction and encapsulation in Object-Oriented Programming?",
    user_answer=(
        "Abstraction hides the implementation details and only shows the functionality to the user, "
        "while encapsulation binds the data and methods together in a single class to restrict access."
    ),
    ideal_answer=(
        "Abstraction focuses on WHAT the object does (interface) and encapsulation focuses on HOW "
        "it does it (data hiding using access modifiers like private, protected, public). Abstraction is implemented "
        "using abstract classes/interfaces; encapsulation is implemented using variables and getter/setter methods."
    ),
    score=8.5,
    feedback_accuracy="The candidate correctly defined the main conceptual difference between the two terms.",
    feedback_communication="Very clear structure and vocabulary. Good articulation.",
    feedback_depth="Solid OOP fundamentals. Mentioning Java interfaces/classes was helpful.",
    feedback_confidence="Paced well with zero filler words.",
    feedback_clarity="The message was direct and easy to follow.",
    feedback_strengths="Accurate definitions, clear differences detailed.",
    feedback_weaknesses="Could mention how private variables prevent external mutations."
)

q2 = Question(
    interview_id=intv1.id,
    question_text="What are ACID properties in a Relational Database Management System?",
    user_answer="ACID stands for Atomicity, Consistency, Isolation, and Durability. They ensure transactions are safe.",
    ideal_answer=(
        "ACID properties guarantee DBMS transactional safety. Atomicity (all operations commit or rollback), "
        "Consistency (DB state changes only through valid paths), Isolation (concurrent execution is equivalent to serial), "
        "Durability (persisted on disk). Example: Bank balance transfer updates."
    ),
    score=8.0,
    feedback_accuracy="All definitions are correct, though details could be richer.",
    feedback_communication="Concise but a bit brief.",
    feedback_depth="Covered the acronym definitions. A transactional example (like credit/debit) was missing.",
    feedback_confidence="Answered confidently.",
    feedback_clarity="Clear definition and layout.",
    feedback_strengths="Correct acronym and basic functions mapped.",
    feedback_weaknesses="Explain concurrency locks and transaction isolation levels for full marks."
)
db.add(q1)
db.add(q2)
db.commit()

print("Seeding Coding Submissions...")
# 4. Coding Submissions
sub = CodingSubmission(
    user_id=candidate.id,
    problem_title="Two Sum",
    language="python",
    code=(
        "def two_sum(nums, target):\n"
        "    seen = {}\n"
        "    for i, num in enumerate(nums):\n"
        "        diff = target - num\n"
        "        if diff in seen:\n"
        "            return [seen[diff], i]\n"
        "        seen[num] = i\n"
        "    return []\n"
    ),
    test_cases_passed=3,
    total_test_cases=3,
    time_complexity="O(N)",
    space_complexity="O(N)",
    readability_feedback="Descriptive naming conventions, pythonic iteration syntax, and proper spacing.",
    optimization_feedback="The solution utilizes a single-pass hashset to find differences in linear time, which is optimal.",
    score=9.5
)
db.add(sub)
db.commit()

print("Seeding Roadmap...")
# 5. Roadmap
roadmap_dict = {
    "Week 1": {
        "Topics": ["Java OOP Core", "Two Pointer Coding Problems"],
        "Goal": "Master abstract classes, inheritance, polymorphism, and solve 10 LeetCode array problems."
    },
    "Week 2": {
        "Topics": ["SQL Joins & Grouping", "Stack & Queue Architectures"],
        "Goal": "Write complex database queries with aggregations and implement min-stack solutions."
    },
    "Week 3": {
        "Topics": ["Tree & Graph Traversals", "DBMS Indexes & Transactions"],
        "Goal": "Practice Pre/In/Post order binary tree traversals, implement ACID transaction scripts."
    },
    "Week 4": {
        "Topics": ["System Design Cockpit", "Google/Amazon Technical Mock Simulations"],
        "Goal": "Design a distributed URL shortener system, take 3 mock tests on InterviewAce."
    }
}
roadmap = Roadmap(
    user_id=candidate.id,
    roadmap_data=json.dumps(roadmap_dict)
)
db.add(roadmap)
db.commit()

print("Database Seeding Completed Successfully!")
