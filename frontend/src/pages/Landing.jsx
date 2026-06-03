import React from "react";
import { Link } from "react-router-dom";
import { Cpu, Target, Shield, ArrowRight, Video, Code, Award, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 overflow-x-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Landing Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto flex items-center justify-between border-b border-slate-900/60 sticky top-0 bg-[#070b13]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg text-white font-black text-xs">IA</span>
          <span className="text-white">Interview<span className="text-blue-500">Ace</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-all duration-150">Sign In</Link>
          <Link to="/login?mode=signup" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
          <Cpu className="w-3.5 h-3.5 animate-pulse" /> Advanced AI Interview Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Ace Your Next Interview with <br />
          <span className="text-gradient">Real-Time AI Coaching</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
          InterviewAce simulates technical and behavioral interviews, parses resumes to generate custom questions, evaluates coding solutions, and guides you with structured AI feedback.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login?mode=signup" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 shadow-xl shadow-blue-500/20 w-full sm:w-auto justify-center group">
            Start Free Mock Interview <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="glass-panel text-slate-300 hover:text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 w-full sm:w-auto hover:bg-slate-800/40">
            Learn More
          </a>
        </div>

        {/* Product mock layout */}
        <div className="mt-16 glass-panel p-2 rounded-2xl max-w-5xl mx-auto shadow-2xl shadow-indigo-500/5 border border-white/5 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-[12px] opacity-15 -z-10"></div>
          <div className="bg-[#0f172a]/95 rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 text-left">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4 text-emerald-400 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" /> AI Answer Evaluation Active
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">"Explain polymorphism in Java."</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Candidate: "Polymorphism means many forms. It allows us to perform a single action in different ways. In Java, it can be compile-time (overloading) or runtime (overriding)..."
              </p>
              <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-500/20">
                <span className="text-xs font-semibold text-blue-400 block mb-1">AI Evaluation - Score: 8.5/10</span>
                <span className="text-xs text-slate-400">Strengths: Clear explanation of compile-time and runtime differentiation.</span>
              </div>
            </div>
            <div className="flex-1 w-full flex flex-col gap-4">
              <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400"><Cpu className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-bold text-white">ATS Resume Scoring</h4>
                  <p className="text-xs text-slate-400">Instantly score and align your resume keywords.</p>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400"><Code className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-bold text-white">Compiler Workspace</h4>
                  <p className="text-xs text-slate-400">Code in Python, Java, C++ with time & space review.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto border-t border-slate-900/60">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">Everything You Need to Ace Placements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-2xl hover:border-blue-500/30 transition-all duration-300">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit mb-6"><Video className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold mb-3 text-white">Voice & Text Simulators</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Integrate Speech-to-Text and Text-to-Speech in Mock Mode. Verbalize responses, record audio, and get tested natively.
            </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-6"><Code className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold mb-3 text-white">Compiler & Sandbox</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Run and validate code against dynamic test cases. Get algorithmic complexity reviews automatically.
            </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl hover:border-emerald-500/30 transition-all duration-300">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-6"><Award className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold mb-3 text-white">Placement Roadmap</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Receive structured week-by-week study milestones targeting your weak topics, optimized by AI.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-900/60 text-center text-slate-500 text-sm max-w-7xl mx-auto">
        &copy; {new Date().getFullYear()} InterviewAce. Built for hackathons, placements, and portfolios.
      </footer>
    </div>
  );
}
