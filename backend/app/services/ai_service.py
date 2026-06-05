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
            
    return {
        "skills": ["Extraction Failed - Standard Skills Assumed: Java", "Python", "SQL", "DSA"],
        "education": ["CS Student"],
        "projects": ["Personal Projects"],
        "certifications": [],
        "ats_score": 50.0,
        "career_guidance": "Could not parse resume text accurately. Please ensure the PDF contains selectable text."
    }

def generate_dynamic_questions(interview_type: str, difficulty: str, skills: list, count: int = 2) -> list:
    """Generates 2-3 dynamic interview questions using Gemini with custom templates for companies/roles"""
    skills_str = ", ".join(skills) if skills else "OOP, DSA, Databases, System Design"
    
    # Parse role & round if embedded
    job_role = "Software Engineer"
    round_type = "Technical"
    if "|" in interview_type:
        parts = interview_type.split("|")
        job_role = parts[0].strip()
        round_type = parts[1].strip()
    elif "(" in interview_type:
        parts = interview_type.split("(")
        job_role = parts[0].strip()
        round_type = parts[1].replace(")", "").strip()
    else:
        job_role = interview_type.strip()

    if use_mock:
        # High fidelity mock generator for role-specific questions
        if "PRODUCT MANAGER" in job_role.upper():
            if "BEHAVIORAL" in round_type.upper():
                return [
                    {
                        "question_text": "Tell me about a time when you had to make a product decision without user data. What was the outcome?",
                        "ideal_answer": "Utilize a structured approach: state the initial problem, outline constraints, detail alignment with business goals, and explain retrospective validation."
                    },
                    {
                        "question_text": "How do you handle a conflict between engineering and design regarding a critical UI feature timeline?",
                        "ideal_answer": "Prioritize user value and tech debt tradeoff analysis. Organize cross-functional sessions to establish a phased release schedule."
                    }
                ]
            else:
                return [
                    {
                        "question_text": "How would you design a monetization strategy for a new remote job hunting platform?",
                        "ideal_answer": "Detail value propositions, customer segments (job seekers vs. recruiters), subscription models, premium features, and metric tracking (ARPU, LTV)."
                    },
                    {
                        "question_text": "What metrics would you track to measure the success of a newly launched video mock interview module?",
                        "ideal_answer": "Define north-star metrics (user retention, completion rate) and behavioral metrics (average sessions per week, NPS)."
                    }
                ]
        elif "DATA" in job_role.upper():
            return [
                {
                    "question_text": "Explain the difference between bagging and boosting algorithms. When would you prefer boosting?",
                    "ideal_answer": "Explain variance reduction (bagging/Random Forest) vs bias reduction (boosting/XGBoost). Prefer boosting when training data is clean and accuracy is the primary driver."
                },
                {
                    "question_text": "How do you design an A/B test pipeline to measure a new landing page conversion rate improvement?",
                    "ideal_answer": "Outline sample size estimation using power analysis, randomization, setting the significance level (alpha), and calculating p-value."
                }
            ]
        elif "HR" in job_role.upper():
            return [
                {
                    "question_text": "How would you handle a high-performing employee who is causing cultural friction within the team?",
                    "ideal_answer": "Discuss active listening, scheduling 1-on-1 feedback sessions, setting behavioral expectations, and balancing output vs team morale."
                },
                {
                    "question_text": "What is your strategy for designing an inclusive and objective virtual recruiting process?",
                    "ideal_answer": "Discuss standardized structured rubrics, blind resume assessments, diverse interview panels, and unconscious bias training."
                }
            ]
        elif "GOOGLE" in job_role.upper():
            return [
                {
                    "question_text": "Describe how you would design a globally distributed cache system (like Memcached) for Google Search. How do you handle consistency?",
                    "ideal_answer": "Detail consistency hashing, read-through/write-through policies, replication, and latency reductions using edge servers."
                },
                {
                    "question_text": "Given a stream of integers, how do you find the median at any point in time with O(1) retrieval?",
                    "ideal_answer": "Use a Min-Heap and a Max-Heap. Maintain heaps sizes balanced (difference <= 1). Median is root of the larger heap, or average of both roots if sizes are equal."
                }
            ]
        elif "AMAZON" in job_role.upper():
            return [
                {
                    "question_text": "Amazon Customer Experience: How would you design a product recommendation system that scales to 100M+ active daily users?",
                    "ideal_answer": "Focus on collaborative filtering, vector embeddings, database sharding, caching layers (Redis), and event-driven updates (Kafka)."
                },
                {
                    "question_text": "Explain Amazon's Leadership Principle: 'Customer Obsession'. How would you apply it to resolve a buggy checkout line API issue?",
                    "ideal_answer": "Explain the priority of immediate fallback systems, clear communication, and post-mortem review to prevent repeated client outages."
                }
            ]
        elif "TCS" in job_role.upper() or "INFOSYS" in job_role.upper() or "WIPRO" in job_role.upper() or "ACCENTURE" in job_role.upper():
            return [
                {
                    "question_text": f"Explain compilation phases and exception handling hierarchies in {skills[0] if skills else 'programming'}.",
                    "ideal_answer": "Detail parsing, syntax tree generation, compilation to bytecode, and try-catch blocks with unchecked exceptions."
                },
                {
                    "question_text": "How do you explain the difference between static binding and dynamic binding with a coding example?",
                    "ideal_answer": "Static binding occurs at compile time (overloading). Dynamic binding occurs at runtime (overriding method of parent class)."
                }
            ]
        else:
            return [
                {
                    "question_text": f"Explain dynamic memory management and pointer usage in {skills[0] if skills else 'OOP'}.",
                    "ideal_answer": "Detail heap vs stack allocations, memory leak prevention, and destructors/smart pointers."
                },
                {
                    "question_text": "How would you solve standard concurrency race conditions in a multithreaded application?",
                    "ideal_answer": "Explain mutex locks, synchronized code locks, semaphore flags, and volatile memory caches."
                }
            ]

    # Gemini call
    company_style = ""
    if "GOOGLE" in job_role.upper():
        company_style = "Google-style technical questions focusing on high-performance scale, system design, and advanced data structures (graphs, trees)."
    elif "AMAZON" in job_role.upper():
        company_style = "Amazon-style technical questions focusing on distributed systems, optimization, and Amazon Leadership Principles."
    elif "MICROSOFT" in job_role.upper():
        company_style = "Microsoft-style technical questions focusing on low-level resource management, system APIs, OS concepts, and algorithmic efficiency."
    elif "TCS" in job_role.upper() or "INFOSYS" in job_role.upper() or "WIPRO" in job_role.upper() or "ACCENTURE" in job_role.upper():
        company_style = "Service company style questions focusing on core programming syntax (Java/Python), SQL queries, basic DSA (Arrays/Linked Lists), and OOP concepts."
    
    prompt = f"""
    Generate {count} unique and highly specific interview questions for a {job_role} interview, specifically for the {round_type} round at {difficulty} level.
    The candidate has skills in: {skills_str}.
    Style guideline: {company_style if company_style else 'Standard high-quality questions matching the job role and round type.'}
    """
    
    response = call_gemini(prompt, response_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass
            
    # Mock fallback
    return generate_dynamic_questions(interview_type, difficulty, skills, count)

def generate_questions(interview_type: str, difficulty: str, skills: list, history: list = None) -> list:
    """Legacy question generator (unused now, we query from question bank)"""
    return generate_dynamic_questions(interview_type, difficulty, skills, 3)

def evaluate_answer(question_text: str, user_answer: str, ideal_answer: str, wpm: float = None, filler_words_count: int = None) -> dict:
    """Evaluates a user answer with optional speaking pace and filler words counts"""
    if use_mock:
        is_behavioral = any(kw in question_text.lower() for kw in ["tell me", "why", "describe", "conflict", "strength", "weakness", "journey", "fail", "lead", "star"])
        if is_behavioral:
            communication_fb = (
                "[STAR]\n"
                "- Situation: You clearly described the project team size and goal. (Score: 8/10)\n"
                "- Task: Defined the conflicting deadlines and feature priorities. (Score: 7/10)\n"
                "- Action: Showed strong communication by calling a alignment meeting. (Score: 9/10)\n"
                "- Result: Delivered the module on-time, reducing latency by 12%. (Score: 8/10)"
            )
        else:
            communication_fb = "Clear and logical flow. You spoke with good structure but could use more precise terminology."
            if wpm:
                communication_fb += f" Speaking rate of {wpm} WPM is optimal."
            if filler_words_count:
                communication_fb += f" Noticed {filler_words_count} verbal filler pauses."

        return {
            "score": 7.8,
            "feedback_accuracy": "The answer is conceptually correct and covers the main topics (e.g. definitions and usage).",
            "feedback_communication": communication_fb,
            "feedback_depth": "Good understanding shown. Adding a concrete code snippet or real-world project example would make it stand out.",
            "feedback_confidence": "Tone is positive and assertive." + (f" Try to reduce the {filler_words_count} verbal pauses." if filler_words_count and filler_words_count > 3 else ""),
            "feedback_clarity": "The core message is understandable, though a bit wordy in the middle.",
            "feedback_strengths": "Strong conceptual foundation, structured delivery, and accurate examples.",
            "feedback_weaknesses": "Missed referencing edge cases (e.g., memory management, thread safety) and used slight pauses.",
            "suggested_answer": ideal_answer
        }
        
    extra_details = ""
    if wpm is not None:
        extra_details += f"\nCandidate Speaking Pace: {wpm} words per minute (normal/optimal conversational pace is 110-150 WPM)."
    if filler_words_count is not None:
        extra_details += f"\nCandidate Filler Words count (verbal pauses like 'um', 'uh', 'like'): {filler_words_count} times."

    prompt = f"""
    Evaluate the user's answer to the interview question below:
    
    Question: {question_text}
    Ideal Points: {ideal_answer}
    User's Answer: {user_answer}
    {extra_details}
    
    CRITICAL INSTRUCTION FOR BEHAVIORAL/HR QUESTIONS:
    If this is a behavioral/HR question, perform a STAR Method analysis (Situation, Task, Action, Result).
    In the 'feedback_communication' field of your JSON response, you MUST prefix the string with '[STAR]' and structure it as:
    '[STAR]\n- Situation: [your feedback on how they described the situation] (Score: X/10)\n- Task: [your feedback on how they described the task/challenge] (Score: X/10)\n- Action: [your feedback on how they described their specific actions] (Score: X/10)\n- Result: [your feedback on how they described the outcome/numbers] (Score: X/10)'
    Make sure each letter is explicitly evaluated.
    
    Return a JSON object containing:
    - score (float out of 10)
    - feedback_accuracy (string, evaluate technical correctness)
    - feedback_communication (string, evaluate speaking/writing structure and pace)
    - feedback_depth (string, detail technical depth shown or missed)
    - feedback_confidence (string, assess confidence indicators based on text style and verbal filler pauses)
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
            
    return evaluate_answer(question_text, user_answer, ideal_answer, wpm, filler_words_count)

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


def get_code_hint(problem_title: str, language: str, code: str, chat_history: list, message: str) -> str:
    """Generates code hints using Gemini as an interviewer without giving the full code"""
    if use_mock:
        return "Think about using a two-pointer approach here. If the array is sorted, you can check if the sum of elements at the left and right pointers matches the target, then move pointers closer."

    history_str = ""
    for msg in chat_history:
        role = "Candidate" if msg.get("role") == "user" else "Interviewer"
        history_str += f"{role}: {msg.get('content')}\n"

    prompt = f"""
    You are a friendly technical coding interviewer conducting a mock interview.
    The candidate is solving the problem '{problem_title}' in {language}.
    
    Current Code:
    {code}
    
    Chat History:
    {history_str}
    
    Candidate's Question/Message:
    {message}
    
    Provide a brief (2-3 sentences) hint or guidance.
    CRITICAL RULE: DO NOT write the full code solution. Give conceptual tips, ask guiding questions, or point out edge cases to help them solve it themselves.
    """
    
    response = call_gemini(prompt, response_json=False)
    if response:
        return response.strip()
    return "Think about how you can check the values iteratively. Are there any libraries or datastructures (like a map or stack) that could simplify tracking?"

def match_resume_to_jd(parsed_resume: dict, jd_text: str) -> dict:
    """Compares parsed resume details with a target Job Description using Gemini"""
    if use_mock:
        return {
            "match_score": 75.0,
            "missing_keywords": ["FastAPI", "Docker", "CI/CD Pipelines", "System Design"],
            "resume_suggestions": [
                "Detail your backend APIs experience by referencing FastAPI explicitly rather than just 'Python backend'.",
                "Add a deployment section detailing any experience with Docker, cloud providers, or CI/CD pipelines.",
                "Incorporate system design terminology (sharding, caching, load balancing) in your E-commerce project description."
            ],
            "ats_compatibility_feedback": "The resume has a solid layout and covers core DSA/OOP concepts, but lacks terms relating to modern deployment practices (Docker, Kubernetes) and scaling which are highlighted in the job description."
        }

    prompt = f"""
    Compare the following candidate profile with the target Job Description (JD).
    
    Candidate Profile:
    - Skills: {parsed_resume.get('skills', [])}
    - Projects: {parsed_resume.get('projects', [])}
    
    Target Job Description:
    {jd_text}
    
    Return a JSON object containing:
    - match_score (float between 0 and 100 assessing suitability)
    - missing_keywords (list of strings representing critical skills/keywords in the JD that are not evident in the candidate profile)
    - resume_suggestions (list of strings outlining concrete improvements to better align the resume to the JD)
    - ats_compatibility_feedback (string summarizing overall compatibility and layout advice)
    """

    response = call_gemini(prompt, response_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass

    return match_resume_to_jd(parsed_resume, jd_text)
