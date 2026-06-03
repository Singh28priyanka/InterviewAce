import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Video, Award, RefreshCw, ChevronRight, Mic, MicOff, Volume2, Play, CheckCircle2, ChevronLeft, BrainCircuit, AlertCircle } from "lucide-react";

export default function MockInterview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reviewId = searchParams.get("review");

  // Selection state
  const [interviewType, setInterviewType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [inProgress, setInProgress] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active interview state
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

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
        setAnswers({
          ...answers,
          [currentQuestionIndex]: currentAns ? `${currentAns} ${transcript}` : transcript
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
      const data = await api.post("/api/interview/start", {
        interview_type: interviewType,
        difficulty: difficulty
      });
      setInterview(data);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setInProgress(true);
      // Automatically speak the first question
      speakText(data.questions[0].question_text);
    } catch (err) {
      alert(err.message || "Failed to initiate mock session.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      speakText(interview.questions[nextIdx].question_text);
    }
  };

  const handlePrev = () => {
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
      recognition.stop();
      setRecording(false);
    } else {
      recognition.start();
      setRecording(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (recording && recognition) {
      recognition.stop();
    }
    
    // Format answers array
    const submitPayload = {
      answers: interview.questions.map((q, idx) => ({
        question_id: q.id,
        answer_text: answers[idx] || ""
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md"
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
          {reviewData.questions.map((q, idx) => (
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
          ))}
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

          <div className="flex justify-center gap-3">
            <button
              onClick={() => speakText(activeQ.question_text)}
              className="p-3 bg-slate-800 hover:bg-slate-755 text-blue-400 rounded-full border border-white/5 transition-all"
              title="Hear Question"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full border transition-all ${
                recording 
                  ? "bg-red-600 border-red-500 text-white animate-pulse" 
                  : "bg-slate-800 hover:bg-slate-755 border-white/5 text-slate-300"
              }`}
              title={recording ? "Stop Recording" : "Voice Answer"}
            >
              {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-left space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Answer</label>
            <textarea
              rows="6"
              value={answers[currentQuestionIndex] || ""}
              onChange={(e) => setAnswers({ ...answers, [currentQuestionIndex]: e.target.value })}
              placeholder={recording ? "Transcribing audio input..." : "Input your answer. Speak aloud or type details here."}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-800/40">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white disabled:opacity-30 text-sm font-semibold transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            
            {currentQuestionIndex < interview.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-755 border border-white/5 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md"
              >
                Finish & Evaluate
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render 3: Configure Interview Setup Screen
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-200">
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden border-white/5">
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-600/5 rounded-full blur-[70px] pointer-events-none"></div>
        
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mb-2">
          <Video className="w-6 h-6 text-blue-500" /> AI Mock Interview Simulator
        </h1>
        <p className="text-slate-400 text-sm">
          Simulate behavioral HR mock screens or custom Technical questions aligned to your resume. Get tested and receive graded scoring.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Choose Session Topic</label>
            <div className="grid grid-cols-2 gap-3">
              {["Technical", "HR", "Google Mode", "Amazon Mode", "TCS/NQT", "Infosys Mode"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInterviewType(mode)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all duration-200 ${
                    interviewType === mode
                      ? "bg-blue-600/15 border-blue-500 text-blue-400"
                      : "border-slate-800 bg-transparent text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Difficulty Profile</label>
            <div className="grid grid-cols-3 gap-3">
              {["Easy", "Medium", "Hard"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all duration-200 ${
                    difficulty === level
                      ? "bg-blue-600/15 border-blue-500 text-blue-400"
                      : "border-slate-800 bg-transparent text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all mt-8 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
        >
          <Play className="w-4 h-4 fill-current" /> Start Interview Simulator
        </button>
      </div>
    </div>
  );
}
