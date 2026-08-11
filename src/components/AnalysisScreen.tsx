import React, { useEffect, useState } from "react";
import { AIAnalysisResult } from "../types";

interface AnalysisScreenProps {
  analysis: AIAnalysisResult;
  formData: {
    title: string;
    category: string;
    description: string;
    imageBase64?: string;
    locationName: string;
    lat: number;
    lng: number;
  };
  onSubmitComplaint: () => void;
  onEditReport: () => void;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  analysis,
  formData,
  onSubmitComplaint,
  onEditReport,
}) => {
  const [dashOffset, setDashOffset] = useState(283);

  useEffect(() => {
    // Animate circular gauge fill
    const circumference = 283;
    const offset = circumference - (analysis.priorityScore / 100) * circumference;
    const timer = setTimeout(() => {
      setDashOffset(offset);
    }, 150);
    return () => clearTimeout(timer);
  }, [analysis.priorityScore]);

  // Color for priority gauge & badge
  const getPriorityColor = (level: string) => {
    switch (level) {
      case "EMERGENCY":
        return { stroke: "#ef4444", bg: "bg-red-500/20 border-red-500/40", text: "text-red-400" };
      case "HIGH":
        return { stroke: "#f97316", bg: "bg-orange-500/20 border-orange-500/40", text: "text-orange-400" };
      case "MEDIUM":
        return { stroke: "#3b82f6", bg: "bg-blue-500/20 border-blue-500/40", text: "text-blue-400" };
      default:
        return { stroke: "#10b981", bg: "bg-emerald-500/20 border-emerald-500/40", text: "text-emerald-400" };
    }
  };

  const priorityStyle = getPriorityColor(analysis.priorityLevel);

  return (
    <main className="px-4 py-8 max-w-md mx-auto flex flex-col gap-5 pb-28 md:pb-12 w-full relative z-10">
      {/* Header */}
      <header className="flex flex-col items-center justify-center text-center mb-2">
        <div className="bg-orange-500/20 border border-orange-500/40 rounded-full p-4 mb-3 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
          <span
            className="material-symbols-outlined text-orange-400 text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase">
          AI Analysis Complete
        </h1>
        <p className="text-xs text-white/60 mt-1">
          Multimodal analysis synthesized for "{formData.title}"
        </p>
      </header>

      {/* Analysis Overview Card */}
      <section className="glass-card rounded-2xl p-6 relative overflow-hidden border border-white/10">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400 mb-4 relative z-10">
          Analysis Overview
        </h2>

        <div className="space-y-3 relative z-10">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <span className="text-xs text-white/60 font-semibold">Detected Issue</span>
            <span className="text-sm font-bold text-white">{analysis.detectedIssue}</span>
          </div>

          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <span className="text-xs text-white/60 font-semibold">Confidence Score</span>
            <span className="text-sm font-bold text-orange-400">{analysis.confidence}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-white/60 font-semibold">Recommended Dept.</span>
            <span className="text-sm font-bold text-white">{analysis.recommendedDept}</span>
          </div>
        </div>
      </section>

      {/* Civic Priority Score Card */}
      <section className="glass-card rounded-2xl p-6 flex flex-col items-center text-center border border-white/10">
        <h2 className="text-xs font-extrabold text-white/60 uppercase tracking-[0.2em] mb-5">
          Civic Priority Score
        </h2>

        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            ></circle>
            <circle
              className="circular-progress"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={priorityStyle.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              style={{ strokeDashoffset: dashOffset }}
            ></circle>
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className={`text-4xl font-black ${priorityStyle.text}`}>
              {analysis.priorityScore}
            </span>
            <span className="text-[10px] font-bold text-white/40">/100</span>
          </div>
        </div>

        <div
          className={`${priorityStyle.bg} ${priorityStyle.text} border px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase`}
        >
          {analysis.priorityLevel}
        </div>
      </section>

      {/* Breakdown Card */}
      <section className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400 mb-4">Risk Breakdown</h3>

        <div className="space-y-4 mb-5">
          {/* Severity */}
          <div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-white/60 font-semibold uppercase tracking-wider">Severity</span>
              <span className="text-white font-bold">{analysis.severity}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                style={{ width: `${analysis.severity}%` }}
              ></div>
            </div>
          </div>

          {/* Public Impact */}
          <div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-white/60 font-semibold uppercase tracking-wider">Public Impact</span>
              <span className="text-white font-bold">{analysis.publicImpact}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                style={{ width: `${analysis.publicImpact}%` }}
              ></div>
            </div>
          </div>

          {/* Safety Risk */}
          <div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-white/60 font-semibold uppercase tracking-wider">Safety Risk</span>
              <span className="text-white font-bold">{analysis.safetyRisk}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                style={{ width: `${analysis.safetyRisk}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 p-4 rounded-xl border border-white/10 flex items-start gap-3">
          <span className="material-symbols-outlined text-orange-400 text-xl mt-0.5">
            lightbulb
          </span>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            {analysis.recommendation}
          </p>
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-col gap-3 mt-2">
        <button
          onClick={onSubmitComplaint}
          className="w-full bg-orange-500 text-black font-extrabold text-xs uppercase tracking-[0.15em] py-4 rounded-xl shadow-[0_0_24px_rgba(249,115,22,0.4)] flex justify-center items-center gap-2 hover:bg-orange-400 active:scale-[0.99] transition-all cursor-pointer"
        >
          Submit Complaint
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>

        <button
          onClick={onEditReport}
          className="w-full bg-white/5 border border-white/20 text-white font-bold text-xs uppercase tracking-[0.15em] py-3.5 rounded-xl flex justify-center items-center hover:bg-white/10 transition-colors cursor-pointer"
        >
          Edit Report
        </button>
      </section>
    </main>
  );
};
