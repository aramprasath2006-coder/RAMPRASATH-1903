import React, { useState } from "react";
import { CivicIssue, UserProfile } from "../types";
import { SLACountdownBadge } from "./SLACountdownBadge";
import { ESCALATION_ROLES } from "../utils/slaEngine";
import { InteractiveTimeline } from "./InteractiveTimeline";

interface ComplaintTrackingModalProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onCitizenVerify?: (issueId: string, verified: boolean, feedback?: string) => void;
  onOfficerUploadProof?: (issue: CivicIssue) => void;
  isOfficerRole?: boolean;
  user?: UserProfile;
  onRefreshIssues?: () => void;
}

export const ComplaintTrackingModal: React.FC<ComplaintTrackingModalProps> = ({
  issue,
  onClose,
  onCitizenVerify,
  onOfficerUploadProof,
  isOfficerRole = false,
  user,
  onRefreshIssues,
}) => {
  const [reopenFeedback, setReopenFeedback] = useState("");
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showClosureForm, setShowClosureForm] = useState(false);
  const [closureRemarks, setClosureRemarks] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [closureError, setClosureError] = useState<string | null>(null);

  if (!issue) return null;

  const activeRole = user?.role || "admin";
  const userDept = user?.department || "All Departments";

  const isAdmin = activeRole === "admin";
  const isMatchingDeptHead =
    (activeRole === "official" || activeRole === "admin") &&
    (!userDept || userDept === "All Departments" || userDept.toLowerCase() === issue.department.toLowerCase());

  const canCloseComplaint = isAdmin || isMatchingDeptHead;

  const handleCloseComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsClosing(true);
    setClosureError(null);

    try {
      const res = await fetch(`/api/issues/${issue.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: activeRole,
          department: userDept,
          closedBy: user?.name ? `${user.name} (${isAdmin ? 'Admin' : 'Department Head'})` : (isAdmin ? "State Admin Authority" : `Department Head (${issue.department})`),
          closureRemarks: closureRemarks || "Complaint officially verified and closed by authorized authority.",
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onRefreshIssues) onRefreshIssues();
        onClose();
      } else {
        setClosureError(data.error || "Failed to close complaint.");
      }
    } catch (err: any) {
      setClosureError("Network error while closing complaint.");
    } finally {
      setIsClosing(false);
    }
  };

  const escalationRoleInfo = ESCALATION_ROLES[issue.escalationLevel || 0];

  const handleVerifySuccess = () => {
    if (!onCitizenVerify) return;
    setIsVerifying(true);
    setTimeout(() => {
      onCitizenVerify(issue.id, true, "Verified fixed on-site by citizen.");
      setIsVerifying(false);
    }, 300);
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCitizenVerify || !reopenFeedback.trim()) return;

    setIsVerifying(true);
    setTimeout(() => {
      onCitizenVerify(issue.id, false, reopenFeedback);
      setIsVerifying(false);
      setShowReopenForm(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-2xl rounded-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative border border-white/20 text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer border border-white/10"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Header Badges */}
        <div className="pr-10 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono">
              #{issue.ticketId || issue.id}
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                issue.priority === "CRITICAL" || issue.priority === "EMERGENCY"
                  ? "bg-red-500/20 text-red-400 border-red-500/40"
                  : issue.priority === "HIGH"
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/40"
              }`}
            >
              {issue.priority} Priority ({issue.priorityScore}/100)
            </span>

            <SLACountdownBadge slaDeadline={issue.slaDeadline} slaBreached={issue.slaBreached} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">{issue.title}</h2>
          <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-orange-400">location_on</span>
            {issue.locationName}
          </p>
        </div>

        {/* SLA Breach / Escalation Alert Banner */}
        {issue.slaBreached && (
          <div className="mb-4 p-4 rounded-2xl bg-red-500/20 border-2 border-red-500/50 flex items-start gap-3 animate-pulse">
            <span className="material-symbols-outlined text-red-400 text-2xl shrink-0 mt-0.5">
              emergency_home
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">
                🚨 SLA DEADLINE BREACHED — AUTOMATICALLY ESCALATED
              </span>
              <p className="text-xs text-white/90 mt-0.5 font-medium leading-relaxed">
                This complaint was automatically escalated to <strong>{escalationRoleInfo.title}</strong> due to SLA deadline expiration. Action priority elevated.
              </p>
            </div>
          </div>
        )}

        {/* Assigned Department & Escalation Level Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-white/50 font-bold uppercase tracking-widest text-[9px] block">
              Responsible Department
            </span>
            <span className="font-black text-white text-sm block mt-1">
              {issue.department}
            </span>
            <span className="text-[10px] text-white/60 mt-0.5 block">
              Assigned: {issue.assignedOfficer || "Field Officer"}
            </span>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-white/50 font-bold uppercase tracking-widest text-[9px] block">
              Accountability Escalation Authority
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${escalationRoleInfo.badgeColor}`}>
                Level {issue.escalationLevel || 0}
              </span>
              <span className="font-extrabold text-white text-xs truncate">
                {escalationRoleInfo.officerRole}
              </span>
            </div>
          </div>
        </div>

        {/* BEFORE & AFTER PROOF INSPECTOR (if action proof exists) */}
        {issue.actionProof ? (
          <div className="mb-5 bg-black/60 p-4 rounded-2xl border border-emerald-500/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">verified</span>
                Government Officer Action Proof Uploaded
              </span>
              <span className="text-[10px] text-white/50">
                {new Date(issue.actionProof.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="relative rounded-xl overflow-hidden border border-white/15 h-36 bg-black">
                <img
                  src={issue.actionProof.beforeImageUrl || issue.imageUrl}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-red-500/90 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">
                  Before (Issue)
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 h-36 bg-black">
                <img
                  src={issue.actionProof.afterImageUrl}
                  alt="After"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-emerald-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded">
                  After (Resolved)
                </span>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl text-xs text-white/90">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">
                Officer Remarks ({issue.actionProof.officerName}):
              </span>
              <p className="italic font-medium text-white/80">"{issue.actionProof.remarks}"</p>
            </div>
          </div>
        ) : issue.imageUrl ? (
          <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/15 h-48 bg-black">
            <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 bg-black/80 text-orange-400 border border-orange-500/30 text-[9px] font-black uppercase px-2.5 py-1 rounded">
              Citizen Complaint Evidence Photo
            </span>
          </div>
        ) : null}

        {/* CITIZEN RE-VERIFICATION ACTION BOX */}
        {issue.status === "Awaiting Citizen Verification" && onCitizenVerify && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <div className="flex items-start gap-3 mb-3">
              <span className="material-symbols-outlined text-emerald-400 text-2xl shrink-0 mt-0.5">
                rate_review
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Citizen Re-verification Requested
                </h3>
                <p className="text-xs text-white/80 mt-0.5 leading-relaxed">
                  The assigned government officer marked this complaint as fixed and submitted proof photos above. Please confirm whether the issue has actually been fixed to your satisfaction.
                </p>
              </div>
            </div>

            {!showReopenForm ? (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleVerifySuccess}
                  disabled={isVerifying}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  👍 Yes, Issue Resolved Completely
                </button>

                <button
                  onClick={() => setShowReopenForm(true)}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">cancel</span>
                  👎 Not Resolved (Reopen Ticket)
                </button>
              </div>
            ) : (
              <form onSubmit={handleReopenSubmit} className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="block text-red-300 font-bold text-[10px] uppercase mb-1">
                    Explain why the issue is not fixed (Reopen Reason):
                  </label>
                  <textarea
                    rows={2}
                    value={reopenFeedback}
                    onChange={(e) => setReopenFeedback(e.target.value)}
                    placeholder="e.g., Pothole was filled poorly and came undone in rain / Streetlight is still flickering..."
                    className="w-full bg-black/60 border border-red-500/50 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-400"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReopenForm(false)}
                    className="px-4 bg-white/10 text-white font-bold rounded-xl py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs rounded-xl py-2 shadow-lg"
                  >
                    Confirm Reopen Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* INTERACTIVE STATE TRANSITION TIMELINE */}
        <div className="mb-5">
          <InteractiveTimeline issue={issue} />
        </div>

        {/* Officer Action Button */}
        {isOfficerRole && onOfficerUploadProof && issue.status !== "Resolved" && (
          <div className="mb-4">
            <button
              onClick={() => onOfficerUploadProof(issue)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_a_photo</span>
              Upload Resolution Proof & Request Citizen Verification
            </button>
          </div>
        )}

        {/* ADMIN & DEPARTMENT HEAD COMPLAINT CLOSURE CONTROL */}
        {issue.status !== "Closed" && (
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 mb-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-xl">gavel</span>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Complaint Closure Authority
                  </h4>
                  <p className="text-[10px] text-white/60">
                    Restricted: Only Admin or Head of <span className="text-emerald-400 font-bold">{issue.department}</span> can close this complaint.
                  </p>
                </div>
              </div>

              {canCloseComplaint ? (
                <span className="self-start sm:self-auto bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified_user</span>
                  {isAdmin ? "System Admin Authorized" : "Dept Head Authorized"}
                </span>
              ) : (
                <span className="self-start sm:self-auto bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">lock</span>
                  Closure Restricted
                </span>
              )}
            </div>

            {canCloseComplaint ? (
              !showClosureForm ? (
                <button
                  type="button"
                  onClick={() => setShowClosureForm(true)}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Close Complaint & Sign Off Ticket (Admin / Dept Head)
                </button>
              ) : (
                <form onSubmit={handleCloseComplaintSubmit} className="mt-3 pt-3 border-t border-white/10 space-y-3">
                  <div className="text-xs font-bold text-white">
                    Official Sign-Off & Closure Remarks
                  </div>

                  <textarea
                    value={closureRemarks}
                    onChange={(e) => setClosureRemarks(e.target.value)}
                    placeholder="Enter final closure audit remarks (e.g. On-site inspection verified by Executive Engineer. Work complete.)..."
                    className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 min-h-[70px]"
                    required
                  />

                  {closureError && (
                    <div className="text-[11px] text-red-400 font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                      {closureError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowClosureForm(false)}
                      className="px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl py-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isClosing}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl py-2 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">lock_person</span>
                      {isClosing ? "Signing Off & Closing..." : "Confirm & Close Complaint"}
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="mt-2 text-[10px] text-white/50 bg-black/40 p-2.5 rounded-xl border border-white/5">
                🔒 You are currently viewing as <span className="text-orange-400 font-bold">{user?.role === "citizen" ? "Citizen" : "Field Officer"}</span> ({user?.department || "General"}). To close this complaint, switch your persona to <span className="text-emerald-400 font-bold">System Admin</span> or <span className="text-emerald-400 font-bold">Head of {issue.department}</span> in the Admin Command Center.
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer border border-white/10"
        >
          Close Ticket View
        </button>
      </div>
    </div>
  );
};
