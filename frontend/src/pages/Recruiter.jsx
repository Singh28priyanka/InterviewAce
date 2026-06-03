import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Briefcase, RefreshCw, BarChart2, CheckCircle2, User, FileText, Code, Sparkles, HelpCircle } from "lucide-react";

export default function Recruiter() {
  const [candidates, setCandidates] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/recruiter/candidates");
      setCandidates(data);
    } catch (err) {
      alert("Failed to load candidate roster. Make sure you are registered as recruiter.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleCompare = async () => {
    setComparing(true);
    setComparison(null);
    try {
      const data = await api.get("/api/recruiter/candidates/compare");
      setComparison(data);
    } catch (err) {
      alert("Failed to compile candidate comparison analysis.");
    } finally {
      setComparing(false);
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-200">
      <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-500" /> Recruiter Management Portal
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Audit registered candidates, review interview timelines, and run comparative reports.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCompare}
            disabled={comparing || candidates.length < 2}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10"
          >
            {comparing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Compile AI Insights
          </button>
          <button
            onClick={loadCandidates}
            className="glass-panel border-white/10 hover:bg-slate-800/40 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Renders AI Insights Compare block if exists */}
      {comparison && (
        <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" /> Comparative Analysis Report
          </h3>
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-white/5">
            {comparison.comparison_insight}
          </div>
        </div>
      )}

      {/* Candidates List Grid */}
      <h2 className="text-lg font-bold text-white">Registered Applicants ({candidates.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((cand) => (
          <div key={cand.id} className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold uppercase">
                  {cand.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{cand.name}</h3>
                  <span className="text-[10px] text-slate-400 block">{cand.email}</span>
                </div>
              </div>

              {/* Skills matched list */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">Profile Skills</span>
                <div className="flex flex-wrap gap-1">
                  {cand.skills && cand.skills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-900 border border-slate-800 text-[10px] px-2 py-0.5 rounded-md text-slate-300">
                      {skill}
                    </span>
                  ))}
                  {(!cand.skills || cand.skills.length === 0) && (
                    <span className="text-slate-500 text-[10px] italic">No resume parsed yet.</span>
                  )}
                </div>
              </div>

              {/* Stats values */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/40 text-center">
                <div className="bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-[8px] uppercase font-bold text-slate-500 block mb-0.5">ATS Score</span>
                  <span className="text-xs font-bold text-white">{cand.ats_score > 0 ? `${Math.round(cand.ats_score)}%` : "N/A"}</span>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-[8px] uppercase font-bold text-slate-500 block mb-0.5">Mock Score</span>
                  <span className="text-xs font-bold text-white">{cand.interviews_taken > 0 ? `${cand.average_interview_score}/10` : "N/A"}</span>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  <span className="text-[8px] uppercase font-bold text-slate-500 block mb-0.5">Code Score</span>
                  <span className="text-xs font-bold text-white">{cand.coding_submissions > 0 ? `${cand.average_coding_score}/10` : "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/40 flex justify-between items-center text-[10px] text-slate-400">
              <span>Candidate ID: #{cand.id}</span>
              <span>Registered {new Date(cand.last_active).toLocaleDateString()}</span>
            </div>
          </div>
        ))}

        {candidates.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No candidates have registered on the platform yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
