import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { BarChart2, Video, Code, Calendar, Award, AlertCircle, RefreshCw, CheckCircle, ChevronRight, Activity, Zap } from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState({ interviews: [], coding_submissions: [] });
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const dbStats = await api.get("/api/analytics/dashboard");
      setData(dbStats);
      
      const dbHistory = await api.get("/api/analytics/history");
      setHistory(dbHistory);

      const rData = await api.get("/api/analytics/roadmap").catch(() => null);
      if (rData && rData.roadmap_data) {
        setRoadmap(JSON.parse(rData.roadmap_data));
      }
    } catch (err) {
      console.error("Failed to load analytics datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate Streak Calendar Blocks (Last 28 Days)
  const getStreakBlocks = () => {
    if (!history.coding_submissions) return [];
    
    // Group submissions by local date string YYYY-MM-DD
    const submissionCounts = {};
    history.coding_submissions.forEach(sub => {
      const dateStr = new Date(sub.created_at).toISOString().split("T")[0];
      submissionCounts[dateStr] = (submissionCounts[dateStr] || 0) + 1;
    });

    const blocks = [];
    const today = new Date();
    
    // Generate blocks from 27 days ago to today
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = submissionCounts[dateStr] || 0;
      
      let colorClass = "bg-slate-900 border border-white/5"; // 0 submissions
      if (count === 1) colorClass = "bg-emerald-900/80 border border-emerald-900";
      else if (count === 2) colorClass = "bg-emerald-700/80 border border-emerald-700";
      else if (count >= 3) colorClass = "bg-emerald-500/80 border border-emerald-500";

      blocks.push({
        date: dateStr,
        day: d.getDate(),
        count: count,
        color: colorClass
      });
    }
    return blocks;
  };

  const streakBlocks = getStreakBlocks();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-200">
      {/* Title Header */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-500" /> Performance cockpit
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Visualize score timelines, analyze topic strengths, verify streak counts, and review roadmaps.
          </p>
        </div>
        <button
          onClick={loadData}
          className="glass-panel border-white/10 hover:bg-slate-800/40 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
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

          {/* GitHub-style Coding Streak Grid & Weakness Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Streak Grid Card */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Coding Contribution Streak
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Last 28 Days</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consistency is key to placement success. Green intensity indicates number of solutions evaluated on those days.
              </p>
              
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
                {streakBlocks.map((block, idx) => (
                  <div 
                    key={idx} 
                    className={`h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold ${block.color}`}
                    title={`${block.count} submissions on ${block.date}`}
                  >
                    <span className="text-slate-300">{block.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Weakness Alerts Panel */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400" /> Skill Critical Alerts
              </h3>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-48">
                {data.topic_scores && data.topic_scores.filter(t => t.score < 6.0).map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-400">
                    <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-white block">{t.topic} is Weak ({t.score}/10)</span>
                      <p className="text-slate-400 leading-relaxed mt-0.5">Recommended: Practice 3 mock questions or code challenges in this category.</p>
                    </div>
                  </div>
                ))}
                {(!data.topic_scores || data.topic_scores.filter(t => t.score < 6.0).length === 0) && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Fantastic job! All topic averages are above the 60% placement bar.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Roadmap timeline */}
          {roadmap && (
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" /> Your Active Placement Roadmap
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.keys(roadmap).map((week, idx) => (
                  <div key={week} className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">{week} Target</span>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{roadmap[week].Goal}</h4>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {roadmap[week].Topics.map((topic, tIdx) => (
                        <span key={tIdx} className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
