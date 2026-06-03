import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { BarChart2, Video, Code, Calendar, Award, AlertCircle, RefreshCw } from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState({ interviews: [], coding_submissions: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const dbStats = await api.get("/api/analytics/dashboard");
      setData(dbStats);
      
      const dbHistory = await api.get("/api/analytics/history");
      setHistory(dbHistory);
    } catch (err) {
      console.error("Failed to load analytics datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
            <BarChart2 className="w-6 h-6 text-blue-500" /> Performance Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Visualize score timelines, analyze topic strengths, and revisit past mock evaluations.
          </p>
        </div>
        <button
          onClick={loadData}
          className="glass-panel border-white/10 hover:bg-slate-800/40 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
        </button>
      </div>

      {data && (
        <>
          {/* Top stats summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mock Interviews</span>
              <span className="text-2xl font-black text-white">{data.total_interviews}</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Interview Score</span>
              <span className="text-2xl font-black text-emerald-400">{data.average_score} <span className="text-xs text-slate-400">/ 10</span></span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Coding Submissions</span>
              <span className="text-2xl font-black text-white">{data.total_coding_submissions}</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Coding Score</span>
              <span className="text-2xl font-black text-indigo-400">{data.average_coding_score} <span className="text-xs text-slate-400">/ 10</span></span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Performance Trends */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Performance Trends</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weekly_performance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} domain={[0, 10]} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" activeDot={{ r: 8 }} name="Mock Score" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="coding" stroke="#10b981" name="Coding Score" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Topic-wise Scores */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Topic-wise Scores</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topic_scores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="topic" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} domain={[0, 10]} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="score" fill="#6366f1" name="Average Score" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5" /> Key Strengths
              </h3>
              <ul className="space-y-3 text-xs leading-relaxed text-slate-300">
                {data.strong_areas.map((area, idx) => (
                  <li key={idx} className="list-disc list-inside text-slate-350">{area}</li>
                ))}
                {data.strong_areas.length === 0 && (
                  <li className="text-slate-500 italic">Complete mock evaluations to compute strengths.</li>
                )}
              </ul>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5" /> Weak Areas & Gaps
              </h3>
              <ul className="space-y-3 text-xs leading-relaxed text-slate-300">
                {data.weak_areas.map((area, idx) => (
                  <li key={idx} className="list-disc list-inside text-slate-350">{area}</li>
                ))}
                {data.weak_areas.length === 0 && (
                  <li className="text-slate-500 italic">Complete mock evaluations to compute gaps.</li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Historical records history */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-900/60">
        <div>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Video className="w-4.5 h-4.5 text-blue-500" /> Completed Mocks
          </h2>
          {history.interviews.length > 0 ? (
            <div className="space-y-3">
              {history.interviews.map((intv) => (
                <div key={intv.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
                  <div>
                    <span className="font-bold text-white block">{intv.interview_type} Simulator</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{new Date(intv.created_at).toLocaleDateString()} &bull; {intv.difficulty}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-400 block mb-0.5">{intv.score > 0 ? `${intv.score}/10` : Pending}</span>
                    <Link to={`/interview?review=${intv.id}`} className="text-blue-500 hover:text-blue-400 font-semibold text-[10px]">
                      Revisit Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic text-center py-6">No interviews taken yet.</p>
          )}
        </div>

        <div>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Code className="w-4.5 h-4.5 text-indigo-500" /> Code Submissions
          </h2>
          {history.coding_submissions.length > 0 ? (
            <div className="space-y-3">
              {history.coding_submissions.map((sub) => (
                <div key={sub.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
                  <div>
                    <span className="font-bold text-white block">{sub.problem_title}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{new Date(sub.created_at).toLocaleDateString()} &bull; {sub.language}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-indigo-400 block mb-0.5">Score: {sub.score}/10</span>
                    <span className="text-[10px] text-slate-450 block">{sub.test_cases_passed}/{sub.total_test_cases} tests passed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic text-center py-6">No coding solutions submitted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
