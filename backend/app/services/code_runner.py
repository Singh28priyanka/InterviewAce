import os
import subprocess
import tempfile
import uuid

# Coding Problem Definitions
PROBLEMS = {
    "Two Sum": {
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nInput Format:\nLine 1: Comma-separated integers (e.g. 2,7,11,15)\nLine 2: Target integer (e.g. 9)",
        "test_cases": [
            {"input": "2,7,11,15\n9", "expected": "0,1"},
            {"input": "3,2,4\n6", "expected": "1,2"},
            {"input": "3,3\n6", "expected": "0,1"}
        ],
        "templates": {
            "python": "# Write your Python 3 code here\nimport sys\n\ndef two_sum(nums, target):\n    # Implement here\n    pass\n\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        nums = [int(x) for x in lines[0].strip().split(\",\")]\n        target = int(lines[1].strip())\n        # Print result as comma separated indices\n",
            "java": "// Save class name as Solution\nimport java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) throws Exception {\n        // Implement input parsing and logic here\n    }\n}",
            "cpp": "// Write your C++ solution\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Implement here\n    return 0;\n}"
        }
    },
    "Palindrome Number": {
        "description": "Given an integer x, return true if x is a palindrome, and false otherwise.\n\nInput Format:\nLine 1: An integer (e.g. 121)",
        "test_cases": [
            {"input": "121", "expected": "true"},
            {"input": "-121", "expected": "false"},
            {"input": "10", "expected": "false"}
        ],
        "templates": {
            "python": "# Palindrome Number\nimport sys\n\ndef is_palindrome(x):\n    # Implement\n    return False\n\nif __name__ == '__main__':\n    val = int(sys.stdin.read().strip())\n    print('true' if is_palindrome(val) else 'false')\n",
            "java": "import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement\n    }\n}",
            "cpp": "#include <iostream>\nusing namespace std;\nint main() {\n    // Implement\n    return 0;\n}"
        }
    },
    "Valid Parentheses": {
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if brackets close in the correct order and open brackets are closed by the same type of brackets.\n\nInput Format:\nLine 1: Brackets string (e.g. ()[]{}",
        "test_cases": [
            {"input": "()", "expected": "true"},
            {"input": "()[]{}", "expected": "true"},
            {"input": "(]", "expected": "false"}
        ],
        "templates": {
            "python": "# Valid Parentheses\nimport sys\ndef is_valid(s):\n    # Implement\n    return False\n\nif __name__ == '__main__':\n    s = sys.stdin.read().strip()\n    print('true' if is_valid(s) else 'false')\n",
            "java": "import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        // Implement\n    }\n}",
            "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    // Implement\n    return 0;\n}"
        }
    }
}

def execute_code(problem_title: str, language: str, code: str) -> dict:
    """Compiles and runs code against test cases in a subprocess sandbox"""
    if problem_title not in PROBLEMS:
        return {"error": "Problem not found", "passed": 0, "total": 0}

    problem = PROBLEMS[problem_title]
    test_cases = problem["test_cases"]
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
                    # Runtime error
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
