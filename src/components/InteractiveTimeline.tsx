import React, { useState, useMemo } from "react";
import { CivicIssue, ActivityLog, IssueStatus } from "../types";

interface InteractiveTimelineProps {
  issue: CivicIssue;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ issue }) => {
  const [filterType, setFilterType] = useState<"all" | "transitions" | "officer" | "escalation">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("oldest");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [activeStepFilter, setActiveStepFilter] = useState<string | null>(null);

  // Standard Lifecycle Stages for State Transition Pipeline
  const PIPELINE_STAGES: { id: string; label: string; statuses: IssueStatus[]; icon: string }[] = [
    {
      id: "submitted",
      label: "Submitted",
      statuses: ["Submitted", "Pending"],
      icon: "assignment_late",
    },
    {
      id: "assigned",
      label: "AI Analyzed & Assigned",
      statuses: ["AI Analyzed", "Assigned"],
      icon: "smart_toy",
    },
    {
      id: "in_progress",
      label: "Action Taken",
      statuses: ["In Progress", "Action Taken", "Escalated", "Reopened"],
      icon: "engineering",
    },
    {
      id: "verification",
      label: "Citizen Verification",
      statuses: ["Awaiting Citizen Verification"],
      icon: "rate_review",
    },
    {
      id: "resolved",
      label: "Resolved",
      statuses: ["Resolved", "Closed"],
      icon: "check_circle",
    },
  ];

  // Helper to determine active step index based on current issue status
  const currentStepIndex = useMemo(() => {
    const s = issue.status;
    if (s === "Resolved" || s === "Closed") return 4;
    if (s === "Awaiting Citizen Verification") return 3;
    if (s === "In Progress" || s === "Action Taken" || s === "Escalated" || s === "Reopened") return 2;
    if (s === "Assigned" || s === "AI Analyzed") return 1;
    return 0;
  }, [issue.status]);

  // Generate / Normalize Activity Logs with State Transitions
  const processedLogs = useMemo(() => {
    let rawLogs: ActivityLog[] = issue.activityLogs && issue.activityLogs.length > 0 ? [...issue.activityLogs] : [];

    // Fallback: If no logs exist, synthesize state transitions from issue metadata
    if (rawLogs.length === 0) {
      const createdTime = issue.timestamp || Date.now() - 24 * 3600 * 1000;
      rawLogs.push({
        id: "synth-log-1",
        action: "COMPLAINT REGISTERED",
        actor: issue.reporter || "Citizen",
        timestamp: createdTime,
        newStatus: "Submitted",
        notes: `Ticket #${issue.ticketId || issue.id} logged with ${issue.priority} Priority.`,
      });

      if (issue.department) {
        rawLogs.push({
          id: "synth-log-2",
          action: "SMART DEPARTMENT ROUTING",
          actor: "Civic Action AI Engine",
          timestamp: createdTime + 180000,
          oldStatus: "Submitted",
          newStatus: "Assigned",
          notes: `Analyzed and routed to ${issue.department}. Priority Score: ${issue.priorityScore}/100.`,
        });
      }

      if (issue.actionProof) {
        rawLogs.push({
          id: "synth-log-3",
          action: "RESOLUTION PROOF SUBMITTED",
          actor: issue.actionProof.officerName || "Assigned Officer",
          timestamp: issue.actionProof.submittedAt || Date.now() - 3600 * 1000,
          oldStatus: "In Progress",
          newStatus: "Awaiting Citizen Verification",
          notes: `Before & After proof photos uploaded. Remarks: "${issue.actionProof.remarks}"`,
        });
      }

      if (issue.status === "Resolved") {
        rawLogs.push({
          id: "synth-log-4",
          action: "CITIZEN VERIFIED & RESOLVED",
          actor: "Citizen Verifier",
          timestamp: Date.now(),
          oldStatus: "Awaiting Citizen Verification",
          newStatus: "Resolved",
          notes: "Issue confirmed fixed on-site.",
        });
      }
    }

    // Sort by timestamp
    rawLogs.sort((a, b) => (sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));

    return rawLogs;
  }, [issue, sortOrder]);

  // Filter logs based on user controls
  const filteredLogs = useMemo(() => {
    return processedLogs.filter((log) => {
      // Step filter check
      if (activeStepFilter) {
        const logStatus = log.newStatus || log.oldStatus || "";
        if (activeStepFilter === "submitted" && !["Submitted", "Pending", ""].includes(logStatus)) {
          if (!log.action.toLowerCase().includes("register") && !log.action.toLowerCase().includes("created")) return false;
        }
        if (activeStepFilter === "assigned" && !["Assigned", "AI Analyzed"].includes(logStatus)) {
          if (!log.action.toLowerCase().includes("assign") && !log.action.toLowerCase().includes("rout")) return false;
        }
        if (activeStepFilter === "in_progress" && !["In Progress", "Action Taken", "Escalated", "Reopened"].includes(logStatus)) {
          if (!log.action.toLowerCase().includes("progress") && !log.action.toLowerCase().includes("escalat") && !log.action.toLowerCase().includes("reopen")) return false;
        }
        if (activeStepFilter === "verification" && !["Awaiting Citizen Verification"].includes(logStatus)) {
          if (!log.action.toLowerCase().includes("verify") && !log.action.toLowerCase().includes("proof")) return false;
        }
        if (activeStepFilter === "resolved" && !["Resolved", "Closed"].includes(logStatus)) {
          if (!log.action.toLowerCase().includes("resolve") && !log.action.toLowerCase().includes("close")) return false;
        }
      }

      // Filter type check
      if (filterType === "transitions") {
        if (!log.oldStatus && !log.newStatus) return false;
      } else if (filterType === "officer") {
        const actorLower = log.actor.toLowerCase();
        if (!actorLower.includes("officer") && !actorLower.includes("engineer") && !actorLower.includes("inspector") && !actorLower.includes("supervisor")) return false;
      } else if (filterType === "escalation") {
        const actionLower = log.action.toLowerCase();
        const notesLower = (log.notes || "").toLowerCase();
        if (!actionLower.includes("escalat") && !notesLower.includes("escalat") && !actionLower.includes("sla")) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchActor = log.actor.toLowerCase().includes(q);
        const matchNotes = (log.notes || "").toLowerCase().includes(q);
        const matchOld = (log.oldStatus || "").toLowerCase().includes(q);
        const matchNew = (log.newStatus || "").toLowerCase().includes(q);
        if (!matchAction && !matchActor && !matchNotes && !matchOld && !matchNew) return false;
      }

      return true;
    });
  }, [processedLogs, filterType, searchQuery, activeStepFilter]);

  // Helper to get actor icon & styling
  const getActorMeta = (actor: string, action: string) => {
    const actLower = actor.toLowerCase();
    const actionLower = action.toLowerCase();

    if (actLower.includes("ai") || actLower.includes("engine") || actLower.includes("civic")) {
      return {
        icon: "smart_toy",
        badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        nodeBg: "bg-purple-500 border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]",
      };
    }
    if (actLower.includes("citizen") || actLower.includes("reporter") || actionLower.includes("register")) {
      return {
        icon: "person",
        badgeBg: "bg-orange-500/20 text-orange-400 border-orange-500/40",
        nodeBg: "bg-orange-500 border-amber-300 shadow-[0_0_12px_rgba(249,115,22,0.5)]",
      };
    }
    if (actionLower.includes("escalat") || actLower.includes("sla")) {
      return {
        icon: "warning",
        badgeBg: "bg-red-500/20 text-red-400 border-red-500/40",
        nodeBg: "bg-red-500 border-red-300 shadow-[0_0_12px_rgba(239,68,68,0.6)]",
      };
    }
    if (actionLower.includes("proof") || actionLower.includes("resolve") || actionLower.includes("verify")) {
      return {
        icon: "verified",
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        nodeBg: "bg-emerald-500 border-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]",
      };
    }

    return {
      icon: "engineering",
      badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      nodeBg: "bg-blue-500 border-cyan-300 shadow-[0_0_12px_rgba(59,130,246,0.5)]",
    };
  };

  return (
    <div className="bg-black/50 p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-orange-400 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">timeline</span>
            Interactive Ticket Lifecycle & State Transition Timeline
          </h3>
          <p className="text-[11px] text-white/60 mt-0.5">
            Audit trail tracking state changes from submission to government resolution
          </p>
        </div>

        {/* Sort Toggle */}
        <button
          type="button"
          onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
          className="self-start sm:self-auto bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">swap_vert</span>
          <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
        </button>
      </div>

      {/* VISUAL STATE TRANSITION STEPPER BAR */}
      <div className="bg-white/5 p-3.5 sm:p-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
            Lifecycle Progress Flow
          </span>
          {activeStepFilter && (
            <button
              onClick={() => setActiveStepFilter(null)}
              className="text-[10px] font-bold text-orange-400 hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">clear</span>
              Reset Stage Filter
            </button>
          )}
        </div>

        {/* Pipeline Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStepIndex || issue.status === "Resolved";
            const isCurrent = idx === currentStepIndex && issue.status !== "Resolved";
            const isSelected = activeStepFilter === stage.id;

            let nodeClass = "bg-white/5 text-white/40 border-white/10";
            if (isCompleted) {
              nodeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
            } else if (isCurrent) {
              nodeClass = "bg-orange-500/30 text-orange-300 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-pulse";
            }

            if (isSelected) {
              nodeClass += " ring-2 ring-orange-400 scale-[1.02]";
            }

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStepFilter(activeStepFilter === stage.id ? null : stage.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${nodeClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="material-symbols-outlined text-base">
                    {isCompleted ? "check_circle" : stage.icon}
                  </span>
                  <span className="text-[9px] font-mono font-black opacity-60">
                    0{idx + 1}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold block truncate">
                    {stage.label}
                  </span>
                  <span className="text-[8px] font-medium opacity-60 block uppercase">
                    {isCompleted ? "Completed" : isCurrent ? "Active State" : "Pending"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              filterType === "all"
                ? "bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            All Logs ({processedLogs.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType("transitions")}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              filterType === "transitions"
                ? "bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            State Transitions
          </button>

          <button
            type="button"
            onClick={() => setFilterType("officer")}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              filterType === "officer"
                ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            Officer Work
          </button>

          <button
            type="button"
            onClick={() => setFilterType("escalation")}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              filterType === "escalation"
                ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            Escalations & SLA
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[180px]">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          )}
        </div>
      </div>

      {/* CHRONOLOGICAL TIMELINE STREAM */}
      <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-orange-500/80 before:via-blue-500/50 before:to-emerald-500/80">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const actorMeta = getActorMeta(log.actor, log.action);
            const isExpanded = selectedLogId === log.id;
            const logDate = new Date(log.timestamp);
            const timeAgo = formatTimeAgo(log.timestamp);

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLogId(isExpanded ? null : log.id)}
                className={`relative pl-9 transition-all cursor-pointer group`}
              >
                {/* Timeline Dot Node */}
                <div
                  className={`absolute left-2 top-2.5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${actorMeta.nodeBg} group-hover:scale-125`}
                ></div>

                {/* Log Card Body */}
                <div
                  className={`bg-white/5 hover:bg-white/10 border p-3.5 rounded-2xl transition-all ${
                    isExpanded ? "border-orange-500/50 bg-white/10 shadow-[0_0_15px_rgba(249,115,22,0.15)]" : "border-white/10"
                  }`}
                >
                  {/* Top Bar: Action Title & Time */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs sm:text-sm text-white tracking-wide">
                        {log.action}
                      </span>

                      {/* State Transition Pill */}
                      {(log.oldStatus || log.newStatus) && (
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-orange-300 border border-white/10">
                          {log.oldStatus && <span>{log.oldStatus}</span>}
                          {log.oldStatus && log.newStatus && (
                            <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                          )}
                          {log.newStatus && <span className="text-emerald-400 font-extrabold">{log.newStatus}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-mono">
                      <span>{logDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>•</span>
                      <span className="text-orange-400/90 font-bold">{timeAgo}</span>
                    </div>
                  </div>

                  {/* Log Notes */}
                  {log.notes && (
                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                      {log.notes}
                    </p>
                  )}

                  {/* Bottom Bar: Actor Badge & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${actorMeta.badgeBg}`}
                      >
                        <span className="material-symbols-outlined text-[11px]">
                          {actorMeta.icon}
                        </span>
                        {log.actor}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-white/40">
                        {logDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="material-symbols-outlined text-xs text-white/40 group-hover:text-orange-400 transition-colors">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </div>

                  {/* EXPANDABLE DETAILS METADATA */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs text-white/80 animate-in fade-in duration-150 bg-black/40 p-3 rounded-xl">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <span className="text-white/40 block font-bold uppercase">Log Entry ID</span>
                          <span className="font-mono text-white/90">{log.id}</span>
                        </div>

                        <div>
                          <span className="text-white/40 block font-bold uppercase">Timestamp</span>
                          <span className="font-mono text-white/90">{logDate.toISOString()}</span>
                        </div>

                        <div>
                          <span className="text-white/40 block font-bold uppercase">Ticket Priority</span>
                          <span className="text-orange-400 font-bold">{issue.priority} ({issue.priorityScore}/100)</span>
                        </div>
                      </div>

                      {log.notes && log.notes.includes("Before & After") && issue.actionProof && (
                        <div className="pt-2">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">
                            Resolution Proof Reference Attached
                          </span>
                          <div className="flex items-center gap-2">
                            <img
                              src={issue.actionProof.beforeImageUrl || issue.imageUrl}
                              alt="Before"
                              className="w-12 h-12 rounded-lg object-cover border border-white/20"
                            />
                            <span className="text-white/40 text-xs">➔</span>
                            <img
                              src={issue.actionProof.afterImageUrl}
                              alt="After"
                              className="w-12 h-12 rounded-lg object-cover border border-emerald-500/50"
                            />
                            <div className="text-[10px] text-white/70 italic">
                              Remarks: "{issue.actionProof.remarks}"
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="pl-9 py-6 text-center text-xs text-white/50 bg-white/5 rounded-2xl border border-white/10">
            <span className="material-symbols-outlined text-2xl text-white/30 block mb-1">
              search_off
            </span>
            No timeline logs match the selected filter or search query.
          </div>
        )}
      </div>
    </div>
  );
};

// Helper for relative time formatting
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
