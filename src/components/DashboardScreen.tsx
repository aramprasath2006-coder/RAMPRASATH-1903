import React, { useState, useMemo } from "react";
import { CivicIssue, NavigationTab, UserProfile } from "../types";
import { ResolutionTrendChart } from "./ResolutionTrendChart";
import { DepartmentPerformanceChart } from "./DepartmentPerformanceChart";
import { CitizenImpactSection } from "./CitizenImpactSection";
import { SLACountdownBadge } from "./SLACountdownBadge";

interface DashboardScreenProps {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  onNavigate: (tab: NavigationTab) => void;
  user?: UserProfile;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  issues,
  onSelectIssue,
  onNavigate,
  user = {
    name: "Michael Chen",
    email: "michael.c@example.com",
    mobile: "+1 (555) 234-5678",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBVpPwVPV6fl-R7ZdKSNTlJrhmXqkdhl7-na-GrzyzOY5_1FN_tX206sEf3_6FWgzOu-gg9mqSALJ0zQrqeGnQFpawDbXcuM3c4m3Bo3YM8QILc4eYUFpcIHlbLna1jVTj8zFdVYy7FbuMrdVL27x1MYDbX-loE1y_VYsCiQz2tq5HchLY2ZNt05TdfiVRXy9kiNoEXb6y2Og5vakUcCXIgvOgzj1Q93cvZP4S_WVT6aC_i6ZbheRy6",
    role: "citizen",
    isLoggedIn: true,
  },
}) => {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [showFullImpact, setShowFullImpact] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");

  // Available filter options
  const CATEGORIES = [
    { label: "All Categories", value: "ALL", icon: "apps" },
    { label: "Street Light", value: "Street Light", icon: "lightbulb" },
    { label: "Water Leakage", value: "Water Leakage", icon: "water_drop" },
    { label: "Drainage Issue", value: "Drainage Issue", icon: "waves" },
    { label: "Road Damage", value: "Road Damage", icon: "construction" },
    { label: "Garbage / Waste", value: "Garbage", icon: "delete" },
  ];

  const PRIORITIES = [
    { label: "All Priorities", value: "ALL", color: "text-white" },
    { label: "Critical", value: "CRITICAL", color: "text-red-400" },
    { label: "High", value: "HIGH", color: "text-orange-400" },
    { label: "Medium", value: "MEDIUM", color: "text-blue-400" },
    { label: "Low", value: "LOW", color: "text-slate-400" },
  ];

  const STATUSES = [
    { label: "All Statuses", value: "ALL" },
    { label: "Assigned", value: "Assigned" },
    { label: "In Progress", value: "In Progress" },
    { label: "Awaiting Verification", value: "Awaiting Citizen Verification" },
    { label: "Escalated", value: "Escalated" },
    { label: "Resolved", value: "Resolved" },
  ];

  // Active Filter Count
  const activeFilterCount =
    (selectedCategory !== "ALL" ? 1 : 0) +
    (selectedPriority !== "ALL" ? 1 : 0) +
    (selectedStatus !== "ALL" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedPriority("ALL");
    setSelectedStatus("ALL");
    setSearchQuery("");
  };

  // Filter computation
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Category Filter
      if (selectedCategory !== "ALL") {
        const catMatch = issue.category
          .toLowerCase()
          .includes(selectedCategory.toLowerCase());
        if (!catMatch) return false;
      }

      // Priority Filter
      if (selectedPriority !== "ALL" && issue.priority !== selectedPriority) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== "ALL" && issue.status !== selectedStatus) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchTitle = issue.title.toLowerCase().includes(query);
        const matchDesc = issue.description.toLowerCase().includes(query);
        const matchLoc = issue.locationName.toLowerCase().includes(query);
        const matchId = issue.id.toLowerCase().includes(query);
        const matchTicket = issue.ticketId && issue.ticketId.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLoc && !matchId && !matchTicket) return false;
      }

      return true;
    });
  }, [issues, selectedCategory, selectedPriority, selectedStatus, searchQuery]);

  const awaitingVerificationCount = issues.filter(
    (i) => i.status === "Awaiting Citizen Verification"
  ).length;

  return (
    <main className="px-4 py-8 max-w-[1400px] mx-auto space-y-6 pb-28 md:pb-12 w-full relative z-10 text-white">
      {/* Welcome & Citizen Impact Top Banner */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                SLA & Escalation Tracker Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-400">dashboard</span>
              Citizen Grievance & Accountability Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5">
              Monitor live SLA resolution countdowns, verify completed action proofs, and review dynamic citizen impact badges.
            </p>
          </div>

          <button
            onClick={() => setShowFullImpact(!showFullImpact)}
            className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-400 hover:bg-orange-500/30 px-4 py-2.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
          >
            <span className="material-symbols-outlined text-base">military_tech</span>
            {showFullImpact ? "Hide Impact Badges" : "View Citizen Impact"}
          </button>
        </div>

        {/* Citizen Re-verification Banner Prompt */}
        {awaitingVerificationCount > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-emerald-400 text-3xl shrink-0">
                rate_review
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                  {awaitingVerificationCount} Resolution Verification(s) Pending
                </span>
                <p className="text-xs text-white/90 mt-0.5 font-medium">
                  Government officers uploaded Before & After resolution photos for your ticket. Click to verify work and close the ticket!
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedStatus("Awaiting Citizen Verification")}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shrink-0"
            >
              Verify Resolution Proofs →
            </button>
          </div>
        )}

        {/* Citizen Impact Badge Section */}
        {showFullImpact && (
          <div className="animate-in fade-in duration-200">
            <CitizenImpactSection issues={issues} user={user} />
          </div>
        )}
      </section>

      {/* Main Grid: Sidebar Filters + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden w-full">
          <button
            type="button"
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="w-full glass-card p-3 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-400 text-lg">filter_list</span>
              Filter Complaints {activeFilterCount > 0 && `(${activeFilterCount} Active)`}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-orange-400">
              {showMobileSidebar ? "Hide Filters ▲" : "Show Filters ▼"}
            </span>
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`glass-card rounded-2xl p-4 border border-white/10 space-y-4 ${
            showMobileSidebar ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-orange-400 text-base">filter_list</span>
              Filter Complaints
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[10px] text-orange-400 font-bold hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-white/50 uppercase tracking-widest block">
              Search Keyword / Ticket ID
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket # or area..."
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-white/50 uppercase tracking-widest block">
              Category
            </label>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                    selectedCategory === cat.value
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                      : "bg-white/5 text-white/70 border-transparent hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                    {cat.label}
                  </span>
                  {selectedCategory === cat.value && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Level Filter */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <label className="text-[9px] font-black text-white/50 uppercase tracking-widest block">
              Priority
            </label>
            <div className="space-y-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelectedPriority(p.value)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                    selectedPriority === p.value
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                      : "bg-white/5 text-white/70 border-transparent hover:bg-white/10"
                  }`}
                >
                  <span className={p.color}>{p.label}</span>
                  {selectedPriority === p.value && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Complaints Feed Column */}
        <div className="lg:col-span-3 space-y-6">
          <ResolutionTrendChart />

          <DepartmentPerformanceChart issues={issues} />

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-white/10">
              <div>
                <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-400">list_alt</span>
                  My Grievance Tickets ({filteredIssues.length})
                </h2>
                <p className="text-[11px] text-white/50">
                  Switch between card grid and compact list view for easy mobile scrolling
                </p>
              </div>

              {/* Grid to List Layout Switcher */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setLayoutMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    layoutMode === "grid"
                      ? "bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">grid_view</span>
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    layoutMode === "list"
                      ? "bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">view_list</span>
                  <span>List</span>
                </button>
              </div>
            </div>

            {filteredIssues.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl text-center border border-white/10">
                <span className="material-symbols-outlined text-4xl text-white/30 mb-2">
                  search_off
                </span>
                <p className="text-sm font-bold text-white">No complaints found</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 bg-orange-500 text-black text-xs font-extrabold uppercase px-4 py-2 rounded-full cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : layoutMode === "grid" ? (
              /* GRID LAYOUT VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="glass-card rounded-2xl border border-white/10 shadow-lg relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between gap-3 hover:border-orange-500/50 transition-all cursor-pointer group hover:scale-[1.01]"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        issue.priority === "CRITICAL" || issue.priority === "EMERGENCY"
                          ? "bg-red-500"
                          : issue.priority === "HIGH"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    ></div>

                    <div className="space-y-2 pl-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded">
                          #{issue.ticketId || issue.id}
                        </span>
                        <SLACountdownBadge slaDeadline={issue.slaDeadline} slaBreached={issue.slaBreached} compact />
                      </div>

                      <h3 className="text-base font-extrabold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                        {issue.title}
                      </h3>

                      <p className="text-xs text-white/70 line-clamp-2">{issue.description}</p>
                    </div>

                    <div className="pl-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          issue.status === "Awaiting Citizen Verification"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse"
                            : issue.status === "Escalated"
                            ? "bg-red-500/20 text-red-400 border-red-500/40"
                            : issue.status === "Resolved" || issue.status === "Closed"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-orange-500/20 text-orange-400 border-orange-500/40"
                        }`}
                      >
                        {issue.status}
                      </span>

                      <span className="text-[10px] font-black text-orange-400">
                        Score: {issue.priorityScore}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* COMPACT LIST LAYOUT VIEW */
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="glass-card rounded-2xl border border-white/10 shadow-lg relative overflow-hidden p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-orange-500/50 transition-all cursor-pointer group"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        issue.priority === "CRITICAL" || issue.priority === "EMERGENCY"
                          ? "bg-red-500"
                          : issue.priority === "HIGH"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    ></div>

                    <div className="pl-2 space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded">
                          #{issue.ticketId || issue.id}
                        </span>
                        <span className="text-[10px] font-bold text-white/50">
                          📍 {issue.locationName}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-orange-400 transition-colors">
                        {issue.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/60 font-semibold">
                        <span className="text-orange-400 font-bold">{issue.category}</span>
                        <span>• {issue.department}</span>
                        <span>• Score: {issue.priorityScore}/100</span>
                      </div>
                    </div>

                    <div className="pl-2 sm:pl-0 flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <SLACountdownBadge slaDeadline={issue.slaDeadline} slaBreached={issue.slaBreached} compact />

                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          issue.status === "Awaiting Citizen Verification"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse"
                            : issue.status === "Escalated"
                            ? "bg-red-500/20 text-red-400 border-red-500/40"
                            : issue.status === "Resolved" || issue.status === "Closed"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-orange-500/20 text-orange-400 border-orange-500/40"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
