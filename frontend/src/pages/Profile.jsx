import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { User, Mail, Shield, Calendar, FileText, ArrowRight } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-200">
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden border-white/5">
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-600/5 rounded-full blur-[70px] pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-2xl shadow-lg shadow-blue-500/5 uppercase">
            {user.name[0]}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/10 text-blue-400 border border-blue-500/20 capitalize">
              <Shield className="w-3.5 h-3.5" /> {user.role} Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-800/40 text-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-slate-450 block text-[10px] uppercase font-bold tracking-wider">Email Address</span>
                <span className="text-slate-200 font-semibold">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-slate-450 block text-[10px] uppercase font-bold tracking-wider">Member Since</span>
                <span className="text-slate-200 font-semibold">
                  {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {user.role === "candidate" && (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
                <span className="text-white font-bold flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-blue-400" /> Resume Profile Status
                </span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Keeping your resume updated guarantees keyword matching generators are aligned to your exact tech skills.
                </p>
                <Link to="/resume" className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 mt-1">
                  Manage Resume <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
