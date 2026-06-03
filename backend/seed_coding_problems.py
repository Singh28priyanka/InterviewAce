import json
from app.database import engine, Base, SessionLocal
from app.models import CodingProblem

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Cleanup previous coding problems
db.query(CodingProblem).delete()
db.commit()

# Core questions template database
core_problems = [
    {
        "title": "Two Sum",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.\\n\\nInput Format:\\nLine 1: Comma-separated integers (e.g. 2,7,11,15)\\nLine 2: Target integer (e.g. 9)",
        "test_cases": [
            {"input": "2,7,11,15\n9", "expected": "0,1"},
            {"input": "3,2,4\n6", "expected": "1,2"},
            {"input": "3,3\n6", "expected": "0,1"}
        ],
        "template_python": """# Write your Python 3 code here
import sys

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = [int(x) for x in lines[0].strip().split(",")]
        target = int(lines[1].strip())
        result = two_sum(nums, target)
        if result:
            print(f"{result[0]},{result[1]}")
""",
        "template_java": """// Save class name as Solution
import java.util.*;
import java.io.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (seen.containsKey(diff)) {
                return new int[]{seen.get(diff), i};
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        String line2 = br.readLine();
        if (line1 != null && line2 != null) {
            String[] tokens = line1.split(",");
            int[] nums = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) {
                nums[i] = Integer.parseInt(tokens[i].trim());
            }
            int target = Integer.parseInt(line2.trim());
            int[] res = twoSum(nums, target);
            if (res.length == 2) {
                System.out.println(res[0] + "," + res[1]);
            }
        }
    }
}
""",
        "template_cpp": """// Write your C++ solution
#include <iostream>
#include <vector>
#include <sstream>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (seen.count(diff)) {
            return {seen[diff], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    string line1, line2;
    if (getline(cin, line1) && getline(cin, line2)) {
        stringstream ss(line1);
        string token;
        vector<int> nums;
        while (getline(ss, token, ',')) {
            nums.push_back(stoi(token));
        }
        int target = stoi(line2);
        vector<int> res = twoSum(nums, target);
        if (!res.empty()) {
            cout << res[0] << "," << res[1] << endl;
        }
    }
    return 0;
}
"""
    },
    {
        "title": "Palindrome Number",
        "description": "Given an integer x, return true if x is a palindrome, and false otherwise.\\n\\nInput Format:\\nLine 1: An integer (e.g. 121)",
        "test_cases": [
            {"input": "121", "expected": "true"},
            {"input": "-121", "expected": "false"},
            {"input": "10", "expected": "false"}
        ],
        "template_python": """# Palindrome Number
import sys

def is_palindrome(x):
    if x < 0:
        return False
    return str(x) == str(x)[::-1]

if __name__ == '__main__':
    val = int(sys.stdin.read().strip())
    print('true' if is_palindrome(val) else 'false')
""",
        "template_java": """import java.util.*;
public class Solution {
    public static boolean isPalindrome(int x) {
        if (x < 0) return false;
        String s = String.valueOf(x);
        String rev = new StringBuilder(s).reverse().toString();
        return s.equals(rev);
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int val = sc.nextInt();
            System.out.println(isPalindrome(val) ? "true" : "false");
        }
    }
}
""",
        "template_cpp": """#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
bool isPalindrome(int x) {
    if (x < 0) return false;
    string s = to_string(x);
    string r = s;
    reverse(r.begin(), r.end());
    return s == r;
}
int main() {
    int val;
    if (cin >> val) {
        cout << (isPalindrome(val) ? "true" : "false") << endl;
    }
    return 0;
}
"""
    },
    {
        "title": "Valid Parentheses",
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\\nAn input string is valid if brackets close in the correct order and open brackets are closed by the same type of brackets.\\n\\nInput Format:\\nLine 1: Brackets string (e.g. ()[]{})",
        "test_cases": [
            {"input": "()", "expected": "true"},
            {"input": "()[]{}", "expected": "true"},
            {"input": "(]", "expected": "false"}
        ],
        "template_python": """# Valid Parentheses
import sys
def is_valid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    print('true' if is_valid(s) else 'false')
""",
        "template_java": """import java.util.*;
public class Solution {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            System.out.println(isValid(sc.next()) ? "true" : "false");
        }
    }
}
""",
        "template_cpp": """#include <iostream>
#include <string>
#include <stack>
using namespace std;
bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            st.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return st.empty();
}
int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}
"""
    }
]

companies = ["Google", "Amazon", "Microsoft", "TCS", "Infosys", "Wipro", "Accenture", "General"]
difficulty_levels = ["Easy", "Medium", "Hard"]

print("Generating 100 coding problems...")
seeded_count = 0

for i in range(100):
    company = companies[i % len(companies)]
    difficulty = difficulty_levels[i % len(difficulty_levels)]
    
    template = core_problems[i % len(core_problems)]
    
    title = f"{company} {template['title']} (Problem #{i+1})"
    description = f"[{company} Hiring Test] {template['description']}"
    
    db_p = CodingProblem(
        title=title,
        description=description,
        difficulty=difficulty,
        company=company,
        test_cases=json.dumps(template['test_cases']),
        template_python=template['template_python'],
        template_java=template['template_java'],
        template_cpp=template['template_cpp']
    )
    db.add(db_p)
    seeded_count += 1

db.commit()
print(f"Successfully seeded {seeded_count} coding questions categorized by company and difficulty!")
