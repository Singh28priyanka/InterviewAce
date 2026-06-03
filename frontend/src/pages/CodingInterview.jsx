import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Code, Play, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight, Terminal, Info, Cpu, Sparkles } from "lucide-react";

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

  const handleProblemSelect = (prob, lang = language) => {
    setSelectedProblem(prob);
    setLanguage(lang);
    if (prob && prob.templates && prob.templates[lang]) {
      setCode(prob.templates[lang]);
    } else {
      setCode("");
    }
    setResult(null);
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col text-slate-200">
      {/* Top filter bar */}
      <div className="glass-panel p-4 rounded-xl border-white/5 flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-blue-500" />
          <h1 className="text-lg font-bold text-white">Coding Sandbox Interview</h1>
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
            onClick={handleSubmit}
            disabled={executing || !selectedProblem}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md disabled:cursor-not-allowed"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 overflow-y-auto">
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
                <span>Monospace font active</span>
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
                <span>Compilation & AI Review Console</span>
              </div>
              <div className="p-4 overflow-y-auto flex-1 bg-slate-950/90 font-mono text-xs text-slate-300 space-y-4">
                {executing && (
                  <div className="text-blue-400 animate-pulse">Running compilation process in subprocess sandbox...</div>
                )}
                
                {!executing && !result && (
                  <div className="text-slate-500 italic">Submit your code to display compile outputs and complexity reviews.</div>
                )}

                {result && (
                  <div className="space-y-4">
                    {/* Test Cases Results */}
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-850">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-1">Execution Status</span>
                      {result.test_cases_passed === result.total_test_cases ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> All Test Cases Passed ({result.test_cases_passed}/{result.total_test_cases})
                        </span>
                      ) : (
                        <span className="text-yellow-500 font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" /> {result.test_cases_passed}/{result.total_test_cases} Test Cases Passed
                        </span>
                      )}
                    </div>

                    {/* AI Complexity Insights */}
                    {result.time_complexity && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-850">
                          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-1">Time Complexity</span>
                          <span className="text-white font-bold flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-blue-400" /> {result.time_complexity}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-850">
                          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-1">Space Complexity</span>
                          <span className="text-white font-bold flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-indigo-400" /> {result.space_complexity}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Review Critiques */}
                    <div className="space-y-3.5">
                      <div>
                        <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-1">Readability Feedback</span>
                        <p className="text-slate-300 leading-relaxed bg-[#0b0f19] p-3 rounded-lg border border-slate-900">{result.readability_feedback}</p>
                      </div>
                      {result.optimization_feedback && (
                        <div>
                          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-1">AI Optimization Suggestions</span>
                          <p className="text-slate-300 leading-relaxed bg-[#0b0f19] p-3 rounded-lg border border-slate-900">{result.optimization_feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
