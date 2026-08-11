import React from "react";
import { CivicIssue } from "../types";

interface IssueDetailModalProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: "In Progress" | "Pending" | "Resolved") => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onUpdateStatus,
}) => {
  if (!issue) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative border border-white/20">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer border border-white/10"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Issue Header */}
        <div className="pr-10 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              #{issue.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                issue.priority === "EMERGENCY"
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-orange-500/20 text-orange-400 border-orange-500/30"
              }`}
            >
              {issue.priority} Priority
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-wide">{issue.title}</h2>
          <p className="text-xs text-white/60 mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-orange-400">location_on</span>
            {issue.locationName}
          </p>
        </div>

        {/* Photo Evidence */}
        {issue.imageUrl && (
          <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/10 h-48 sm:h-56">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/80 border border-white/10 text-orange-400 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-md">
              Verified Evidence Photo
            </div>
          </div>
        )}

        {/* Issue Description */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/10 mb-4">
          <h3 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">
            Citizen Description
          </h3>
          <p className="text-xs text-white/80 leading-relaxed font-medium">{issue.description}</p>
        </div>

        {/* AI Analysis & Department Routing Info */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-white/50 font-bold uppercase tracking-widest text-[9px] block">
              Assigned Department
            </span>
            <span className="font-extrabold text-white text-sm block mt-0.5">
              {issue.department}
            </span>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-white/50 font-bold uppercase tracking-widest text-[9px] block">
              Civic Priority Score
            </span>
            <span className="font-extrabold text-orange-400 text-sm block mt-0.5">
              {issue.priorityScore} / 100
            </span>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl mb-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-orange-400 text-xl mt-0.5">smart_toy</span>
          <div>
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">
              AI Action Recommendation
            </span>
            <p className="text-xs text-white/80 mt-0.5 leading-relaxed font-medium">
              {issue.recommendation}
            </p>
          </div>
        </div>

        {/* Action controls */}
        {onUpdateStatus && (
          <div className="flex gap-2 pt-2 border-t border-white/10">
            {issue.status !== "Resolved" && (
              <button
                onClick={() => {
                  onUpdateStatus(issue.id, "Resolved");
                  onClose();
                }}
                className="flex-1 bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-[0_0_16px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Mark as Resolved
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 bg-white/10 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-white/20 cursor-pointer border border-white/10"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
