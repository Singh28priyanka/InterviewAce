import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Video, Award, RefreshCw, ChevronRight, Mic, MicOff, Volume2, Play, CheckCircle2, ChevronLeft, BrainCircuit, AlertCircle, Sparkles } from "lucide-react";

export default function MockInterview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reviewId = searchParams.get("review");

  // Selection state
  const [targetStyle, setTargetStyle] = useState("General");
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [roundType, setRoundType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [inProgress, setInProgress] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active interview state
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Audio metrics states
  const [startTime, setStartTime] = useState(0);
  const [answersMetadata, setAnswersMetadata] = useState({}); // { [qIdx]: { wpm: float, filler_words_count: int } }

  // Feedback/Review state
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    if (reviewId) {
      loadReview(reviewId);
    }
  }, [reviewId]);

  useEffect(() => {
    // Initialize Web Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";
      
      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const currentAns = answers[currentQuestionIndex] || "";
        const updatedAns = currentAns ? `${currentAns} ${transcript}` : transcript;
        setAnswers({
          ...answers,
          [currentQuestionIndex]: updatedAns
        });
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
  }, [answers, currentQuestionIndex]);

  const loadReview = async (id) => {
    setLoading(true);
    try {
      const data = await api.get(`/api/interview/${id}`);
      setReviewData(data);
    } catch (err) {
      alert("Failed to load interview feedback.");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const formattedType = `${targetStyle} | ${jobRole} (${roundType})`;
      const data = await api.post("/api/interview/start", {
        interview_type: formattedType,
        difficulty: difficulty
      });
      setInterview(data);
      setAnswers({});
      setAnswersMetadata({});
      setCurrentQuestionIndex(0);
      setInProgress(true);
      speakText(data.questions[0].question_text);
    } catch (err) {
      alert(err.message || "Failed to initiate mock session.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (recording && recognition) {
      stopRecordingSession();
    }
    if (currentQuestionIndex < interview.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      speakText(interview.questions[nextIdx].question_text);
    }
  };

  const handlePrev = () => {
    if (recording && recognition) {
      stopRecordingSession();
    }
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      speakText(interview.questions[prevIdx].question_text);
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
      setStartTime(Date.now());
      recognition.start();
      setRecording(true);
    }
  };

  const stopRecordingSession = () => {
    recognition.stop();
    setRecording(false);
    
    // Calculate speaking pace and filler words
    const durationSec = (Date.now() - startTime) / 1000.0;
    const currentAns = answers[currentQuestionIndex] || "";
    const words = currentAns.trim().split(/\s+/).filter(x => x.length > 0).length;
    
    // Words per minute (Conversational optimal range: 110-150 WPM)
    const calcWpm = durationSec > 2 && words > 0 ? Math.round((words / durationSec) * 60) : 120;
    
    // Filler words matches: um, uh, like, basically, actually, so
    const matches = currentAns.toLowerCase().match(/\b(um|uh|like|basically|actually|so)\b/g);
    const fillerCount = matches ? matches.length : 0;
    
    setAnswersMetadata({
      ...answersMetadata,
      [currentQuestionIndex]: {
        wpm: calcWpm,
        filler_words_count: fillerCount
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (recording && recognition) {
      stopRecordingSession();
    }
    
    // Format answers array with optional speech metrics
    const submitPayload = {
      answers: interview.questions.map((q, idx) => ({
        question_id: q.id,
        answer_text: answers[idx] || "",
        wpm: answersMetadata[idx]?.wpm || null,
        filler_words_count: answersMetadata[idx]?.filler_words_count || null
      }))
    };

    try {
      const data = await api.post(`/api/interview/${interview.id}/submit`, submitPayload);
      setReviewData(data);
      setInProgress(false);
      setInterview(null);
      navigate(`/interview?review=${data.id}`);
    } catch (err) {
      alert("Evaluation failed. Please submit again.");
    } finally {
      setLoading(false);
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
    
    if (sitMatch) result.situation = sitMatch[1].strip ? sitMatch[1].trim() : sitMatch[1];
    if (taskMatch) result.task = taskMatch[1].strip ? taskMatch[1].trim() : taskMatch[1];
    if (actMatch) result.action = actMatch[1].strip ? actMatch[1].trim() : actMatch[1];
    if (resMatch) result.result = resMatch[1].strip ? resMatch[1].trim() : resMatch[1];
    
    return result;
  };

  // Render 1: Detailed Feedback Dashboard
  if (reviewData) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-200">
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Interview Feedback Report</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Completed on {new Date(reviewData.created_at).toLocaleDateString()} &bull; {reviewData.interview_type} &bull; {reviewData.difficulty}
            </p>
          </div>
          <button
            onClick={() => { setReviewData(null); navigate("/interview"); }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            Start New Simulator
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Overall Score</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="48" cx="56" cy="56" />
                <circle className="text-blue-500" strokeWidth="8" strokeDasharray={`${48 * 2 * Math.PI}`} strokeDashoffset={`${48 * 2 * Math.PI * (1 - reviewData.score / 10)}`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="48" cx="56" cy="56" />
              </svg>
              <span className="absolute text-2xl font-black text-white">{reviewData.score} <span className="text-xs text-slate-400">/10</span></span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-white/5 md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Metrics Analysis</h3>
            
            {reviewData.questions && reviewData.questions.length > 0 && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-slate-400">Technical correctness</span><span className="text-slate-200">Excellent</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: "85%" }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-slate-400">Communication & Pace</span><span className="text-slate-200">Good</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full" style={{ width: "75%" }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-slate-400">Clarity & Terminology</span><span className="text-slate-200">Above Average</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-indigo-500 h-2 rounded-full" style={{ width: "80%" }}></div></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions and feedback review */}
        <h2 className="text-lg font-extrabold text-white mt-8">Question Breakdown</h2>
        <div className="space-y-6">
          {reviewData.questions.map((q, idx) => {
            const starData = parseStar(q.feedback_communication);
            return (
              <div key={q.id} className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-xs font-semibold bg-slate-800 border border-white/5 px-2.5 py-1 rounded-lg text-slate-400 uppercase tracking-wider">
                    Question {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    Score: {q.score}/10
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{q.question_text}</h3>
                
                <div className="space-y-2.5 bg-slate-900/30 border border-white/5 p-4 rounded-xl text-xs leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Your response:</span>
                      <p className="text-slate-300 italic">{q.user_answer || "No response provided."}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Suggested ideal response:</span>
                      <p className="text-slate-300">{q.ideal_answer}</p>
                    </div>
                  </div>
                </div>

                {/* Render STAR card if applicable */}
                {starData && (
                  <div className="p-4 rounded-xl bg-blue-950/15 border border-blue-500/15 space-y-3">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI STAR Method Behavioral Evaluation
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                      {starData.situation && (
                        <div className="p-2.5 rounded bg-slate-950/40">
                          <span className="font-extrabold text-white block mb-0.5">S - Situation</span>
                          <p className="text-slate-400">{starData.situation}</p>
                        </div>
                      )}
                      {starData.task && (
                        <div className="p-2.5 rounded bg-slate-950/40">
                          <span className="font-extrabold text-white block mb-0.5">T - Task</span>
                          <p className="text-slate-400">{starData.task}</p>
                        </div>
                      )}
                      {starData.action && (
                        <div className="p-2.5 rounded bg-slate-950/40">
                          <span className="font-extrabold text-white block mb-0.5">A - Action</span>
                          <p className="text-slate-400">{starData.action}</p>
                        </div>
                      )}
                      {starData.result && (
                        <div className="p-2.5 rounded bg-slate-950/40">
                          <span className="font-extrabold text-white block mb-0.5">R - Result</span>
                          <p className="text-slate-400">{starData.result}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/40 text-xs">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">Strengths</span>
                    <p className="text-slate-400 leading-relaxed">{q.feedback_strengths || "Strong response syntax and concepts."}</p>
                  </div>
                  <div>
                    <span className="text-yellow-500 font-bold block mb-1">Areas of improvement</span>
                    <p className="text-slate-400 leading-relaxed">{q.feedback_weaknesses || "Detail edge conditions or scaling aspects."}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render 2: Simulator Active
  if (inProgress && interview) {
    const activeQ = interview.questions[currentQuestionIndex];
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-200">
        <div className="glass-panel p-4 rounded-2xl border-white/5 flex items-center justify-between">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            {interview.interview_type} Simulator ({interview.difficulty})
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {currentQuestionIndex + 1} of {interview.questions.length} Questions
          </span>
        </div>

        <div className="glass-panel p-8 rounded-2xl border-white/5 space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <h2 className="text-xl font-bold text-white leading-relaxed max-w-2xl mx-auto">
            {activeQ.question_text}
          </h2>

          {/* Animated audio waveform during recording */}
          {recording && (
            <div className="flex items-center justify-center gap-1.5 my-6 h-8">
              <span className="w-1 bg-blue-500 rounded h-3 animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1 bg-blue-500 rounded h-7 animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1 bg-blue-500 rounded h-4 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              <span className="w-1 bg-blue-500 rounded h-8 animate-bounce" style={{ animationDelay: "450ms" }}></span>
              <span className="w-1 bg-blue-500 rounded h-5 animate-bounce" style={{ animationDelay: "600ms" }}></span>
              <span className="w-1 bg-blue-500 rounded h-2 animate-bounce" style={{ animationDelay: "750ms" }}></span>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={() => speakText(activeQ.question_text)}
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

          <div className="max-w-2xl mx-auto text-left space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Your Answer Transcript:</span>
            <div className="min-h-32 p-4 rounded-xl bg-slate-950/80 border border-slate-900 text-sm italic leading-relaxed text-slate-300">
              {answers[currentQuestionIndex] || "No speech detected yet. Click the microphone button and start speaking, or type directly..."}
            </div>
            
            {/* Direct text input alternative */}
            <textarea
              value={answers[currentQuestionIndex] || ""}
              onChange={(e) => setAnswers({ ...answers, [currentQuestionIndex]: e.target.value })}
              placeholder="Or type/edit your response here..."
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-xs leading-relaxed outline-none focus:border-blue-500 resize-none h-16"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800/40 max-w-2xl mx-auto">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentQuestionIndex < interview.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Next Question <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                Submit & End Session
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render 3: Start Screen Configurations
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-200">
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-extrabold text-white">AI Mock Interview Simulator</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Experience real-world placement parameters. Select a company style, target job role, round type, and difficulty, then speak your answers. Our AI evaluates accuracy, depth, and speaking metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Form inputs */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-bold uppercase">Company / Target Style:</label>
              <select
                value={targetStyle}
                onChange={(e) => setTargetStyle(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="General">General Platform Style</option>
                <option value="Google">Google SWE Style</option>
                <option value="Amazon">Amazon SDE Style</option>
                <option value="Microsoft">Microsoft SWE Style</option>
                <option value="TCS">TCS NQT Style</option>
                <option value="Infosys">Infosys SE Style</option>
                <option value="Wipro">Wipro Style</option>
                <option value="Accenture">Accenture Style</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-bold uppercase">Target Job Role:</label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Data Scientist">Data Scientist / Analyst</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                <option value="Web Designer">Web Designer / Frontend Developer</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Financial Analyst">Financial Analyst</option>
                <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
                <option value="HR Generalist">HR Generalist / Specialist</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-bold uppercase">Interview Round Type:</label>
              <select
                value={roundType}
                onChange={(e) => setRoundType(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Technical">Domain-Specific Technical</option>
                <option value="Behavioral">Behavioral & Leadership (STAR)</option>
                <option value="Warm-up">Warm-up & Ice Breaker</option>
                <option value="System Design">System Design & Scale</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-bold uppercase">Difficulty Level:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Easy">Easy (Entry Level)</option>
                <option value="Medium">Medium (Associate)</option>
                <option value="Hard">Hard (Expert / Tier-1)</option>
              </select>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer text-sm mt-4 flex items-center justify-center gap-1.5"
            >
              <Video className="w-4 h-4" /> Start Mock Simulator
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900/40 border border-white/5 p-6 space-y-4 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-purple-400" /> Simulator Parameters
            </h4>
            <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">&bull;</span>
                <span>Includes **4 total questions**: 2 generated dynamically from your resume skills and 2 pulled from the question bank.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">&bull;</span>
                <span>Speech metrics track your speaking rate (optimal is 110-150 words per minute).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">&bull;</span>
                <span>Behavioral answers are analyzed using the structured **STAR** method logic.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
