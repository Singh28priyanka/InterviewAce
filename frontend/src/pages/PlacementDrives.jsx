import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import {
  Briefcase,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Mic,
  MicOff,
  Code,
  Terminal,
  BrainCircuit,
  Info,
  Award,
  RefreshCw,
  Check,
  Activity,
  Calendar,
  Building,
  Sparkles,
  Award as AwardIcon
} from "lucide-react";

const COMPANIES = [
  {
    id: "Google",
    name: "Google SWE Style",
    difficulty: "Hard",
    color: "from-blue-600 to-indigo-700",
    accentColor: "text-blue-400",
    desc: "Rigorous test focusing on complex Algorithms, DSA MCQs, and SWE technical verbal interview questions.",
  },
  {
    id: "Amazon",
    name: "Amazon SDE Style",
    difficulty: "Hard",
    color: "from-amber-600 to-orange-700",
    accentColor: "text-amber-400",
    desc: "Focuses on balanced Data Structures questions, Core Technical MCQs, and Leadership Principles behavioral scenarios.",
  },
  {
    id: "Microsoft",
    name: "Microsoft SWE Style",
    difficulty: "Hard",
    color: "from-teal-600 to-emerald-700",
    accentColor: "text-teal-400",
    desc: "Rigorous coding problems, System Design & Architecture concepts verbal round, and Operating Systems MCQs.",
  },
  {
    id: "TCS",
    name: "TCS NQT Style",
    difficulty: "Easy",
    color: "from-blue-700 to-cyan-600",
    accentColor: "text-cyan-400",
    desc: "Aptitude-based MCQs, basic coding questions (Loops/Arrays), and conversational HR behavioral rounds.",
  },
  {
    id: "Infosys",
    name: "Infosys SE Style",
    difficulty: "Medium",
    color: "from-green-600 to-teal-700",
    accentColor: "text-green-400",
    desc: "Covers DBMS, OOP, Software Engineering MCQs, basic programming problems, and technical verbal answers.",
  },
  {
    id: "Wipro",
    name: "Wipro Project Eng. Style",
    difficulty: "Easy",
    color: "from-purple-600 to-indigo-700",
    accentColor: "text-purple-400",
    desc: "Fundamental MCQs in Networking & OS, simple coding, and introductory HR behavioral evaluation.",
  },
  {
    id: "Accenture",
    name: "Accenture Associate Style",
    difficulty: "Medium",
    color: "from-rose-600 to-pink-700",
    accentColor: "text-rose-400",
    desc: "OOP paradigms, DSA MCQs, intermediate recursion/greedy coding questions, and balanced verbal rounds.",
  }
];

export default function PlacementDrives() {
  const navigate = useNavigate();

  // Setup / Dashboard states
  const [drivesList, setDrivesList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [starting, setStarting] = useState(false);

  // Active drive states
  const [activeDrive, setActiveDrive] = useState(null);
  const [activeStage, setActiveStage] = useState(1); // 1 = MCQ, 2 = Coding, 3 = Verbal
  const [timer, setTimer] = useState(1800); // 30 mins
  
  // MCQ state
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({}); // { 0: "option text", 1: ... }

  // Coding state
  const [codingLanguage, setCodingLanguage] = useState("python");
  const [codingCode, setCodingCode] = useState("");
  const [codeCache, setCodeCache] = useState({ python: "", java: "", cpp: "" });
  const [executingCode, setExecutingCode] = useState(false);
  const [codeResult, setCodeResult] = useState(null);

  // Verbal state
  const [currentVerbalIndex, setCurrentVerbalIndex] = useState(0);
  const [verbalAnswers, setVerbalAnswers] = useState({}); // { 0: "transcript text" }
  const [verbalMetadata, setVerbalMetadata] = useState({}); // { 0: { wpm: float, filler_words_count: int } }
  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceStartTime, setVoiceStartTime] = useState(0);

  // Review states
  const [reviewDrive, setReviewDrive] = useState(null);
  const [activeReviewTab, setActiveReviewTab] = useState("mcq"); // "mcq" | "coding" | "verbal"

  // Fetch initial dashboard list
  useEffect(() => {
    loadDrives();
  }, []);

  // Speech Recognition API initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const currentAns = verbalAnswers[currentVerbalIndex] || "";
        const updatedAns = currentAns ? `${currentAns} ${transcript}` : transcript;
        setVerbalAnswers(prev => ({
          ...prev,
          [currentVerbalIndex]: updatedAns
        }));
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setRecording(false);
      };

      rec.onend = () => {
        setRecording(false);
      };

      setRecognition(rec);
    }
  }, [verbalAnswers, currentVerbalIndex]);

  // Global timer setup
  useEffect(() => {
    let interval = null;
    if (activeDrive && activeDrive.status === "In_Progress" && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeDrive, timer]);

  const loadDrives = async () => {
    setLoadingList(true);
    try {
      const list = await api.get("/api/drives/my-drives");
      setDrivesList(list);
    } catch (err) {
      console.error("Failed to load placement drives:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleStartDrive = async () => {
    setStarting(true);
    try {
      const drive = await api.post("/api/drives/start", {
        company: selectedCompany,
        difficulty: selectedDifficulty
      });
      
      setActiveDrive(drive);
      setActiveStage(1);
      setTimer(1800); // 30 minutes
      
      // Initialize sub-states from drive metadata
      let driveData = {};
      try {
        driveData = JSON.parse(drive.feedback);
      } catch (e) {
        console.error("Failed to parse drive question configuration", e);
      }
      
      // Setup MCQ
      setMcqAnswers({});
      setCurrentMcqIndex(0);
      
      // Setup Coding Sandbox
      const templates = driveData.coding_problem?.templates || {};
      setCodeCache({
        python: templates.python || "",
        java: templates.java || "",
        cpp: templates.cpp || ""
      });
      setCodingLanguage("python");
      setCodingCode(templates.python || "");
      setCodeResult(null);
      
      // Setup Verbal Interview
      setVerbalAnswers({});
      setVerbalMetadata({});
      setCurrentVerbalIndex(0);
      setReviewDrive(null);
      
    } catch (err) {
      alert(err.message || "Failed to start placement drive.");
    } finally {
      setStarting(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    // cache current language code
    setCodeCache(prev => ({ ...prev, [codingLanguage]: codingCode }));
    setCodingLanguage(newLang);
    setCodingCode(codeCache[newLang] || "");
    setCodeResult(null);
  };

  const handleRunCoding = async () => {
    let driveData = {};
    try {
      driveData = JSON.parse(activeDrive.feedback);
    } catch (e) {
      return;
    }
    
    if (!driveData.coding_problem) return;
    
    setExecutingCode(true);
    setCodeResult(null);
    try {
      const data = await api.post("/api/coding/submit", {
        problem_title: driveData.coding_problem.title,
        language: codingLanguage,
        code: codingCode
      });
      setCodeResult(data);
    } catch (err) {
      setCodeResult({ error: err.message || "Compiler runtime error occurred." });
    } finally {
      setExecutingCode(false);
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert("Speech Recognition API is not supported in this browser. Please use Chrome/Safari.");
      return;
    }
    if (recording) {
      stopRecordingSession();
    } else {
      setVoiceStartTime(Date.now());
      recognition.start();
      setRecording(true);
    }
  };

  const stopRecordingSession = () => {
    if (recognition) {
      recognition.stop();
    }
    setRecording(false);

    const durationSec = (Date.now() - voiceStartTime) / 1000.0;
    const currentAns = verbalAnswers[currentVerbalIndex] || "";
    const words = currentAns.trim().split(/\s+/).filter(x => x.length > 0).length;

    // Calculate pace WPM
    const calcWpm = durationSec > 2 && words > 0 ? Math.round((words / durationSec) * 60) : 120;

    // Count conversational filler words
    const matches = currentAns.toLowerCase().match(/\b(um|uh|like|basically|actually|so)\b/g);
    const fillerCount = matches ? matches.length : 0;

    setVerbalMetadata(prev => ({
      ...prev,
      [currentVerbalIndex]: {
        wpm: calcWpm,
        filler_words_count: fillerCount
      }
    }));
  };

  const handleAutoSubmit = async () => {
    alert("Time has expired! Submitting your placement drive details now.");
    await executeSubmission();
  };

  const executeSubmission = async () => {
    if (!activeDrive) return;
    
    let driveData = {};
    try {
      driveData = JSON.parse(activeDrive.feedback);
    } catch (e) {
      alert("Submitting failed due to corrupted drive configurations.");
      return;
    }

    const payload = {
      answers: driveData.verbal_questions.map((vq, idx) => ({
        question_id: vq.id,
        answer_text: verbalAnswers[idx] || "",
        wpm: verbalMetadata[idx]?.wpm || null,
        filler_words_count: verbalMetadata[idx]?.filler_words_count || null
      })),
      code: codingCode,
      problem_title: driveData.coding_problem?.title || "Two Sum",
      language: codingLanguage,
      mcq_answers: driveData.mcqs.map((q, idx) => ({
        question: q.question,
        answer: mcqAnswers[idx] || ""
      }))
    };

    setStarting(true);
    try {
      const completedDrive = await api.post(`/api/drives/${activeDrive.id}/submit`, payload);
      setReviewDrive(completedDrive);
      setActiveDrive(null);
      loadDrives();
    } catch (err) {
      alert("Submission failed. Please submit again.");
    } finally {
      setStarting(false);
    }
  };

  const parseStar = (text) => {
    if (!text || !text.startsWith("[STAR]")) return null;
    const cleanText = text.replace("[STAR]", "").trim();
    const result = { situation: "", task: "", action: "", result: "" };
    
    const sitMatch = cleanText.match(/-\s*Situation:\s*(.*?)(?=\s*-\s*(Task|Action|Result)|\s*$)/s);
    const taskMatch = cleanText.match(/-\s*Task:\s*(.*?)(?=\s*-\s*(Situation|Action|Result)|\s*$)/s);
    const actMatch = cleanText.match(/-\s*Action:\s*(.*?)(?=\s*-\s*(Situation|Task|Result)|\s*$)/s);
    const resMatch = cleanText.match(/-\s*Result:\s*(.*?)(?=\s*-\s*(Situation|Task|Action)|\s*$)/s);
    
    if (sitMatch) result.situation = sitMatch[1].trim();
    if (taskMatch) result.task = taskMatch[1].trim();
    if (actMatch) result.action = actMatch[1].trim();
    if (resMatch) result.result = resMatch[1].trim();
    
    return result;
  };

  const formatTimer = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ==========================================
  // RENDER: REPORT CARD VIEW
  // ==========================================
  if (reviewDrive) {
    let reportData = {};
    try {
      reportData = JSON.parse(reviewDrive.feedback);
    } catch (e) {
      reportData = {};
    }

    const companyDetails = COMPANIES.find(c => c.id === reviewDrive.company);
    const overallScore = reviewDrive.overall_score;
    
    // Placement outcome badge logic
    let outcomeText = "Interview Under Evaluation";
    let outcomeColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    if (reviewDrive.status === "Completed") {
      if (overallScore >= 7.5) {
        outcomeText = "OFFER EXTENDED (Recommended)";
        outcomeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      } else if (overallScore >= 5.5) {
        outcomeText = "WAITLISTED (Needs Practice)";
        outcomeColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
      } else {
        outcomeText = "REJECTED (Focused Training Needed)";
        outcomeColor = "text-red-400 bg-red-500/10 border-red-500/20";
      }
    }

    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-200">
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-400" /> Drive Placement Report Card
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Company Style: <span className="text-white font-bold">{reviewDrive.company}</span> &bull; Difficulty: {reviewDrive.difficulty} &bull; Took on {new Date(reviewDrive.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => { setReviewDrive(null); }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Overall radial ring */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Overall Score</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28">
                <circle className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="42" cx="56" cy="56" />
                <circle className="text-blue-500" strokeWidth="6" strokeDasharray={`${42 * 2 * Math.PI}`} strokeDashoffset={`${42 * 2 * Math.PI * (1 - overallScore / 10)}`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="56" cy="56" />
              </svg>
              <span className="absolute text-xl font-black text-white">{overallScore} <span className="text-[10px] text-slate-400">/10</span></span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded border mt-4 uppercase tracking-wider ${outcomeColor}`}>
              {outcomeText}
            </span>
          </div>

          {/* Sectional metrics cards */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-center gap-4 md:col-span-3">
            <h3 className="text-sm font-bold text-white">Sectional Performance Dashboard</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex flex-col items-center text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MCQ Aptitude</span>
                <span className="text-2xl font-black text-white mt-1">{reviewDrive.mcq_score}<span className="text-xs text-slate-400">/10</span></span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-cyan-500 h-1.5" style={{ width: `${reviewDrive.mcq_score * 10}%` }}></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex flex-col items-center text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coding Sandbox</span>
                <span className="text-2xl font-black text-white mt-1">{reviewDrive.coding_score}<span className="text-xs text-slate-400">/10</span></span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5" style={{ width: `${reviewDrive.coding_score * 10}%` }}></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex flex-col items-center text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verbal Interview</span>
                <span className="text-2xl font-black text-white mt-1">{reviewDrive.verbal_score}<span className="text-xs text-slate-400">/10</span></span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-purple-500 h-1.5" style={{ width: `${reviewDrive.verbal_score * 10}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed view selection */}
        <div className="border-b border-slate-800 flex gap-4 shrink-0">
          <button
            onClick={() => setActiveReviewTab("mcq")}
            className={`pb-3 font-semibold text-xs border-b-2 px-1 cursor-pointer transition-all ${
              activeReviewTab === "mcq" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Stage 1: MCQ Evaluation ({reviewDrive.mcq_score}/10)
          </button>
          <button
            onClick={() => setActiveReviewTab("coding")}
            className={`pb-3 font-semibold text-xs border-b-2 px-1 cursor-pointer transition-all ${
              activeReviewTab === "coding" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Stage 2: Code Submission ({reviewDrive.coding_score}/10)
          </button>
          <button
            onClick={() => setActiveReviewTab("verbal")}
            className={`pb-3 font-semibold text-xs border-b-2 px-1 cursor-pointer transition-all ${
              activeReviewTab === "verbal" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Stage 3: Verbal Assessment ({reviewDrive.verbal_score}/10)
          </button>
        </div>

        {/* Tab Content panels */}
        <div className="space-y-6">
          {/* TAB 1: MCQ REVIEW */}
          {activeReviewTab === "mcq" && (
            <div className="space-y-4">
              {reportData.mcq_review && reportData.mcq_review.length > 0 ? (
                reportData.mcq_review.map((item, idx) => (
                  <div key={idx} className="glass-panel p-5 rounded-2xl border-white/5 space-y-3 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 w-1.5 h-full ${item.is_correct ? "bg-cyan-500" : "bg-red-500"}`}></div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5">MCQ {idx + 1}</span>
                      <span className={`font-bold flex items-center gap-1 ${item.is_correct ? "text-cyan-400" : "text-red-400"}`}>
                        {item.is_correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} {item.is_correct ? "Correct Answer" : "Incorrect"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{item.question}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {item.options.map((opt, oIdx) => {
                        const isCorrectOpt = opt.trim().toLowerCase() === item.correct_answer.trim().toLowerCase() || opt === item.correct_answer;
                        const isUserOpt = opt.trim().toLowerCase() === item.user_answer?.trim().toLowerCase() || opt === item.user_answer;
                        
                        let borderStyle = "border-slate-800 bg-slate-950/20";
                        let checkIcon = null;
                        
                        if (isCorrectOpt) {
                          borderStyle = "border-cyan-500/40 bg-cyan-950/20 text-cyan-200";
                          checkIcon = <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 inline shrink-0" />;
                        } else if (isUserOpt) {
                          borderStyle = "border-red-500/40 bg-red-950/20 text-red-200";
                          checkIcon = <XCircle className="w-3.5 h-3.5 text-red-400 inline shrink-0" />;
                        }

                        return (
                          <div key={oIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${borderStyle}`}>
                            <span>{opt}</span>
                            {checkIcon}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm text-center py-6">MCQ feedback data not available.</p>
              )}
            </div>
          )}

          {/* TAB 2: CODING REVIEW */}
          {activeReviewTab === "coding" && (
            <div className="space-y-6">
              {reportData.coding_review ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left panel: Submitted Code */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col">
                      <div className="bg-slate-950/60 p-4 border-b border-slate-800 flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-400 uppercase">Submitted Code ({reportData.coding_review.language})</span>
                        <span className="font-bold text-emerald-400">Passed: {reportData.coding_review.test_cases_passed} / {reportData.coding_review.total_test_cases} Test Cases</span>
                      </div>
                      <pre className="p-4 bg-slate-950/90 font-mono text-xs text-blue-300 overflow-x-auto h-[400px]">
                        <code>{reportData.coding_review.code}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Right panel: AI Grading */}
                  <div className="space-y-4 col-span-1">
                    <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <BrainCircuit className="w-4 h-4 text-emerald-400" /> Complexity Assessment
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-500 block uppercase">Time Complexity</span>
                          <span className="text-white font-semibold text-xs mt-1 block">{reportData.coding_review.time_complexity}</span>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-500 block uppercase">Space Complexity</span>
                          <span className="text-white font-semibold text-xs mt-1 block">{reportData.coding_review.space_complexity}</span>
                        </div>
                      </div>

                      {reportData.coding_review.error && (
                        <div className="p-3.5 bg-red-950/30 border border-red-500/20 text-red-300 text-xs rounded-xl font-mono whitespace-pre-wrap">
                          <strong className="block mb-1 text-red-400">Execution Error:</strong>
                          {reportData.coding_review.error}
                        </div>
                      )}

                      <div className="space-y-3 pt-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Structure & Readability Feedback</span>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
                            {reportData.coding_review.readability_feedback || "Structure complies with best programming standards."}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Optimization Guidance</span>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
                            {reportData.coding_review.optimization_feedback || "Optimizations look clean."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-6">Coding report data not available.</p>
              )}
            </div>
          )}

          {/* TAB 3: VERBAL REVIEW */}
          {activeReviewTab === "verbal" && (
            <div className="space-y-6">
              {reportData.verbal_review && reportData.verbal_review.length > 0 ? (
                reportData.verbal_review.map((item, idx) => {
                  const starData = parseStar(item.feedback_communication);
                  return (
                    <div key={idx} className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-purple-500"></div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-white/5">Verbal Question {idx + 1}</span>
                        <span className="font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                          Score: {item.score}/10
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{item.question_text}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/20 border border-white/5 p-4 rounded-xl text-xs leading-relaxed">
                        <div>
                          <span className="text-slate-400 font-semibold block mb-1">Your Speech Transcript:</span>
                          <p className="text-slate-300 italic">"{item.user_answer || "No speech detected."}"</p>
                          <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-500 uppercase">
                            <span>Pace: <span className="text-white">{item.wpm || 120} WPM</span></span>
                            <span>Filler Words: <span className="text-white">{item.filler_words_count || 0} count</span></span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block mb-1">Ideal Model Answer:</span>
                          <p className="text-slate-300">{item.ideal_answer}</p>
                        </div>
                      </div>

                      {/* STAR Evaluation Cards */}
                      {starData && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> STAR Behavioral Methodology Segmentation
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                              <span className="text-[9px] font-bold text-blue-400 uppercase block tracking-wider">Situation</span>
                              <p className="text-xs text-slate-300 leading-relaxed">{starData.situation || "Not identified"}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 space-y-1">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase block tracking-wider">Task</span>
                              <p className="text-xs text-slate-300 leading-relaxed">{starData.task || "Not identified"}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                              <span className="text-[9px] font-bold text-emerald-400 uppercase block tracking-wider">Action</span>
                              <p className="text-xs text-slate-300 leading-relaxed">{starData.action || "Not identified"}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-1">
                              <span className="text-[9px] font-bold text-purple-400 uppercase block tracking-wider">Result</span>
                              <p className="text-xs text-slate-300 leading-relaxed">{starData.result || "Not identified"}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Feedback strengths & weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                          <strong className="text-emerald-400 font-bold block mb-1">Response Strengths:</strong>
                          <p className="text-slate-300 leading-relaxed">{item.feedback_strengths}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                          <strong className="text-yellow-500 font-bold block mb-1">Areas of Improvement:</strong>
                          <p className="text-slate-300 leading-relaxed">{item.feedback_weaknesses}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm text-center py-6">Verbal feedback report data not available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: ACTIVE TIMED PLACEMENT DRIVE INTERACTIVE SCREEN
  // ==========================================
  if (activeDrive) {
    let driveData = {};
    try {
      driveData = JSON.parse(activeDrive.feedback);
    } catch (e) {
      driveData = {};
    }

    const timerColor = timer < 300 ? "text-red-500 animate-pulse font-black" : "text-amber-400 font-bold";

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col text-slate-200 relative">
        {/* Timed Placement Drive Header */}
        <div className="glass-panel p-4 rounded-xl border-white/5 flex justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-indigo-400" />
            <div>
              <h1 className="text-md font-extrabold text-white uppercase tracking-wider">{activeDrive.company} Recruitment Drive</h1>
              <p className="text-[10px] text-slate-400">Assessing: {activeDrive.difficulty} Level Technical Capabilities</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Progress Stage Tracker */}
            <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
              <span className={`px-2.5 py-1 rounded-lg border transition-all ${
                activeStage === 1 ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-slate-900/60 text-slate-500 border-slate-800"
              }`}>Stage 1: MCQs</span>
              <span className="text-slate-700">──</span>
              <span className={`px-2.5 py-1 rounded-lg border transition-all ${
                activeStage === 2 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-900/60 text-slate-500 border-slate-800"
              }`}>Stage 2: Coding</span>
              <span className="text-slate-700">──</span>
              <span className={`px-2.5 py-1 rounded-lg border transition-all ${
                activeStage === 3 ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-slate-900/60 text-slate-500 border-slate-800"
              }`}>Stage 3: Verbal</span>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
              <Clock className={`w-4 h-4 ${timer < 300 ? "text-red-500" : "text-amber-400"}`} />
              <span className={`font-mono text-sm ${timerColor}`}>{formatTimer(timer)}</span>
            </div>
          </div>
        </div>

        {/* STAGE 1: MCQs PANEL */}
        {activeStage === 1 && (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
            {/* Question side selector */}
            <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
              {(driveData.mcqs || []).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentMcqIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border font-semibold text-xs shrink-0 flex items-center justify-between transition-all cursor-pointer ${
                    currentMcqIndex === idx
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-lg"
                      : "bg-slate-900/40 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <span>MCQ Question {idx + 1}</span>
                  {mcqAnswers[idx] && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </button>
              ))}
            </div>

            {/* MCQ question content */}
            <div className="flex-1 glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-between overflow-y-auto">
              {driveData.mcqs && driveData.mcqs.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aptitude Segment</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5">Q {currentMcqIndex + 1} of 5</span>
                  </div>
                  
                  <h2 className="text-lg font-bold text-white leading-relaxed">
                    {driveData.mcqs[currentMcqIndex].question}
                  </h2>

                  <div className="grid grid-cols-1 gap-3.5 pt-4">
                    {driveData.mcqs[currentMcqIndex].options.map((opt, oIdx) => {
                      const isSelected = mcqAnswers[currentMcqIndex] === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => setMcqAnswers(prev => ({ ...prev, [currentMcqIndex]: opt }))}
                          className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-md shadow-cyan-500/5"
                              : "bg-slate-900/30 border-slate-800 text-slate-300 hover:bg-slate-900/50 hover:border-slate-750"
                          }`}
                        >
                          <span className="font-bold text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-800 mr-3 text-slate-400">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No MCQs configuration present.</p>
              )}

              <div className="flex justify-between items-center border-t border-slate-800/40 pt-4 mt-6">
                <button
                  onClick={() => setCurrentMcqIndex(idx => Math.max(0, idx - 1))}
                  disabled={currentMcqIndex === 0}
                  className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous MCQ
                </button>

                {currentMcqIndex < (driveData.mcqs?.length || 5) - 1 ? (
                  <button
                    onClick={() => setCurrentMcqIndex(idx => idx + 1)}
                    className="bg-slate-800 hover:bg-slate-750 border border-white/5 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    Next MCQ <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveStage(2)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-md shadow-cyan-500/10 cursor-pointer"
                  >
                    Proceed to Coding Sandbox <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: CODING SANDBOX */}
        {activeStage === 2 && (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
            {/* Left panel: Coding problem description */}
            <div className="w-full lg:w-1/3 glass-panel p-5 rounded-2xl border-white/5 flex flex-col min-h-0 overflow-y-auto">
              {driveData.coding_problem ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coding Segment</span>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                      {driveData.coding_problem.difficulty}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white leading-relaxed">{driveData.coding_problem.title}</h2>
                  
                  <div className="text-xs text-slate-400 leading-relaxed font-sans whitespace-pre-wrap select-text p-4 rounded-xl bg-slate-950/40 border border-slate-900 h-[280px] overflow-y-auto scrollbar-thin">
                    {driveData.coding_problem.description}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No coding problem configuration present.</p>
              )}
            </div>

            {/* Right panel: Editor and Terminal Console */}
            <div className="flex-1 flex flex-col min-h-0 gap-4">
              <div className="flex-1 glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col min-h-0">
                {/* Control bar */}
                <div className="bg-slate-950/60 p-3 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-4">
                    <select
                      value={codingLanguage}
                      onChange={handleLanguageChange}
                      className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold p-2 text-white outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="python">Python 3</option>
                      <option value="java">Java (JDK 17)</option>
                      <option value="cpp">C++ (GCC 11)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunCoding}
                      disabled={executingCode}
                      className="bg-slate-800 hover:bg-slate-750 border border-white/5 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {executingCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      Compile & Run Test
                    </button>
                  </div>
                </div>

                {/* Text editor box */}
                <textarea
                  value={codingCode}
                  onChange={(e) => setCodingCode(e.target.value)}
                  className="flex-1 bg-slate-950/90 p-4 font-mono text-sm leading-relaxed text-blue-300 outline-none resize-none overflow-y-auto w-full select-text"
                  spellCheck="false"
                  placeholder="Input your programming solution..."
                />
              </div>

              {/* Local console / compiler terminal */}
              <div className="glass-panel rounded-2xl border-white/5 h-44 shrink-0 flex flex-col min-h-0">
                <div className="border-b border-slate-800/60 p-3 shrink-0 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                  <Terminal className="w-3.5 h-3.5" /> Sandbox compiler console logs
                </div>
                <div className="p-3.5 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-300 select-text whitespace-pre-wrap scrollbar-thin">
                  {codeResult ? (
                    <div>
                      {codeResult.error ? (
                        <div className="text-red-400 font-bold">
                          Compilation / Runtime Error:
                          <pre className="mt-1 text-[10px] text-red-300 bg-red-950/20 p-2 rounded border border-red-500/10 font-mono">{codeResult.error}</pre>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className={`font-bold flex items-center gap-1.5 ${codeResult.test_cases_passed === codeResult.total_test_cases ? "text-emerald-400" : "text-yellow-500"}`}>
                            {codeResult.test_cases_passed === codeResult.total_test_cases ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            )}
                            SANDBOX TEST COMPILATION: {codeResult.test_cases_passed}/{codeResult.total_test_cases} test cases passed.
                          </div>
                          {codeResult.readability_feedback && (
                            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{codeResult.readability_feedback}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-600 italic">Compiler output idle. Click 'Compile & Run Test' to run your current sandbox code.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: VERBAL INTERVIEW */}
        {activeStage === 3 && (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
            {/* Verbal question tabs */}
            <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
              {(driveData.verbal_questions || []).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentVerbalIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border font-semibold text-xs shrink-0 flex items-center justify-between transition-all cursor-pointer ${
                    currentVerbalIndex === idx
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-lg"
                      : "bg-slate-900/40 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <span>Verbal Question {idx + 1}</span>
                  {verbalAnswers[idx] && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Verbal interaction canvas */}
            <div className="flex-1 glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-between overflow-y-auto">
              {driveData.verbal_questions && driveData.verbal_questions.length > 0 ? (
                <div className="space-y-6 text-center max-w-2xl mx-auto w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verbal Communication Segment</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5">Q {currentVerbalIndex + 1} of 2</span>
                  </div>

                  <h2 className="text-lg font-bold text-white leading-relaxed">
                    {driveData.verbal_questions[currentVerbalIndex].question_text}
                  </h2>

                  {/* Pulsing micro-animation for voice recording */}
                  {recording ? (
                    <div className="flex items-center gap-1.5 justify-center py-4">
                      <span className="w-1.5 bg-blue-500 rounded h-6 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 bg-blue-500 rounded h-10 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 bg-blue-500 rounded h-14 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      <span className="w-1.5 bg-blue-500 rounded h-8 animate-bounce" style={{ animationDelay: "450ms" }}></span>
                      <span className="w-1.5 bg-blue-500 rounded h-12 animate-bounce" style={{ animationDelay: "600ms" }}></span>
                      <span className="w-1.5 bg-blue-500 rounded h-4 animate-bounce" style={{ animationDelay: "750ms" }}></span>
                    </div>
                  ) : (
                    <div className="h-14 py-4 flex items-center justify-center text-slate-500 text-xs italic">Speech recording idle</div>
                  )}

                  {/* Buttons controls */}
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => speakText(driveData.verbal_questions[currentVerbalIndex].question_text)}
                      className="p-3 bg-slate-800 hover:bg-slate-700/60 text-blue-400 rounded-full border border-white/5 transition-all cursor-pointer"
                      title="Hear Question"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggleRecording}
                      className={`p-3 rounded-full border transition-all cursor-pointer ${
                        recording 
                          ? "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30 animate-pulse" 
                          : "bg-slate-800 hover:bg-slate-700/60 text-slate-300 border-white/5"
                      }`}
                      title={recording ? "Stop Voice Input" : "Record Voice Answer"}
                    >
                      {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Transcript panel */}
                  <div className="text-left space-y-2 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Speech Transcript:</span>
                    <div className="min-h-24 p-3.5 rounded-xl bg-slate-950/80 border border-slate-900 text-xs italic leading-relaxed text-slate-300 max-h-32 overflow-y-auto">
                      {verbalAnswers[currentVerbalIndex] || "No speech detected yet. Click the microphone button to start recording, or type directly below..."}
                    </div>
                    
                    <textarea
                      value={verbalAnswers[currentVerbalIndex] || ""}
                      onChange={(e) => setVerbalAnswers(prev => ({ ...prev, [currentVerbalIndex]: e.target.value }))}
                      placeholder="Or edit/type your response here..."
                      className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-xs leading-relaxed outline-none focus:border-blue-500 resize-none h-14"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No verbal questions configuration present.</p>
              )}

              <div className="flex justify-between items-center border-t border-slate-800/40 pt-4 mt-6">
                <button
                  onClick={() => setCurrentVerbalIndex(idx => Math.max(0, idx - 1))}
                  disabled={currentVerbalIndex === 0}
                  className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {currentVerbalIndex < (driveData.verbal_questions?.length || 2) - 1 ? (
                  <button
                    onClick={() => setCurrentVerbalIndex(idx => idx + 1)}
                    className="bg-slate-800 hover:bg-slate-750 border border-white/5 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    Next Question <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={executeSubmission}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Finish & Submit Drive
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Footer Navigation */}
        <div className="glass-panel p-3.5 rounded-xl border-white/5 flex justify-between items-center shrink-0">
          <button
            onClick={() => {
              if (activeStage > 1) {
                setActiveStage(s => s - 1);
              }
            }}
            disabled={activeStage === 1}
            className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous Stage
          </button>
          
          <span className="text-[10px] text-slate-500 font-bold uppercase">
            Completed: {Object.keys(mcqAnswers).length}/5 MCQs &bull; {codingCode ? 1 : 0}/1 Coding &bull; {Object.keys(verbalAnswers).length}/2 Verbal
          </span>

          <button
            onClick={() => {
              if (activeStage < 3) {
                setActiveStage(s => s + 1);
              }
            }}
            disabled={activeStage === 3}
            className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            Next Stage <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: DASHBOARD / SETUP PAGE (DEFAULT)
  // ==========================================
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-200">
      
      {/* Hero Welcome banner */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-[90px] pointer-events-none"></div>
        
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-400" /> Cockpit Mock Placement Drives
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ready to test yourself under full-scale recruitment criteria? Select a timing layout modeled directly on top-tier corporate placement cycles. Solve technical aptitude MCQs, build sandboxed programs, and submit verbal recordings for comprehensive AI matching reports.
          </p>
        </div>

        {/* Company Card Selection */}
        <div className="pt-8">
          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-4">Select Target Recruiter Style:</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {COMPANIES.map((company) => {
              const isSelected = selectedCompany === company.id;
              return (
                <div
                  key={company.id}
                  onClick={() => {
                    setSelectedCompany(company.id);
                    setSelectedDifficulty(company.difficulty);
                  }}
                  className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-44 relative overflow-hidden ${
                    isSelected
                      ? "bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/5 scale-[1.02]"
                      : "bg-slate-900/30 border-white/5 hover:bg-slate-900/50 hover:border-slate-800"
                  }`}
                >
                  <div className="space-y-2 z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                        {company.difficulty} Drive
                      </span>
                      <Building className={`w-4 h-4 ${company.accentColor}`} />
                    </div>
                    <h3 className="text-sm font-extrabold text-white leading-tight">{company.name}</h3>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-3">{company.desc}</p>
                  </div>
                  {/* Subtle selection ring glow */}
                  {isSelected && (
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-[30px] pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Launch settings panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-850 mt-8 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Adjustment Difficulty:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Easy">Easy (Entry Level)</option>
              <option value="Medium">Medium (Associate SDE)</option>
              <option value="Hard">Hard (Senior SDE / R&D)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleStartDrive}
              disabled={starting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {starting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Preparing recruitment drive questions...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start Placement Drive (30-Min Timer)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Past Placement Drives History */}
      <div className="space-y-4">
        <h2 className="text-md font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" /> Attempted Placement Drives Report Feed
        </h2>

        {loadingList ? (
          <div className="text-center py-10">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-slate-400 mt-2">Loading performance logs history...</p>
          </div>
        ) : drivesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivesList.map((drive) => {
              const overall = drive.overall_score;
              let scoreColor = "text-red-400";
              let badgeColor = "text-red-400 bg-red-500/10 border-red-500/20";
              let statusText = "Needs Focus";
              
              if (overall >= 7.5) {
                scoreColor = "text-emerald-400";
                badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                statusText = "Selected";
              } else if (overall >= 5.5) {
                scoreColor = "text-blue-400";
                badgeColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                statusText = "Waitlisted";
              }

              return (
                <div key={drive.id} className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{drive.company} Style Mock</h4>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" /> Taken on {new Date(drive.created_at).toLocaleDateString()} &bull; {drive.difficulty}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-lg font-black block ${scoreColor}`}>{overall} <span className="text-[9px] text-slate-500">/10</span></span>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border inline-block mt-1 ${badgeColor}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-3.5 flex justify-between items-center text-xs">
                    <div className="flex gap-3 text-[10px] text-slate-400 font-semibold">
                      <span>MCQ: {drive.mcq_score}</span>
                      <span>Code: {drive.coding_score}</span>
                      <span>Speech: {drive.verbal_score}</span>
                    </div>

                    <button
                      onClick={() => setReviewDrive(drive)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      View Report Card <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
            <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No attempted drives yet. Launch a new drive above to build your credentials dashboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}
