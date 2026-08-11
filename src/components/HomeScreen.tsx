import React from "react";
import { NavigationTab } from "../types";

interface HomeScreenProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 pb-24 md:pb-12 max-w-[1440px] mx-auto w-full relative z-10">
      {/* Hero Section */}
      <section className="px-4 sm:px-8 pt-10 pb-12 relative overflow-hidden">
        <div className="flex flex-col items-center text-center gap-5 z-10 relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 backdrop-blur-md">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span className="font-bold text-xs uppercase tracking-[0.2em]">AI-Powered Civic Intelligence</span>
          </div>

          <h1 className="font-black text-4xl sm:text-6xl text-white tracking-tight leading-none">
            Turn Civic Problems Into <span className="text-gradient-orange">Government Action</span>.
          </h1>

          <p className="text-white/70 text-base sm:text-lg max-w-xl leading-relaxed">
            Civic Action AI uses Artificial Intelligence to analyze public complaints, detect civic issues, and automatically route citizens to the right municipal team.
          </p>

          <div className="flex flex-col sm:flex-row w-full max-w-md gap-3.5 mt-2">
            <button
              onClick={() => onNavigate("report")}
              className="bg-orange-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-[0.15em] py-4 px-6 rounded-full w-full flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(249,115,22,0.4)] hover:bg-orange-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Report a Civic Issue
            </button>

            <button
              onClick={() => onNavigate("map")}
              className="bg-white/5 backdrop-blur-md text-white border border-white/20 font-bold text-xs sm:text-sm uppercase tracking-[0.15em] py-4 px-6 rounded-full w-full flex items-center justify-center gap-2 hover:bg-white/10 hover:border-orange-500/50 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">map</span>
              View Live Civic Map
            </button>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="mt-12 relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 max-w-4xl mx-auto group glass-card">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none"></div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuARVbYeYYJIsFogar6F1gDfV249dQh_ulQcHiVpf-nu8s1xon_C0v7awA9sEUvtKpDoaFEJ4U-Oj51iudElewR7ne2lWV2oyeutzGlIjgEAWaUVDOyTyWhrdD04NkcVP1-1W22oD7flrrOGw2QEiRWzD7LebZ5iiroNi_0ZSIGAuaws_vtK5LS96QCQ5QITNZJbt5scLcDXRr0fWgUPqc-hCorU0nxOk3NBz4kgbeoG8NAo54T2epzL"
            alt="Civic Map Preview"
            className="w-full h-[300px] sm:h-[420px] object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-90"
          />

          <div className="absolute bottom-6 left-6 z-20 glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-2xl border border-white/20 max-w-xs sm:max-w-sm">
            <span className="material-symbols-outlined text-orange-400 bg-orange-500/20 p-3 rounded-xl text-2xl animate-pulse">
              warning
            </span>
            <div>
              <p className="text-[10px] font-extrabold text-orange-400 uppercase tracking-[0.2em] mb-0.5">
                High Priority Alert
              </p>
              <p className="text-sm sm:text-base font-bold text-white">
                Water Main Break Detected
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
          <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col items-center text-center border border-white/10">
            <span className="text-3xl sm:text-4xl font-black text-orange-400">12.5k+</span>
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider mt-1">
              Complaints Analyzed
            </span>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col items-center text-center border border-white/10">
            <span className="text-3xl sm:text-4xl font-black text-orange-400">8.9k+</span>
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider mt-1">
              Issues Resolved
            </span>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col items-center text-center col-span-2 sm:col-span-1 border border-white/10">
            <span className="text-3xl sm:text-4xl font-black text-orange-400">92%</span>
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider mt-1">
              AI Accuracy
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 sm:px-8 py-12 my-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">How It Works</h2>
            <p className="text-xs sm:text-sm text-white/60 uppercase tracking-[0.2em] mt-2 font-medium">
              Automated workflow from report to municipal resolution
            </p>
          </div>

          <div className="flex flex-col gap-4 relative">
            {/* Vertical Connecting Line */}
            <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-orange-500 via-orange-500/30 to-blue-500/20"></div>

            {/* Step 1 */}
            <div className="flex gap-4 relative z-10 items-start">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-black flex items-center justify-center shrink-0 font-black text-base shadow-[0_0_12px_rgba(249,115,22,0.5)]">
                1
              </div>
              <div className="glass-card p-5 rounded-2xl flex-1 hover:border-orange-500/40 transition-colors">
                <h3 className="font-extrabold text-white text-base uppercase tracking-wider">Report</h3>
                <p className="text-sm text-white/70 mt-1">
                  Citizen submits a photo, title, and location description.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 relative z-10 items-start">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-black flex items-center justify-center shrink-0 font-black text-base shadow-[0_0_12px_rgba(249,115,22,0.5)]">
                2
              </div>
              <div className="glass-card p-5 rounded-2xl flex-1 hover:border-orange-500/40 transition-colors">
                <h3 className="font-extrabold text-white text-base uppercase tracking-wider">AI Analyze</h3>
                <p className="text-sm text-white/70 mt-1">
                  Multimodal Gemini vision & NLP extract severity, hazard level, and issue details.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 relative z-10 items-start">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 font-extrabold text-base border border-white/20">
                3
              </div>
              <div className="glass-card p-5 rounded-2xl flex-1">
                <h3 className="font-extrabold text-white text-base uppercase tracking-wider">Prioritize</h3>
                <p className="text-sm text-white/70 mt-1">
                  System ranks civic issues by priority score, safety risk, and community impact.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 relative z-10 items-start">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 font-extrabold text-base border border-white/20">
                4
              </div>
              <div className="glass-card p-5 rounded-2xl flex-1">
                <h3 className="font-extrabold text-white text-base uppercase tracking-wider">Route</h3>
                <p className="text-sm text-white/70 mt-1">
                  Complaint is automatically routed to the correct department with recommended actions.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4 relative z-10 items-start">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 font-extrabold text-base border border-white/20">
                5
              </div>
              <div className="glass-card p-5 rounded-2xl flex-1">
                <h3 className="font-extrabold text-white text-base uppercase tracking-wider">Resolve</h3>
                <p className="text-sm text-white/70 mt-1">
                  Municipal team dispatches workers and updates the citizen with live status tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities & Supported Issues Section */}
      <section className="px-4 sm:px-8 py-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">AI Capabilities</h2>
          <p className="text-xs sm:text-sm text-white/60 uppercase tracking-[0.2em] mt-1 font-medium">
            Powered by Google Gemini multimodal intelligence
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-orange-500 hover:translate-y-[-2px] transition-transform">
            <span className="material-symbols-outlined text-orange-400 mb-2 text-3xl">
              visibility
            </span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Computer Vision</h3>
          </div>

          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-orange-500 hover:translate-y-[-2px] transition-transform">
            <span className="material-symbols-outlined text-orange-400 mb-2 text-3xl">
              forum
            </span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">NLP Analysis</h3>
          </div>

          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-orange-500 hover:translate-y-[-2px] transition-transform">
            <span className="material-symbols-outlined text-orange-400 mb-2 text-3xl">
              priority_high
            </span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Priority Prediction</h3>
          </div>

          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-orange-500 hover:translate-y-[-2px] transition-transform">
            <span className="material-symbols-outlined text-orange-400 mb-2 text-3xl">
              content_copy
            </span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Duplicate Detection</h3>
          </div>
        </div>

        {/* Supported Issues */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
          <h3 className="font-extrabold text-lg text-white uppercase tracking-wider mb-4">Supported Civic Categories</h3>
          <div className="flex flex-wrap gap-2.5">
            {[
              "Potholes",
              "Garbage & Refuse",
              "Water Leakage",
              "Streetlights",
              "Vandalism & Graffiti",
              "Traffic Signals",
              "Fallen Trees",
              "Drainage Clogs",
              "+ More",
            ].map((tag, idx) => (
              <span
                key={idx}
                className="bg-white/5 text-white/80 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-orange-500 hover:text-orange-400 transition-colors cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Content */}
      <footer className="px-4 py-10 text-center glass-panel mt-12 rounded-t-3xl max-w-4xl mx-auto border-t border-white/10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center font-bold text-black text-xs italic">
            C
          </div>
          <span className="text-xl font-extrabold tracking-widest uppercase text-white">
            Civic<span className="text-orange-500">AI</span>
          </span>
        </div>
        <p className="text-xs text-white/60 uppercase tracking-widest">AI for Smarter, Safer Cities.</p>
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-widest">© 2026 Civic Action Initiative</p>
        </div>
      </footer>
    </div>
  );
};
