import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import MockInterview from "./pages/MockInterview";
import CodingInterview from "./pages/CodingInterview";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Recruiter from "./pages/Recruiter";
import { RefreshCw } from "lucide-react";

// Authenticated private route wrapper
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "recruiter" ? "/recruiter" : "/dashboard"} replace />;
  }

  return children;
};

function NavigationLayout() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute allowedRoles={["candidate"]}><Dashboard /></PrivateRoute>} />
          <Route path="/resume" element={<PrivateRoute allowedRoles={["candidate"]}><ResumeAnalyzer /></PrivateRoute>} />
          <Route path="/interview" element={<PrivateRoute allowedRoles={["candidate"]}><MockInterview /></PrivateRoute>} />
          <Route path="/coding" element={<PrivateRoute allowedRoles={["candidate"]}><CodingInterview /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute allowedRoles={["candidate"]}><Analytics /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/recruiter" element={<PrivateRoute allowedRoles={["recruiter"]}><Recruiter /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NavigationLayout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
