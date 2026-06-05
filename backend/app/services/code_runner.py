import os
import subprocess
import tempfile
import uuid
import json
import base64
import requests
import time
from ..database import SessionLocal
from ..models import CodingProblem

def execute_code(problem_title: str, language: str, code: str) -> dict:
    \"\"\"Compiles and runs code against test cases. Integrates Judge0 API with local subprocess fallback.\"\"\"
    db = SessionLocal()
    try:
        problem = db.query(CodingProblem).filter(CodingProblem.title == problem_title).first()
        if not problem:
            return {"error": "Problem not found", "passed": 0, "total": 0, "runtime": "N/A", "memory_usage": "N/A", "status": "Error"}
        
        try:
            test_cases = json.loads(problem.test_cases)
        except Exception:
            return {"error": "Corrupted test cases format", "passed": 0, "total": 0, "runtime": "N/A", "memory_usage": "N/A", "status": "Error"}
    finally:
        db.close()

    passed = 0
    total = len(test_cases)
    
    # Track metrics
    max_runtime = 0.0
    max_memory = 0
    execution_status = "Accepted"
    compilation_error = None
    runtime_error = None
    
    # 1. Try Judge0 API first
    lang_map = {
        "python": 71,
        "java": 62,
        "cpp": 54,
        "javascript": 63
    }
    lang_id = lang_map.get(language.lower(), 71)
    
    judge0_success = True
    for tc in test_cases:
        url = "https://play.judge0.com/submissions?wait=true"
        payload = {
            "source_code": base64.b64encode(code.encode("utf-8")).decode("utf-8"),
            "language_id": lang_id,
            "stdin": base64.b64encode(tc["input"].encode("utf-8")).decode("utf-8") if tc.get("input") else "",
            "expected_output": base64.b64encode(tc["expected"].encode("utf-8")).decode("utf-8") if tc.get("expected") else ""
        }
        try:
            # 3 second timeout for API
            res = requests.post(url, json=payload, timeout=3.0)
            if res.status_code in [200, 201]:
                res_data = res.json()
                status_id = res_data.get("status", {}).get("id", 3)
                status_desc = res_data.get("status", {}).get("description", "Unknown")
                
                # Check compile/stderr
                compile_err = res_data.get("compile_output")
                stderr_err = res_data.get("stderr")
                
                if compile_err:
                    compilation_error = base64.b64decode(compile_err).decode("utf-8")
                    execution_status = "Compilation Error"
                    break
                
                if stderr_err:
                    runtime_error = base64.b64decode(stderr_err).decode("utf-8")
                    execution_status = "Runtime Error"
                    break
                
                # Retrieve stdout
                stdout_b64 = res_data.get("stdout") or ""
                stdout = base64.b64decode(stdout_b64).decode("utf-8").strip() if stdout_b64 else ""
                
                # Compare
                expected = tc["expected"].strip()
                if stdout == expected or stdout.lower() == expected.lower():
                    passed += 1
                else:
                    execution_status = "Wrong Answer"
                
                # Track maximum runtime/memory
                try:
                    time_taken = float(res_data.get("time") or 0.0)
                    if time_taken > max_runtime:
                        max_runtime = time_taken
                except ValueError:
                    pass
                
                try:
                    mem_val = int(res_data.get("memory") or 0)
                    if mem_val > max_memory:
                        max_memory = mem_val
                except ValueError:
                    pass
            else:
                judge0_success = False
                break
        except Exception:
            judge0_success = False
            break

    # If Judge0 API succeeded for all runs, return results
    if judge0_success:
        if compilation_error:
            return {
                "error": f"Compilation Error:\n{compilation_error}",
                "passed": 0,
                "total": total,
                "runtime": "N/A",
                "memory_usage": "N/A",
                "status": "Compilation Error"
            }
        if runtime_error:
            return {
                "error": f"Runtime Error:\n{runtime_error}",
                "passed": passed,
                "total": total,
                "runtime": f"{max_runtime:.3f}s",
                "memory_usage": f"{max_memory} KB" if max_memory > 0 else "N/A",
                "status": "Runtime Error"
            }
        return {
            "error": None,
            "passed": passed,
            "total": total,
            "runtime": f"{max_runtime:.3f}s",
            "memory_usage": f"{max_memory} KB" if max_memory > 0 else "N/A",
            "status": "Accepted" if passed == total else "Wrong Answer"
        }

    # 2. Local Fallback Subprocess execution
    passed = 0
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
            compile_cmd = ["g++", "-std=c++17", source_file, "-o", binary_file]
            comp_proc = subprocess.run(compile_cmd, capture_output=True, text=True)
            if comp_proc.returncode != 0:
                return {
                    "error": f"Compilation Error:\n{comp_proc.stderr}",
                    "passed": 0,
                    "total": total,
                    "runtime": "N/A",
                    "memory_usage": "N/A",
                    "status": "Compilation Error"
                }
            run_cmd = [binary_file]
            
        elif language == "java":
            source_file = os.path.join(tmpdir, "Solution.java")
            with open(source_file, "w") as f:
                f.write(code)
            compile_cmd = ["javac", source_file]
            comp_proc = subprocess.run(compile_cmd, capture_output=True, text=True)
            if comp_proc.returncode != 0:
                return {
                    "error": f"Compilation Error:\n{comp_proc.stderr}",
                    "passed": 0,
                    "total": total,
                    "runtime": "N/A",
                    "memory_usage": "N/A",
                    "status": "Compilation Error"
                }
            run_cmd = ["java", "-cp", tmpdir, "Solution"]
            
        elif language == "javascript":
            filename = os.path.join(tmpdir, f"solution_{file_id}.js")
            with open(filename, "w") as f:
                f.write(code)
            run_cmd = ["node", filename]
            
        else:
            return {"error": "Unsupported language", "passed": 0, "total": total, "runtime": "N/A", "memory_usage": "N/A", "status": "Error"}
            
        max_duration = 0.0
        
        for tc in test_cases:
            try:
                start_t = time.perf_counter()
                proc = subprocess.run(
                    run_cmd,
                    input=tc["input"],
                    capture_output=True,
                    text=True,
                    timeout=2.0
                )
                duration = time.perf_counter() - start_t
                if duration > max_duration:
                    max_duration = duration
                
                if proc.returncode != 0:
                    return {
                        "error": f"Runtime Error:\n{proc.stderr or proc.stdout}",
                        "passed": passed,
                        "total": total,
                        "runtime": f"{max_duration:.3f}s",
                        "memory_usage": "N/A",
                        "status": "Runtime Error"
                    }
                
                user_output = proc.stdout.strip().lower()
                expected_output = tc["expected"].strip().lower()
                
                if user_output == expected_output:
                    passed += 1
            except subprocess.TimeoutExpired:
                return {
                    "error": "Time Limit Exceeded (Timeout of 2.0s expired)",
                    "passed": passed,
                    "total": total,
                    "runtime": "2.000s",
                    "memory_usage": "N/A",
                    "status": "Time Limit Exceeded"
                }
            except Exception as e:
                return {
                    "error": f"Execution Error: {str(e)}",
                    "passed": passed,
                    "total": total,
                    "runtime": "N/A",
                    "memory_usage": "N/A",
                    "status": "Error"
                }
                
    return {
        "error": None,
        "passed": passed,
        "total": total,
        "runtime": f"{max_duration:.3f}s",
        "memory_usage": "N/A",
        "status": "Accepted" if passed == total else "Wrong Answer"
    }
