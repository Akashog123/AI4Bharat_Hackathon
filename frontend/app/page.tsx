import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Globe2, BookOpen, Briefcase, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-400/10 blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            सहज <span className="text-sm font-medium text-slate-500 ml-1">Sahaj</span>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-white/50 border border-slate-200 backdrop-blur-sm text-sm font-medium text-slate-600 shadow-sm">
          AI4Bharat Hackathon
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto z-10 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
          <Zap className="w-4 h-4" /> Powering India's Workforce
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
          Your Voice-First <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
            Career Counselor
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl leading-relaxed">
          Discover your skills, find free courses, prepare for interviews, and
          get matched with jobs — all through a simple voice conversation.
        </p>

        <p className="text-lg text-indigo-600 font-medium mb-12 flex items-center gap-2 bg-indigo-50 px-6 py-2 rounded-full border border-indigo-100">
          <Globe2 className="w-5 h-5" /> Supports 22 Indian languages. No app download needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <Link href="/app" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-7 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30 border border-white/10 group">
              <Mic className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Start Counseling
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            { value: "22", label: "Languages", icon: <Globe2 className="w-5 h-5 text-blue-500 mb-2 opacity-70" /> },
            { value: "100+", label: "Free Courses", icon: <BookOpen className="w-5 h-5 text-indigo-500 mb-2 opacity-70" /> },
            { value: "50+", label: "Job Listings", icon: <Briefcase className="w-5 h-5 text-violet-500 mb-2 opacity-70" /> },
            { value: "5min", label: "To Get Started", icon: <Zap className="w-5 h-5 text-fuchsia-500 mb-2 opacity-70" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/60 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center">
              {stat.icon}
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-500 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-sm font-medium text-slate-400 z-10">
        Powered by <span className="text-slate-600">Sarvam AI + Claude</span> | Built for <span className="text-slate-600">AI4Bharat Hackathon</span>
      </footer>
    </div>
  );
}
