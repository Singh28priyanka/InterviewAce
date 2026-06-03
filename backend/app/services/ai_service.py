import json
import os
import google.generativeai as genai
from ..config import settings

# Initialize Gemini if key is provided
api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
use_mock = not api_key

if not use_mock:
    genai.configure(api_key=api_key)

def call_gemini(prompt: str, response_json: bool = True) -> str:
    """Helper to call Gemini model"""
    if use_mock:
        return ""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        generation_config = {}
        if response_json:
            generation_config = {"response_mime_type": "application/json"}
        
        response = model.generate_content(prompt, generation_config=generation_config)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return ""

def parse_resume(pdf_text: str) -> dict:
    """Parses resume text using Gemini to extract skills, education, projects, certifications, and calculate ATS score"""
    if use_mock or not pdf_text:
        # High fidelity mock resume parse
        return {
            "skills": ["Java", "Python", "SQL", "Data Structures", "Algorithms", "FastAPI", "React"],
            "education": ["B.Tech in Computer Science and Engineering, GPA: 8.9"],
            "projects": ["E-Commerce App: React & Node.js web app with Stripe integration", "Library Management System: Java Swing and MySQL project"],
            "certifications": ["AWS Cloud Practitioner", "Oracle Certified Java SE Developer"],
            "ats_score": 78.5,
            "career_guidance": "Your resume is strong in Core Software Engineering (Java, SQL) and Web Development. To target Tier-1 companies like Amazon/Google, work on advanced DSA (Graphs, Dynamic Programming) and system design. Strengthen your cloud projects with CI/CD deployment pipelines."
        }
    
    prompt = f"""
    Analyze the following resume text. Extract details and structure them into JSON format with the following keys:
    - skills (list of strings)
    - education (list of strings representing degrees, schools, GPAs)
    - projects (list of strings detailing project names and summary)
    - certifications (list of strings)
    - ats_score (float from 0 to 100 assessing layout, keywords, structure for tech roles)
    - career_guidance (string offering career advice based on the resume)

    Resume Text:
    {pdf_text}
    """
    
    response = call_gemini(prompt, response_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass
            
    # Fallback mock if parse fails
    return {
        "skills": ["Extraction Failed - Standard Skills Assumed: Java", "Python", "SQL", "DSA"],
        "education": ["CS Student"],
        "projects": ["Personal Projects"],
        "certifications": [],
        "ats_score": 50.0,
        "career_guidance": "Could not parse resume text accurately. Please ensure the PDF contains selectable text."
    }

def generate_questions(interview_type: str, difficulty: str, skills: list, history: list = None) -> list:
    """Generates mock interview questions"""
    if use_mock:
        # Standard high-fidelity interview sets
        if "HR" in interview_type.upper():
            return [
                {
                    "question_text": "Tell me about yourself and your background.",
                    "ideal_answer": "Provide a structured pitch: Present self and core stack, highlight 1-2 major achievements or projects, and explain why you're a good fit for this role."
                },
                {
                    "question_text": "Describe a challenging technical situation you faced and how you overcame it.",
                    "ideal_answer": "Use the STAR method: Situation, Task, Action, Result. Highlight problem-solving, collaboration, and learnings from the issue."
                },
                {
                    "question_text": "Where do you see yourself in five years?",
                    "ideal_answer": "Align personal aspirations with the company's growth. Emphasize mastering technical skills, taking ownership of features, and eventually mentoring juniors."
                }
            ]
        else:
            # Technical Mock Questions
            return [
                {
                    "question_text": f"Explain the difference between abstract classes and interfaces in {skills[0] if skills else 'OOP'}. When would you use which?",
                    "ideal_answer": "Abstract classes can have state (fields) and default behavior (implemented methods), support single inheritance. Interfaces define a contract (methods), support multiple inheritance. Use interfaces for api contracts, and abstract classes for base shared behavior."
                },
                {
                    "question_text": "What is a transaction in DBMS? Explain ACID properties with a real-world example.",
                    "ideal_answer": "A transaction is a logical unit of database processing. ACID: Atomicity (all or nothing), Consistency (preserves DB invariants), Isolation (transactions execution separate), Durability (persisted on disk). Example: Bank transfer."
                },
                {
                    "question_text": "Given an unsorted array, how do you find the duplicates in linear time and O(1) extra space?",
                    "ideal_answer": "For elements range [1, N], use the index-as-hash technique (marking elements negative). Alternatively, if elements can be anything, a hashset takes O(N) space, while sorting takes O(N log N). Under constraint of O(1) space and O(N) time, we modify the array elements in place using index marking if values are constrained, otherwise it's impossible without constraints."
                }
            ]

    skills_str = ", ".join(skills) if skills else "Java, Python, SQL, Operating Systems, DSA"
    prompt = f"""
    Generate 3 interview questions for a {interview_type} mock interview at {difficulty} level.
    The candidate has skills in: {skills_str}.
    Provide the output in JSON format as a list of objects. Each object must have:
    - question_text (string)
    - ideal_answer (string detailing the key points that should be in a perfect answer)
    """
    
    response = call_gemini(prompt, response_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass
            
    # Standard fallback questions
    return generate_questions("HR", "Medium", [])

def evaluate_answer(question_text: str, user_answer: str, ideal_answer: str) -> dict:
    """Evaluates a user answer"""
    if use_mock:
        # High fidelity mock evaluator
        return {
            "score": 7.8,
            "feedback_accuracy": "The answer is conceptually correct and covers the main topics (e.g. definitions and usage).",
            "feedback_communication": "Clear and logical flow. You spoke with good structure but could use more precise terminology.",
            "feedback_depth": "Good understanding shown. Adding a concrete code snippet or real-world project example would make it stand out.",
            "feedback_confidence": "Tone is positive and assertive. Avoid using filler words like 'uh', 'um', or 'like' in the middle of sentences.",
            "feedback_clarity": "The core message is understandable, though a bit wordy in the middle.",
            "feedback_strengths": "Strong conceptual foundation, structured delivery, and accurate examples.",
            "feedback_weaknesses": "Missed referencing edge cases (e.g., memory management, thread safety) and used slight pauses.",
            "suggested_answer": ideal_answer
        }
        
    prompt = f"""
    Evaluate the user's answer to the interview question below:
    
    Question: {question_text}
    Ideal Points: {ideal_answer}
    User's Answer: {user_answer}
    
    Return a JSON object containing:
    - score (float out of 10)
    - feedback_accuracy (string, evaluate technical correctness)
    - feedback_communication (string, evaluate speaking/writing structure)
    - feedback_depth (string, detail technical depth shown or missed)
    - feedback_confidence (string, assess confidence indicators based on text style)
    - feedback_clarity (string, assess how clear and concise the response was)
    - feedback_strengths (string)
    - feedback_weaknesses (string)
    - suggested_answer (string, a refined ideal answer combining user's context and ideal answer)
    """
    
    response = call_gemini(prompt, response_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass
            
    return evaluate_answer(question_text, user_answer, ideal_answer)

def review_code(problem_title: str, language: str, code: str) -> dict:
    """Reviews coding solution for complexity, readability, optimization"""
    if use_mock:
        return {
            "time_complexity": "O(N)",
            "space_complexity": "O(1)",
            "readability_feedback": "Code is well-formatted. Variable names are descriptive and follow standard naming conventions. Comments are minimal but helpful.",
            "optimization_feedback": "The solution is optimal. No further optimization is needed. You avoided extra space allocations by using pointers.",
            "score": 9.0
        }
        
    prompt = f"""
    Review the following coding solution in {language} for the problem '{problem_title}':
    
    Code:
    {code}
    
    Return a JSON object containing:
    - time_complexity (string, e.g. O(N))
    - space_complexity (string, e.g. O(1))
    - readability_feedback (string, feedback on variable naming, comments, style)
    - optimization_feedback (string, feedback on space/time improvements, edge cases)
    - score (float out of 10)
    """
    
    response = call_gemini(prompt, response_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass
            
    return review_code(problem_title, language, code)

def generate_roadmap(performance_summary: str) -> dict:
    """Generates placement roadmap based on student's performance"""
    if use_mock:
        return {
            "Week 1": {"Topics": ["Arrays & HashMaps", "Basic Java OOP"], "Goal": "Solve 15 easy LeetCode problems, code class structures with inheritance."},
            "Week 2": {"Topics": ["Linked Lists & Stacks/Queues", "SQL Queries (Joins, Aggregations)"], "Goal": "Write raw queries for complex reports, reverse linked list."},
            "Week 3": {"Topics": ["Recursion & Binary Trees", "Operating Systems (Processes & Threads)"], "Goal": "Trace process creation, implement Pre/Post/In-order traversals."},
            "Week 4": {"Topics": ["System Design Basics", "Mock Interviews (Technical & HR)"], "Goal": "Practice 3 mock interviews on InterviewAce, design a URL Shortener database."}
        }
        
    prompt = f"""
    Create a personalized 4-week study roadmap based on the candidate's performance summary:
    {performance_summary}
    
    Return a JSON object where keys are 'Week 1', 'Week 2', 'Week 3', 'Week 4'.
    Each week must contain:
    - Topics (list of strings)
    - Goal (string outlining key milestone for the week)
    """
    
    response = call_gemini(prompt, response_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass
            
    return generate_roadmap(performance_summary)
