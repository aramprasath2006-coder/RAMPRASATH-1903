import React, { useState } from "react";
import { CivicIssue } from "../types";

interface DemoSimulationPanelProps {
  issues: CivicIssue[];
  onRefreshIssues: () => void;
  onToggleUserRole: () => void;
  userRole: string;
}

export const DemoSimulationPanel: React.FC<DemoSimulationPanelProps> = ({
  issues,
  onRefreshIssues,
  onToggleUserRole,
  userRole,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [actionLog, setActionLog] = useState<string | null>(null);

  const handleSimulateBreach = async () => {
    try {
      setActionLog("Simulating SLA Breach & Auto Escalation...");
      const res = await fetch("/api/demo/simulate-breach", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActionLog("🚨 SLA Breach Simulated! Issue #CIV-2026-000184 Auto-Escalated.");
        onRefreshIssues();
      }
    } catch (err) {
      setActionLog("Failed to simulate breach");
    }
  };

  const handleSimulateProofUpload = async () => {
    if (issues.length === 0) return;
    const target = issues[0];
    try {
      setActionLog("Uploading Officer Proof Photos...");
      const res = await fetch(`/api/issues/${target.id}/action-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beforeImageUrl: target.imageUrl,
          afterImageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
          remarks: "DEMO PROOF: Asphalt laying and pavement compaction completed on-site.",
          officerName: "Officer S. Murugan (Field Inspector)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionLog("📸 Resolution Proof Uploaded! Ticket status set to 'Awaiting Citizen Verification'.");
        onRefreshIssues();
      }
    } catch (err) {
      setActionLog("Failed to simulate proof");
    }
  };

  const handleSimulateCitizenVerify = async () => {
    if (issues.length === 0) return;
    const target = issues[0];
    try {
      setActionLog("Simulating Citizen Verification...");
      const res = await fetch(`/api/issues/${target.id}/citizen-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verified: true,
          feedback: "DEMO VERIFICATION: Work verified satisfactory by citizen.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionLog("👍 Citizen Verified & Ticket Closed!");
        onRefreshIssues();
      }
    } catch (err) {
      setActionLog("Failed to verify");
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 right-4 z-50 bg-orange-600 text-black font-black text-xs uppercase px-3 py-2 rounded-full shadow-2xl border border-white/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-sm">tune</span>
        Demo Control Bar
      </button>
    );
  }

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 z-50 w-80 sm:w-96 glass-card rounded-2xl p-4 shadow-2xl border-2 border-orange-500/50 text-white animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/15">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
          <span className="font-black text-xs uppercase tracking-wider text-orange-400">
            Presentation / Demo Mode Control Panel
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white/60 hover:text-white p-1 rounded"
        >
          <span className="material-symbols-outlined text-base">minimize</span>
        </button>
      </div>

      <p className="text-[10px] text-white/70 mb-3 leading-tight">
        Test the complete Government Accountability Engine in 1 click for judges and live demonstration.
      </p>

      {actionLog && (
        <div className="mb-3 p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-[10px] text-orange-200 font-bold">
          {actionLog}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <button
          onClick={handleSimulateBreach}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 p-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer text-left flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm shrink-0">alarm_off</span>
          1. SLA Breach & Escalations
        </button>

        <button
          onClick={handleSimulateProofUpload}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 p-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer text-left flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm shrink-0">verified</span>
          2. Upload Resolution Proof
        </button>

        <button
          onClick={handleSimulateCitizenVerify}
          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 p-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer text-left flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
          3. Citizen Re-Verification
        </button>

        <button
          onClick={onToggleUserRole}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 p-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer text-left flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm shrink-0">swap_horiz</span>
          Role: {userRole}
        </button>
      </div>
    </div>
  );
};
