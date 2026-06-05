import React, { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  Info,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Terminal,
  Cpu,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  Activity,
  BarChart2,
  Lock,
  Layers,
  HelpCircle,
  AlertCircle,
  FileCode,
  LineChart,
  PieChart as PieIcon,
  Trash2,
  CheckSquare
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Cell,
  Pie
} from "recharts";

export default function CodingInterview() {
  // Navigation & Problems lists
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);

  // Filters
  const [companyFilter, setCompanyFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Selection states
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [codeCache, setCodeCache] = useState({
    python: "",
    java: "",
    cpp: "",
    javascript: ""
  });

  // Simulator / Interview Mode states
  const [interviewMode, setInterviewMode] = useState(false);
  const [timer, setTimer] = useState(2700); // 45 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Execution outputs & tabs below editor
  const [activeTab, setActiveTab] = useState("console"); // console, testcases, aianalysis, submissions
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [submissions, setSubmissions] = useState([]);

  // AI Coach drawer states
  const [coachOpen, setCoachOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // UI Tabs on Problem details
  const [activeProblemTab, setActiveProblemTab] = useState("description"); // description, submissions_history

  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  // Default javascript stubs
  const jsStubs = {
    "Two Sum": `function twoSum(nums, target) {\n    // Implement your solution here\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
    "Reverse Linked List": `function reverseList(head) {\n    // Implement your solution here\n    let prev = null;\n    let curr = head;\n    while (curr) {\n        let nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`,
    "Valid Parentheses": `function isValid(s) {\n    // Implement your solution here\n    const stack = [];\n    const mapping = { ")": "(", "}": "{", "]": "[" };\n    for (let char of s) {\n        if (mapping[char]) {\n            const topElement = stack.length === 0 ? "#" : stack.pop();\n            if (topElement !== mapping[char]) {\n                return false;\n            }\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}`
  };

  // Fetch coding problems list
  const loadProblems = async (company = companyFilter, difficulty = difficultyFilter) => {
    setLoading(true);
    try {
      const data = await api.get(`/api/coding/problems?company=${company}&difficulty=${difficulty}`);
      setProblems(data);
      if (data.length > 0) {
        // Retain selection if valid, else pick first
        const current = selectedProblem ? data.find((x) => x.title === selectedProblem.title) : null;
        handleProblemSelect(current || data[0]);
      } else {
        setSelectedProblem(null);
        setCode("");
      }
    } catch (err) {
      setError("Failed to fetch coding problems list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  // Timer interval for Interview Simulator Mode
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            alert("Interview Simulator time expired! Auto-submitting solution.");
            handleSubmit();
            return 0;
          }
          return t - 1;
        });
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timer]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, coachOpen]);

  const handleProblemSelect = (prob, lang = language) => {
    setSelectedProblem(prob);
    setLanguage(lang);
    
    // Setup initial stubs/templates
    let activeStub = "";
    if (lang === "javascript") {
      activeStub = jsStubs[prob?.title] || `function solution(input) {\n    // Write JavaScript solution here\n    return input;\n}`;
    } else {
      activeStub = prob?.templates?.[lang] || "";
    }
    
    setCode(activeStub);
    setCodeCache({
      python: prob?.templates?.python || "",
      java: prob?.templates?.java || "",
      cpp: prob?.templates?.cpp || "",
      javascript: jsStubs[prob?.title] || `function solution(input) {\n    // Write JavaScript solution here\n    return input;\n}`
    });
    setResult(null);
    setAttempts(0);
    setElapsedSeconds(0);
    
    // Reset Chat Messages
    setChatMessages([
      { role: "assistant", content: `Hello! I am your AI Coding Partner Coach. Let's work together to solve '${prob ? prob.title : "this problem"}'. Ask me to explain the logic, check for potential bugs, or discuss complexity optimizations!` }
    ]);
    
    if (interviewMode) {
      // Restart Simulator metrics for new question
      setTimer(2700);
      setTimerActive(true);
      setStartTime(Date.now());
    }
  };

  const handleLanguageChange = (lang) => {
    // Cache current language code
    setCodeCache(prev => ({ ...prev, [language]: code }));
    setLanguage(lang);
    
    if (selectedProblem) {
      let activeStub = "";
      if (lang === "javascript") {
        activeStub = codeCache.javascript || jsStubs[selectedProblem.title] || `function solution(input) {\n    // Write JavaScript solution here\n    return input;\n}`;
      } else {
        activeStub = codeCache[lang] || selectedProblem.templates?.[lang] || "";
      }
      setCode(activeStub);
    }
    setResult(null);
  };

  const handleFilterChange = (company, difficulty) => {
    setCompanyFilter(company);
    setDifficultyFilter(difficulty);
    loadProblems(company, difficulty);
  };

  const handleToggleInterviewMode = () => {
    const nextVal = !interviewMode;
    setInterviewMode(nextVal);
    if (nextVal) {
      setCoachOpen(false);
      setTimer(2700);
      setTimerActive(true);
      setElapsedSeconds(0);
      setAttempts(0);
      setStartTime(Date.now());
    } else {
      setTimerActive(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProblem) return;
    setExecuting(true);
    setResult(null);
    setAttempts((prev) => prev + 1);
    setActiveTab("console");

    try {
      const data = await api.post("/api/coding/submit", {
        problem_title: selectedProblem.title,
        language: language,
        code: code
      });
      setResult(data);
      
      // Update local submissions log history list
      setSubmissions((prev) => [
        {
          id: data.id || Date.now(),
          language: data.language,
          runtime: data.runtime || "0.08s",
          memory_usage: data.memory_usage || "32 MB",
          status: data.status || (data.test_cases_passed === data.total_test_cases ? "Accepted" : "Wrong Answer"),
          score: data.score,
          time_complexity: data.time_complexity,
          space_complexity: data.space_complexity,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      
      if (interviewMode) {
        // Stop simulator metrics
        setTimerActive(false);
      }
    } catch (err) {
      alert(err.message || "Failed to execute and evaluate solution.");
    } finally {
      setExecuting(false);
    }
  };

  // AI Helpers panel calls
  const handleAIAction = async (actionType) => {
    if (!selectedProblem) return;
    setCoachOpen(true);
    setSendingChat(true);

    let prompt = "";
    if (actionType === "explain") {
      prompt = "Please explain the conceptual approach and structure of my current code. How does this solution work?";
    } else if (actionType === "bugs") {
      prompt = "Analyze my code and find logical flaws, edge case failures, or code issues. Do not write the full corrected code, just point out bugs clearly.";
    } else if (actionType === "optimize") {
      prompt = "How can I optimize the current solution? Can we improve the runtime or memory complexity? Suggest algorithmic approaches.";
    } else if (actionType === "complexity") {
      prompt = "Analyze the Time and Space Complexity of my current code. Detail the Big-O notation for worst-case analysis.";
    } else if (actionType === "approach") {
      prompt = "Generate a structured high-level logic design/approach to solve this problem. Use bullet points.";
    }

    const userMsgObj = { role: "user", content: prompt };
    const updatedHistory = [...chatMessages, userMsgObj];
    setChatMessages(updatedHistory);

    try {
      const data = await api.post("/api/coding/hint", {
        problem_title: selectedProblem.title,
        language: language,
        code: code,
        chat_history: updatedHistory.slice(0, -1),
        message: prompt
      });
      
      setChatMessages([
        ...updatedHistory,
        { role: "assistant", content: data.hint }
      ]);
    } catch (err) {
      setChatMessages([
        ...updatedHistory,
        { role: "assistant", content: "Apologies, I encountered an error evaluating your request. Please try again." }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !selectedProblem) return;
    const msg = chatInput.trim();
    setChatInput("");

    const userMsgObj = { role: "user", content: msg };
    const updatedHistory = [...chatMessages, userMsgObj];
    setChatMessages(updatedHistory);
    setSendingChat(true);

    try {
      const data = await api.post("/api/coding/hint", {
        problem_title: selectedProblem.title,
        language: language,
        code: code,
        chat_history: updatedHistory.slice(0, -1),
        message: msg
      });
      
      setChatMessages([
        ...updatedHistory,
        { role: "assistant", content: data.hint }
      ]);
    } catch (err) {
      setChatMessages([
        ...updatedHistory,
        { role: "assistant", content: "Apologies, I encountered an error analyzing your request. Please try again." }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  // Mock analytics state
  const mockAnalytics = {
    questionsSolved: 42,
    accuracy: 78.5,
    averageRuntime: "0.045s",
    radarData: [
      { name: "Dynamic Prog.", A: 80, B: 100, fullMark: 100 },
      { name: "Backtracking", A: 65, B: 100, fullMark: 100 },
      { name: "Trees & Graphs", A: 85, B: 100, fullMark: 100 },
      { name: "Arrays & Strings", A: 95, B: 100, fullMark: 100 },
      { name: "Heaps / Sorting", A: 75, B: 100, fullMark: 100 },
      { name: "DBMS / SQL", A: 90, B: 100, fullMark: 100 }
    ],
    companyStats: [
      { name: "Google", solved: 12 },
      { name: "Amazon", solved: 15 },
      { name: "Microsoft", solved: 8 },
      { name: "TCS / Infosys", solved: 22 }
    ]
  };

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Parse Problem Description for constraints, examples, notes
  const renderFormattedDescription = (text) => {
    if (!text) return null;
    
    // Try to extract Examples and Constraints sections
    const cleanText = text.replace(/\[.*?Hiring Test\]/gi, "").trim();
    
    return (
      <div className="space-y-4 font-sans text-slate-300 text-sm leading-relaxed">
        <p className="whitespace-pre-wrap">{cleanText}</p>
        
        {/* Constraints Sub-card mockup if none explicitly defined */}
        <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 mt-6 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Problem Constraints</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
            <li>Time Limit: 2.0 seconds</li>
            <li>Memory Limit: 256 MB</li>
            <li>Input values fall within typical limits.</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col text-slate-200 relative overflow-hidden">
      
      {/* Top dashboard control bar */}
      <div className="glass-panel p-4 rounded-2xl border-white/5 flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Code className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-md font-black text-white tracking-tight flex items-center gap-2">
              InterviewAce Coding Sandbox
            </h1>
            <p className="text-[10px] text-slate-400">VS-Code powered professional programming environment</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          
          {/* Company filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Company:</span>
            <select
              value={companyFilter}
              onChange={(e) => handleFilterChange(e.target.value, difficultyFilter)}
              className="bg-transparent border-none text-xs font-semibold text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Companies</option>
              <option value="Google">Google</option>
              <option value="Amazon">Amazon</option>
              <option value="Microsoft">Microsoft</option>
              <option value="TCS">TCS</option>
              <option value="Infosys">Infosys</option>
              <option value="Wipro">Wipro</option>
              <option value="Accenture">Accenture</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => handleFilterChange(companyFilter, e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Problem Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-2.5 py-1.5 max-w-[200px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Problem:</span>
            <select
              value={selectedProblem?.title || ""}
              onChange={(e) => {
                const p = problems.find((x) => x.title === e.target.value);
                if (p) handleProblemSelect(p);
              }}
              disabled={problems.length === 0}
              className="bg-transparent border-none text-xs font-semibold text-slate-200 outline-none cursor-pointer w-full text-ellipsis overflow-hidden whitespace-nowrap"
            >
              {problems.length > 0 ? (
                problems.map((p) => (
                  <option key={p.title} value={p.title}>{p.title}</option>
                ))
              ) : (
                <option value="">No Problems</option>
              )}
            </select>
          </div>

          {/* Interview Simulator toggle switch */}
          <button
            onClick={handleToggleInterviewMode}
            className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 border transition-all cursor-pointer ${
              interviewMode
                ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-lg"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${interviewMode ? "animate-pulse" : ""}`} />
            <span>Interview Mode {interviewMode ? "ON" : "OFF"}</span>
          </button>
          
          {/* Active timer for simulator */}
          {interviewMode && (
            <div className="flex items-center gap-1.5 bg-red-950/20 border border-red-500/20 px-3 py-2 rounded-xl text-red-400 font-mono text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0"></span>
              {formatTimer(timer)}
            </div>
          )}

        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs text-slate-400">Syncing sandbox configurations...</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden w-full relative">
          
          {/* Left panel split: Problem description */}
          <div className="w-full lg:w-[45%] flex flex-col min-h-0 shrink-0">
            <div className="flex-1 glass-panel rounded-2xl border-white/5 flex flex-col min-h-0 overflow-hidden">
              
              {/* Problem tabs */}
              <div className="bg-slate-950/60 p-3.5 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveProblemTab("description")}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeProblemTab === "description"
                        ? "bg-blue-600/15 text-blue-400 border-blue-500/20"
                        : "border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveProblemTab("submissions_history")}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeProblemTab === "submissions_history"
                        ? "bg-blue-600/15 text-blue-400 border-blue-500/20"
                        : "border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    Submissions ({submissions.length})
                  </button>
                </div>
              </div>

              {/* Problem content panels */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0 scrollbar-thin">
                {activeProblemTab === "description" ? (
                  selectedProblem ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-xl font-black text-white">{selectedProblem.title}</h2>
                        
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                          selectedProblem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          selectedProblem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {selectedProblem.difficulty}
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                          {selectedProblem.company} Style
                        </span>
                      </div>

                      <div className="border-t border-slate-850 pt-4">
                        {renderFormattedDescription(selectedProblem.description)}
                      </div>

                      {/* Display test cases as interactive examples */}
                      {selectedProblem.test_cases && selectedProblem.test_cases.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-slate-850">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <CheckSquare className="w-4 h-4 text-emerald-400" /> Examples (LeetCode Style)
                          </h4>
                          <div className="space-y-3">
                            {selectedProblem.test_cases.slice(0, 2).map((tc, tcIdx) => (
                              <div key={tcIdx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-2 text-xs font-mono">
                                <div>
                                  <span className="text-indigo-400 font-bold block mb-0.5">Example {tcIdx + 1} Input:</span>
                                  <pre className="text-slate-300 whitespace-pre-wrap bg-slate-950/40 p-2 rounded border border-white/5">{tc.input}</pre>
                                </div>
                                <div>
                                  <span className="text-emerald-400 font-bold block mb-0.5">Example {tcIdx + 1} Output:</span>
                                  <pre className="text-slate-300 whitespace-pre-wrap bg-slate-950/40 p-2 rounded border border-white/5">{tc.expected}</pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                      <HelpCircle className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-slate-400 text-sm">Please select a coding problem to begin solving.</p>
                    </div>
                  )
                ) : (
                  /* Submissions History tab */
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white">Your Submissions List</h3>
                    {submissions.length > 0 ? (
                      <div className="space-y-3">
                        {submissions.map((sub, idx) => (
                          <div key={sub.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <span className="font-semibold text-slate-300 uppercase block">{sub.language} &bull; Attempt #{submissions.length - idx}</span>
                              <span className="text-[10px] text-slate-500 block">Submitted {new Date(sub.created_at).toLocaleTimeString()}</span>
                              <div className="flex gap-2 text-[10px] text-slate-400 pt-1">
                                <span>Runtime: {sub.runtime}</span>
                                <span>Memory: {sub.memory_usage}</span>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <span className={`font-bold block ${sub.status === "Accepted" ? "text-emerald-400" : "text-yellow-500"}`}>{sub.status}</span>
                              <span className="text-[10px] text-slate-500 block">Score: {sub.score}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                        <FileCode className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">No submission attempts yet. Write solutions and submit to build log history.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right panel split: Monaco editor & Console output tabs */}
          <div className={`flex-1 flex flex-col min-h-0 gap-6 transition-all duration-300 ${coachOpen ? "lg:mr-[340px]" : ""}`}>
            
            {/* Editor workspace */}
            <div className="flex-1 glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col min-h-0 relative">
              
              {/* Editor controls bar */}
              <div className="bg-slate-950/60 p-3 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Language:</label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={problems.length === 0}
                    className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold p-2 text-white outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="python">Python 3</option>
                    <option value="java">Java (JDK 17)</option>
                    <option value="cpp">C++ (GCC 17)</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {!interviewMode && (
                    <button
                      onClick={() => setCoachOpen(!coachOpen)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer ${
                        coachOpen
                          ? "bg-purple-600/15 text-purple-400 border-purple-500/30"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Partner
                    </button>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={executing || !selectedProblem}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md disabled:cursor-not-allowed cursor-pointer"
                  >
                    {executing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Evaluating Code
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current text-white" /> Run & Submit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Monaco Editor workspace container */}
              <div className="flex-1 bg-slate-950/40 min-h-0 relative select-text">
                <Editor
                  height="100%"
                  language={language === "cpp" ? "cpp" : language === "python" ? "python" : language === "java" ? "java" : "javascript"}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val)}
                  options={{
                    fontSize: 13,
                    fontFamily: "Fira Code, Source Code Pro, monospace",
                    minimap: { enabled: false },
                    automaticLayout: true,
                    cursorBlinking: "smooth",
                    folding: true,
                    lineNumbers: "on",
                    wordWrap: "on",
                    scrollbar: {
                      vertical: "visible",
                      horizontal: "visible"
                    }
                  }}
                />
              </div>

            </div>

            {/* Below Editor Tabs panel */}
            <div className="glass-panel rounded-2xl border-white/5 h-[340px] shrink-0 flex flex-col min-h-0">
              
              {/* Tab options selector bar */}
              <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab("console")}
                    className={`pb-2.5 pt-2 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "console" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" /> Console Output
                  </button>
                  <button
                    onClick={() => setActiveTab("testcases")}
                    className={`pb-2.5 pt-2 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "testcases" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Test Cases
                  </button>
                  {!interviewMode && (
                    <button
                      onClick={() => setActiveTab("aianalysis")}
                      className={`pb-2.5 pt-2 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === "aianalysis" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Cpu className="w-3.5 h-3.5" /> AI Analysis
                    </button>
                  )}
                </div>
              </div>

              {/* Tab content displays */}
              <div className="p-4 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-300 select-text whitespace-pre-wrap scrollbar-thin">
                
                {/* 1. Console tab */}
                {activeTab === "console" && (
                  result ? (
                    <div className="space-y-4">
                      {/* Metric widgets block */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Status</span>
                          <span className={`text-xs font-bold block ${result.status === "Accepted" ? "text-emerald-400" : "text-yellow-500"}`}>
                            {result.status || "Completed"}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Runtime</span>
                          <span className="text-white block font-semibold text-xs">{result.runtime || "0.04s"}</span>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Memory Usage</span>
                          <span className="text-white block font-semibold text-xs">{result.memory_usage || "32 MB"}</span>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Test Cases Passed</span>
                          <span className="text-white block font-semibold text-xs">{result.test_cases_passed} / {result.total_test_cases}</span>
                        </div>
                      </div>

                      {result.error ? (
                        <div className="text-red-400 font-bold border border-red-500/20 bg-red-950/10 p-4 rounded-xl space-y-2 mt-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Execution / Compile Error Logs:</span>
                          </div>
                          <pre className="text-[10px] text-red-300 bg-black/40 p-3 rounded font-mono overflow-x-auto whitespace-pre-wrap">{result.error}</pre>
                        </div>
                      ) : (
                        <div className="p-4 border border-emerald-500/20 bg-emerald-950/5 rounded-xl flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                          <div>
                            <h5 className="font-bold text-emerald-400 text-sm">Code Executed Successfully!</h5>
                            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Your code was compiled and executed against sample and hidden database test cases.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-600 italic py-4">
                      Execution Console is idle. Click 'Run & Submit' to compile and evaluate your code.
                    </div>
                  )
                )}

                {/* 2. Test Cases Tab */}
                {activeTab === "testcases" && (
                  <div className="space-y-4">
                    {selectedProblem?.test_cases && selectedProblem.test_cases.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider pb-1 border-b border-slate-900">
                          <span>Sample inputs vs expected outputs</span>
                          <span className="text-indigo-400 font-semibold font-sans">Active language: {language}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedProblem.test_cases.map((tc, tcIdx) => (
                            <div key={tcIdx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-indigo-400 font-bold">Test Case {tcIdx + 1}:</span>
                                {result && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    result.test_cases_passed > tcIdx 
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : "bg-red-500/10 text-red-400 border-red-500/20"
                                  }`}>
                                    {result.test_cases_passed > tcIdx ? "Passed" : "Failed"}
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="text-slate-500 font-semibold block mb-1">Input:</span>
                                <pre className="bg-slate-950 p-2.5 rounded border border-white/5 whitespace-pre-wrap">{tc.input}</pre>
                              </div>
                              <div>
                                <span className="text-slate-500 font-semibold block mb-1">Expected Output:</span>
                                <pre className="bg-slate-950 p-2.5 rounded border border-white/5 whitespace-pre-wrap">{tc.expected}</pre>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Custom Input block */}
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Custom Stdin Input:</label>
                          <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Type custom test inputs here..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs leading-relaxed text-slate-300 font-mono outline-none focus:border-blue-500 resize-none h-16"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No sample test cases configured for this problem.</p>
                    )}
                  </div>
                )}

                {/* 3. AI Analysis Tab */}
                {activeTab === "aianalysis" && (
                  result ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Big-O Complexity
                          </span>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between"><span className="text-slate-400">Time Complexity:</span><span className="text-white font-bold">{result.time_complexity || "O(N)"}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Space Complexity:</span><span className="text-white font-bold">{result.space_complexity || "O(1)"}</span></div>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Score Card
                          </span>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-xs">Readability and Formatting rating:</span>
                            <span className="text-emerald-400 text-sm font-black">{result.score || 9.0} / 10</span>
                          </div>
                        </div>
                      </div>

                      {result.readability_feedback && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Refactoring Feedback</span>
                          <p className="text-slate-300 font-sans leading-relaxed text-xs">{result.readability_feedback}</p>
                        </div>
                      )}

                      {result.optimization_feedback && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Optimization Hints</span>
                          <p className="text-slate-300 font-sans leading-relaxed text-xs">{result.optimization_feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-600 italic py-4">
                      AI review reports are generated automatically after you run code submissions.
                    </div>
                  )
                )}

              </div>
            </div>

          </div>

          {/* AI Partner Panel Drawer */}
          <AnimatePresence>
            {coachOpen && !interviewMode && (
              <motion.div
                initial={{ x: 340, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 340, opacity: 0 }}
                transition={{ type: "tween", duration: 0.25 }}
                className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col min-h-0 z-10"
              >
                
                {/* Drawer header */}
                <div className="border-b border-slate-800 p-4 shrink-0 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI Code Partner Coach</span>
                  </div>
                  <button
                    onClick={() => setCoachOpen(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* AI prompt action helpers */}
                <div className="p-3 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 gap-2 shrink-0">
                  <button
                    onClick={() => handleAIAction("explain")}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-300 py-1.5 rounded-lg cursor-pointer"
                  >
                    Explain Code
                  </button>
                  <button
                    onClick={() => handleAIAction("bugs")}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-300 py-1.5 rounded-lg cursor-pointer"
                  >
                    Find Bugs
                  </button>
                  <button
                    onClick={() => handleAIAction("optimize")}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-300 py-1.5 rounded-lg cursor-pointer"
                  >
                    Optimize Solution
                  </button>
                  <button
                    onClick={() => handleAIAction("complexity")}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-300 py-1.5 rounded-lg cursor-pointer"
                  >
                    Complexity
                  </button>
                </div>

                {/* Chat conversation area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        {msg.role === "user" ? "You" : "Coach"}
                      </span>
                      <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/5" 
                          : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  
                  {sendingChat && (
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Coach</span>
                      <div className="p-3 rounded-xl bg-slate-800 border border-white/5 text-slate-400 italic">
                        Analyzing code context...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat input box */}
                <div className="p-3 border-t border-slate-800 shrink-0 flex items-center gap-2 bg-slate-950/60 rounded-b-2xl">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    placeholder="Ask a question about your code..."
                    disabled={sendingChat || !selectedProblem}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={sendingChat || !chatInput.trim() || !selectedProblem}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 p-2.5 rounded-lg text-white transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* Redesigned Analytics Overview at bottom when no active sandbox problems are selected */}
      {!selectedProblem && !loading && (
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              <span>Personal Coding Analytics (Judge0 Engine)</span>
            </h3>
            <span className="text-[10px] text-slate-500">Based on past evaluated sandbox problems</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Questions Solved</span>
                <span className="text-xl font-black text-white">{mockAnalytics.questionsSolved} <span className="text-xs text-slate-400">/ 100+</span></span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Evaluation Accuracy</span>
                <span className="text-xl font-black text-emerald-400">{mockAnalytics.accuracy}%</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={mockAnalytics.radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} />
                  <Radar name="Solved" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAnalytics.companyStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="solved"
                  >
                    {mockAnalytics.companyStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
