import React, { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";
import { Code, Play, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight, Terminal, Info, Cpu, Sparkles, MessageSquare, Send } from "lucide-react";

export default function CodingInterview() {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [companyFilter, setCompanyFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Execution status
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // AI Code Partner Coach Chat Drawer states
  const [coachOpen, setCoachOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hello! I am your AI Coding Partner. I can give you conceptual hints, review your loop logic, or guide you past compiler errors. What would you like to discuss?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  const loadProblems = async (company = companyFilter, difficulty = difficultyFilter) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/coding/problems?company=${company}&difficulty=${difficulty}`);
      setProblems(data);
      if (data.length > 0) {
        handleProblemSelect(data[0], "python");
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

  useEffect(() => {
    // Scroll chat to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, coachOpen]);

  const handleProblemSelect = (prob, lang = language) => {
    setSelectedProblem(prob);
    setLanguage(lang);
    if (prob && prob.templates && prob.templates[lang]) {
      setCode(prob.templates[lang]);
    } else {
      setCode("");
    }
    setResult(null);
    // Reset Chat Messages when problem changes
    setChatMessages([
      { role: "assistant", content: `Hello! I'm ready to help you with '${prob ? prob.title : "this problem"}'. Ask me for a hint, loop logic checks, or edge case ideas!` }
    ]);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (selectedProblem && selectedProblem.templates && selectedProblem.templates[lang]) {
      setCode(selectedProblem.templates[lang]);
    }
    setResult(null);
  };

  const handleFilterChange = (company, difficulty) => {
    setCompanyFilter(company);
    setDifficultyFilter(difficulty);
    loadProblems(company, difficulty);
  };

  const handleSubmit = async () => {
    if (!selectedProblem) return;
    setExecuting(true);
    setResult(null);
    try {
      const data = await api.post("/api/coding/submit", {
        problem_title: selectedProblem.title,
        language: language,
        code: code
      });
      setResult(data);
    } catch (err) {
      alert(err.message || "Failed to execute solution.");
    } finally {
      setExecuting(false);
    }
  };

  const handleSendChatMessage = async (customMsg = "") => {
    const msgToSend = (customMsg || chatInput).trim();
    if (!msgToSend || !selectedProblem) return;
    
    // Clear input
    if (!customMsg) setChatInput("");

    // Append user message
    const userMsgObj = { role: "user", content: msgToSend };
    const updatedHistory = [...chatMessages, userMsgObj];
    setChatMessages(updatedHistory);
    setSendingChat(true);

    try {
      const data = await api.post("/api/coding/hint", {
        problem_title: selectedProblem.title,
        language: language,
        code: code,
        chat_history: updatedHistory.slice(0, -1), // exclude current message
        message: msgToSend
      });
      
      setChatMessages([
        ...updatedHistory,
        { role: "assistant", content: data.hint }
      ]);
    } catch (err) {
      setChatMessages([
        ...updatedHistory,
        { role: "assistant", content: "Sorry, I had an error analyzing your request. Please try again." }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col text-slate-200 relative">
      {/* Top filter bar */}
      <div className="glass-panel p-4 rounded-xl border-white/5 flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-blue-500" />
          <h1 className="text-lg font-bold text-white">Coding Sandbox</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Company filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Company:</span>
            <select
              value={companyFilter}
              onChange={(e) => handleFilterChange(e.target.value, difficultyFilter)}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold p-2 text-white outline-none focus:border-blue-500 cursor-pointer"
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => handleFilterChange(companyFilter, e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold p-2 text-white outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Problem Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Problem:</span>
            <select
              value={selectedProblem?.title || ""}
              onChange={(e) => {
                const p = problems.find((x) => x.title === e.target.value);
                if (p) handleProblemSelect(p);
              }}
              disabled={problems.length === 0}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold p-2 text-white outline-none focus:border-blue-500 cursor-pointer max-w-xs disabled:opacity-50"
            >
              {problems.length > 0 ? (
                problems.map((p) => (
                  <option key={p.title} value={p.title}>{p.title}</option>
                ))
              ) : (
                <option value="">No Problems Found</option>
              )}
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Lang:</span>
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={problems.length === 0}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold p-2 text-white outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50"
            >
              <option value="python">Python 3</option>
              <option value="java">Java</option>
              <option value="cpp">C++ 17</option>
            </select>
          </div>
          
          <button
            onClick={() => setCoachOpen(!coachOpen)}
            className={`text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer border ${
              coachOpen 
                ? "bg-purple-600/20 text-purple-400 border-purple-500/30" 
                : "glass-panel hover:bg-slate-800/40 text-slate-300 border-white/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Partner
          </button>

          <button
            onClick={handleSubmit}
            disabled={executing || !selectedProblem}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md disabled:cursor-not-allowed cursor-pointer"
          >
            {executing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Run & Evaluate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="flex flex-1 gap-6 min-h-0 overflow-y-auto w-full relative">
          
          {/* Main sandbox splits */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 transition-all duration-300 ${coachOpen ? "lg:mr-[340px]" : ""}`}>
            {/* Left Side: Problem Statements */}
            <div className="glass-panel rounded-xl border-white/5 flex flex-col min-h-0">
              <div className="border-b border-slate-800/60 p-4 shrink-0 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-white">Problem Statement</h2>
              </div>
              <div className="p-6 overflow-y-auto flex-1 text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                {selectedProblem ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-base font-extrabold text-white">{selectedProblem.title}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        selectedProblem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        selectedProblem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {selectedProblem.difficulty}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {selectedProblem.company}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{selectedProblem.description}</p>
                  </>
                ) : (
                  <div className="text-center py-16 text-slate-500 italic">
                    No problems matched the selected filters. Please adjust the Company or Difficulty dropdowns.
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Editor & Console Terminal */}
            <div className="flex flex-col gap-4 min-h-0 flex-1">
              {/* Custom textarea code editor */}
              <div className="glass-panel rounded-xl border-white/5 flex-1 flex flex-col min-h-0 relative">
                <div className="border-b border-slate-800/60 p-3 shrink-0 flex justify-between items-center text-xs text-slate-400">
                  <span>editor.code.{language}</span>
                  <span>Monospace active</span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={!selectedProblem}
                  className="flex-1 bg-slate-950/80 p-4 font-mono text-sm leading-relaxed text-blue-300 outline-none resize-none overflow-y-auto w-full select-text disabled:opacity-30 disabled:cursor-not-allowed"
                  spellCheck="false"
                  placeholder="Input coding solution..."
                />
              </div>

              {/* Console / Terminal feedback panel */}
              <div className="glass-panel rounded-xl border-white/5 h-64 shrink-0 flex flex-col min-h-0">
                <div className="border-b border-slate-800/60 p-3 shrink-0 flex items-center gap-2 text-xs text-slate-400">
                  <Terminal className="w-4 h-4" />
                  <span>Execution Output Terminal Console</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-300 select-text whitespace-pre-wrap">
                  {result ? (
                    <div className="space-y-4">
                      {result.test_cases_passed === result.total_test_cases ? (
                        <div className="text-emerald-400 font-bold flex items-center gap-1.5 mb-2">
                          <CheckCircle2 className="w-4 h-4" /> ALL TEST CASES PASSED SUCCESSFULLY! ({result.test_cases_passed}/{result.total_test_cases})
                        </div>
                      ) : (
                        <div className="text-yellow-500 font-bold flex items-center gap-1.5 mb-2">
                          <AlertTriangle className="w-4 h-4" /> SOME TEST CASES FAILED. ({result.test_cases_passed}/{result.total_test_cases} passed)
                        </div>
                      )}

                      {/* Display Readability / AI reviewer stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-3">
                        <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Complexity</span>
                          <span className="text-white block font-semibold text-xs">Time: {result.time_complexity} &bull; Space: {result.space_complexity}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">AI Rating Score</span>
                          <span className="text-emerald-400 block font-semibold text-xs">{result.score}/10</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Refactoring Feedback</span>
                        <p className="text-slate-300 font-sans leading-relaxed text-xs">{result.readability_feedback}</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Optimizations Guidance</span>
                        <p className="text-slate-300 font-sans leading-relaxed text-xs">{result.optimization_feedback}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-600 italic">
                      Console Idle. Click 'Run & Evaluate' to execute your solution against database-driven test cases.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Partner Floating Drawer */}
          {coachOpen && (
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md shadow-2xl flex flex-col min-h-0 z-10">
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

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      {msg.role === "user" ? "Candidate" : "Code Coach"}
                    </span>
                    <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Code Coach</span>
                    <div className="p-3 rounded-xl bg-slate-800 border border-white/5 text-slate-400 italic">
                      Analyzing code context...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Hint buttons */}
              <div className="p-3 border-t border-slate-800/60 flex gap-2 shrink-0">
                <button
                  onClick={() => handleSendChatMessage("Give me a hints prompt for my current loop logic.")}
                  disabled={sendingChat || !selectedProblem}
                  className="flex-1 bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 text-purple-400 font-bold py-2 rounded-lg text-[10px] cursor-pointer text-center"
                >
                  Ask Loop Hint
                </button>
                <button
                  onClick={() => handleSendChatMessage("Are there any edge cases I should consider?")}
                  disabled={sendingChat || !selectedProblem}
                  className="flex-1 bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 text-purple-400 font-bold py-2 rounded-lg text-[10px] cursor-pointer text-center"
                >
                  Check Edge Cases
                </button>
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-800 shrink-0 flex items-center gap-2 bg-slate-950/60 rounded-b-xl">
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
                  onClick={() => handleSendChatMessage()}
                  disabled={sendingChat || !chatInput.trim() || !selectedProblem}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 p-2.5 rounded-lg text-white transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
