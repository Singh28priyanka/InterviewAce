import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { FileText, UploadCloud, Award, CheckCircle, BrainCircuit, RefreshCw, AlertCircle } from "lucide-react";

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadResume = async () => {
    try {
      const data = await api.get("/api/resume/my-resume");
      setResume(data);
    } catch (err) {
      // 404 is expected if user has not uploaded any resume yet
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
    } catch (err) {
      setError(err.message || "Failed to analyze resume.");
    } finally {
      setUploading(false);
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
      <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">ATS Resume Evaluator</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload your professional profile in PDF format to receive keyword audits, ATS scores, and target questions.
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

      {resume ? (
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

              <button
                onClick={() => navigate("/interview")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold transition-all mt-4 flex items-center justify-center gap-1.5"
              >
                <BrainCircuit className="w-4 h-4" /> Generate Mock Questions
              </button>
            </div>
          </div>

          {/* Column 2 & 3: Extracted details & suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Extracted Details */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-3">Extracted Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {getList(resume.parsed_skills).map((skill, idx) => (
                    <span key={idx} className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                  {getList(resume.parsed_skills).length === 0 && (
                    <span className="text-slate-500 text-xs italic">No skills identified. Make sure the PDF contains selectable text.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/40">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Projects</h3>
                  <ul className="space-y-3">
                    {getList(resume.parsed_projects).map((proj, idx) => (
                      <li key={idx} className="text-xs text-slate-300 leading-relaxed list-disc list-inside">
                        {proj}
                      </li>
                    ))}
                    {getList(resume.parsed_projects).length === 0 && (
                      <li className="text-slate-500 text-xs italic">No projects found.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Education & Certs</h3>
                  <ul className="space-y-3">
                    {getList(resume.parsed_education).map((edu, idx) => (
                      <li key={idx} className="text-xs text-slate-300 leading-relaxed list-disc list-inside">
                        {edu}
                      </li>
                    ))}
                    {getList(resume.parsed_certifications).map((cert, idx) => (
                      <li key={`cert-${idx}`} className="text-xs text-slate-300 leading-relaxed list-disc list-inside">
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Career Advice */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" /> Career Guidance & Enhancements
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {resume.career_guidance || "Resume analysis pending. Try uploading your resume to view feedback."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel py-16 px-6 text-center rounded-2xl border-white/5 border-dashed border">
          <UploadCloud className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Profile Uploaded Yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Upload your PDF resume to parse custom keywords, view ATS scoring, and start mock interviews built around your specific tech stack.
          </p>
          <label className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer inline-flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4" />
            Select Resume PDF
            <input type="file" onChange={handleFileUpload} accept="application/pdf" className="hidden" disabled={uploading} />
          </label>
        </div>
      )}
    </div>
  );
}
