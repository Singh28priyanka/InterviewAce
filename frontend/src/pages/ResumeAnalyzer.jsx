import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { FileText, UploadCloud, Award, CheckCircle, BrainCircuit, RefreshCw, AlertCircle, Sparkles, Plus, Check } from "lucide-react";

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  
  // Tab control: "analysis" or "matcher"
  const [activeTab, setActiveTab] = useState("analysis");

  // JD Matcher States
  const [jdText, setJdText] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const loadResume = async () => {
    try {
      const data = await api.get("/api/resume/my-resume");
      setResume(data);
    } catch (err) {
      if (err.message !== "No resume uploaded yet") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      setError("Please select a PDF file resume. Only PDFs are supported.");
      return;
    }

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await api.postMultipart("/api/resume/upload", formData);
      setResume(data);
      setMatchResult(null); // reset matching on new upload
    } catch (err) {
      setError(err.message || "Failed to analyze resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleJdMatchSubmit = async () => {
    if (!jdText.trim()) {
      alert("Please paste target Job Description text first.");
      return;
    }
    setMatching(true);
    setError("");
    try {
      const data = await api.post("/api/resume/match-jd", { jd_text: jdText });
      setMatchResult(data);
    } catch (err) {
      setError(err.message || "JD matching analysis failed.");
    } finally {
      setMatching(false);
    }
  };

  const getList = (jsonStr) => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch (err) {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-200">
      {/* Header bar */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">ATS Resume Suite</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload your professional profile in PDF format to receive keyword audits, ATS scores, and Job Description matches.
          </p>
        </div>
        
        <div>
          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-blue-500/10 cursor-pointer">
            <UploadCloud className="w-4 h-4" /> 
            {uploading ? "Analyzing Profile..." : "Upload PDF Resume"}
            <input type="file" onChange={handleFileUpload} accept="application/pdf" className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      {resume && (
        <div className="flex gap-4 border-b border-slate-800 pb-px shrink-0">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 px-2 ${
              activeTab === "analysis" ? "border-blue-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Resume Keyword Audit
          </button>
          <button
            onClick={() => setActiveTab("matcher")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 px-2 ${
              activeTab === "matcher" ? "border-blue-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Job Description Matcher
          </button>
        </div>
      )}

      {resume ? (
        activeTab === "analysis" ? (
          /* Resume Audit Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: ATS Gauge Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Resume Keyword Score</h3>
                
                <div className="relative flex items-center justify-center mb-4">
                  <svg className="w-40 h-40">
                    <circle className="text-slate-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="64" cx="80" cy="80" />
                    <circle className="text-blue-500" strokeWidth="10" strokeDasharray={`${64 * 2 * Math.PI}`} strokeDashoffset={`${64 * 2 * Math.PI * (1 - resume.ats_score / 100)}`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="64" cx="80" cy="80" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-white">{Math.round(resume.ats_score)}</span>
                    <span className="text-xs text-slate-400 font-medium">ATS Score</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 w-full text-left">
                  <span className="text-xs text-slate-400 block mb-1">Status</span>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Ready for Interview Prep
                  </span>
                </div>
              </div>

              {/* Career Guidance */}
              <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-purple-400" /> AI Career Guidance
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{resume.career_guidance}</p>
              </div>
            </div>

            {/* Columns 2-3: Parsed Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills */}
              <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-400" /> Extracted Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getList(resume.parsed_skills).map((skill, idx) => (
                    <span key={idx} className="bg-slate-900/60 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Key Projects</h3>
                <div className="space-y-3">
                  {getList(resume.parsed_projects).map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/30 border border-white/5 text-xs text-slate-300 leading-relaxed">
                      {proj}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Certs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Education</h3>
                  <ul className="space-y-2 text-xs text-slate-400">
                    {getList(resume.parsed_education).map((edu, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Certifications</h3>
                  <ul className="space-y-2 text-xs text-slate-400">
                    {getList(resume.parsed_certifications).map((cert, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Job Description Matcher Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border-white/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Target Job Description</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste the full text of the job description you are targeting. We will match it against your uploaded resume.
              </p>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job requirements, skills needed, or company role details here..."
                className="flex-1 min-h-64 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 text-xs font-medium text-slate-200 outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
              <button
                onClick={handleJdMatchSubmit}
                disabled={matching || !jdText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {matching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analyze Match Score
              </button>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2 space-y-6">
              {matchResult ? (
                <>
                  {/* Score Meter */}
                  <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                    
                    <div className="relative flex items-center justify-center shrink-0">
                      <svg className="w-32 h-32">
                        <circle className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="48" cx="56" cy="56" />
                        <circle className="text-emerald-500" strokeWidth="8" strokeDasharray={`${48 * 2 * Math.PI}`} strokeDashoffset={`${48 * 2 * Math.PI * (1 - matchResult.match_score / 100)}`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="48" cx="56" cy="56" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-white">{Math.round(matchResult.match_score)}%</span>
                        <span className="text-[10px] text-slate-400 font-medium">Match</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white">ATS Match Compatibility Summary</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{matchResult.ats_compatibility_feedback}</p>
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-yellow-400" /> Missing Key Terms in Resume
                    </h3>
                    <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                      We identified these key terms in the Job Description that are absent or poorly matches in your profile:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missing_keywords && matchResult.missing_keywords.length > 0 ? (
                        matchResult.missing_keywords.map((kw, idx) => (
                          <span key={idx} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                            <Plus className="w-3 h-3" /> {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Perfect keyword matching! All core terms were found.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actionable Suggestions */}
                  <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">How to Tailor Your Resume</h3>
                    <ul className="space-y-3">
                      {matchResult.resume_suggestions && matchResult.resume_suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="glass-panel p-16 rounded-2xl border-white/5 flex flex-col items-center justify-center text-center text-slate-500 italic">
                  <FileText className="w-12 h-12 text-slate-600 mb-3" />
                  No matching analysis loaded. Paste a target Job Description on the left and run analysis to tailor your profile.
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* Upload Prompt */
        <div className="glass-panel p-16 rounded-2xl border-white/5 flex flex-col items-center justify-center text-center space-y-6">
          <UploadCloud className="w-16 h-16 text-blue-500 animate-pulse" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">No Professional Profile Active</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Before evaluating matches or taking customized technical interviews, please upload your resume in PDF format.
            </p>
          </div>
          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer">
            <UploadCloud className="w-4 h-4" /> 
            {uploading ? "Analyzing Profile..." : "Upload PDF Resume"}
            <input type="file" onChange={handleFileUpload} accept="application/pdf" className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
}
