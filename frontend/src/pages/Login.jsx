import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Briefcase, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "recruiter" ? "/recruiter" : "/dashboard");
    }
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsRegister(true);
    } else {
      setIsRegister(false);
    }
  }, [user, searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex items-center justify-center px-6 relative">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/5 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl text-white font-bold text-sm mb-4">
            IA
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRegister ? "Create Account" : "Sign In to InterviewAce"}
          </h2>
          <p className="text-slate-400 text-sm mt-2 text-center">
            {isRegister 
              ? "Join thousands of job seekers preparing for placements." 
              : "Access simulated interviews, roadmaps, and coding feedback."}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Mail className="w-4 h-4" /></span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => alert("Password reset link has been dispatched to email.")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Lock className="w-4 h-4" /></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    role === "candidate"
                      ? "bg-blue-600/10 border-blue-500 text-blue-400 shadow-md shadow-blue-500/5"
                      : "border-slate-800 hover:border-slate-700 bg-transparent text-slate-400"
                  }`}
                >
                  <User className="w-4 h-4" /> Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    role === "recruiter"
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/5"
                      : "border-slate-800 hover:border-slate-700 bg-transparent text-slate-400"
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Recruiter
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isRegister ? "Create Account" : "Sign In"} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{" "}
              <button onClick={() => setIsRegister(false)} className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to InterviewAce?{" "}
              <button onClick={() => setIsRegister(true)} className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
