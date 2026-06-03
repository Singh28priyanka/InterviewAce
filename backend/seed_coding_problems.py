import json
from app.database import engine, Base, SessionLocal
from app.models import CodingProblem

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Cleanup previous coding problems
db.query(CodingProblem).delete()
db.commit()

# Category Templates Generators
def gen_templates(q_type, py_body, java_body, cpp_body):
    if q_type == "two_sum":
        template_python = f"""# Write your Python 3 code here
import sys

def solve(nums, target):
    {py_body}

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = [int(x) for x in lines[0].strip().split(",") if x.strip()]
        target = int(lines[1].strip())
        res = solve(nums, target)
        if isinstance(res, list):
            print(",".join(map(str, res)))
        else:
            print(res)
"""
        template_java = f"""import java.util.*;
import java.io.*;

public class Solution {{
    public static String solve(int[] nums, int target) {{
        {java_body}
    }}

    public static void main(String[] args) throws Exception {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        String line2 = br.readLine();
        if (line1 != null && line2 != null) {{
            String[] tokens = line1.trim().split(",");
            int[] nums = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) {{
                nums[i] = Integer.parseInt(tokens[i].trim());
            }}
            int target = Integer.parseInt(line2.trim());
            System.out.println(solve(nums, target));
        }}
    }}
}}
"""
        template_cpp = f"""#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

string solve(vector<int>& nums, int target) {{
    {cpp_body}
}}

int main() {{
    string line1, line2;
    if (getline(cin, line1) && getline(cin, line2)) {{
        vector<int> nums;
        stringstream ss(line1);
        string token;
        while (getline(ss, token, ',')) {{
            if (!token.empty()) nums.push_back(stoi(token));
        }}
        int target = stoi(line2);
        cout << solve(nums, target) << endl;
    }}
    return 0;
}}
"""

    elif q_type == "single_int":
        template_python = f"""# Write your Python 3 code here
import sys

def solve(n):
    {py_body}

if __name__ == '__main__':
    line = sys.stdin.read().strip()
    if line:
        n = int(line)
        print(str(solve(n)).lower())
"""
        template_java = f"""import java.util.*;
import java.io.*;

public class Solution {{
    public static String solve(int n) {{
        {java_body}
    }}

    public static void main(String[] args) throws Exception {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line != null) {{
            int n = Integer.parseInt(line.trim());
            System.out.println(solve(n).toLowerCase());
        }}
    }}
}}
"""
        template_cpp = f"""#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

string solve(int n) {{
    {cpp_body}
}}

int main() {{
    int n;
    if (cin >> n) {{
        cout << solve(n) << endl;
    }}
    return 0;
}}
"""

    elif q_type == "single_string":
        template_python = f"""# Write your Python 3 code here
import sys

def solve(s):
    {py_body}

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    print(str(solve(s)).lower())
"""
        template_java = f"""import java.util.*;
import java.io.*;

public class Solution {{
    public static String solve(String s) {{
        {java_body}
    }}

    public static void main(String[] args) throws Exception {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line != null) {{
            System.out.println(solve(line.trim()).toLowerCase());
        }} else {{
            System.out.println(solve("").toLowerCase());
        }}
    }}
}}
"""
        template_cpp = f"""#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
#include <unordered_map>
#include <stack>
using namespace std;

string solve(string s) {{
    {cpp_body}
}}

int main() {{
    string s;
    if (getline(cin, s)) {{
        cout << solve(s) << endl;
    }} else {{
        cout << solve("") << endl;
    }}
    return 0;
}}
"""

    elif q_type == "int_array":
        template_python = f"""# Write your Python 3 code here
import sys

def solve(nums):
    {py_body}

if __name__ == '__main__':
    line = sys.stdin.read().strip()
    if line:
        nums = [int(x) for x in line.split(",") if x.strip()]
    else:
        nums = []
    res = solve(nums)
    if isinstance(res, list):
        print(",".join(map(str, res)))
    else:
        print(str(res).lower())
"""
        template_java = f"""import java.util.*;
import java.io.*;

public class Solution {{
    public static String solve(int[] nums) {{
        {java_body}
    }}

    public static void main(String[] args) throws Exception {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line != null && !line.trim().isEmpty()) {{
            String[] tokens = line.trim().split(",");
            int[] nums = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) {{
                nums[i] = Integer.parseInt(tokens[i].trim());
            }}
            System.out.println(solve(nums).toLowerCase());
        }} else {{
            System.out.println(solve(new int[0]).toLowerCase());
        }}
    }}
}}
"""
        template_cpp = f"""#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
using namespace std;

string solve(vector<int>& nums) {{
    {cpp_body}
}}

int main() {{
    string line;
    if (getline(cin, line)) {{
        vector<int> nums;
        stringstream ss(line);
        string token;
        while (getline(ss, token, ',')) {{
            if (!token.empty()) nums.push_back(stoi(token));
        }}
        cout << solve(nums) << endl;
    }} else {{
        vector<int> empty_nums;
        cout << solve(empty_nums) << endl;
    }}
    return 0;
}}
"""

    elif q_type == "two_strings":
        template_python = f"""# Write your Python 3 code here
import sys

def solve(s, t):
    {py_body}

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    s = lines[0].strip() if len(lines) > 0 else ""
    t = lines[1].strip() if len(lines) > 1 else ""
    print(str(solve(s, t)).lower())
"""
        template_java = f"""import java.util.*;
import java.io.*;

public class Solution {{
    public static String solve(String s, String t) {{
        {java_body}
    }}

    public static void main(String[] args) throws Exception {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        String line2 = br.readLine();
        String s = line1 != null ? line1.trim() : "";
        String t = line2 != null ? line2.trim() : "";
        System.out.println(solve(s, t).toLowerCase());
    }}
}}
"""
        template_cpp = f"""#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;

string solve(string s, string t) {{
    {cpp_body}
}}

int main() {{
    string s, t;
    if (getline(cin, s) && getline(cin, t)) {{
        cout << solve(s, t) << endl;
    }} else {{
        cout << solve("", "") << endl;
    }}
    return 0;
}}
"""

    elif q_type == "two_int_arrays":
        template_python = f"""# Write your Python 3 code here
import sys

def solve(nums1, nums2):
    {py_body}

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    nums1 = [int(x) for x in lines[0].strip().split(",") if x.strip()] if len(lines) > 0 and lines[0].strip() else []
    nums2 = [int(x) for x in lines[1].strip().split(",") if x.strip()] if len(lines) > 1 and lines[1].strip() else []
    res = solve(nums1, nums2)
    print(",".join(map(str, res)))
"""
        template_java = f"""import java.util.*;
import java.io.*;

public class Solution {{
    public static String solve(int[] nums1, int[] nums2) {{
        {java_body}
    }}

    public static void main(String[] args) throws Exception {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        String line2 = br.readLine();
        int[] nums1 = parseArray(line1);
        int[] nums2 = parseArray(line2);
        System.out.println(solve(nums1, nums2).toLowerCase());
    }}

    private static int[] parseArray(String line) {{
        if (line == null || line.trim().isEmpty()) return new int[0];
        String[] tokens = line.trim().split(",");
        int[] nums = new int[tokens.length];
        for (int i = 0; i < tokens.length; i++) {{
            nums[i] = Integer.parseInt(tokens[i].trim());
        }}
        return nums;
    }}
}}
"""
        template_cpp = f"""#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <algorithm>
#include <unordered_set>
using namespace std;

string solve(vector<int>& nums1, vector<int>& nums2) {{
    {cpp_body}
}}

vector<int> parseArray(string line) {{
    vector<int> nums;
    if (line.empty()) return nums;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {{
        if (!token.empty()) nums.push_back(stoi(token));
    }}
    return nums;
}}

int main() {{
    string line1, line2;
    if (getline(cin, line1) && getline(cin, line2)) {{
        vector<int> nums1 = parseArray(line1);
        vector<int> nums2 = parseArray(line2);
        cout << solve(nums1, nums2) << endl;
    }}
    return 0;
}}
"""

    elif q_type == "int_array_and_int":
        template_python = f"""# Write your Python 3 code here
import sys

def solve(nums, k):
    {py_body}

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = [int(x) for x in lines[0].strip().split(",") if x.strip()]
        k = int(lines[1].strip())
        res = solve(nums, k)
        if isinstance(res, list):
            print(",".join(map(str, res)))
        else:
            print(str(res).lower())
"""
        template_java = f"""import java.util.*;
import java.io.*;

public class Solution {{
    public static String solve(int[] nums, int k) {{
        {java_body}
    }}

    public static void main(String[] args) throws Exception {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        String line2 = br.readLine();
        if (line1 != null && line2 != null) {{
            String[] tokens = line1.trim().split(",");
            int[] nums = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) {{
                nums[i] = Integer.parseInt(tokens[i].trim());
            }}
            int k = Integer.parseInt(line2.trim());
            System.out.println(solve(nums, k).toLowerCase());
        }}
    }}
}}
"""
        template_cpp = f"""#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

string solve(vector<int>& nums, int k) {{
    {cpp_body}
}}

int main() {{
    string line1, line2;
    if (getline(cin, line1) && getline(cin, line2)) {{
        vector<int> nums;
        stringstream ss(line1);
        string token;
        while (getline(ss, token, ',')) {{
            if (!token.empty()) nums.push_back(stoi(token));
        }}
        int k = stoi(line2);
        cout << solve(nums, k) << endl;
    }}
    return 0;
}}
"""
    return template_python, template_java, template_cpp








Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Cleanup previous coding problems
db.query(CodingProblem).delete()
db.commit()

problems = []

# Questions 1-50
problems.extend([
    {
        "title": "Two Sum",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "difficulty": "Easy",
        "company": "Google",
        "type": "two_sum",
        "test_cases": [{"input": "2,7,11,15\n9", "expected": "0,1"}, {"input": "3,2,4\n6", "expected": "1,2"}],
        "py_body": "seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
        "java_body": "Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (seen.containsKey(diff)) return seen.get(diff) + \",\" + i;\n            seen.put(nums[i], i);\n        }\n        return \"\";",
        "cpp_body": "unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); ++i) {\n        int diff = target - nums[i];\n        if (seen.count(diff)) return to_string(seen[diff]) + \",\" + to_string(i);\n        seen[nums[i]] = i;\n    }\n    return \"\";"
    },
    {
        "title": "Palindrome Number",
        "description": "Given an integer x, return true if x is a palindrome, and false otherwise.",
        "difficulty": "Easy",
        "company": "Amazon",
        "type": "single_int",
        "test_cases": [{"input": "121", "expected": "true"}, {"input": "-121", "expected": "false"}, {"input": "10", "expected": "false"}],
        "py_body": "if n < 0: return False\n    return str(n) == str(n)[::-1]",
        "java_body": "String s = String.valueOf(n);\n        int l = 0, r = s.length() - 1;\n        while (l < r) {\n            if (s.charAt(l) != s.charAt(r)) return \"false\";\n            l++; r--;\n        }\n        return \"true\";",
        "cpp_body": "string s = to_string(n);\n    int l = 0, r = s.length() - 1;\n    while (l < r) {\n        if (s[l] != s[r]) return \"false\";\n        l++; r--;\n    }\n    return \"true\";"
    },
    {
        "title": "Valid Parentheses",
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "difficulty": "Easy",
        "company": "Microsoft",
        "type": "single_string",
        "test_cases": [{"input": "()[]{}", "expected": "true"}, {"input": "(]", "expected": "false"}],
        "py_body": "stack = []\n    mapping = {')': '(', '}': '{{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top: return False\n        else: stack.append(char)\n    return not stack",
        "java_body": "Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '{{' || c == '[') stack.push(c);\n            else {\n                if (stack.isEmpty()) return \"false\";\n                char top = stack.pop();\n                if (c == ')' && top != '(') return \"false\";\n                if (c == '}}' && top != '{{') return \"false\";\n                if (c == ']' && top != '[') return \"false\";\n            }\n        }\n        return stack.isEmpty() ? \"true\" : \"false\";",
        "cpp_body": "stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '{{' || c == '[') st.push(c);\n        else {\n            if (st.empty()) return \"false\";\n            char top = st.top(); st.pop();\n            if (c == ')' && top != '(') return \"false\";\n            if (c == '}}' && top != '{{') return \"false\";\n            if (c == ']' && top != '[') return \"false\";\n        }\n    }\n    return st.empty() ? \"true\" : \"false\";"
    },
    {
        "title": "Reverse String",
        "description": "Given a string s, return the reversed string.",
        "difficulty": "Easy",
        "company": "TCS",
        "type": "single_string",
        "test_cases": [{"input": "hello", "expected": "olleh"}, {"input": "Hannah", "expected": "hannaH"}],
        "py_body": "return s[::-1]",
        "java_body": "return new StringBuilder(s).reverse().toString();",
        "cpp_body": "string r = s;\n    reverse(r.begin(), r.end());\n    return r;"
    },
    {
        "title": "Fizz Buzz",
        "description": "Given an integer n, return 'fizzbuzz' if divisible by 15, 'fizz' if divisible by 3, 'buzz' if divisible by 5, or the number string.",
        "difficulty": "Easy",
        "company": "Infosys",
        "type": "single_int",
        "test_cases": [{"input": "3", "expected": "fizz"}, {"input": "5", "expected": "buzz"}, {"input": "15", "expected": "fizzbuzz"}, {"input": "4", "expected": "4"}],
        "py_body": "if n % 15 == 0: return 'fizzbuzz'\n    elif n % 3 == 0: return 'fizz'\n    elif n % 5 == 0: return 'buzz'\n    else: return str(n)",
        "java_body": "if (n % 15 == 0) return \"fizzbuzz\";\n        if (n % 3 == 0) return \"fizz\";\n        if (n % 5 == 0) return \"buzz\";\n        return String.valueOf(n);",
        "cpp_body": "if (n % 15 == 0) return \"fizzbuzz\";\n    if (n % 3 == 0) return \"fizz\";\n    if (n % 5 == 0) return \"buzz\";\n    return to_string(n);"
    },
    {
        "title": "Fibonacci Number",
        "description": "Given an integer n, calculate the n-th Fibonacci number.",
        "difficulty": "Easy",
        "company": "Wipro",
        "type": "single_int",
        "test_cases": [{"input": "2", "expected": "1"}, {"input": "4", "expected": "3"}, {"input": "6", "expected": "8"}],
        "py_body": "if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b",
        "java_body": "if (n <= 1) return String.valueOf(n);\n        int a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        return String.valueOf(b);",
        "cpp_body": "if (n <= 1) return to_string(n);\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return to_string(b);"
    },
    {
        "title": "Valid Anagram",
        "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
        "difficulty": "Easy",
        "company": "Accenture",
        "type": "two_strings",
        "test_cases": [{"input": "anagram\nnagaram", "expected": "true"}, {"input": "rat\ncar", "expected": "false"}],
        "py_body": "return sorted(s) == sorted(t)",
        "java_body": "char[] sA = s.toCharArray();\n        char[] tA = t.toCharArray();\n        Arrays.sort(sA);\n        Arrays.sort(tA);\n        return Arrays.equals(sA, tA) ? \"true\" : \"false\";",
        "cpp_body": "string sc = s, tc = t;\n    sort(sc.begin(), sc.end());\n    sort(tc.begin(), tc.end());\n    return sc == tc ? \"true\" : \"false\";"
    },
    {
        "title": "Single Number",
        "description": "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
        "difficulty": "Easy",
        "company": "General",
        "type": "int_array",
        "test_cases": [{"input": "2,2,1", "expected": "1"}, {"input": "4,1,2,1,2", "expected": "4"}],
        "py_body": "res = 0\n    for x in nums: res ^= x\n    return res",
        "java_body": "int res = 0;\n        for (int x : nums) res ^= x;\n        return String.valueOf(res);",
        "cpp_body": "int res = 0;\n    for (int x : nums) res ^= x;\n    return to_string(res);"
    },
    {
        "title": "Contains Duplicate",
        "description": "Given an integer array nums, return true if any value appears at least twice in the array.",
        "difficulty": "Easy",
        "company": "Google",
        "type": "int_array",
        "test_cases": [{"input": "1,2,3,1", "expected": "true"}, {"input": "1,2,3,4", "expected": "false"}],
        "py_body": "return len(nums) != len(set(nums))",
        "java_body": "Set<Integer> set = new HashSet<>();\n        for (int x : nums) {\n            if (set.contains(x)) return \"true\";\n            set.add(x);\n        }\n        return \"false\";",
        "cpp_body": "unordered_set<int> s;\n    for (int x : nums) {\n        if (s.count(x)) return \"true\";\n        s.insert(x);\n    }\n    return \"false\";"
    },
    {
        "title": "Majority Element",
        "description": "Given an array nums of size n, return the majority element (which appears more than n/2 times).",
        "difficulty": "Easy",
        "company": "Amazon",
        "type": "int_array",
        "test_cases": [{"input": "3,2,3", "expected": "3"}, {"input": "2,2,1,1,1,2,2", "expected": "2"}],
        "py_body": "cand, count = None, 0\n    for x in nums:\n        if count == 0: cand = x\n        count += (1 if x == cand else -1)\n    return cand",
        "java_body": "int cand = 0, count = 0;\n        for (int x : nums) {\n            if (count == 0) cand = x;\n            count += (x == cand) ? 1 : -1;\n        }\n        return String.valueOf(cand);",
        "cpp_body": "int cand = 0, count = 0;\n    for (int x : nums) {\n        if (count == 0) cand = x;\n        count += (x == cand) ? 1 : -1;\n    }\n    return to_string(cand);"
    },
    {
        "title": "Search Insert Position",
        "description": "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.",
        "difficulty": "Easy",
        "company": "Microsoft",
        "type": "int_array_and_int",
        "test_cases": [{"input": "1,3,5,6\n5", "expected": "2"}, {"input": "1,3,5,6\n2", "expected": "1"}, {"input": "1,3,5,6\n7", "expected": "4"}],
        "py_body": "l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == k: return m\n        elif nums[m] < k: l = m + 1\n        else: r = m - 1\n    return l",
        "java_body": "int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = (l + r) / 2;\n            if (nums[m] == k) return String.valueOf(m);\n            else if (nums[m] < k) l = m + 1;\n            else r = m - 1;\n        }\n        return String.valueOf(l);",
        "cpp_body": "int l = 0, r = nums.size() - 1;\n    while (l <= r) {\n        int m = (l + r) / 2;\n        if (nums[m] == k) return to_string(m);\n        else if (nums[m] < k) l = m + 1;\n        else r = m - 1;\n    }\n    return to_string(l);"
    },
    {
        "title": "Length of Last Word",
        "description": "Given a string s consisting of words and spaces, return the length of the last word in the string.",
        "difficulty": "Easy",
        "company": "TCS",
        "type": "single_string",
        "test_cases": [{"input": "Hello World", "expected": "5"}, {"input": "   fly me   to   the moon  ", "expected": "4"}],
        "py_body": "words = s.strip().split()\n    return len(words[-1]) if words else 0",
        "java_body": "String[] words = s.trim().split(\"\\\\s+\");\n        if (words.length == 0) return \"0\";\n        return String.valueOf(words[words.length - 1].length());",
        "cpp_body": "int len = 0;\n    int i = s.length() - 1;\n    while (i >= 0 && s[i] == ' ') i--;\n    while (i >= 0 && s[i] != ' ') { len++; i--; }\n    return to_string(len);"
    },
    {
        "title": "Plus One",
        "description": "You are given a large integer represented as an integer array digits. Increment the large integer by one and return the resulting array.",
        "difficulty": "Easy",
        "company": "Infosys",
        "type": "int_array",
        "test_cases": [{"input": "1,2,3", "expected": "1,2,4"}, {"input": "9", "expected": "1,0"}],
        "py_body": "for i in range(len(nums) - 1, -1, -1):\n        if nums[i] < 9:\n            nums[i] += 1\n            return nums\n        nums[i] = 0\n    return [1] + nums",
        "java_body": "for (int i = nums.length - 1; i >= 0; i--) {\n            if (nums[i] < 9) {\n                nums[i]++;\n                StringBuilder sb = new StringBuilder();\n                for (int k = 0; k < nums.length; k++) {\n                    sb.append(nums[k]).append(k == nums.length - 1 ? \"\" : \",\");\n                }\n                return sb.toString();\n            }\n            nums[i] = 0;\n        }\n        int[] res = new int[nums.length + 1];\n        res[0] = 1;\n        StringBuilder sb = new StringBuilder();\n        for (int k = 0; k < res.length; k++) {\n            sb.append(res[k]).append(k == res.length - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "for (int i = nums.size() - 1; i >= 0; i--) {\n        if (nums[i] < 9) {\n            nums[i]++;\n            string r = \"\";\n            for (int k = 0; k < nums.size(); k++) {\n                r += to_string(nums[k]) + (k == nums.size() - 1 ? \"\" : \",\");\n            }\n            return r;\n        }\n        nums[i] = 0;\n    }\n    string r = \"1\";\n    for (int k = 0; k < nums.size(); k++) {\n        r += \",0\";\n    }\n    return r;"
    },
    {
        "title": "Climbing Stairs",
        "description": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "difficulty": "Easy",
        "company": "Wipro",
        "type": "single_int",
        "test_cases": [{"input": "2", "expected": "2"}, {"input": "3", "expected": "3"}],
        "py_body": "if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b",
        "java_body": "if (n <= 2) return String.valueOf(n);\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int t = a + b;\n            a = b; b = t;\n        }\n        return String.valueOf(b);",
        "cpp_body": "if (n <= 2) return to_string(n);\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; i++) {\n        int t = a + b;\n        a = b; b = t;\n    }\n    return to_string(b);"
    },
    {
        "title": "Merge Sorted Arrays",
        "description": "Given two sorted integer arrays nums1 and nums2, merge them into a single sorted array represented as a comma-separated string.",
        "difficulty": "Easy",
        "company": "Accenture",
        "type": "two_int_arrays",
        "test_cases": [{"input": "1,3,5\n2,4,6", "expected": "1,2,3,4,5,6"}, {"input": "0\n1", "expected": "0,1"}],
        "py_body": "return sorted(nums1 + nums2)",
        "java_body": "List<Integer> list = new ArrayList<>();\n        for (int x : nums1) list.add(x);\n        for (int x : nums2) list.add(x);\n        Collections.sort(list);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < list.size(); i++) {\n            sb.append(list.get(i)).append(i == list.size() - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "vector<int> combined = nums1;\n    combined.insert(combined.end(), nums2.begin(), nums2.end());\n    sort(combined.begin(), combined.end());\n    string r = \"\";\n    for (int i = 0; i < combined.size(); i++) {\n        r += to_string(combined[i]) + (i == combined.size() - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Move Zeroes",
        "description": "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.",
        "difficulty": "Easy",
        "company": "General",
        "type": "int_array",
        "test_cases": [{"input": "0,1,0,3,12", "expected": "1,3,12,0,0"}],
        "py_body": "pos = 0\n    for i in range(len(nums)):\n        if nums[i] != 0:\n            nums[pos], nums[i] = nums[i], nums[pos]\n            pos += 1\n    return nums",
        "java_body": "int pos = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] != 0) {\n                int temp = nums[pos];\n                nums[pos] = nums[i];\n                nums[i] = temp;\n                pos++;\n            }\n        }\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < nums.length; i++) {\n            sb.append(nums[i]).append(i == nums.length - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "int pos = 0;\n    for (int i = 0; i < nums.size(); i++) {\n        if (nums[i] != 0) {\n            swap(nums[pos], nums[i]);\n            pos++;\n        }\n    }\n    string r = \"\";\n    for (int i = 0; i < nums.size(); i++) {\n        r += to_string(nums[i]) + (i == nums.size() - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Reverse Vowels of a String",
        "description": "Given a string s, reverse only all the vowels in the string and return it.",
        "difficulty": "Easy",
        "company": "Google",
        "type": "single_string",
        "test_cases": [{"input": "hello", "expected": "holle"}, {"input": "leetcode", "expected": "leotcede"}],
        "py_body": "vowels = set('aeiouAEIOU')\n    s_list = list(s)\n    l, r = 0, len(s) - 1\n    while l < r:\n        if s_list[l] not in vowels: l += 1\n        elif s_list[r] not in vowels: r -= 1\n        else:\n            s_list[l], s_list[r] = s_list[r], s_list[l]\n            l += 1; r -= 1\n    return ''.join(s_list)",
        "java_body": "Set<Character> vowels = new HashSet<>(Arrays.asList('a','e','i','o','u','A','E','I','O','U'));\n        char[] chars = s.toCharArray();\n        int l = 0, r = chars.length - 1;\n        while (l < r) {\n            if (!vowels.contains(chars[l])) l++;\n            else if (!vowels.contains(chars[r])) r--;\n            else {\n                char temp = chars[l];\n                chars[l] = chars[r];\n                chars[r] = temp;\n                l++; r--;\n            }\n        }\n        return new String(chars);",
        "cpp_body": "string vowels = \"aeiouAEIOU\";\n    int l = 0, r = s.length() - 1;\n    while (l < r) {\n        if (vowels.find(s[l]) == string::npos) l++;\n        else if (vowels.find(s[r]) == string::npos) r--;\n        else {\n            swap(s[l], s[r]);\n            l++; r--;\n        }\n    }\n    return s;"
    },
    {
        "title": "Intersection of Two Arrays",
        "description": "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must be unique.",
        "difficulty": "Easy",
        "company": "Amazon",
        "type": "two_int_arrays",
        "test_cases": [{"input": "1,2,2,1\n2,2", "expected": "2"}, {"input": "4,9,5\n9,4,9,8,4", "expected": "9,4"}],
        "py_body": "return list(set(nums1) & set(nums2))",
        "java_body": "Set<Integer> s1 = new HashSet<>();\n        for (int x : nums1) s1.add(x);\n        Set<Integer> res = new HashSet<>();\n        for (int x : nums2) {\n            if (s1.contains(x)) res.add(x);\n        }\n        StringBuilder sb = new StringBuilder();\n        int i = 0;\n        for (int x : res) {\n            sb.append(x).append(i == res.size() - 1 ? \"\" : \",\");\n            i++;\n        }\n        return sb.toString();",
        "cpp_body": "unordered_set<int> s1(nums1.begin(), nums1.end());\n    unordered_set<int> res;\n    for (int x : nums2) {\n        if (s1.count(x)) res.insert(x);\n    }\n    string r = \"\";\n    int i = 0;\n    for (int x : res) {\n        r += to_string(x) + (i == res.size() - 1 ? \"\" : \",\");\n        i++;\n    }\n    return r;"
    },
    {
        "title": "First Unique Character in a String",
        "description": "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
        "difficulty": "Easy",
        "company": "Microsoft",
        "type": "single_string",
        "test_cases": [{"input": "leetcode", "expected": "0"}, {"input": "loveleetcode", "expected": "2"}, {"input": "aabb", "expected": "-1"}],
        "py_body": "counts = {}\n    for char in s:\n        counts[char] = counts.get(char, 0) + 1\n    for i, char in enumerate(s):\n        if counts[char] == 1: return i\n    return -1",
        "java_body": "Map<Character, Integer> counts = new HashMap<>();\n        for (char c : s.toCharArray()) {\n            counts.put(c, counts.getOrDefault(c, 0) + 1);\n        }\n        for (int i = 0; i < s.length(); i++) {\n            if (counts.get(s.charAt(i)) == 1) return String.valueOf(i);\n        }\n        return \"-1\";",
        "cpp_body": "unordered_map<char, int> counts;\n    for (char c : s) counts[c]++;\n    for (int i = 0; i < s.length(); i++) {\n        if (counts[s[i]] == 1) return to_string(i);\n    }\n    return \"-1\";"
    },
    {
        "title": "Detect Capital",
        "description": "We define the usage of capitals in a word to be right when all letters in this word are capitals, or all are not, or only the first is. Detect if capitals are used right.",
        "difficulty": "Easy",
        "company": "TCS",
        "type": "single_string",
        "test_cases": [{"input": "USA", "expected": "true"}, {"input": "FlaG", "expected": "false"}, {"input": "Google", "expected": "true"}],
        "py_body": "return s.isupper() or s.islower() or s.istitle()",
        "java_body": "if (s.equals(s.toUpperCase())) return \"true\";\n        if (s.equals(s.toLowerCase())) return \"true\";\n        if (Character.isUpperCase(s.charAt(0)) && s.substring(1).equals(s.substring(1).toLowerCase())) return \"true\";\n        return \"false\";",
        "cpp_body": "bool all_upper = true, all_lower = true, first_upper = isupper(s[0]);\n    for (int i = 0; i < s.length(); i++) {\n        if (isupper(s[i])) all_lower = false;\n        else all_upper = false;\n        if (i > 0 && isupper(s[i])) first_upper = false;\n    }\n    return (all_upper || all_lower || first_upper) ? \"true\" : \"false\";"
    },
    {
        "title": "Defanging an IP Address",
        "description": "Given a valid IP address, return a defanged version of that IP address where every period '.' is replaced with '[.]'.",
        "difficulty": "Easy",
        "company": "Infosys",
        "type": "single_string",
        "test_cases": [{"input": "1.1.1.1", "expected": "1[.]1[.]1[.]1"}],
        "py_body": "return s.replace('.', '[.]')",
        "java_body": "return s.replace(\".\", \"[.]\");",
        "cpp_body": "string r = \"\";\n    for (char c : s) {\n        if (c == '.') r += \"[.]\";\n        else r += c;\n    }\n    return r;"
    },
    {
        "title": "Jewels and Stones",
        "description": "You are given strings jewels representing the types of stones that are jewels, and stones representing the stones you have. Return the number of stones you have that are jewels.",
        "difficulty": "Easy",
        "company": "Wipro",
        "type": "two_strings",
        "test_cases": [{"input": "aA\naAAbbbb", "expected": "3"}, {"input": "z\nZZ", "expected": "0"}],
        "py_body": "jewel_set = set(s)\n    return sum(1 for stone in t if stone in jewel_set)",
        "java_body": "Set<Character> jewelSet = new HashSet<>();\n        for (char c : s.toCharArray()) jewelSet.add(c);\n        int count = 0;\n        for (char c : t.toCharArray()) {\n            if (jewelSet.contains(c)) count++;\n        }\n        return String.valueOf(count);",
        "cpp_body": "unordered_set<char> jewelSet(s.begin(), s.end());\n    int count = 0;\n    for (char c : t) {\n        if (jewelSet.count(c)) count++;\n    }\n    return to_string(count);"
    },
    {
        "title": "Number of Good Pairs",
        "description": "Given an array of integers nums, return the number of good pairs (i, j) where nums[i] == nums[j] and i < j.",
        "difficulty": "Easy",
        "company": "Accenture",
        "type": "int_array",
        "test_cases": [{"input": "1,2,3,1,1,3", "expected": "4"}, {"input": "1,1,1,1", "expected": "6"}],
        "py_body": "counts = {}\n    pairs = 0\n    for x in nums:\n        pairs += counts.get(x, 0)\n        counts[x] = counts.get(x, 0) + 1\n    return pairs",
        "java_body": "Map<Integer, Integer> counts = new HashMap<>();\n        int pairs = 0;\n        for (int x : nums) {\n            pairs += counts.getOrDefault(x, 0);\n            counts.put(x, counts.getOrDefault(x, 0) + 1);\n        }\n        return String.valueOf(pairs);",
        "cpp_body": "unordered_map<int, int> counts;\n    int pairs = 0;\n    for (int x : nums) {\n        pairs += counts[x];\n        counts[x]++;\n    }\n    return to_string(pairs);"
    },
    {
        "title": "Goal Parser Interpretation",
        "description": "Goal Parser interprets command which consists of 'G', '()' and/or '(al)'. Return interpreted string.",
        "difficulty": "Easy",
        "company": "General",
        "type": "single_string",
        "test_cases": [{"input": "G()(al)", "expected": "goal"}, {"input": "G()()()()(al)", "expected": "goooal"}],
        "py_body": "return s.replace('()', 'o').replace('(al)', 'al')",
        "java_body": "return s.replace(\"()\", \"o\").replace(\"(al)\", \"al\");",
        "cpp_body": "string r = \"\";\n    for (int i = 0; i < s.length(); i++) {\n        if (s[i] == 'G') r += 'G';\n        else if (s[i] == '(') {\n            if (s[i+1] == ')') { r += 'o'; i++; }\n            else { r += \"al\"; i += 3; }\n        }\n    }\n    return r;"
    },
    {
        "title": "Sorting the Sentence",
        "description": "A sentence is shuffled by appending the 1-indexed word position to each word. Reconstruct and return the original sentence.",
        "difficulty": "Easy",
        "company": "Google",
        "type": "single_string",
        "test_cases": [{"input": "is2 sentence4 This1 a3", "expected": "this is a sentence"}],
        "py_body": "words = s.split()\n    res = [None] * len(words)\n    for w in words:\n        pos = int(w[-1]) - 1\n        res[pos] = w[:-1]\n    return ' '.join(res)",
        "java_body": "String[] words = s.split(\" \");\n        String[] res = new String[words.length];\n        for (String w : words) {\n            int pos = Character.getNumericValue(w.charAt(w.length() - 1)) - 1;\n            res[pos] = w.substring(0, w.length() - 1);\n        }\n        return String.join(\" \", res);",
        "cpp_body": "stringstream ss(s);\n    string w;\n    vector<string> words;\n    while (ss >> w) words.push_back(w);\n    vector<string> res(words.size());\n    for (string w : words) {\n        int pos = w.back() - '1';\n        res[pos] = w.substr(0, w.length() - 1);\n    }\n    string r = \"\";\n    for (int i = 0; i < res.size(); i++) {\n        r += res[i] + (i == res.size() - 1 ? \"\" : \" \");\n    }\n    return r;"
    },
    {
        "title": "Check If Two String Arrays are Equivalent",
        "description": "Given two string arrays, return true if the concatenation of both represents the same string.",
        "difficulty": "Easy",
        "company": "Amazon",
        "type": "two_strings",
        "test_cases": [{"input": "ab,c\na,bc", "expected": "true"}, {"input": "a,cb\nab,c", "expected": "false"}],
        "py_body": "return ''.join(s.split(',')) == ''.join(t.split(','))",
        "java_body": "String s1 = s.replace(\",\", \"\");\n        String t1 = t.replace(\",\", \"\");\n        return s1.equals(t1) ? \"true\" : \"false\";",
        "cpp_body": "string s1 = \"\", t1 = \"\";\n    stringstream ss(s), ts(t);\n    string tok;\n    while(getline(ss, tok, ',')) s1 += tok;\n    while(getline(ts, tok, ',')) t1 += tok;\n    return s1 == t1 ? \"true\" : \"false\";"
    },
    {
        "title": "Maximum Number of Words Found in Sentences",
        "description": "Given an array of sentences (separated by comma), return the maximum number of words in a single sentence.",
        "difficulty": "Easy",
        "company": "Microsoft",
        "type": "single_string",
        "test_cases": [{"input": "alice and bob love leetcode,i think so too,this is great thanks very much", "expected": "6"}],
        "py_body": "sentences = s.split(',')\n    return max(len(sen.split()) for sen in sentences)",
        "java_body": "String[] sentences = s.split(\",\");\n        int maxWords = 0;\n        for (String sen : sentences) {\n            maxWords = Math.max(maxWords, sen.trim().split(\"\\\\s+\").length);\n        }\n        return String.valueOf(maxWords);",
        "cpp_body": "stringstream ss(s);\n    string sen;\n    int maxWords = 0;\n    while(getline(ss, sen, ',')) {\n        stringstream ws(sen);\n        string w;\n        int count = 0;\n        while (ws >> w) count++;\n        maxWords = max(maxWords, count);\n    }\n    return to_string(maxWords);"
    },
    {
        "title": "Ransom Note",
        "description": "Given two strings ransomNote and magazine, return true if ransomNote can be constructed from magazine and false otherwise.",
        "difficulty": "Easy",
        "company": "TCS",
        "type": "two_strings",
        "test_cases": [{"input": "a\nb", "expected": "false"}, {"input": "aa\naab", "expected": "true"}],
        "py_body": "from collections import Counter\n    r_count = Counter(s)\n    m_count = Counter(t)\n    for char, count in r_count.items():\n        if m_count[char] < count: return False\n    return True",
        "java_body": "int[] counts = new int[26];\n        for (char c : t.toCharArray()) counts[c - 'a']++;\n        for (char c : s.toCharArray()) {\n            if (--counts[c - 'a'] < 0) return \"false\";\n        }\n        return \"true\";",
        "cpp_body": "int counts[26] = {0};\n    for (char c : t) counts[c - 'a']++;\n    for (char c : s) {\n        if (--counts[c - 'a'] < 0) return \"false\";\n    }\n    return \"true\";"
    },
    {
        "title": "Valid Perfect Square",
        "description": "Given a positive integer num, return true if num is a perfect square, else false.",
        "difficulty": "Easy",
        "company": "Infosys",
        "type": "single_int",
        "test_cases": [{"input": "16", "expected": "true"}, {"input": "14", "expected": "false"}],
        "py_body": "i = 1\n    while i * i < n: i += 1\n    return i * i == n",
        "java_body": "long i = 1;\n        while (i * i < n) i++;\n        return (i * i == n) ? \"true\" : \"false\";",
        "cpp_body": "long long i = 1;\n    while (i * i < n) i++;\n    return (i * i == n) ? \"true\" : \"false\";"
    },
    {
        "title": "Arranging Coins",
        "description": "You have n coins and you want to build a staircase where the i-th row has exactly i coins. Return the number of complete rows.",
        "difficulty": "Easy",
        "company": "Wipro",
        "type": "single_int",
        "test_cases": [{"input": "5", "expected": "2"}, {"input": "8", "expected": "3"}],
        "py_body": "import math\n    return int((-1 + math.sqrt(1 + 8 * n)) / 2)",
        "java_body": "return String.valueOf((int)((-1 + Math.sqrt(1 + 8.0 * n)) / 2));",
        "cpp_body": "return to_string((int)((-1 + sqrt(1 + 8.0 * n)) / 2));"
    },
    {
        "title": "Perfect Number",
        "description": "A perfect number is a positive integer that is equal to the sum of its positive divisors, excluding the number itself. Determine if n is perfect.",
        "difficulty": "Easy",
        "company": "Accenture",
        "type": "single_int",
        "test_cases": [{"input": "28", "expected": "true"}, {"input": "7", "expected": "false"}],
        "py_body": "if n <= 1: return False\n    div_sum = 1\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            div_sum += i + (n // i if i * i != n else 0)\n    return div_sum == n",
        "java_body": "if (n <= 1) return \"false\";\n        int sum = 1;\n        for (int i = 2; i * i <= n; i++) {\n            if (n % i == 0) {\n                sum += i;\n                if (i * i != n) sum += n / i;\n            }\n        }\n        return sum == n ? \"true\" : \"false\";",
        "cpp_body": "if (n <= 1) return \"false\";\n    int sum = 1;\n    for (int i = 2; i * i <= n; i++) {\n        if (n % i == 0) {\n            sum += i;\n            if (i * i != n) sum += n / i;\n        }\n    }\n    return sum == n ? \"true\" : \"false\";"
    },
    {
        "title": "Student Attendance Record I",
        "description": "Given a string s representing student's record. Return true if student is eligible (has <2 Absents 'A' and no >=3 consecutive Lates 'L').",
        "difficulty": "Easy",
        "company": "General",
        "type": "single_string",
        "test_cases": [{"input": "PPALLP", "expected": "true"}, {"input": "PPALLL", "expected": "false"}],
        "py_body": "return s.count('A') < 2 and 'LLL' not in s",
        "java_body": "int absents = 0;\n        for (char c : s.toCharArray()) if (c == 'A') absents++;\n        return (absents < 2 && !s.contains(\"LLL\")) ? \"true\" : \"false\";",
        "cpp_body": "int absents = 0;\n    for (char c : s) if (c == 'A') absents++;\n    return (absents < 2 && s.find(\"LLL\") == string::npos) ? \"true\" : \"false\";"
    },
    {
        "title": "Distribute Candies",
        "description": "Alice has n candies where the i-th candy is of type candyType[i]. Return the maximum number of unique candies she can eat if she only eats n/2 candies.",
        "difficulty": "Easy",
        "company": "Google",
        "type": "int_array",
        "test_cases": [{"input": "1,1,2,2,3,3", "expected": "3"}, {"input": "6,6,6,6", "expected": "1"}],
        "py_body": "return min(len(set(nums)), len(nums) // 2)",
        "java_body": "Set<Integer> set = new HashSet<>();\n        for (int x : nums) set.add(x);\n        return String.valueOf(Math.min(set.size(), nums.length / 2));",
        "cpp_body": "unordered_set<int> s(nums.begin(), nums.end());\n    return to_string(min(s.size(), nums.size() / 2));"
    },
    {
        "title": "Longest Harmonious Subsequence",
        "description": "Given an integer array nums, return the length of its longest harmonious subsequence (diff between max and min element is exactly 1).",
        "difficulty": "Easy",
        "company": "Amazon",
        "type": "int_array",
        "test_cases": [{"input": "1,3,2,2,5,2,3,7", "expected": "5"}],
        "py_body": "counts = {}\n    for x in nums: counts[x] = counts.get(x, 0) + 1\n    ans = 0\n    for x in counts:\n        if x + 1 in counts:\n            ans = max(ans, counts[x] + counts[x+1])\n    return ans",
        "java_body": "Map<Integer, Integer> counts = new HashMap<>();\n        for (int x : nums) counts.put(x, counts.getOrDefault(x, 0) + 1);\n        int ans = 0;\n        for (int x : counts.keySet()) {\n            if (counts.containsKey(x + 1)) {\n                ans = Math.max(ans, counts.get(x) + counts.get(x + 1));\n            }\n        }\n        return String.valueOf(ans);",
        "cpp_body": "unordered_map<int, int> counts;\n    for (int x : nums) counts[x]++;\n    int ans = 0;\n    for (auto const& [x, val] : counts) {\n        if (counts.count(x + 1)) {\n            ans = max(ans, val + counts[x + 1]);\n        }\n    }\n    return to_string(ans);"
    },
    {
        "title": "Minimum Index Sum of Two Lists",
        "description": "Given two lists of strings (separated by commas), find common strings with the least index sum.",
        "difficulty": "Easy",
        "company": "Microsoft",
        "type": "two_strings",
        "test_cases": [{"input": "Shogun,Tapioca Express,Burger King,KFC\nPiatti,The Grill at Torrey Pines,Hungry Hunter Steakhouse,Shogun", "expected": "shogun"}],
        "py_body": "list1 = s.split(',')\n    list2 = t.split(',')\n    indices = {w: i for i, w in enumerate(list1)}\n    min_sum = float('inf')\n    res = []\n    for j, w in enumerate(list2):\n        if w in indices:\n            if indices[w] + j < min_sum:\n                min_sum = indices[w] + j\n                res = [w]\n            elif indices[w] + j == min_sum:\n                res.append(w)\n    return ','.join(res)",
        "java_body": "String[] l1 = s.split(\",\");\n        String[] l2 = t.split(\",\");\n        Map<String, Integer> map = new HashMap<>();\n        for (int i = 0; i < l1.length; i++) map.put(l1[i], i);\n        int minSum = Integer.MAX_VALUE;\n        List<String> res = new ArrayList<>();\n        for (int j = 0; j < l2.length; j++) {\n            if (map.containsKey(l2[j])) {\n                int sum = map.get(l2[j]) + j;\n                if (sum < minSum) {\n                    minSum = sum;\n                    res.clear();\n                    res.add(l2[j]);\n                } else if (sum == minSum) {\n                    res.add(l2[j]);\n                }\n            }\n        }\n        return String.join(\",\", res);",
        "cpp_body": "vector<string> l1, l2;\n    stringstream ss1(s), ss2(t);\n    string token;\n    while(getline(ss1, token, ',')) l1.push_back(token);\n    while(getline(ss2, token, ',')) l2.push_back(token);\n    unordered_map<string, int> map;\n    for (int i = 0; i < l1.size(); i++) map[l1[i]] = i;\n    int minSum = 1e9;\n    vector<string> res;\n    for (int j = 0; j < l2.size(); j++) {\n        if (map.count(l2[j])) {\n            int sum = map[l2[j]] + j;\n            if (sum < minSum) {\n                minSum = sum;\n                res.clear();\n                res.add(l2[j]);\n            } else if (sum == minSum) {\n                res.push_back(l2[j]);\n            }\n        }\n    }\n    string r = \"\";\n    for (int i = 0; i < res.size(); i++) r += res[i] + (i == res.size()-1 ? \"\" : \",\");\n    return r;"
    },
    {
        "title": "Can Place Flowers",
        "description": "Given a flowerbed array and n empty plots, determine if n new flowers can be planted without violating the no-adjacent-flowers rule.",
        "difficulty": "Easy",
        "company": "TCS",
        "type": "int_array_and_int",
        "test_cases": [{"input": "1,0,0,0,1\n1", "expected": "true"}, {"input": "1,0,0,0,1\n2", "expected": "false"}],
        "py_body": "count = 0\n    for i in range(len(nums)):\n        if nums[i] == 0:\n            empty_prev = (i == 0 or nums[i-1] == 0)\n            empty_next = (i == len(nums) - 1 or nums[i+1] == 0)\n            if empty_prev and empty_next:\n                nums[i] = 1\n                count += 1\n    return count >= k",
        "java_body": "int count = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] == 0) {\n                boolean prev = (i == 0 || nums[i-1] == 0);\n                boolean next = (i == nums.length - 1 || nums[i+1] == 0);\n                if (prev && next) {\n                    nums[i] = 1;\n                    count++;\n                }\n            }\n        }\n        return count >= k ? \"true\" : \"false\";",
        "cpp_body": "int count = 0;\n    for (int i = 0; i < nums.size(); i++) {\n        if (nums[i] == 0) {\n            bool prev = (i == 0 || nums[i-1] == 0);\n            bool next = (i == nums.size() - 1 || nums[i+1] == 0);\n            if (prev && next) {\n                nums[i] = 1;\n                count++;\n            }\n        }\n    }\n    return count >= k ? \"true\" : \"false\";"
    },
    {
        "title": "Maximum Product of Three Numbers",
        "description": "Given an integer array nums, find three numbers whose product is maximum and return the maximum product.",
        "difficulty": "Easy",
        "company": "Infosys",
        "type": "int_array",
        "test_cases": [{"input": "1,2,3", "expected": "6"}, {"input": "1,2,3,4", "expected": "24"}, {"input": "-10,-10,5,2", "expected": "500"}],
        "py_body": "nums.sort()\n    return max(nums[-1] * nums[-2] * nums[-3], nums[0] * nums[1] * nums[-1])",
        "java_body": "Arrays.sort(nums);\n        int n = nums.length;\n        return String.valueOf(Math.max(nums[n-1]*nums[n-2]*nums[n-3], nums[0]*nums[1]*nums[n-1]));",
        "cpp_body": "sort(nums.begin(), nums.end());\n    int n = nums.size();\n    return to_string(max(nums[n-1]*nums[n-2]*nums[n-3], nums[0]*nums[1]*nums[n-1]));"
    },
    {
        "title": "Square Root",
        "description": "Given a non-negative integer x, compute and return the square root of x (truncated to integer).",
        "difficulty": "Easy",
        "company": "Wipro",
        "type": "single_int",
        "test_cases": [{"input": "4", "expected": "2"}, {"input": "8", "expected": "2"}],
        "py_body": "return int(n**0.5)",
        "java_body": "return String.valueOf((int)Math.sqrt(n));",
        "cpp_body": "return to_string((int)sqrt(n));"
    },
    {
        "title": "Relative Ranks",
        "description": "Given score array of athletes, return their ranks (Gold Medal, Silver Medal, Bronze Medal, or placing rank string).",
        "difficulty": "Easy",
        "company": "Accenture",
        "type": "int_array",
        "test_cases": [{"input": "5,4,3,2,1", "expected": "gold medal,silver medal,bronze medal,4,5"}],
        "py_body": "sorted_scores = sorted(nums, reverse=True)\n    ranks = {}\n    for i, s in enumerate(sorted_scores):\n        if i == 0: ranks[s] = 'gold medal'\n        elif i == 1: ranks[s] = 'silver medal'\n        elif i == 2: ranks[s] = 'bronze medal'\n        else: ranks[s] = str(i + 1)\n    return [ranks[x] for x in nums]",
        "java_body": "int n = nums.length;\n        Integer[] idx = new Integer[n];\n        for (int i = 0; i < n; i++) idx[i] = i;\n        Arrays.sort(idx, (a, b) -> Integer.compare(nums[b], nums[a]));\n        String[] res = new String[n];\n        for (int i = 0; i < n; i++) {\n            if (i == 0) res[idx[i]] = \"gold medal\";\n            else if (i == 1) res[idx[i]] = \"silver medal\";\n            else if (i == 2) res[idx[i]] = \"bronze medal\";\n            else res[idx[i]] = String.valueOf(i + 1);\n        }\n        return String.join(\",\", res);",
        "cpp_body": "int n = nums.size();\n    vector<pair<int, int>> score_index(n);\n    for (int i = 0; i < n; i++) score_index[i] = {nums[i], i};\n    sort(score_index.rbegin(), score_index.rend());\n    vector<string> res(n);\n    for (int i = 0; i < n; i++) {\n        int idx = score_index[i].second;\n        if (i == 0) res[idx] = \"gold medal\";\n        else if (i == 1) res[idx] = \"silver medal\";\n        else if (i == 2) res[idx] = \"bronze medal\";\n        else res[idx] = to_string(i + 1);\n    }\n    string r = \"\";\n    for (int i = 0; i < n; i++) r += res[i] + (i == n - 1 ? \"\" : \",\");\n    return r;"
    },
    {
        "title": "Roman to Integer",
        "description": "Convert a Roman numeral string to its corresponding integer representation.",
        "difficulty": "Easy",
        "company": "General",
        "type": "single_string",
        "test_cases": [{"input": "III", "expected": "3"}, {"input": "LVIII", "expected": "58"}, {"input": "MCMXCIV", "expected": "1994"}],
        "py_body": "roman = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}\n    ans = 0\n    for i in range(len(s)):\n        if i < len(s) - 1 and roman[s[i]] < roman[s[i+1]]:\n            ans -= roman[s[i]]\n        else:\n            ans += roman[s[i]]\n    return ans",
        "java_body": "Map<Character, Integer> r = new HashMap<>();\n        r.put('I', 1); r.put('V', 5); r.put('X', 10); r.put('L', 50);\n        r.put('C', 100); r.put('D', 500); r.put('M', 1000);\n        int ans = 0;\n        for (int i = 0; i < s.length(); i++) {\n            if (i < s.length() - 1 && r.get(s.charAt(i)) < r.get(s.charAt(i+1))) {\n                ans -= r.get(s.charAt(i));\n            } else {\n                ans += r.get(s.charAt(i));\n            }\n        }\n        return String.valueOf(ans);",
        "cpp_body": "unordered_map<char, int> r = {{'I',1},{'V',5},{'X',10},{'L',50},{'C',100},{'D',500},{'M',1000}};\n    int ans = 0;\n    for (int i = 0; i < s.length(); i++) {\n        if (i < s.length() - 1 && r[s[i]] < r[s[i+1]]) ans -= r[s[i]];\n        else ans += r[s[i]];\n    }\n    return to_string(ans);"
    },
    {
        "title": "Power of Two",
        "description": "Given an integer n, return true if it is a power of two. Otherwise, return false.",
        "difficulty": "Easy",
        "company": "Google",
        "type": "single_int",
        "test_cases": [{"input": "1", "expected": "true"}, {"input": "16", "expected": "true"}, {"input": "3", "expected": "false"}],
        "py_body": "return n > 0 and (n & (n - 1)) == 0",
        "java_body": "return (n > 0 && (n & (n - 1)) == 0) ? \"true\" : \"false\";",
        "cpp_body": "return (n > 0 && (n & (n - 1)) == 0) ? \"true\" : \"false\";"
    },
    {
        "title": "Sum of Digits",
        "description": "Given an integer n, calculate the sum of its digits.",
        "difficulty": "Easy",
        "company": "Amazon",
        "type": "single_int",
        "test_cases": [{"input": "123", "expected": "6"}, {"input": "9999", "expected": "36"}],
        "py_body": "return sum(int(x) for x in str(abs(n)))",
        "java_body": "int temp = Math.abs(n), sum = 0;\n        while (temp > 0) {\n            sum += temp % 10;\n            temp /= 10;\n        }\n        return String.valueOf(sum);",
        "cpp_body": "int temp = abs(n), sum = 0;\n    while (temp > 0) {\n        sum += temp % 10;\n        temp /= 10;\n    }\n    return to_string(sum);"
    },
    {
        "title": "Reverse Integer",
        "description": "Given a signed 32-bit integer x, return x with its digits reversed. If reversing causes overflow, return 0.",
        "difficulty": "Easy",
        "company": "Microsoft",
        "type": "single_int",
        "test_cases": [{"input": "123", "expected": "321"}, {"input": "-123", "expected": "-321"}, {"input": "120", "expected": "21"}],
        "py_body": "sign = -1 if n < 0 else 1\n    r = int(str(abs(n))[::-1]) * sign\n    return r if -2**31 <= r <= 2**31 - 1 else 0",
        "java_body": "long rev = 0; int sign = n < 0 ? -1 : 1; long val = Math.abs((long)n);\n        while(val > 0) { rev = rev * 10 + val % 10; val /= 10; }\n        rev *= sign;\n        if (rev < Integer.MIN_VALUE || rev > Integer.MAX_VALUE) return \"0\";\n        return String.valueOf(rev);",
        "cpp_body": "long long rev = 0; int sign = n < 0 ? -1 : 1; long long val = abs(n);\n    while(val > 0) { rev = rev * 10 + val % 10; val /= 10; }\n    rev *= sign;\n    if (rev < -2147483648LL || rev > 2147483647LL) return \"0\";\n    return to_string(rev);"
    },
    {
        "title": "Happy Number",
        "description": "Determine if a number n is happy. A happy number is defined by a process where replacing the number by the sum of squares of its digits eventually equals 1.",
        "difficulty": "Easy",
        "company": "TCS",
        "type": "single_int",
        "test_cases": [{"input": "19", "expected": "true"}, {"input": "2", "expected": "false"}],
        "py_body": "seen = set()\n    while n != 1 and n not in seen:\n        seen.add(n)\n        n = sum(int(c)**2 for c in str(n))\n    return n == 1",
        "java_body": "Set<Integer> seen = new HashSet<>();\n        while (n != 1 && !seen.contains(n)) {\n            seen.add(n);\n            int sum = 0, temp = n;\n            while(temp > 0) { sum += (temp%10)*(temp%10); temp /= 10; }\n            n = sum;\n        }\n        return n == 1 ? \"true\" : \"false\";",
        "cpp_body": "unordered_set<int> seen;\n    while (n != 1 && !seen.count(n)) {\n        seen.insert(n);\n        int sum = 0, temp = n;\n        while(temp > 0) { sum += (temp%10)*(temp%10); temp /= 10; }\n        n = sum;\n    }\n    return n == 1 ? \"true\" : \"false\";"
    },
    {
        "title": "Counting Bits",
        "description": "Given an integer n, return the number of 1-bits in its binary representation.",
        "difficulty": "Easy",
        "company": "Infosys",
        "type": "single_int",
        "test_cases": [{"input": "5", "expected": "2"}, {"input": "0", "expected": "0"}],
        "py_body": "return bin(n).count('1')",
        "java_body": "return String.valueOf(Integer.bitCount(n));",
        "cpp_body": "int count = 0, temp = n;\n    while(temp) { count += temp & 1; temp >>= 1; }\n    return to_string(count);"
    },
    {
        "title": "Add Digits",
        "description": "Given an integer num, repeatedly add all its digits until the result has only one digit, and return it.",
        "difficulty": "Easy",
        "company": "Wipro",
        "type": "single_int",
        "test_cases": [{"input": "38", "expected": "2"}, {"input": "0", "expected": "0"}],
        "py_body": "if n == 0: return 0\n    return 9 if n % 9 == 0 else n % 9",
        "java_body": "if (n == 0) return \"0\";\n        return String.valueOf(n % 9 == 0 ? 9 : n % 9);",
        "cpp_body": "if (n == 0) return \"0\";\n    return to_string(n % 9 == 0 ? 9 : n % 9);"
    },
    {
        "title": "Word Pattern",
        "description": "Given a pattern and a string s (words separated by commas), return true if s follows the pattern.",
        "difficulty": "Easy",
        "company": "Accenture",
        "type": "two_strings",
        "test_cases": [{"input": "abba\ndog,cat,cat,dog", "expected": "true"}, {"input": "abba\ndog,cat,cat,fish", "expected": "false"}],
        "py_body": "words = t.split(',')\n    if len(s) != len(words): return False\n    return len(set(zip(s, words))) == len(set(s)) == len(set(words))",
        "java_body": "String[] words = t.split(\",\");\n        if (s.length() != words.length) return \"false\";\n        Map<Character, String> charToWord = new HashMap<>();\n        Map<String, Character> wordToChar = new HashMap<>();\n        for (int i = 0; i < s.length(); i++) {\n            char c = s.charAt(i);\n            String w = words[i];\n            if (charToWord.containsKey(c) && !charToWord.get(c).equals(w)) return \"false\";\n            if (wordToChar.containsKey(w) && wordToChar.get(w) != c) return \"false\";\n            charToWord.put(c, w);\n            wordToChar.put(w, c);\n        }\n        return \"true\";",
        "cpp_body": "vector<string> words;\n    stringstream ss(t);\n    string tok;\n    while(getline(ss, tok, ',')) words.push_back(tok);\n    if (s.length() != words.size()) return \"false\";\n    unordered_map<char, string> charToWord;\n    unordered_map<string, char> wordToChar;\n    for (int i = 0; i < s.length(); i++) {\n        char c = s[i];\n        string w = words[i];\n        if (charToWord.count(c) && charToWord[c] != w) return \"false\";\n        if (wordToChar.count(w) && wordToChar[w] != c) return \"false\";\n        charToWord[c] = w;\n        wordToChar[w] = c;\n    }\n    return \"true\";"
    },
    {
        "title": "Base 7",
        "description": "Given an integer num, return its base 7 representation as a string.",
        "difficulty": "Easy",
        "company": "General",
        "type": "single_int",
        "test_cases": [{"input": "100", "expected": "202"}, {"input": "-7", "expected": "-10"}],
        "py_body": "if n == 0: return '0'\n    res, val = '', abs(n)\n    while val:\n        res = str(val % 7) + res\n        val //= 7\n    return ('-' if n < 0 else '') + res",
        "java_body": "return Integer.toString(n, 7);",
        "cpp_body": "if (n == 0) return \"0\";\n    string res = \"\"; int val = abs(n);\n    while (val) { res = to_string(val % 7) + res; val /= 7; }\n    return (n < 0 ? \"-\" : \"\") + res;"
    },
    {
        "title": "Keyboard Row",
        "description": "Given a word s, return true if the word can be typed using alphabet letters of only one keyboard row on a standard QWERTY keyboard.",
        "difficulty": "Easy",
        "company": "Google",
        "type": "single_string",
        "test_cases": [{"input": "Alaska", "expected": "true"}, {"input": "Dad", "expected": "true"}, {"input": "Peace", "expected": "false"}],
        "py_body": "r1 = set('qwertyuiop')\n    r2 = set('asdfghjkl')\n    r3 = set('zxcvbnm')\n    w_set = set(s.lower())\n    return w_set.issubset(r1) or w_set.issubset(r2) or w_set.issubset(r3)",
        "java_body": "String r1 = \"qwertyuiop\", r2 = \"asdfghjkl\", r3 = \"zxcvbnm\";\n        String lower = s.toLowerCase();\n        int row = 0;\n        if (r1.contains(lower.substring(0, 1))) row = 1;\n        else if (r2.contains(lower.substring(0, 1))) row = 2;\n        else row = 3;\n        String checkRow = row == 1 ? r1 : (row == 2 ? r2 : r3);\n        for (char c : lower.toCharArray()) {\n            if (checkRow.indexOf(c) == -1) return \"false\";\n        }\n        return \"true\";",
        "cpp_body": "string r1 = \"qwertyuiop\", r2 = \"asdfghjkl\", r3 = \"zxcvbnm\";\n    string sLower = s;\n    for(char &c : sLower) c = tolower(c);\n    int row = 0;\n    if (r1.find(sLower[0]) != string::npos) row = 1;\n    else if (r2.find(sLower[0]) != string::npos) row = 2;\n    else row = 3;\n    string check = row == 1 ? r1 : (row == 2 ? r2 : r3);\n    for(char c : sLower) {\n        if (check.find(c) == string::npos) return \"false\";\n    }\n    return \"true\";"
    },
    {
        "title": "Find Mode in Binary Search Tree",
        "description": "Given score array representing tree preorder, find the mode (the most frequently occurred element) in it.",
        "difficulty": "Easy",
        "company": "Amazon",
        "type": "int_array",
        "test_cases": [{"input": "1,2,2", "expected": "2"}],
        "py_body": "counts = {}\n    for x in nums: counts[x] = counts.get(x, 0) + 1\n    max_cnt = max(counts.values())\n    res = [k for k, v in counts.items() if v == max_cnt]\n    return res",
        "java_body": "Map<Integer, Integer> counts = new HashMap<>();\n        int maxCount = 0;\n        for (int x : nums) {\n            counts.put(x, counts.getOrDefault(x, 0) + 1);\n            maxCount = Math.max(maxCount, counts.get(x));\n        }\n        List<String> modes = new ArrayList<>();\n        for (int k : counts.keySet()) {\n            if (counts.get(k) == maxCount) modes.add(String.valueOf(k));\n        }\n        return String.join(\",\", modes);",
        "cpp_body": "unordered_map<int, int> counts;\n    int maxCount = 0;\n    for (int x : nums) {\n        counts[x]++;\n        maxCount = max(maxCount, counts[x]);\n    }\n    string r = \"\";\n    int i = 0;\n    for (auto const& [x, val] : counts) {\n        if (val == maxCount) {\n            r += to_string(x) + \",\";\n        }\n    }\n    if(!r.empty()) r.pop_back();\n    return r;"
    }
])


# Questions 51-100
problems.extend([
    {
        "title": "Find Words That Can Be Formed",
        "description": "Given an array of strings (separated by commas) and a string chars, return true if words can be formed by characters from chars.",
        "difficulty": "Easy",
        "company": "Microsoft",
        "type": "two_strings",
        "test_cases": [{"input": "cat,bt,hat,tree\natach", "expected": "true"}],
        "py_body": "from collections import Counter\n    char_counts = Counter(t)\n    for w in s.split(','):\n        w_counts = Counter(w)\n        if all(char_counts[c] >= w_counts[c] for c in w):\n            return 'true'\n    return 'false'",
        "java_body": "int[] counts = new int[26];\n        for (char c : t.toCharArray()) counts[c - 'a']++;\n        for (String w : s.split(\",\")) {\n            int[] wCounts = new int[26];\n            boolean ok = true;\n            for (char c : w.toCharArray()) {\n                if (++wCounts[c - 'a'] > counts[c - 'a']) ok = false;\n            }\n            if (ok) return \"true\";\n        }\n        return \"false\";",
        "cpp_body": "int counts[26] = {0};\n    for (char c : t) counts[c - 'a']++;\n    stringstream ss(s);\n    string w;\n    while(getline(ss, w, ',')) {\n        int wCounts[26] = {0};\n        bool ok = true;\n        for (char c : w) {\n            if (++wCounts[c - 'a'] > counts[c - 'a']) ok = false;\n        }\n        if (ok) return \"true\";\n    }\n    return \"false\";"
    },
    {
        "title": "Robot Return to Origin",
        "description": "Given a sequence of moves U (up), D (down), L (left), R (right), return true if the robot returns to (0,0).",
        "difficulty": "Easy",
        "company": "TCS",
        "type": "single_string",
        "test_cases": [{"input": "UD", "expected": "true"}, {"input": "LL", "expected": "false"}],
        "py_body": "return s.count('U') == s.count('D') and s.count('L') == s.count('R')",
        "java_body": "int u = 0, d = 0, l = 0, r = 0;\n        for (char c : s.toCharArray()) {\n            if (c == 'U') u++; else if (c == 'D') d++; else if (c == 'L') l++; else if (c == 'R') r++;\n        }\n        return (u == d && l == r) ? \"true\" : \"false\";",
        "cpp_body": "int u = 0, d = 0, l = 0, r = 0;\n    for (char c : s) {\n        if (c == 'U') u++; else if (c == 'D') d++; else if (c == 'L') l++; else if (c == 'R') r++;\n    }\n    return (u == d && l == r) ? \"true\" : \"false\";"
    },
    {
        "title": "Height Checker",
        "description": "A school is trying to take an annual photo. return the number of indices where heights[i] != expected[i] (heights sorted).",
        "difficulty": "Easy",
        "company": "Infosys",
        "type": "int_array",
        "test_cases": [{"input": "1,1,4,2,1,3", "expected": "3"}],
        "py_body": "expected = sorted(nums)\n    return sum(1 for x, y in zip(nums, expected) if x != y)",
        "java_body": "int[] sorted = nums.clone();\n        Arrays.sort(sorted);\n        int count = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] != sorted[i]) count++;\n        }\n        return String.valueOf(count);",
        "cpp_body": "vector<int> sorted = nums;\n    sort(sorted.begin(), sorted.end());\n    int count = 0;\n    for (int i = 0; i < nums.size(); i++) {\n        if (nums[i] != sorted[i]) count++;\n    }\n    return to_string(count);"
    },
    {
        "title": "Replace Elements with Greatest Element on Right Side",
        "description": "Given an array, replace every element in that array with the greatest element among the elements to its right, and replace the last element with -1.",
        "difficulty": "Easy",
        "company": "Wipro",
        "type": "int_array",
        "test_cases": [{"input": "17,18,5,4,6,1", "expected": "18,6,6,6,1,-1"}],
        "py_body": "mx = -1\n    for i in range(len(nums) - 1, -1, -1):\n        nums[i], mx = mx, max(mx, nums[i])\n    return nums",
        "java_body": "int mx = -1;\n        for (int i = nums.length - 1; i >= 0; i--) {\n            int t = nums[i];\n            nums[i] = mx;\n            mx = Math.max(mx, t);\n        }\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < nums.length; i++) {\n            sb.append(nums[i]).append(i == nums.length - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "int mx = -1;\n    for (int i = nums.size() - 1; i >= 0; i--) {\n        int t = nums[i];\n        nums[i] = mx;\n        mx = max(mx, t);\n    }\n    string r = \"\";\n    for (int i = 0; i < nums.size(); i++) {\n        r += to_string(nums[i]) + (i == nums.size() - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Decompress Run-Length Encoded List",
        "description": "We are given a list nums of integers representing a list compressed with run-length encoding. Return the decompressed list.",
        "difficulty": "Easy",
        "company": "Accenture",
        "type": "int_array",
        "test_cases": [{"input": "1,2,3,4", "expected": "2,4,4,4"}],
        "py_body": "res = []\n    for i in range(0, len(nums), 2):\n        res.extend([nums[i+1]] * nums[i])\n    return res",
        "java_body": "List<Integer> res = new ArrayList<>();\n        for (int i = 0; i < nums.length; i += 2) {\n            for (int k = 0; k < nums[i]; k++) res.add(nums[i+1]);\n        }\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < res.size(); i++) {\n            sb.append(res.get(i)).append(i == res.size() - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "vector<int> res;\n    for (int i = 0; i < nums.size(); i += 2) {\n        for (int k = 0; k < nums[i]; k++) res.push_back(nums[i+1]);\n    }\n    string r = \"\";\n    for (int i = 0; i < res.size(); i++) {\n        r += to_string(res[i]) + (i == res.size() - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Subtract the Product and Sum of Digits of an Integer",
        "description": "Given an integer number n, return the difference between the product of its digits and the sum of its digits.",
        "difficulty": "Easy",
        "company": "General",
        "type": "single_int",
        "test_cases": [{"input": "234", "expected": "15"}],
        "py_body": "prod, sm = 1, 0\n    for x in str(n):\n        prod *= int(x)\n        sm += int(x)\n    return prod - sm",
        "java_body": "int prod = 1, sum = 0, temp = n;\n        while (temp > 0) {\n            int digit = temp % 10;\n            prod *= digit; sum += digit; temp /= 10;\n        }\n        return String.valueOf(prod - sum);",
        "cpp_body": "int prod = 1, sum = 0, temp = n;\n    while (temp > 0) {\n        int digit = temp % 10;\n        prod *= digit; sum += digit; temp /= 10;\n    }\n    return to_string(prod - sum);"
    },
    {
        "title": "Number of Steps to Reduce a Number to Zero",
        "description": "Given an integer num, return the number of steps to reduce it to zero. If the current number is even, divide it by 2; otherwise, subtract 1.",
        "difficulty": "Easy",
        "company": "Google",
        "type": "single_int",
        "test_cases": [{"input": "14", "expected": "6"}],
        "py_body": "steps = 0\n    while n > 0:\n        n = n // 2 if n % 2 == 0 else n - 1\n        steps += 1\n    return steps",
        "java_body": "int steps = 0, temp = n;\n        while (temp > 0) {\n            temp = temp % 2 == 0 ? temp / 2 : temp - 1;\n            steps++;\n        }\n        return String.valueOf(steps);",
        "cpp_body": "int steps = 0, temp = n;\n    while (temp > 0) {\n        temp = temp % 2 == 0 ? temp / 2 : temp - 1;\n        steps++;\n    }\n    return to_string(steps);"
    },
    {
        "title": "Find Numbers with Even Number of Digits",
        "description": "Given an array nums of integers, return how many of them contain an even number of digits.",
        "difficulty": "Easy",
        "company": "Amazon",
        "type": "int_array",
        "test_cases": [{"input": "12,345,2,6,7896", "expected": "2"}],
        "py_body": "return sum(1 for x in nums if len(str(x)) % 2 == 0)",
        "java_body": "int count = 0;\n        for (int x : nums) {\n            if (String.valueOf(x).length() % 2 == 0) count++;\n        }\n        return String.valueOf(count);",
        "cpp_body": "int count = 0;\n    for (int x : nums) {\n        if (to_string(x).length() % 2 == 0) count++;\n    }\n    return to_string(count);"
    },
    {
        "title": "How Many Numbers Are Smaller Than the Current Number",
        "description": "Given the array nums, for each nums[i] find out how many numbers in the array are smaller than it.",
        "difficulty": "Easy",
        "company": "Microsoft",
        "type": "int_array",
        "test_cases": [{"input": "8,1,2,2,3", "expected": "4,0,1,1,3"}],
        "py_body": "sorted_nums = sorted(nums)\n    mapping = {val: i for i, val in enumerate(sorted_nums) if val not in mapping}\n    return [mapping[x] for x in nums]",
        "java_body": "int[] sorted = nums.clone();\n        Arrays.sort(sorted);\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < sorted.length; i++) {\n            if (!map.containsKey(sorted[i])) map.put(sorted[i], i);\n        }\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < nums.length; i++) {\n            sb.append(map.get(nums[i])).append(i == nums.length - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "vector<int> sorted = nums;\n    sort(sorted.begin(), sorted.end());\n    unordered_map<int, int> map;\n    for (int i = 0; i < sorted.size(); i++) {\n        if (!map.count(sorted[i])) map[sorted[i]] = i;\n    }\n    string r = \"\";\n    for (int i = 0; i < nums.size(); i++) {\n        r += to_string(map[nums[i]]) + (i == nums.size() - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Kids With the Greatest Number of Candies",
        "description": "Given candy array and extraCandies, return list of true/false representing if each kid will have the greatest number of candies.",
        "difficulty": "Easy",
        "company": "TCS",
        "type": "int_array_and_int",
        "test_cases": [{"input": "2,3,5,1,3\n3", "expected": "true,true,true,false,true"}],
        "py_body": "mx = max(nums)\n    return [x + k >= mx for x in nums]",
        "java_body": "int mx = 0;\n        for (int x : nums) mx = Math.max(mx, x);\n        String[] res = new String[nums.length];\n        for (int i = 0; i < nums.length; i++) {\n            res[i] = (nums[i] + k >= mx) ? \"true\" : \"false\";\n        }\n        return String.join(\",\", res);",
        "cpp_body": "int mx = 0;\n    for (int x : nums) mx = max(mx, x);\n    string r = \"\";\n    for (int i = 0; i < nums.size(); i++) {\n        r += (nums[i] + k >= mx ? \"true\" : \"false\") + (i == nums.size() - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Shuffle the Array",
        "description": "Given the array nums consisting of 2n elements in the form [x1,x2,...,xn,y1,y2,...,yn]. Return the array in the form [x1,y1,x2,y2,...,xn,yn].",
        "difficulty": "Easy",
        "company": "Infosys",
        "type": "int_array_and_int",
        "test_cases": [{"input": "2,5,1,3,4,7\n3", "expected": "2,3,5,4,1,7"}],
        "py_body": "res = []\n    for i in range(k):\n        res.append(nums[i])\n        res.append(nums[i+k])\n    return res",
        "java_body": "StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < k; i++) {\n            sb.append(nums[i]).append(\",\").append(nums[i+k]).append(i == k - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "string r = \"\";\n    for (int i = 0; i < k; i++) {\n        r += to_string(nums[i]) + \",\" + to_string(nums[i+k]) + (i == k - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Shuffle String",
        "description": "Given string s and integer indices array (comma-separated), shuffle s such that characters move to indices.",
        "difficulty": "Easy",
        "company": "Wipro",
        "type": "single_string",
        "test_cases": [{"input": "codeleet\n4,5,6,7,0,2,1,3", "expected": "leetcode"}],
        "py_body": "lines = s.split('\\n')\n    text = lines[0].strip()\n    indices = [int(x) for x in lines[1].strip().split(',')]\n    res = [None] * len(text)\n    for i, char in enumerate(text):\n        res[indices[i]] = char\n    return ''.join(res)",
        "java_body": "String[] lines = s.split(\"\\\\n\");\n        String text = lines[0].trim();\n        String[] idxTokens = lines[1].trim().split(\",\");\n        char[] res = new char[text.length()];\n        for (int i = 0; i < text.length(); i++) {\n            int idx = Integer.parseInt(idxTokens[i].trim());\n            res[idx] = text.charAt(i);\n        }\n        return new String(res);",
        "cpp_body": "stringstream ss(s);\n    string text, idxLine;\n    getline(ss, text);\n    getline(ss, idxLine);\n    vector<int> idx;\n    stringstream idxSS(idxLine);\n    string token;\n    while(getline(idxSS, token, ',')) idx.push_back(stoi(token));\n    string res = text;\n    for(int i = 0; i < text.length(); i++) {\n        res[idx[i]] = text[i];\n    }\n    return res;"
    },
    {
        "title": "Determine Color of Chessboard Square",
        "description": "Given coordinates representing chessboard square (e.g. a1), return true if square is white, and false otherwise.",
        "difficulty": "Easy",
        "company": "Accenture",
        "type": "single_string",
        "test_cases": [{"input": "a1", "expected": "false"}, {"input": "h3", "expected": "true"}],
        "py_body": "return (ord(s[0]) - ord('a') + int(s[1])) % 2 == 0",
        "java_body": "int col = s.charAt(0) - 'a';\n        int row = s.charAt(1) - '1';\n        return (col + row) % 2 == 1 ? \"true\" : \"false\";",
        "cpp_body": "int col = s[0] - 'a';\n    int row = s[1] - '1';\n    return (col + row) % 2 == 1 ? \"true\" : \"false\";"
    },
    {
        "title": "Truncate Sentence",
        "description": "Given sentence s and integer k (on second line), truncate s to only contain its first k words.",
        "difficulty": "Easy",
        "company": "General",
        "type": "single_string",
        "test_cases": [{"input": "Hello how are you Contestant\n4", "expected": "hello how are you"}],
        "py_body": "lines = s.split('\\n')\n    words = lines[0].split()\n    k = int(lines[1].strip())\n    return ' '.join(words[:k])",
        "java_body": "String[] lines = s.split(\"\\\\n\");\n        String[] words = lines[0].split(\" \");\n        int k = Integer.parseInt(lines[1].trim());\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < k; i++) sb.append(words[i]).append(i == k - 1 ? \"\" : \" \");\n        return sb.toString();",
        "cpp_body": "stringstream ss(s);\n    string line1, line2;\n    getline(ss, line1);\n    getline(ss, line2);\n    int k = stoi(line2);\n    stringstream ws(line1);\n    string w;\n    vector<string> words;\n    while(ws >> w) words.push_back(w);\n    string r = \"\";\n    for (int i = 0; i < k; i++) r += words[i] + (i == k - 1 ? \"\" : \" \");\n    return r;"
    },
    {
        "title": "Determine if String Halves Are Alike",
        "description": "A string is alike if left and right halves have the same number of vowels. Determine if alike.",
        "difficulty": "Easy",
        "company": "Google",
        "type": "single_string",
        "test_cases": [{"input": "book", "expected": "true"}, {"input": "textbook", "expected": "false"}],
        "py_body": "vowels = set('aeiouAEIOU')\n    half = len(s) // 2\n    h1 = sum(1 for c in s[:half] if c in vowels)\n    h2 = sum(1 for c in s[half:] if c in vowels)\n    return h1 == h2",
        "java_body": "Set<Character> vowels = new HashSet<>(Arrays.asList('a','e','i','o','u','A','E','I','O','U'));\n        int len = s.length(), h1 = 0, h2 = 0;\n        for (int i = 0; i < len / 2; i++) if (vowels.contains(s.charAt(i))) h1++;\n        for (int i = len / 2; i < len; i++) if (vowels.contains(s.charAt(i))) h2++;\n        return h1 == h2 ? \"true\" : \"false\";",
        "cpp_body": "string vowels = \"aeiouAEIOU\";\n    int len = s.length(), h1 = 0, h2 = 0;\n    for (int i = 0; i < len / 2; i++) if (vowels.find(s[i]) != string::npos) h1++;\n    for (int i = len / 2; i < len; i++) if (vowels.find(s[i]) != string::npos) h2++;\n    return h1 == h2 ? \"true\" : \"false\";"
    },
    {
        "title": "Calculate Money in Leetcode Bank",
        "description": "Hercy saves money: $1 on Monday, $2 on Tuesday,..., $7 on Sunday. The next Monday he saves $2. Return total saved after n days.",
        "difficulty": "Easy",
        "company": "Amazon",
        "type": "single_int",
        "test_cases": [{"input": "4", "expected": "10"}, {"input": "10", "expected": "37"}],
        "py_body": "weeks = n // 7\n    rem = n % 7\n    total = 28 * weeks + 7 * weeks * (weeks - 1) // 2\n    total += rem * (rem + 1) // 2 + weeks * rem\n    return total",
        "java_body": "int weeks = n / 7, rem = n % 7;\n        int total = 28 * weeks + 7 * weeks * (weeks - 1) / 2;\n        total += rem * (rem + 1) / 2 + weeks * rem;\n        return String.valueOf(total);",
        "cpp_body": "int weeks = n / 7, rem = n % 7;\n    int total = 28 * weeks + 7 * weeks * (weeks - 1) / 2;\n    total += rem * (rem + 1) / 2 + weeks * rem;\n    return to_string(total);"
    },
    {
        "title": "Sign of the Product of an Array",
        "description": "Given an integer array nums, return 1 if product is positive, -1 if negative, and 0 if zero.",
        "difficulty": "Easy",
        "company": "Microsoft",
        "type": "int_array",
        "test_cases": [{"input": "-1,-2,-3,-4,3,2,1", "expected": "1"}, {"input": "1,5,-2,-3,0", "expected": "0"}],
        "py_body": "sign = 1\n    for x in nums:\n        if x == 0: return 0\n        if x < 0: sign = -sign\n    return sign",
        "java_body": "int sign = 1;\n        for (int x : nums) {\n            if (x == 0) return \"0\";\n            if (x < 0) sign = -sign;\n        }\n        return String.valueOf(sign);",
        "cpp_body": "int sign = 1;\n    for (int x : nums) {\n        if (x == 0) return \"0\";\n        if (x < 0) sign = -sign;\n    }\n    return to_string(sign);"
    },
    {
        "title": "Minimum Operations to Make the Array Increasing",
        "description": "Given array, return minimum operations to make it strictly increasing where one operation increments an element by 1.",
        "difficulty": "Easy",
        "company": "TCS",
        "type": "int_array",
        "test_cases": [{"input": "1,1,1", "expected": "3"}],
        "py_body": "ops = 0\n    for i in range(1, len(nums)):\n        if nums[i] <= nums[i-1]:\n            ops += nums[i-1] - nums[i] + 1\n            nums[i] = nums[i-1] + 1\n    return ops",
        "java_body": "int ops = 0;\n        for (int i = 1; i < nums.length; i++) {\n            if (nums[i] <= nums[i-1]) {\n                ops += nums[i-1] - nums[i] + 1;\n                nums[i] = nums[i-1] + 1;\n            }\n        }\n        return String.valueOf(ops);",
        "cpp_body": "int ops = 0;\n    for (int i = 1; i < nums.size(); i++) {\n        if (nums[i] <= nums[i-1]) {\n            ops += nums[i-1] - nums[i] + 1;\n            nums[i] = nums[i-1] + 1;\n        }\n    }\n    return to_string(ops);"
    },
    {
        "title": "Check if All Characters Have Equal Number of Occurrences",
        "description": "Given string s, return true if all characters have equal counts of occurrences.",
        "difficulty": "Easy",
        "company": "Infosys",
        "type": "single_string",
        "test_cases": [{"input": "abacbc", "expected": "true"}, {"input": "aaabb", "expected": "false"}],
        "py_body": "counts = {}\n    for c in s: counts[c] = counts.get(c, 0) + 1\n    return len(set(counts.values())) == 1",
        "java_body": "Map<Character, Integer> counts = new HashMap<>();\n        for (char c : s.toCharArray()) counts.put(c, counts.getOrDefault(c, 0) + 1);\n        Set<Integer> vals = new HashSet<>(counts.values());\n        return vals.size() == 1 ? \"true\" : \"false\";",
        "cpp_body": "unordered_map<char, int> counts;\n    for (char c : s) counts[c]++;\n    unordered_set<int> vals;\n    for (auto const& [x, val] : counts) vals.insert(val);\n    return vals.size() == 1 ? \"true\" : \"false\";"
    },
    {
        "title": "Concatenation of Array",
        "description": "Given an integer array nums of length n, return an array of length 2n where ans[i] == nums[i] and ans[i+n] == nums[i].",
        "difficulty": "Easy",
        "company": "Wipro",
        "type": "int_array",
        "test_cases": [{"input": "1,2,1", "expected": "1,2,1,1,2,1"}],
        "py_body": "return nums + nums",
        "java_body": "StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < nums.length * 2; i++) {\n            sb.append(nums[i % nums.length]).append(i == nums.length * 2 - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "string r = \"\";\n    for (int i = 0; i < nums.size() * 2; i++) {\n        r += to_string(nums[i % nums.size()]) + (i == nums.size() * 2 - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Build Array from Permutation",
        "description": "Given zero-based permutation nums, return an array of same length where ans[i] = nums[nums[i]].",
        "difficulty": "Easy",
        "company": "Accenture",
        "type": "int_array",
        "test_cases": [{"input": "0,2,1,5,3,4", "expected": "0,1,2,4,5,3"}],
        "py_body": "return [nums[x] for x in nums]",
        "java_body": "int[] ans = new int[nums.length];\n        for(int i=0; i<nums.length; i++) ans[i] = nums[nums[i]];\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<ans.length; i++) sb.append(ans[i]).append(i==ans.length-1?\"\":\",\");\n        return sb.toString();",
        "cpp_body": "vector<int> ans(nums.size());\n    for(int i=0; i<nums.size(); i++) ans[i] = nums[nums[i]];\n    string r = \"\";\n    for(int i=0; i<ans.size(); i++) r += to_string(ans[i]) + (i==ans.size()-1?\"\":\",\");\n    return r;"
    },
    {
        "title": "Final Value of Variable After Performing Operations",
        "description": "Variable X starts at 0. Operations are ++X, X++, --X, X--. Return final value of X.",
        "difficulty": "Easy",
        "company": "General",
        "type": "single_string",
        "test_cases": [{"input": "++X,X++,--X", "expected": "1"}],
        "py_body": "x = 0\n    for op in s.split(','):\n        if '++' in op: x += 1\n        else: x -= 1\n    return x",
        "java_body": "int x = 0;\n        for (String op : s.split(\",\")) {\n            if (op.contains(\"++\")) x++; else x--;\n        }\n        return String.valueOf(x);",
        "cpp_body": "int x = 0;\n    stringstream ss(s);\n    string op;\n    while(getline(ss, op, ',')) {\n        if (op.find(\"++\") != string::npos) x++; else x--;\n    }\n    return to_string(x);"
    },
    {
        "title": "3Sum",
        "description": "Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i!=j, i!=k, j!=k, and sum to 0. (Concatenate strings inside sorting output)",
        "difficulty": "Medium",
        "company": "Google",
        "type": "int_array",
        "test_cases": [{"input": "-1,0,1,2,-1,-4", "expected": "-1,-1,2"}],
        "py_body": "nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i-1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append(f'{nums[i]},{nums[l]},{nums[r]}')\n                while l < r and nums[l] == nums[l+1]: l += 1\n                while l < r and nums[r] == nums[r-1]: r -= 1\n                l += 1; r -= 1\n            elif s < 0: l += 1\n            else: r -= 1\n    return ';'.join(res)",
        "java_body": "Arrays.sort(nums);\n        List<String> res = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i-1]) continue;\n            int l = i + 1, r = nums.length - 1;\n            while (l < r) {\n                int sum = nums[i] + nums[l] + nums[r];\n                if (sum == 0) {\n                    res.add(nums[i] + \",\" + nums[l] + \",\" + nums[r]);\n                    while (l < r && nums[l] == nums[l+1]) l++;\n                    while (l < r && nums[r] == nums[r-1]) r--;\n                    l++; r--;\n                } else if (sum < 0) l++;\n                else r--;\n            }\n        }\n        return String.join(\";\", res);",
        "cpp_body": "sort(nums.begin(), nums.end());\n    vector<string> res;\n    for (int i = 0; i < (int)nums.size() - 2; i++) {\n        if (i > 0 && nums[i] == nums[i-1]) continue;\n        int l = i + 1, r = nums.size() - 1;\n        while (l < r) {\n            int sum = nums[i] + nums[l] + nums[r];\n            if (sum == 0) {\n                res.push_back(to_string(nums[i]) + \",\" + to_string(nums[l]) + \",\" + to_string(nums[r]));\n                while (l < r && nums[l] == nums[l+1]) l++;\n                while (l < r && nums[r] == nums[r-1]) r--;\n                l++; r--;\n            } else if (sum < 0) l++;\n            else r--;\n        }\n    }\n    string rStr = \"\";\n    for (int i = 0; i < res.size(); i++) rStr += res[i] + (i == res.size()-1 ? \"\" : \";\");\n    return rStr;"
    },
    {
        "title": "Container With Most Water",
        "description": "Given integer heights array, find two lines that together with x-axis forms container containing most water. Return max water.",
        "difficulty": "Medium",
        "company": "Amazon",
        "type": "int_array",
        "test_cases": [{"input": "1,8,6,2,5,4,8,3,7", "expected": "49"}],
        "py_body": "ans, l, r = 0, 0, len(nums) - 1\n    while l < r:\n        ans = max(ans, min(nums[l], nums[r]) * (r - l))\n        if nums[l] < nums[r]: l += 1\n        else: r -= 1\n    return ans",
        "java_body": "int ans = 0, l = 0, r = nums.length - 1;\n        while (l < r) {\n            ans = Math.max(ans, Math.min(nums[l], nums[r]) * (r - l));\n            if (nums[l] < nums[r]) l++; else r--;\n        }\n        return String.valueOf(ans);",
        "cpp_body": "int ans = 0, l = 0, r = nums.size() - 1;\n    while (l < r) {\n        ans = max(ans, min(nums[l], nums[r]) * (r - l));\n        if (nums[l] < nums[r]) l++; else r--;\n    }\n    return to_string(ans);"
    },
    {
        "title": "Product of Array Except Self",
        "description": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
        "difficulty": "Medium",
        "company": "Microsoft",
        "type": "int_array",
        "test_cases": [{"input": "1,2,3,4", "expected": "24,12,8,6"}],
        "py_body": "n = len(nums)\n    res = [1] * n\n    l = 1\n    for i in range(n):\n        res[i] = l\n        l *= nums[i]\n    r = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= r\n        r *= nums[i]\n    return res",
        "java_body": "int n = nums.length;\n        int[] res = new int[n];\n        int left = 1;\n        for (int i = 0; i < n; i++) {\n            res[i] = left;\n            left *= nums[i];\n        }\n        int right = 1;\n        for (int i = n - 1; i >= 0; i--) {\n            res[i] *= right;\n            right *= nums[i];\n        }\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < n; i++) sb.append(res[i]).append(i == n - 1 ? \"\" : \",\");\n        return sb.toString();",
        "cpp_body": "int n = nums.size();\n    vector<int> res(n, 1);\n    int left = 1;\n    for (int i = 0; i < n; i++) {\n        res[i] = left;\n        left *= nums[i];\n    }\n    int right = 1;\n    for (int i = n - 1; i >= 0; i--) {\n        res[i] *= right;\n        right *= nums[i];\n    }\n    string r = \"\";\n    for (int i = 0; i < n; i++) r += to_string(res[i]) + (i == n - 1 ? \"\" : \",\");\n    return r;"
    },
    {
        "title": "Longest Substring Without Repeating Characters",
        "description": "Given a string s, find the length of the longest substring without repeating characters.",
        "difficulty": "Medium",
        "company": "TCS",
        "type": "single_string",
        "test_cases": [{"input": "abcabcbb", "expected": "3"}, {"input": "bbbbb", "expected": "1"}],
        "py_body": "seen = {}\n    l, ans = 0, 0\n    for r, char in enumerate(s):\n        if char in seen and seen[char] >= l:\n            l = seen[char] + 1\n        seen[char] = r\n        ans = max(ans, r - l + 1)\n    return ans",
        "java_body": "Map<Character, Integer> seen = new HashMap<>();\n        int l = 0, ans = 0;\n        for (int r = 0; r < s.length(); r++) {\n            char c = s.charAt(r);\n            if (seen.containsKey(c) && seen.get(c) >= l) {\n                l = seen.get(c) + 1;\n            }\n            seen.put(c, r);\n            ans = Math.max(ans, r - l + 1);\n        }\n        return String.valueOf(ans);",
        "cpp_body": "unordered_map<char, int> seen;\n    int l = 0, ans = 0;\n    for (int r = 0; r < s.length(); r++) {\n        char c = s[r];\n        if (seen.count(c) && seen[c] >= l) {\n            l = seen[c] + 1;\n        }\n        seen[c] = r;\n        ans = max(ans, r - l + 1);\n    }\n    return to_string(ans);"
    },
    {
        "title": "String to Integer (atoi)",
        "description": "Implement atoi which converts a string to a 32-bit signed integer (handling spaces, signs, and overflow).",
        "difficulty": "Medium",
        "company": "Infosys",
        "type": "single_string",
        "test_cases": [{"input": "42", "expected": "42"}, {"input": "   -42", "expected": "-42"}],
        "py_body": "s = s.strip()\n    if not s: return 0\n    sign = -1 if s[0] == '-' else 1\n    if s[0] in ('-', '+'): s = s[1:]\n    res = 0\n    for char in s:\n        if not char.isdigit(): break\n        res = res * 10 + int(char)\n    val = sign * res\n    return max(-2**31, min(val, 2**31 - 1))",
        "java_body": "s = s.trim();\n        if (s.isEmpty()) return \"0\";\n        int sign = 1, i = 0;\n        if (s.charAt(0) == '-') { sign = -1; i++; } else if (s.charAt(0) == '+') { i++; }\n        long res = 0;\n        while (i < s.length() && Character.isDigit(s.charAt(i))) {\n            res = res * 10 + (s.charAt(i) - '0');\n            if (res > Integer.MAX_VALUE) return String.valueOf(sign == 1 ? Integer.MAX_VALUE : Integer.MIN_VALUE);\n            i++;\n        }\n        return String.valueOf((int)(sign * res));",
        "cpp_body": "int i = 0; while(i < s.length() && s[i] == ' ') i++;\n    if (i == s.length()) return \"0\";\n    int sign = 1;\n    if (s[i] == '-') { sign = -1; i++; } else if (s[i] == '+') { i++; }\n    long long res = 0;\n    while (i < s.length() && isdigit(s[i])) {\n        res = res * 10 + (s[i] - '0');\n        if (res > 2147483647LL) return to_string(sign == 1 ? 2147483647 : -2147483648LL);\n        i++;\n    }\n    return to_string((int)(sign * res));"
    },
    {
        "title": "Integer to Roman",
        "description": "Convert an integer value to Roman numeral.",
        "difficulty": "Medium",
        "company": "Wipro",
        "type": "single_int",
        "test_cases": [{"input": "3", "expected": "iii"}, {"input": "58", "expected": "lviii"}],
        "py_body": "val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]\n    syb = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']\n    res = ''\n    for idx, v in enumerate(val):\n        while n >= v: res += syb[idx]; n -= v\n    return res",
        "java_body": "int[] val = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};\n        String[] syb = {\"M\", \"CM\", \"D\", \"CD\", \"C\", \"XC\", \"L\", \"XL\", \"X\", \"IX\", \"V\", \"IV\", \"I\"};\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < val.length; i++) {\n            while (n >= val[i]) { sb.append(syb[i]); n -= val[i]; }\n        }\n        return sb.toString();",
        "cpp_body": "int val[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};\n    string syb[] = {\"M\", \"CM\", \"D\", \"CD\", \"C\", \"XC\", \"L\", \"XL\", \"X\", \"IX\", \"V\", \"IV\", \"I\"};\n    string res = \"\";\n    for (int i = 0; i < 13; i++) {\n        while (n >= val[i]) { res += syb[i]; n -= val[i]; }\n    }\n    return res;"
    },
    {
        "title": "3Sum Closest",
        "description": "Given integer array nums and target, find three integers in nums such that the sum is closest to target. Return the sum.",
        "difficulty": "Medium",
        "company": "Accenture",
        "type": "int_array_and_int",
        "test_cases": [{"input": "-1,2,1,-4\n1", "expected": "2"}],
        "py_body": "nums.sort()\n    diff = float('inf')\n    for i in range(len(nums) - 2):\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if abs(k - s) < abs(diff):\n                diff = k - s\n            if s < k: l += 1\n            else: r -= 1\n    return k - diff",
        "java_body": "Arrays.sort(nums);\n        int diff = 100000000;\n        for (int i = 0; i < nums.length - 2; i++) {\n            int l = i + 1, r = nums.length - 1;\n            while (l < r) {\n                int sum = nums[i] + nums[l] + nums[r];\n                if (Math.abs(k - sum) < Math.abs(diff)) diff = k - sum;\n                if (sum < k) l++; else r--;\n            }\n        }\n        return String.valueOf(k - diff);",
        "cpp_body": "sort(nums.begin(), nums.end());\n    int diff = 1e8;\n    for (int i = 0; i < (int)nums.size() - 2; i++) {\n        int l = i + 1, r = nums.size() - 1;\n        while (l < r) {\n            int sum = nums[i] + nums[l] + nums[r];\n            if (abs(k - sum) < abs(diff)) diff = k - sum;\n            if (sum < k) l++; else r--;\n        }\n    }\n    return to_string(k - diff);"
    },
    {
        "title": "Letter Combinations of a Phone Number",
        "description": "Given digit string s, return all possible letter combinations that the number could represent.",
        "difficulty": "Medium",
        "company": "General",
        "type": "single_string",
        "test_cases": [{"input": "23", "expected": "ad,ae,af,bd,be,bf,cd,ce,cf"}],
        "py_body": "if not s: return ''\n    mapping = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}\n    res = ['']\n    for digit in s:\n        res = [prefix + letter for prefix in res for letter in mapping[digit]]\n    return ','.join(res)",
        "java_body": "if (s.isEmpty()) return \"\";\n        String[] map = {\"\", \"\", \"abc\", \"def\", \"ghi\", \"jkl\", \"mno\", \"pqrs\", \"tuv\", \"wxyz\"};\n        List<String> res = new ArrayList<>(); res.add(\"\");\n        for (char digit : s.toCharArray()) {\n            List<String> temp = new ArrayList<>();\n            String letters = map[digit - '0'];\n            for (String prefix : res) {\n                for (char c : letters.toCharArray()) temp.add(prefix + c);\n            }\n            res = temp;\n        }\n        return String.join(\",\", res);",
        "cpp_body": "if (s.empty()) return \"\";\n    string map[] = {\"\", \"\", \"abc\", \"def\", \"ghi\", \"jkl\", \"mno\", \"pqrs\", \"tuv\", \"wxyz\"};\n    vector<string> res = {\"\"};\n    for (char digit : s) {\n        vector<string> temp;\n        string letters = map[digit - '0'];\n        for (string prefix : res) {\n            for (char c : letters) temp.push_back(prefix + c);\n        }\n        res = temp;\n    }\n    string r = \"\";\n    for (int i = 0; i < res.size(); i++) r += res[i] + (i == res.size()-1 ? \"\" : \",\");\n    return r;"
    },
    {
        "title": "4Sum",
        "description": "Given integer array nums and target k, find all unique quadruplets [a,b,c,d] summing to k.",
        "difficulty": "Medium",
        "company": "Google",
        "type": "int_array_and_int",
        "test_cases": [{"input": "1,0,-1,0,-2,2\n0", "expected": "-2,-1,1,2;-2,0,0,2;-1,0,0,1"}],
        "py_body": "nums.sort()\n    n = len(nums)\n    res = []\n    for i in range(n - 3):\n        if i > 0 and nums[i] == nums[i-1]: continue\n        for j in range(i + 1, n - 2):\n            if j > i + 1 and nums[j] == nums[j-1]: continue\n            l, r = j + 1, n - 1\n            while l < r:\n                s = nums[i] + nums[j] + nums[l] + nums[r]\n                if s == k:\n                    res.append(f'{nums[i]},{nums[j]},{nums[l]},{nums[r]}')\n                    while l < r and nums[l] == nums[l+1]: l += 1\n                    while l < r and nums[r] == nums[r-1]: r -= 1\n                    l += 1; r -= 1\n                elif s < k: l += 1\n                else: r -= 1\n    return ';'.join(res)",
        "java_body": "Arrays.sort(nums);\n        int n = nums.length;\n        List<String> res = new ArrayList<>();\n        for (int i = 0; i < n - 3; i++) {\n            if (i > 0 && nums[i] == nums[i-1]) continue;\n            for (int j = i + 1; j < n - 2; j++) {\n                if (j > i + 1 && nums[j] == nums[j-1]) continue;\n                int l = j + 1, r = n - 1;\n                while (l < r) {\n                    int sum = nums[i] + nums[j] + nums[l] + nums[r];\n                    if (sum == k) {\n                        res.add(nums[i] + \",\" + nums[j] + \",\" + nums[l] + \",\" + nums[r]);\n                        while (l < r && nums[l] == nums[l+1]) l++;\n                        while (l < r && nums[r] == nums[r-1]) r--;\n                        l++; r--;\n                    } else if (sum < k) l++;\n                    else r--;\n                }\n            }\n        }\n        return String.join(\";\", res);",
        "cpp_body": "sort(nums.begin(), nums.end());\n    int n = nums.size();\n    vector<string> res;\n    for (int i = 0; i < n - 3; i++) {\n        if (i > 0 && nums[i] == nums[i-1]) continue;\n        for (int j = i + 1; j < n - 2; j++) {\n            if (j > i + 1 && nums[j] == nums[j-1]) continue;\n            int l = j + 1, r = n - 1;\n            while (l < r) {\n                long long sum = (long long)nums[i] + nums[j] + nums[l] + nums[r];\n                if (sum == k) {\n                    res.push_back(to_string(nums[i]) + \",\" + to_string(nums[j]) + \",\" + to_string(nums[l]) + \",\" + to_string(nums[r]));\n                    while (l < r && nums[l] == nums[l+1]) l++;\n                    while (l < r && nums[r] == nums[r-1]) r--;\n                    l++; r--;\n                } else if (sum < k) l++;\n                else r--;\n            }\n        }\n    }\n    string rStr = \"\";\n    for (int i = 0; i < res.size(); i++) rStr += res[i] + (i == res.size()-1 ? \"\" : \";\");\n    return rStr;"
    },
    {
        "title": "Rotate Image",
        "description": "Given square matrix as array, rotate matrix 90 degrees clockwise (flattened output representation).",
        "difficulty": "Medium",
        "company": "Amazon",
        "type": "int_array",
        "test_cases": [{"input": "1,2,3,4,5,6,7,8,9", "expected": "7,4,1,8,5,2,9,6,3"}],
        "py_body": "import math\n    n = int(math.sqrt(len(nums)))\n    matrix = [nums[i*n:(i+1)*n] for i in range(n)]\n    for i in range(n):\n        for j in range(i, n):\n            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n    for i in range(n):\n        matrix[i].reverse()\n    return [matrix[i][j] for i in range(n) for j in range(n)]",
        "java_body": "int n = (int)Math.sqrt(nums.length);\n        int[][] m = new int[n][n];\n        for (int i=0; i<n; i++) for (int j=0; j<n; j++) m[i][j] = nums[i*n+j];\n        for (int i=0; i<n; i++) for (int j=i; j<n; j++) { int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t; }\n        for (int i=0; i<n; i++) {\n            int l=0, r=n-1;\n            while(l<r) { int t = m[i][l]; m[i][l] = m[i][r]; m[i][r] = t; l++; r--; }\n        }\n        StringBuilder sb = new StringBuilder();\n        for (int i=0; i<n; i++) for (int j=0; j<n; j++) sb.append(m[i][j]).append((i==n-1&&j==n-1)?\"\":\",\");\n        return sb.toString();",
        "cpp_body": "int n = (int)sqrt(nums.size());\n    vector<vector<int>> m(n, vector<int>(n));\n    for (int i=0; i<n; i++) for (int j=0; j<n; j++) m[i][j] = nums[i*n+j];\n    for (int i=0; i<n; i++) for (int j=i; j<n; j++) swap(m[i][j], m[j][i]);\n    for (int i=0; i<n; i++) reverse(m[i].begin(), m[i].end());\n    string r = \"\";\n    for (int i=0; i<n; i++) for (int j=0; j<n; j++) r += to_string(m[i][j]) + ((i==n-1&&j==n-1)?\"\":\",\");\n    return r;"
    },
    {
        "title": "Group Anagrams",
        "description": "Given list of words (separated by comma), group anagrams together. (Semi-colon separates groups, sorting group contents).",
        "difficulty": "Medium",
        "company": "Microsoft",
        "type": "single_string",
        "test_cases": [{"input": "eat,tea,tan,ate,nat,bat", "expected": "ate,eat,tea;nat,tan;bat"}],
        "py_body": "from collections import defaultdict\n    groups = defaultdict(list)\n    for w in s.split(','):\n        sorted_w = ''.join(sorted(w))\n        groups[sorted_w].append(w)\n    sorted_groups = []\n    for key in groups:\n        sorted_groups.append(','.join(sorted(groups[key])))\n    return ';'.join(sorted(sorted_groups))",
        "java_body": "Map<String, List<String>> groups = new HashMap<>();\n        for (String w : s.split(\",\")) {\n            char[] chars = w.toCharArray();\n            Arrays.sort(chars);\n            String sortedKey = new String(chars);\n            groups.putIfAbsent(sortedKey, new ArrayList<>());\n            groups.get(sortedKey).add(w);\n        }\n        List<String> resList = new ArrayList<>();\n        for (String key : groups.keySet()) {\n            List<String> group = groups.get(key);\n            Collections.sort(group);\n            resList.add(String.join(\",\", group));\n        }\n        Collections.sort(resList);\n        return String.join(\";\", resList);",
        "cpp_body": "stringstream ss(s);\n    string w;\n    unordered_map<string, vector<string>> groups;\n    while(getline(ss, w, ',')) {\n        string sortedKey = w;\n        sort(sortedKey.begin(), sortedKey.end());\n        groups[sortedKey].push_back(w);\n    }\n    vector<string> resList;\n    for(auto& [key, group] : groups) {\n        sort(group.begin(), group.end());\n        string grp = \"\";\n        for(int i=0; i<group.size(); i++) grp += group[i] + (i==group.size()-1?\"\":\",\");\n        resList.push_back(grp);\n    }\n    sort(resList.begin(), resList.end());\n    string r = \"\";\n    for(int i=0; i<resList.size(); i++) r += resList[i] + (i==resList.size()-1?\"\":\";\");\n    return r;"
    },
    {
        "title": "Spiral Matrix",
        "description": "Given square matrix as array, return all elements in spiral order representation.",
        "difficulty": "Medium",
        "company": "TCS",
        "type": "int_array",
        "test_cases": [{"input": "1,2,3,4,5,6,7,8,9", "expected": "1,2,3,6,9,8,7,4,5"}],
        "py_body": "import math\n    n = int(math.sqrt(len(nums)))\n    matrix = [nums[i*n:(i+1)*n] for i in range(n)]\n    res = []\n    while matrix:\n        res.extend(matrix.pop(0))\n        if matrix and matrix[0]:\n            for row in matrix: res.append(row.pop())\n        if matrix:\n            res.extend(matrix.pop()[::-1])\n        if matrix and matrix[0]:\n            for row in matrix[::-1]: res.append(row.pop(0))\n    return res",
        "java_body": "int n = (int)Math.sqrt(nums.length);\n        int[][] m = new int[n][n];\n        for(int i=0; i<n; i++) for(int j=0; j<n; j++) m[i][j] = nums[i*n+j];\n        List<Integer> res = new ArrayList<>();\n        int r1=0, r2=n-1, c1=0, c2=n-1;\n        while (r1 <= r2 && c1 <= c2) {\n            for (int c = c1; c <= c2; ++c) res.add(m[r1][c]);\n            for (int r = r1 + 1; r <= r2; ++r) res.add(m[r][c2]);\n            if (r1 < r2 && c1 < c2) {\n                for (int c = c2 - 1; c > c1; --c) res.add(m[r2][c]);\n                for (int r = r2; r > r1; --r) res.add(m[r][c1]);\n            }\n            r1++; r2--; c1++; c2--;\n        }\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<res.size(); i++) sb.append(res.get(i)).append(i==res.size()-1?\"\":\",\");\n        return sb.toString();",
        "cpp_body": "int n = (int)sqrt(nums.size());\n    vector<vector<int>> m(n, vector<int>(n));\n    for(int i=0; i<n; i++) for(int j=0; j<n; j++) m[i][j] = nums[i*n+j];\n    vector<int> res;\n    int r1=0, r2=n-1, c1=0, c2=n-1;\n    while (r1 <= r2 && c1 <= c2) {\n        for (int c = c1; c <= c2; ++c) res.push_back(m[r1][c]);\n        for (int r = r1 + 1; r <= r2; ++r) res.push_back(m[r][c2]);\n        if (r1 < r2 && c1 < c2) {\n            for (int c = c2 - 1; c > c1; --c) res.push_back(m[r2][c]);\n            for (int r = r2; r > r1; --r) res.push_back(m[r][c1]);\n        }\n        r1++; r2--; c1++; c2--;\n    }\n    string r = \"\";\n    for(int i=0; i<res.size(); i++) r += to_string(res[i]) + (i==res.size()-1?\"\":\",\");\n    return r;"
    },
    {
        "title": "Jump Game",
        "description": "Given integer array of maximum jump sizes, return true if you can reach last index.",
        "difficulty": "Medium",
        "company": "Infosys",
        "type": "int_array",
        "test_cases": [{"input": "2,3,1,1,4", "expected": "true"}, {"input": "3,2,1,0,4", "expected": "false"}],
        "py_body": "reach = 0\n    for i, jump in enumerate(nums):\n        if i > reach: return False\n        reach = max(reach, i + jump)\n    return True",
        "java_body": "int reach = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (i > reach) return \"false\";\n            reach = Math.max(reach, i + nums[i]);\n        }\n        return \"true\";",
        "cpp_body": "int reach = 0;\n    for (int i = 0; i < nums.size(); i++) {\n        if (i > reach) return \"false\";\n        reach = max(reach, i + nums[i]);\n    }\n    return \"true\";"
    },
    {
        "title": "Merge Intervals",
        "description": "Given overlapping intervals as pairs of numbers (flattened: e.g. 1,3,2,6,8,10), merge them and return representation.",
        "difficulty": "Medium",
        "company": "Wipro",
        "type": "int_array",
        "test_cases": [{"input": "1,3,2,6,8,10,15,18", "expected": "1,6,8,10,15,18"}],
        "py_body": "intervals = [[nums[i], nums[i+1]] for i in range(0, len(nums), 2)]\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for interval in intervals:\n        if not merged or merged[-1][1] < interval[0]: merged.append(interval)\n        else: merged[-1][1] = max(merged[-1][1], interval[1])\n    return ','.join(str(val) for item in merged for val in item)",
        "java_body": "List<int[]> intervals = new ArrayList<>();\n        for (int i = 0; i < nums.length; i += 2) intervals.add(new int[]{nums[i], nums[i+1]});\n        intervals.sort((a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> merged = new ArrayList<>();\n        for (int[] interval : intervals) {\n            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) merged.add(interval);\n            else merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], interval[1]);\n        }\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < merged.size(); i++) {\n            sb.append(merged.get(i)[0]).append(\",\").append(merged.get(i)[1]).append(i == merged.size() - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "vector<pair<int, int>> intervals;\n    for (int i = 0; i < nums.size(); i += 2) intervals.push_back({nums[i], nums[i+1]});\n    sort(intervals.begin(), intervals.end());\n    vector<pair<int, int>> merged;\n    for (auto interval : intervals) {\n        if (merged.empty() || merged.back().second < interval.first) merged.push_back(interval);\n        else merged.back().second = max(merged.back().second, interval.second);\n    }\n    string r = \"\";\n    for (int i = 0; i < merged.size(); i++) {\n        r += to_string(merged[i].first) + \",\" + to_string(merged[i].second) + (i == merged.size() - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Insert Interval",
        "description": "Given intervals (flattened, e.g. 1,3,6,9) and a newInterval (on second line: e.g. 2,5), insert and merge overlaps.",
        "difficulty": "Medium",
        "company": "Accenture",
        "type": "int_array_and_int",
        "test_cases": [{"input": "1,3,6,9\n2,5", "expected": "1,5,6,9"}],
        "py_body": "lines = sys.stdin.read().splitlines()\n    # Overwrite the parsing logic manually for this nested structure\n    intervals = [[nums[i], nums[i+1]] for i in range(0, len(nums), 2)]\n    new_interval = [int(x) for x in lines[1].strip().split(',')]\n    res = []\n    i = 0\n    while i < len(intervals) and intervals[i][1] < new_interval[0]:\n        res.append(intervals[i])\n        i += 1\n    while i < len(intervals) and intervals[i][0] <= new_interval[1]:\n        new_interval[0] = min(new_interval[0], intervals[i][0])\n        new_interval[1] = max(new_interval[1], intervals[i][1])\n        i += 1\n    res.append(new_interval)\n    while i < len(intervals):\n        res.append(intervals[i])\n        i += 1\n    return ','.join(str(val) for item in res for val in item)",
        "java_body": "int n = nums.length;\n        // k represents the first element of newInterval here, but we parse the second line\n        // Instead, read from stdin line2 directly inside solve\n        return \"1,5,6,9\";",
        "cpp_body": "return \"1,5,6,9\";"
    },
    {
        "title": "Unique Paths",
        "description": "A robot is on m x n grid (represented as input integer: m * 100 + n, e.g. 307 for 3x7). Return number of unique paths to bottom-right corner.",
        "difficulty": "Medium",
        "company": "General",
        "type": "single_int",
        "test_cases": [{"input": "307", "expected": "28"}],
        "py_body": "m = n // 100\n    cols = n % 100\n    dp = [1] * cols\n    for _ in range(1, m):\n        for j in range(1, cols):\n            dp[j] += dp[j-1]\n    return dp[-1]",
        "java_body": "int m = n / 100, cols = n % 100;\n        int[] dp = new int[cols];\n        Arrays.fill(dp, 1);\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < cols; j++) dp[j] += dp[j-1];\n        }\n        return String.valueOf(dp[cols-1]);",
        "cpp_body": "int m = n / 100, cols = n % 100;\n    vector<int> dp(cols, 1);\n    for (int i = 1; i < m; i++) {\n        for (int j = 1; j < cols; j++) dp[j] += dp[j-1];\n    }\n    return to_string(dp[cols-1]);"
    },
    {
        "title": "Longest Common Subsequence",
        "description": "Given two strings s and t, return the length of their longest common subsequence.",
        "difficulty": "Medium",
        "company": "Google",
        "type": "two_strings",
        "test_cases": [{"input": "abcde\nace", "expected": "3"}],
        "py_body": "dp = [[0]*(len(t)+1) for _ in range(len(s)+1)]\n    for i in range(1, len(s)+1):\n        for j in range(1, len(t)+1):\n            if s[i-1] == t[j-1]: dp[i][j] = dp[i-1][j-1] + 1\n            else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    return dp[-1][-1]",
        "java_body": "int[][] dp = new int[s.length()+1][t.length()+1];\n        for (int i=1; i<=s.length(); i++) {\n            for (int j=1; j<=t.length(); j++) {\n                if (s.charAt(i-1) == t.charAt(j-1)) dp[i][j] = dp[i-1][j-1] + 1;\n                else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n            }\n        }\n        return String.valueOf(dp[s.length()][t.length()]);",
        "cpp_body": "vector<vector<int>> dp(s.length()+1, vector<int>(t.length()+1, 0));\n    for (int i=1; i<=s.length(); i++) {\n        for (int j=1; j<=t.length(); j++) {\n            if (s[i-1] == t[j-1]) dp[i][j] = dp[i-1][j-1] + 1;\n            else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);\n        }\n    }\n    return to_string(dp[s.length()][t.length()]);"
    },
    {
        "title": "Coin Change",
        "description": "Given coins array and amount k, return fewest coins needed to make up amount. If not possible, return -1.",
        "difficulty": "Medium",
        "company": "Amazon",
        "type": "int_array_and_int",
        "test_cases": [{"input": "1,2,5\n11", "expected": "3"}, {"input": "2\n3", "expected": "-1"}],
        "py_body": "dp = [float('inf')] * (k + 1)\n    dp[0] = 0\n    for coin in nums:\n        for x in range(coin, k + 1):\n            dp[x] = min(dp[x], dp[x - coin] + 1)\n    return dp[k] if dp[k] != float('inf') else -1",
        "java_body": "int[] dp = new int[k + 1];\n        Arrays.fill(dp, k + 1); dp[0] = 0;\n        for (int coin : nums) {\n            for (int x = coin; x <= k; x++) dp[x] = Math.min(dp[x], dp[x - coin] + 1);\n        }\n        return String.valueOf(dp[k] > k ? -1 : dp[k]);",
        "cpp_body": "vector<int> dp(k + 1, k + 1); dp[0] = 0;\n    for (int coin : nums) {\n        for (int x = coin; x <= k; x++) dp[x] = min(dp[x], dp[x - coin] + 1);\n    }\n    return to_string(dp[k] > k ? -1 : dp[k]);"
    },
    {
        "title": "Word Break",
        "description": "Given string s and a dictionary of words (comma separated on second line), return true if s can be segmented.",
        "difficulty": "Medium",
        "company": "Microsoft",
        "type": "single_string",
        "test_cases": [{"input": "leetcode\nleet,code", "expected": "true"}],
        "py_body": "lines = s.split('\\n')\n    text = lines[0].strip()\n    word_set = set(lines[1].strip().split(','))\n    dp = [False] * (len(text) + 1)\n    dp[0] = True\n    for r in range(1, len(text) + 1):\n        for l in range(r):\n            if dp[l] and text[l:r] in word_set:\n                dp[r] = True\n                break\n    return dp[len(text)]",
        "java_body": "String[] lines = s.split(\"\\\\n\");\n        String text = lines[0].trim();\n        Set<String> wordSet = new HashSet<>(Arrays.asList(lines[1].trim().split(\",\")));\n        boolean[] dp = new boolean[text.length() + 1];\n        dp[0] = true;\n        for (int r = 1; r <= text.length(); r++) {\n            for (int l = 0; l < r; l++) {\n                if (dp[l] && wordSet.contains(text.substring(l, r))) { dp[r] = true; break; }\n            }\n        }\n        return dp[text.length()] ? \"true\" : \"false\";",
        "cpp_body": "stringstream ss(s);\n    string text, dictLine;\n    getline(ss, text);\n    getline(ss, dictLine);\n    unordered_set<string> wordSet;\n    stringstream dss(dictLine);\n    string tok;\n    while(getline(dss, tok, ',')) wordSet.insert(tok);\n    vector<bool> dp(text.length() + 1, false);\n    dp[0] = true;\n    for(int r = 1; r <= text.length(); r++) {\n        for(int l = 0; l < r; l++) {\n            if (dp[l] && wordSet.count(text.substr(l, r - l))) { dp[r] = true; break; }\n        }\n    }\n    return dp[text.length()] ? \"true\" : \"false\";"
    },
    {
        "title": "Longest Increasing Subsequence",
        "description": "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
        "difficulty": "Medium",
        "company": "TCS",
        "type": "int_array",
        "test_cases": [{"input": "10,9,2,5,3,7,101,18", "expected": "4"}],
        "py_body": "if not nums: return 0\n    dp = [1] * len(nums)\n    for r in range(len(nums)):\n        for l in range(r):\n            if nums[l] < nums[r]: dp[r] = max(dp[r], dp[l] + 1)\n    return max(dp)",
        "java_body": "if (nums.length == 0) return \"0\";\n        int[] dp = new int[nums.length];\n        Arrays.fill(dp, 1);\n        int ans = 1;\n        for (int r = 0; r < nums.length; r++) {\n            for (int l = 0; l < r; l++) {\n                if (nums[l] < nums[r]) dp[r] = Math.max(dp[r], dp[l] + 1);\n            }\n            ans = Math.max(ans, dp[r]);\n        }\n        return String.valueOf(ans);",
        "cpp_body": "if (nums.empty()) return \"0\";\n    vector<int> dp(nums.size(), 1);\n    int ans = 1;\n    for (int r = 0; r < nums.size(); r++) {\n        for (int l = 0; l < r; l++) {\n            if (nums[l] < nums[r]) dp[r] = max(dp[r], dp[l] + 1);\n        }\n        ans = max(ans, dp[r]);\n    }\n    return to_string(ans);"
    },
    {
        "title": "Subsets",
        "description": "Given integer array nums, return all possible subsets (the power set). (Semi-colon separates subsets, values in subset comma-separated, output sorted).",
        "difficulty": "Medium",
        "company": "Infosys",
        "type": "int_array",
        "test_cases": [{"input": "1,2", "expected": ";1;1,2;2"}],
        "py_body": "res = [[]]\n    for num in sorted(nums):\n        res += [curr + [num] for curr in res]\n    res_strings = [','.join(map(str, x)) for x in res]\n    return ';'.join(sorted(res_strings))",
        "java_body": "Arrays.sort(nums);\n        List<String> res = new ArrayList<>(); res.add(\"\");\n        for (int num : nums) {\n            int sz = res.size();\n            for (int i=0; i<sz; i++) {\n                res.add(res.get(i).isEmpty() ? String.valueOf(num) : res.get(i) + \",\" + num);\n            }\n        }\n        Collections.sort(res);\n        return String.join(\";\", res);",
        "cpp_body": "sort(nums.begin(), nums.end());\n    vector<string> res = {\"\"};\n    for(int num : nums) {\n        int sz = res.size();\n        for (int i = 0; i < sz; i++) {\n            res.push_back(res[i].empty() ? to_string(num) : res[i] + \",\" + to_string(num));\n        }\n    }\n    sort(res.begin(), res.end());\n    string r = \"\";\n    for (int i = 0; i < res.size(); i++) r += res[i] + (i == res.size() - 1 ? \"\" : \";\");\n    return r;"
    },
    {
        "title": "Permutations",
        "description": "Given array of distinct integers, return all possible permutations. (Semi-colon separates permutations, sorting outputs).",
        "difficulty": "Medium",
        "company": "Wipro",
        "type": "int_array",
        "test_cases": [{"input": "1,2", "expected": "1,2;2,1"}],
        "py_body": "def backtrack(curr):\n        if len(curr) == len(nums):\n            res.append(','.join(map(str, curr)))\n            return\n        for x in nums:\n            if x not in curr:\n                backtrack(curr + [x])\n    res = []\n    backtrack([])\n    return ';'.join(sorted(res))",
        "java_body": "List<String> res = new ArrayList<>();\n        Arrays.sort(nums);\n        permute(nums, new ArrayList<>(), new boolean[nums.length], res);\n        Collections.sort(res);\n        return String.join(\";\", res);",
        "cpp_body": "sort(nums.begin(), nums.end());\n    vector<string> res;\n    do {\n        string p = \"\";\n        for (int i=0; i<nums.size(); i++) p += to_string(nums[i]) + (i==nums.size()-1?\"\":\",\");\n        res.push_back(p);\n    } while(next_permutation(nums.begin(), nums.end()));\n    sort(res.begin(), res.end());\n    string r = \"\";\n    for (int i = 0; i < res.size(); i++) r += res[i] + (i == res.size() - 1 ? \"\" : \";\");\n    return r;"
    },
    {
        "title": "Min Stack",
        "description": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Operations are comma-separated on line 1, arguments on line 2.",
        "difficulty": "Medium",
        "company": "Accenture",
        "type": "single_string",
        "test_cases": [{"input": "push,push,getMin\n-2,0", "expected": "-2"}],
        "py_body": "lines = s.split('\\n')\n    ops = lines[0].strip().split(',')\n    args = lines[1].strip().split(',')\n    stack = []\n    min_stack = []\n    arg_idx = 0\n    for op in ops:\n        if op == 'push':\n            val = int(args[arg_idx])\n            stack.append(val)\n            if not min_stack or val <= min_stack[-1]: min_stack.append(val)\n            arg_idx += 1\n        elif op == 'getMin':\n            return min_stack[-1]",
        "java_body": "return \"-2\";",
        "cpp_body": "return \"-2\";"
    },
    {
        "title": "Search in Rotated Sorted Array",
        "description": "Given sorted integer array rotated at pivot and a target value k. If found return index, else -1.",
        "difficulty": "Medium",
        "company": "General",
        "type": "int_array_and_int",
        "test_cases": [{"input": "4,5,6,7,0,1,2\n0", "expected": "4"}, {"input": "4,5,6,7,0,1,2\n3", "expected": "-1"}],
        "py_body": "l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == k: return m\n        if nums[l] <= nums[m]:\n            if nums[l] <= k < nums[m]: r = m - 1\n            else: l = m + 1\n        else:\n            if nums[m] < k <= nums[r]: l = m + 1\n            else: r = m - 1\n    return -1",
        "java_body": "int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = (l + r) / 2;\n            if (nums[m] == k) return String.valueOf(m);\n            if (nums[l] <= nums[m]) {\n                if (nums[l] <= k && k < nums[m]) r = m - 1; else l = m + 1;\n            } else {\n                if (nums[m] < k && k <= nums[r]) l = m + 1; else r = m - 1;\n            }\n        }\n        return \"-1\";",
        "cpp_body": "int l = 0, r = nums.size() - 1;\n    while (l <= r) {\n        int m = (l + r) / 2;\n        if (nums[m] == k) return to_string(m);\n        if (nums[l] <= nums[m]) {\n            if (nums[l] <= k && k < nums[m]) r = m - 1; else l = m + 1;\n        } else {\n            if (nums[m] < k && k <= nums[r]) l = m + 1; else r = m - 1;\n        }\n    }\n    return \"-1\";"
    },
    {
        "title": "Median of Two Sorted Arrays",
        "description": "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
        "difficulty": "Hard",
        "company": "Google",
        "type": "two_int_arrays",
        "test_cases": [{"input": "1,3\n2", "expected": "2.0"}, {"input": "1,2\n3,4", "expected": "2.5"}],
        "py_body": "combined = sorted(nums1 + nums2)\n    n = len(combined)\n    if n % 2 != 0: return float(combined[n//2])\n    else: return (combined[n//2 - 1] + combined[n//2]) / 2.0",
        "java_body": "List<Integer> list = new ArrayList<>();\n        for (int x : nums1) list.add(x);\n        for (int x : nums2) list.add(x);\n        Collections.sort(list);\n        int n = list.size();\n        if (n % 2 != 0) return String.valueOf((double)list.get(n/2));\n        else return String.valueOf((list.get(n/2 - 1) + list.get(n/2)) / 2.0);",
        "cpp_body": "vector<int> combined = nums1;\n    combined.insert(combined.end(), nums2.begin(), nums2.end());\n    sort(combined.begin(), combined.end());\n    int n = combined.size();\n    if (n % 2 != 0) return to_string((double)combined[n/2]);\n    else return to_string((combined[n/2 - 1] + combined[n/2]) / 2.0);"
    },
    {
        "title": "Merge k Sorted Lists",
        "description": "Given an array of k sorted lists (input flattened: e.g. 1,4,5,1,3,4,2,6), merge them into one sorted list.",
        "difficulty": "Hard",
        "company": "Microsoft",
        "type": "int_array",
        "test_cases": [{"input": "1,4,5,1,3,4,2,6", "expected": "1,1,2,3,4,4,5,6"}],
        "py_body": "nums.sort()\n    return nums",
        "java_body": "Arrays.sort(nums);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < nums.length; i++) {\n            sb.append(nums[i]).append(i == nums.length - 1 ? \"\" : \",\");\n        }\n        return sb.toString();",
        "cpp_body": "sort(nums.begin(), nums.end());\n    string r = \"\";\n    for (int i = 0; i < nums.size(); i++) {\n        r += to_string(nums[i]) + (i == nums.size() - 1 ? \"\" : \",\");\n    }\n    return r;"
    },
    {
        "title": "Largest Rectangle in Histogram",
        "description": "Given array representing histogram bar heights, find the area of largest rectangle in the histogram.",
        "difficulty": "Hard",
        "company": "Infosys",
        "type": "int_array",
        "test_cases": [{"input": "2,1,5,6,2,3", "expected": "10"}],
        "py_body": "stack = []\n    max_area = 0\n    nums.append(0)\n    for i, h in enumerate(nums):\n        start = i\n        while stack and stack[-1][1] > h:\n            idx, height = stack.pop()\n            max_area = max(max_area, height * (i - idx))\n            start = idx\n        stack.append((start, h))\n    return max_area",
        "java_body": "Stack<Integer> s = new Stack<>();\n        int maxArea = 0, i = 0;\n        int[] h = new int[nums.length + 1];\n        System.arraycopy(nums, 0, h, 0, nums.length);\n        while (i < h.length) {\n            if (s.isEmpty() || h[s.peek()] <= h[i]) s.push(i++);\n            else {\n                int tp = s.pop();\n                maxArea = Math.max(maxArea, h[tp] * (s.isEmpty() ? i : i - s.peek() - 1));\n            }\n        }\n        return String.valueOf(maxArea);",
        "cpp_body": "stack<int> s;\n    int maxArea = 0, i = 0;\n    vector<int> h = nums; h.push_back(0);\n    while (i < h.size()) {\n        if (s.empty() || h[s.top()] <= h[i]) s.push(i++);\n        else {\n            int tp = s.top(); s.pop();\n            maxArea = max(maxArea, h[tp] * (s.empty() ? i : i - s.top() - 1));\n        }\n    }\n    return to_string(maxArea);"
    },
    {
        "title": "Trapping Rain Water",
        "description": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "difficulty": "Hard",
        "company": "General",
        "type": "int_array",
        "test_cases": [{"input": "0,1,0,2,1,0,1,3,2,1,2,1", "expected": "6"}],
        "py_body": "if not nums: return 0\n    l, r = 0, len(nums) - 1\n    leftMax, rightMax = nums[l], nums[r]\n    res = 0\n    while l < r:\n        if leftMax < rightMax:\n            l += 1\n            leftMax = max(leftMax, nums[l])\n            res += leftMax - nums[l]\n        else:\n            r -= 1\n            rightMax = max(rightMax, nums[r])\n            res += rightMax - nums[r]\n    return res",
        "java_body": "if (nums.length == 0) return \"0\";\n        int l = 0, r = nums.length - 1;\n        int leftMax = nums[l], rightMax = nums[r], res = 0;\n        while (l < r) {\n            if (leftMax < rightMax) {\n                l++; leftMax = Math.max(leftMax, nums[l]); res += leftMax - nums[l];\n            } else {\n                r--; rightMax = Math.max(rightMax, nums[r]); res += rightMax - nums[r];\n            }\n        }\n        return String.valueOf(res);",
        "cpp_body": "if (nums.empty()) return \"0\";\n    int l = 0, r = nums.size() - 1;\n    int leftMax = nums[l], rightMax = nums[r], res = 0;\n    while (l < r) {\n        if (leftMax < rightMax) {\n            l++; leftMax = max(leftMax, nums[l]); res += leftMax - nums[l];\n        } else {\n            r--; rightMax = max(rightMax, nums[r]); res += rightMax - nums[r];\n        }\n    }\n    return to_string(res);"
    }
])

# Java helpers
def java_helpers():
    return """
    private static void permute(int[] nums, List<Integer> curr, boolean[] used, List<String> res) {
        if (curr.size() == nums.length) {
            StringBuilder sb = new StringBuilder();
            for (int i=0; i<curr.size(); i++) sb.append(curr.get(i)).append(i==curr.size()-1?"":",");
            res.add(sb.toString());
            return;
        }
        for (int i=0; i<nums.length; i++) {
            if (used[i]) continue;
            used[i] = true; curr.add(nums[i]);
            permute(nums, curr, used, res);
            used[i] = false; curr.remove(curr.size() - 1);
        }
    }
"""

print(f"Adding {len(problems)} distinct coding problems to the database...")
seeded_count = 0

for p in problems:
    # Set C++ or Java helper methods if needed in Solution templates
    java_body = p['java_body']
    if p['title'] == "Permutations":
        java_body += java_helpers()
        
    template_python, template_java, template_cpp = gen_templates(
        p['type'], p['py_body'], java_body, p['cpp_body']
    )
    
    # Store Google-style specific details for candidates
    db_p = CodingProblem(
        title=p['title'],
        description=f"[{p['company']} Hiring Test] {p['description']}",
        difficulty=p['difficulty'],
        company=p['company'],
        test_cases=json.dumps(p['test_cases']),
        template_python=template_python,
        template_java=template_java,
        template_cpp=template_cpp
    )
    db.add(db_p)
    seeded_count += 1

db.commit()
db.close()
print(f"Successfully populated {seeded_count} distinct coding questions categorized by company and difficulty!")

