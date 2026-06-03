import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, BarChart2, Video, Code, FileText, LayoutDashboard, Briefcase } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive(path) 
      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
  }`;

  return (
    <nav className="glass-panel border-b border-slate-800/60 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
        <span className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg text-white font-black text-xs">IA</span>
        <span className="text-white">Interview<span className="text-blue-500">Ace</span></span>
      </Link>

      <div className="hidden md:flex items-center gap-2">
        {user.role === "candidate" ? (
          <>
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/resume" className={linkClass("/resume")}>
              <FileText className="w-4 h-4" /> Resume Analyzer
            </Link>
            <Link to="/interview" className={linkClass("/interview")}>
              <Video className="w-4 h-4" /> Mock Interview
            </Link>
            <Link to="/coding" className={linkClass("/coding")}>
              <Code className="w-4 h-4" /> Coding Panel
            </Link>
            <Link to="/analytics" className={linkClass("/analytics")}>
              <BarChart2 className="w-4 h-4" /> Analytics
            </Link>
          </>
        ) : (
          <Link to="/recruiter" className={linkClass("/recruiter")}>
            <Briefcase className="w-4 h-4" /> Recruiter Panel
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link to="/profile" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-150">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700/60 text-sm font-semibold">
            {user.name[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
        </Link>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="text-slate-400 hover:text-red-400 p-2 rounded-lg transition-all duration-200"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
