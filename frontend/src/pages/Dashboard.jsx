import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { Video, Code, Award, CheckCircle, FileText, ArrowRight, Activity, Calendar, Play, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_interviews: 0,
    average_score: 0.0,
    total_coding_submissions: 0,
    average_coding_score: 0.0
  });
  const [resume, setResume] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  const loadData = async () => {
    try {
      const statsData = await api.get("/api/analytics/dashboard");
      setStats(statsData);
      
      const resumeData = await api.get("/api/resume/my-resume").catch(() => null);
      setResume(resumeData);
      
      const roadmapData = await api.get("/api/analytics/roadmap").catch(() => null);
      if (roadmapData && roadmapData.roadmap_data) {
        setRoadmap(JSON.parse(roadmapData.roadmap_data));
      }
      
      const history = await api.get("/api/analytics/history");
      setRecentInterviews(history.interviews ? history.interviews.slice(0, 3) : []);
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegenerateRoadmap = async () => {
    setGeneratingRoadmap(true);
    try {
      const data = await api.post("/api/analytics/roadmap/regenerate");
      if (data && data.roadmap_data) {
        setRoadmap(JSON.parse(data.roadmap_data));
      }
    } catch (err) {
      alert("Failed to regenerate placement roadmap.");
    } finally {
      setGeneratingRoadmap(false);
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
      {/* Welcome banner */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Placement Cockpit</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Simulate company-specific mocks, score code syntax, verify your resume keywords, and track weekly scores.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/interview" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-blue-500/10">
            <Video className="w-4 h-4" /> Start Interview
          </Link>
          <Link to="/coding" className="flex items-center gap-2 glass-panel hover:bg-slate-800/40 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-white/10">
            <Code className="w-4 h-4" /> Code Sandbox
          </Link>
        </div>
      </div>

      {/* Grid for Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Interviews Completed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.total_interviews}</span>
            <span className="text-xs text-blue-400 font-semibold">taken</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Avg Mock Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.average_score}</span>
            <span className="text-xs text-emerald-400 font-semibold">/ 10.0</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Code Submissions</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.total_coding_submissions}</span>
            <span className="text-xs text-indigo-400 font-semibold">submitted</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Avg Coding Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.average_coding_score}</span>
            <span className="text-xs text-emerald-400 font-semibold">/ 10.0</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Resume Analyzer summary & Recent Activity */}
        <div className="space-y-6 lg:col-span-1">
          {/* Resume Summary Card */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Resume ATS Score
            </h3>
            {resume ? (
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-slate-300 block">{resume.filename}</span>
                  <span className="text-xs text-slate-400 block">Uploaded on {new Date(resume.uploaded_at).toLocaleDateString()}</span>
                  <Link to="/resume" className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 mt-2 font-medium">
                    Review Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-20 h-20">
                    <circle className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="32" cx="40" cy="40" />
                    <circle className="text-blue-500" strokeWidth="6" strokeDasharray={`${32 * 2 * Math.PI}`} strokeDashoffset={`${32 * 2 * Math.PI * (1 - resume.ats_score / 100)}`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="32" cx="40" cy="40" />
                  </svg>
                  <span className="absolute text-sm font-bold text-white">{Math.round(resume.ats_score)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm mb-4">No resume uploaded. Generate specialized questions from your profile.</p>
                <Link to="/resume" className="bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-white/5 inline-flex items-center gap-1">
                  Upload Resume
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Recent Mocks
            </h3>
            {recentInterviews.length > 0 ? (
              <div className="space-y-4">
                {recentInterviews.map((intv) => (
                  <div key={intv.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-900/40 border border-white/5">
                    <div>
                      <span className="text-sm font-bold text-white block">{intv.interview_type} Mock</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(intv.created_at).toLocaleDateString()} &bull; {intv.difficulty}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold block ${intv.score >= 8.0 ? "text-emerald-400" : intv.score >= 6.5 ? "text-yellow-400" : "text-slate-400"}`}>
                        {intv.score > 0 ? `${intv.score}/10` : "Pending"}
                      </span>
                      <Link to={`/interview?review=${intv.id}`} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                        Revisit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-6">Your completed interview reviews will list here.</p>
            )}
          </div>
        </div>

        {/* Right column: Learning Roadmap (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" /> Placement Prep Roadmap
              </h3>
              <button 
                onClick={handleRegenerateRoadmap} 
                disabled={generatingRoadmap}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generatingRoadmap ? "animate-spin" : ""}`} /> Regenerate
              </button>
            </div>

            {roadmap ? (
              <div className="space-y-4">
                {Object.keys(roadmap).map((week, idx) => (
                  <div key={week} className="flex gap-4 items-start relative pb-4 last:pb-0">
                    {/* Progress timeline line */}
                    {idx < Object.keys(roadmap).length - 1 && (
                      <div className="absolute top-6 left-3.5 w-0.5 h-full bg-slate-800"></div>
                    )}
                    <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 z-10 text-xs font-bold text-blue-400">
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-slate-900/30 border border-white/5 rounded-xl p-4">
                      <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">{week}</span>
                      <h4 className="text-sm font-bold text-white mb-2">
                        {roadmap[week].Topics ? roadmap[week].Topics.join(", ") : "Skills targets"}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {roadmap[week].Goal || "Complete coding targets."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-850 rounded-xl bg-slate-900/10">
                <p className="text-slate-400 text-sm mb-4">Complete a mock interview or upload a resume to unlock your roadmap.</p>
                <button 
                  onClick={handleRegenerateRoadmap} 
                  disabled={generatingRoadmap}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
                >
                  {generatingRoadmap ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Create Custom Roadmap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
