import os
import subprocess
import tempfile
import uuid
import json
from ..database import SessionLocal
from ..models import CodingProblem

def execute_code(problem_title: str, language: str, code: str) -> dict:
    """Compiles and runs code against test cases from the database CodingProblem table in a subprocess sandbox"""
    db = SessionLocal()
    try:
        problem = db.query(CodingProblem).filter(CodingProblem.title == problem_title).first()
        if not problem:
            return {"error": "Problem not found", "passed": 0, "total": 0}
        
        try:
            test_cases = json.loads(problem.test_cases)
        except Exception:
            return {"error": "Corrupted test cases format", "passed": 0, "total": 0}
    finally:
        db.close()

    passed = 0
    total = len(test_cases)
    
    # Create temp directory
    with tempfile.TemporaryDirectory() as tmpdir:
        file_id = str(uuid.uuid4())[:8]
        
        if language == "python":
            filename = os.path.join(tmpdir, f"solution_{file_id}.py")
            with open(filename, "w") as f:
                f.write(code)
            
            run_cmd = ["python3", filename]
            
        elif language == "cpp":
            source_file = os.path.join(tmpdir, f"solution_{file_id}.cpp")
            binary_file = os.path.join(tmpdir, f"solution_{file_id}")
            with open(source_file, "w") as f:
                f.write(code)
                
            # Compile C++ code
            compile_cmd = ["g++", "-std=c++17", source_file, "-o", binary_file]
            comp_proc = subprocess.run(compile_cmd, capture_output=True, text=True)
            if comp_proc.returncode != 0:
                return {
                    "error": f"Compilation Error:\n{comp_proc.stderr}",
                    "passed": 0,
                    "total": total
                }
            run_cmd = [binary_file]
            
        elif language == "java":
            # Java needs class Solution
            source_file = os.path.join(tmpdir, "Solution.java")
            with open(source_file, "w") as f:
                f.write(code)
                
            # Compile Java code
            compile_cmd = ["javac", source_file]
            comp_proc = subprocess.run(compile_cmd, capture_output=True, text=True)
            if comp_proc.returncode != 0:
                return {
                    "error": f"Compilation Error:\n{comp_proc.stderr}",
                    "passed": 0,
                    "total": total
                }
            run_cmd = ["java", "-cp", tmpdir, "Solution"]
        else:
            return {"error": "Unsupported language", "passed": 0, "total": total}
            
        # Run test cases
        for tc in test_cases:
            try:
                proc = subprocess.run(
                    run_cmd,
                    input=tc["input"],
                    capture_output=True,
                    text=True,
                    timeout=2.0 # 2s timeout safety
                )
                if proc.returncode != 0:
                    return {
                        "error": f"Runtime Error:\n{proc.stderr or proc.stdout}",
                        "passed": passed,
                        "total": total
                    }
                
                user_output = proc.stdout.strip().lower()
                expected_output = tc["expected"].strip().lower()
                
                if user_output == expected_output:
                    passed += 1
            except subprocess.TimeoutExpired:
                return {
                    "error": "Time Limit Exceeded (Timeout of 2.0s expired)",
                    "passed": passed,
                    "total": total
                }
            except Exception as e:
                return {
                    "error": f"Execution Error: {str(e)}",
                    "passed": passed,
                    "total": total
                }
                
    return {
        "error": None,
        "passed": passed,
        "total": total
    }
