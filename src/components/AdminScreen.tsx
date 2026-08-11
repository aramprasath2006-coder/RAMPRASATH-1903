import React, { useState } from "react";
import { APISetting, CivicIssue, RoutingRule, UserProfile } from "../types";
import { SLACountdownBadge } from "./SLACountdownBadge";
import { ActionProofModal } from "./ActionProofModal";
import { ComplaintTrackingModal } from "./ComplaintTrackingModal";
import { ESCALATION_ROLES } from "../utils/slaEngine";

interface AdminScreenProps {
  issues: CivicIssue[];
  onUpdateIssueStatus: (id: string, status: any) => void;
  onRefreshIssues?: () => void;
  user?: UserProfile;
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  issues,
  onUpdateIssueStatus,
  onRefreshIssues,
  user,
  onUpdateUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [queueLayout, setQueueLayout] = useState<"list" | "grid" | "table">("list");

  const [selectedProofIssue, setSelectedProofIssue] = useState<CivicIssue | null>(null);
  const [selectedTrackingIssue, setSelectedTrackingIssue] = useState<CivicIssue | null>(null);
  const [selectedCloseIssue, setSelectedCloseIssue] = useState<CivicIssue | null>(null);
  const [closureModalRemarks, setClosureModalRemarks] = useState("");
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);
  const [closureModalError, setClosureModalError] = useState<string | null>(null);

  const activeRole = user?.role || "admin";
  const activeUserDept = user?.department || "All Departments";

  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([
    { id: "1", category: "Potholes & Road Damage", department: "Roads & Municipal Engineering", defaultSlaHours: 48 },
    { id: "2", category: "Water Leakage", department: "Water Supply & Sewerage Board", defaultSlaHours: 24 },
    { id: "3", category: "Garbage / Waste", department: "Sanitation Department", defaultSlaHours: 72 },
    { id: "4", category: "Street Light Outage", department: "Electrical Department", defaultSlaHours: 168 },
  ]);

  const [apiSettings, setApiSettings] = useState<APISetting[]>([
    { id: "1", name: "Gemini Vision AI Engine", statusText: "Active v3.6 Flash", active: true },
    { id: "2", name: "SLA Auto-Escalation Cron", statusText: "Active (Every 5m)", active: true },
    { id: "3", name: "SMS & WhatsApp Alert Gateway", statusText: "Active", active: true },
    { id: "4", name: "State ERP & GIS Sync", statusText: "Connected", active: true },
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [showAddRule, setShowAddRule] = useState(false);

  // Stats Calculations
  const totalCount = issues.length;
  const inProgressCount = issues.filter((i) => i.status === "In Progress" || i.status === "Assigned").length;
  const awaitingVerificationCount = issues.filter((i) => i.status === "Awaiting Citizen Verification").length;
  const slaBreachedCount = issues.filter((i) => i.slaBreached || i.status === "Escalated").length;
  const resolvedCount = issues.filter((i) => i.status === "Resolved" || i.status === "Closed").length;

  const handleCloseComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCloseIssue) return;

    setIsSubmittingClose(true);
    setClosureModalError(null);

    try {
      const res = await fetch(`/api/issues/${selectedCloseIssue.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: activeRole,
          department: activeUserDept,
          closedBy: user?.name
            ? `${user.name} (${activeRole === "admin" ? "State Admin" : "Department Head"})`
            : activeRole === "admin"
            ? "State System Admin"
            : `Head of ${selectedCloseIssue.department}`,
          closureRemarks: closureModalRemarks || "Complaint officially verified and closed by authorized authority.",
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onRefreshIssues) onRefreshIssues();
        setSelectedCloseIssue(null);
        setClosureModalRemarks("");
      } else {
        setClosureModalError(data.error || "Failed to close complaint.");
      }
    } catch (err: any) {
      setClosureModalError("Error submitting closure request.");
    } finally {
      setIsSubmittingClose(false);
    }
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory && newDepartment) {
      setRoutingRules([
        ...routingRules,
        {
          id: String(Date.now()),
          category: newCategory,
          department: newDepartment,
          defaultSlaHours: 48,
        },
      ]);
      setNewCategory("");
      setNewDepartment("");
      setShowAddRule(false);
    }
  };

  const handleToggleApi = (id: string) => {
    setApiSettings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const handleOfficerSubmitProof = async (
    issueId: string,
    proofData: {
      beforeImageUrl: string;
      afterImageUrl: string;
      remarks: string;
      officerName: string;
    }
  ) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/action-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proofData),
      });
      const data = await res.json();
      if (data.success && onRefreshIssues) {
        onRefreshIssues();
      }
    } catch (err) {
      console.error("Proof submission failed:", err);
    }
  };

  const handleManualEscalate = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Manual Escalation by Department Officer in Admin Portal",
          officerName: "Sarah Jenkins (Officer)",
        }),
      });
      const data = await res.json();
      if (data.success && onRefreshIssues) {
        onRefreshIssues();
      }
    } catch (err) {
      console.error("Manual escalation failed:", err);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Ticket ID",
      "Title",
      "Category",
      "Priority",
      "Priority Score",
      "Department",
      "Status",
      "SLA Breached",
      "Escalation Level",
      "Assigned Officer",
      "Location",
      "Created Date",
    ];

    const escapeCsv = (str: any) => {
      if (str === undefined || str === null) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = issues.map((i) => [
      escapeCsv(i.ticketId || i.id),
      escapeCsv(i.title),
      escapeCsv(i.category),
      escapeCsv(i.priority),
      escapeCsv(i.priorityScore),
      escapeCsv(i.department),
      escapeCsv(i.status),
      escapeCsv(i.slaBreached ? "YES" : "NO"),
      escapeCsv(`Level ${i.escalationLevel || 0}`),
      escapeCsv(i.assignedOfficer || "Unassigned"),
      escapeCsv(i.locationName),
      escapeCsv(i.date),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Govt_Civic_Action_Accountability_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.ticketId && issue.ticketId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      issue.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = filterDept === "all" || issue.department.toLowerCase().includes(filterDept.toLowerCase());
    const matchesPriority = filterPriority === "all" || issue.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;

    return matchesSearch && matchesDept && matchesPriority && matchesStatus;
  });

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full p-4 sm:p-6 pb-28 md:pb-12 flex flex-col gap-6 relative z-10 text-white">
      {/* Top Bar / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              Government Officer Portal
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              SLA Engine Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
            Government Action & SLA Command Center
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Real-time department dispatch queue, SLA breach detection, and complaint closure authority portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-orange-500 text-black px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:bg-orange-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* AUTHORITY PERSONA SELECTOR BANNER */}
      {onUpdateUser && (
        <div className="bg-slate-900/80 border border-blue-500/30 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <span className="material-symbols-outlined text-2xl">shield_person</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Active Officer Persona
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  {activeRole === "admin" ? "State System Admin" : `Dept Head (${activeUserDept})`}
                </span>
              </div>
              <p className="text-[11px] text-white/60 mt-0.5">
                {activeRole === "admin"
                  ? "✓ System Admin has full authorization to close complaints across ALL departments."
                  : `✓ Authorized as Head of '${activeUserDept}'. Can close complaints assigned to this department.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block md:hidden w-full mb-1">
              Switch Authority Persona:
            </span>

            <button
              type="button"
              onClick={() =>
                onUpdateUser({
                  name: "State Admin Officer",
                  email: "admin@tn.gov.in",
                  mobile: "+91 9876543210",
                  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                  role: "admin",
                  isLoggedIn: true,
                  department: "All Departments",
                  district: "Chennai Headquarters",
                })
              }
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                activeRole === "admin"
                  ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)] border border-blue-400"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              }`}
            >
              <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
              System Admin
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateUser({
                  name: "Er. K. Ramanathan (Roads Head)",
                  email: "head.roads@tn.gov.in",
                  mobile: "+91 9444100100",
                  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                  role: "official",
                  isLoggedIn: true,
                  department: "Roads & Municipal Engineering",
                  district: "Chennai Corporation",
                })
              }
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                activeRole === "official" && activeUserDept === "Roads & Municipal Engineering"
                  ? "bg-emerald-600 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-400"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              }`}
            >
              <span className="material-symbols-outlined text-xs">engineering</span>
              Head (Roads)
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateUser({
                  name: "Dr. S. Meenakshi (Sanitation Head)",
                  email: "head.sanitation@tn.gov.in",
                  mobile: "+91 9444200200",
                  avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                  role: "official",
                  isLoggedIn: true,
                  department: "Sanitation Department",
                  district: "Chennai Corporation",
                })
              }
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                activeRole === "official" && activeUserDept === "Sanitation Department"
                  ? "bg-emerald-600 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-400"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              }`}
            >
              <span className="material-symbols-outlined text-xs">cleaning_services</span>
              Head (Sanitation)
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateUser({
                  name: "Er. R. Arumugam (Water Head)",
                  email: "head.water@tn.gov.in",
                  mobile: "+91 9444300300",
                  avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                  role: "official",
                  isLoggedIn: true,
                  department: "Water Supply & Sewerage Board",
                  district: "Chennai Corporation",
                })
              }
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                activeRole === "official" && activeUserDept === "Water Supply & Sewerage Board"
                  ? "bg-emerald-600 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-400"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              }`}
            >
              <span className="material-symbols-outlined text-xs">water_drop</span>
              Head (Water)
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Metric Cards (Accountability Bento) */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-[9px] font-extrabold text-white/60 uppercase tracking-widest">
            Total Logged
          </p>
          <div>
            <h3 className="text-2xl font-black text-white">{totalCount}</h3>
            <span className="text-[10px] text-white/50">Municipal Queue</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest">
            Active / Assigned
          </p>
          <div>
            <h3 className="text-2xl font-black text-blue-400">{inProgressCount}</h3>
            <span className="text-[10px] text-blue-300">Work Underway</span>
          </div>
        </div>

        {/* Awaiting Citizen Verification */}
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between h-28 relative overflow-hidden">
          <p className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">
            Proof Uploaded
          </p>
          <div>
            <h3 className="text-2xl font-black text-emerald-400">{awaitingVerificationCount}</h3>
            <span className="text-[10px] text-emerald-300">Awaiting Citizen</span>
          </div>
        </div>

        {/* SLA Breached */}
        <div className="glass-card rounded-2xl p-4 border border-red-500/40 bg-red-500/10 flex flex-col justify-between h-28 relative overflow-hidden animate-pulse">
          <p className="text-[9px] font-extrabold text-red-400 uppercase tracking-widest">
            🚨 SLA Breached
          </p>
          <div>
            <h3 className="text-2xl font-black text-red-400">{slaBreachedCount}</h3>
            <span className="text-[10px] text-red-300 font-bold">Auto-Escalated</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between h-28 relative overflow-hidden col-span-2 md:col-span-1">
          <p className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">
            Resolved & Closed
          </p>
          <div>
            <h3 className="text-2xl font-black text-emerald-400">{resolvedCount}</h3>
            <span className="text-[10px] text-emerald-300">Verified Complete</span>
          </div>
        </div>
      </section>

      {/* OFFICER DISPATCH QUEUE & SLA MONITORING */}
      <section className="glass-card rounded-3xl border border-white/10 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-orange-400 text-xl">priority_high</span>
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                Priority Queue & SLA Live Monitor
              </h2>
            </div>
            <p className="text-xs text-white/60">
              Ranked by AI priority score and live SLA countdown. Switch between List, Grid, or Table layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Grid vs List vs Table Layout Switcher */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={() => setQueueLayout("list")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  queueLayout === "list"
                    ? "bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                    : "text-white/60 hover:text-white"
                }`}
                title="Compact List View"
              >
                <span className="material-symbols-outlined text-sm">view_list</span>
                <span>List</span>
              </button>

              <button
                type="button"
                onClick={() => setQueueLayout("grid")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  queueLayout === "grid"
                    ? "bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                    : "text-white/60 hover:text-white"
                }`}
                title="Card Grid View"
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
                <span>Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setQueueLayout("table")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  queueLayout === "table"
                    ? "bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                    : "text-white/60 hover:text-white"
                }`}
                title="Full Table View"
              >
                <span className="material-symbols-outlined text-sm">table_rows</span>
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Search ticket # or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-orange-500 text-xs"
              />

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-xl px-2.5 py-1.5 text-white text-xs cursor-pointer"
              >
                <option value="all" className="bg-black">All Priorities</option>
                <option value="CRITICAL" className="bg-black">CRITICAL</option>
                <option value="HIGH" className="bg-black">HIGH</option>
                <option value="MEDIUM" className="bg-black">MEDIUM</option>
                <option value="LOW" className="bg-black">LOW</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-xl px-2.5 py-1.5 text-white text-xs cursor-pointer"
              >
                <option value="all" className="bg-black">All Statuses</option>
                <option value="Assigned" className="bg-black">Assigned</option>
                <option value="In Progress" className="bg-black">In Progress</option>
                <option value="Awaiting Citizen Verification" className="bg-black">Awaiting Verification</option>
                <option value="Escalated" className="bg-black">Escalated</option>
                <option value="Resolved" className="bg-black">Resolved</option>
                <option value="Reopened" className="bg-black">Reopened</option>
              </select>
            </div>
          </div>
        </div>

        {/* QUEUE CONTENT RENDERER */}
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-white/50 border border-white/10 rounded-2xl bg-black/30">
            <span className="material-symbols-outlined text-3xl mb-1 block text-white/30">search_off</span>
            No issues match the active filter criteria.
          </div>
        ) : queueLayout === "list" ? (
          /* COMPACT MOBILE LIST VIEW */
          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const escalationInfo = ESCALATION_ROLES[issue.escalationLevel || 0];
              const isAdmin = activeRole === "admin";
              const isDeptHead =
                (activeRole === "official" || activeRole === "admin") &&
                (!activeUserDept ||
                  activeUserDept === "All Departments" ||
                  activeUserDept.toLowerCase() === issue.department.toLowerCase());
              const canClose = isAdmin || isDeptHead;

              return (
                <div
                  key={issue.id}
                  className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-lg hover:border-orange-500/40 transition-all"
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

                  <div className="pl-2 space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-orange-400 text-xs bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded">
                        #{issue.ticketId || issue.id}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          issue.priority === "CRITICAL" || issue.priority === "EMERGENCY"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : issue.priority === "HIGH"
                            ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {issue.priority} ({issue.priorityScore}/100)
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${escalationInfo.badgeColor}`}>
                        L{issue.escalationLevel || 0}: {escalationInfo.officerRole.split("/")[0]}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {issue.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/60 font-medium">
                      <span>🏛️ {issue.department}</span>
                      <span>📍 {issue.locationName}</span>
                    </div>
                  </div>

                  <div className="pl-2 lg:pl-0 flex flex-wrap items-center justify-between lg:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                    <div className="flex items-center gap-2">
                      <SLACountdownBadge slaDeadline={issue.slaDeadline} slaBreached={issue.slaBreached} compact />
                      <span className="text-[10px] font-black uppercase text-white bg-white/10 px-2 py-1 rounded-md">
                        {issue.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTrackingIssue(issue)}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-white/10 cursor-pointer"
                      >
                        Audit
                      </button>

                      {issue.status === "Closed" ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          Closed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedCloseIssue(issue)}
                          className={`font-black text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                            canClose
                              ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                              : "bg-white/5 text-white/50 border border-white/10"
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {canClose ? "gavel" : "lock"}
                          </span>
                          Close
                        </button>
                      )}

                      {issue.status !== "Resolved" && issue.status !== "Closed" && issue.status !== "Awaiting Citizen Verification" && (
                        <button
                          type="button"
                          onClick={() => setSelectedProofIssue(issue)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">add_a_photo</span>
                          Proof
                        </button>
                      )}

                      {issue.status !== "Resolved" && issue.status !== "Closed" && (
                        <button
                          type="button"
                          onClick={() => handleManualEscalate(issue.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg cursor-pointer"
                        >
                          ▲ Escalate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : queueLayout === "grid" ? (
          /* CARD GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIssues.map((issue) => {
              const escalationInfo = ESCALATION_ROLES[issue.escalationLevel || 0];
              const isAdmin = activeRole === "admin";
              const isDeptHead =
                (activeRole === "official" || activeRole === "admin") &&
                (!activeUserDept ||
                  activeUserDept === "All Departments" ||
                  activeUserDept.toLowerCase() === issue.department.toLowerCase());
              const canClose = isAdmin || isDeptHead;

              return (
                <div
                  key={issue.id}
                  className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between gap-3 shadow-lg hover:border-orange-500/40 transition-all"
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

                  <div className="pl-2 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-orange-400 text-xs bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded">
                        #{issue.ticketId || issue.id}
                      </span>
                      <SLACountdownBadge slaDeadline={issue.slaDeadline} slaBreached={issue.slaBreached} compact />
                    </div>

                    <h3 className="text-sm font-extrabold text-white line-clamp-2">
                      {issue.title}
                    </h3>

                    <div className="space-y-1 text-[11px] text-white/60">
                      <div>🏛️ <span className="text-white/80 font-bold">{issue.department}</span></div>
                      <div>📍 {issue.locationName}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          issue.priority === "CRITICAL" || issue.priority === "EMERGENCY"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : issue.priority === "HIGH"
                            ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        Score: {issue.priorityScore}/100
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${escalationInfo.badgeColor}`}>
                        L{issue.escalationLevel || 0}: {escalationInfo.officerRole.split("/")[0]}
                      </span>
                    </div>
                  </div>

                  <div className="pl-2 pt-2 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/50">Status:</span>
                      <span className="font-black text-white uppercase">{issue.status}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedTrackingIssue(issue)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase py-1.5 rounded-lg border border-white/10 cursor-pointer text-center"
                      >
                        Audit
                      </button>

                      {issue.status === "Closed" ? (
                        <span className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase py-1.5 rounded-lg flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          Closed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedCloseIssue(issue)}
                          className={`flex-1 font-black text-[10px] uppercase py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            canClose
                              ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                              : "bg-white/5 text-white/50 border border-white/10"
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {canClose ? "gavel" : "lock"}
                          </span>
                          Close
                        </button>
                      )}

                      {issue.status !== "Resolved" && issue.status !== "Closed" && issue.status !== "Awaiting Citizen Verification" && (
                        <button
                          type="button"
                          onClick={() => setSelectedProofIssue(issue)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">add_a_photo</span>
                          Proof
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* FULL DESKTOP TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 text-[9px] font-black text-white/50 uppercase tracking-widest">
                  <th className="py-3 px-3">Ticket ID & Title</th>
                  <th className="py-3 px-3">Priority Score</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">SLA Countdown</th>
                  <th className="py-3 px-3">Escalation Authority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Officer Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-semibold">
                {filteredIssues.map((issue) => {
                  const escalationInfo = ESCALATION_ROLES[issue.escalationLevel || 0];
                  const isAdmin = activeRole === "admin";
                  const isDeptHead =
                    (activeRole === "official" || activeRole === "admin") &&
                    (!activeUserDept ||
                      activeUserDept === "All Departments" ||
                      activeUserDept.toLowerCase() === issue.department.toLowerCase());
                  const canClose = isAdmin || isDeptHead;

                  return (
                    <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-black text-orange-400 block text-[11px]">
                          #{issue.ticketId || issue.id}
                        </span>
                        <span className="text-white font-extrabold text-xs truncate max-w-[220px] block">
                          {issue.title}
                        </span>
                        <span className="text-[10px] text-white/50">{issue.locationName}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            issue.priority === "CRITICAL" || issue.priority === "EMERGENCY"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : issue.priority === "HIGH"
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {issue.priority} ({issue.priorityScore}/100)
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-white/80 font-bold">
                        {issue.department}
                      </td>

                      <td className="py-3.5 px-3">
                        <SLACountdownBadge slaDeadline={issue.slaDeadline} slaBreached={issue.slaBreached} compact />
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${escalationInfo.badgeColor}`}>
                          L{issue.escalationLevel || 0}: {escalationInfo.officerRole.split("/")[0]}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-black text-white text-[11px] block">{issue.status}</span>
                        {issue.status === "Awaiting Citizen Verification" && (
                          <span className="text-[9px] text-emerald-400 font-bold">Proof Uploaded</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTrackingIssue(issue)}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
                          >
                            Audit
                          </button>

                          {issue.status === "Closed" ? (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              Closed
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedCloseIssue(issue)}
                              className={`font-black text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                canClose
                                  ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                              }`}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {canClose ? "gavel" : "lock"}
                              </span>
                              Close
                            </button>
                          )}

                          {issue.status !== "Resolved" && issue.status !== "Closed" && issue.status !== "Awaiting Citizen Verification" && (
                            <button
                              onClick={() => setSelectedProofIssue(issue)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-md transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">add_a_photo</span>
                              Proof
                            </button>
                          )}

                          {issue.status !== "Resolved" && issue.status !== "Closed" && (
                            <button
                              onClick={() => handleManualEscalate(issue.id)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg cursor-pointer"
                            >
                              ▲ Escalate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DEPARTMENT ROUTING RULES & SLA CONFIGURATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Routing Rules */}
        <section className="glass-card rounded-2xl border border-white/10 p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-400">account_tree</span>
            Department SLA & Routing Configuration
          </h2>

          <div className="space-y-2">
            {routingRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-black/40 border border-white/10 rounded-xl p-3 flex justify-between items-center text-xs font-semibold"
              >
                <div>
                  <span className="text-white block font-extrabold">{rule.category}</span>
                  <span className="text-[10px] text-white/50">Target SLA: {rule.defaultSlaHours} hrs</span>
                </div>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold">
                  {rule.department}
                </span>
              </div>
            ))}
          </div>

          {showAddRule ? (
            <form onSubmit={handleAddRule} className="mt-2 space-y-2 text-xs">
              <input
                type="text"
                placeholder="Category (e.g. Traffic Signal Failure)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-white/10 bg-black/50 text-white outline-none focus:border-orange-500"
                required
              />
              <input
                type="text"
                placeholder="Department (e.g. Traffic Engineering)"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-white/10 bg-black/50 text-white outline-none focus:border-orange-500"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-black text-xs py-2 rounded-lg font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  Save Config
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRule(false)}
                  className="px-3 bg-white/10 text-white text-xs rounded-lg cursor-pointer hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddRule(true)}
              className="mt-1 w-full py-2.5 border border-orange-500/40 text-orange-400 rounded-xl font-bold text-xs hover:bg-orange-500/10 transition-colors flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add Department Rule
            </button>
          )}
        </section>

        {/* API & System Integration Status */}
        <section className="glass-card rounded-2xl border border-white/10 p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-400">tune</span>
            System Engines & Service Gateways
          </h2>

          <div className="space-y-2">
            {apiSettings.map((api) => (
              <div
                key={api.id}
                className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5"
              >
                <div>
                  <p className="text-xs font-bold text-white">{api.name}</p>
                  <p className="text-[10px] font-semibold text-emerald-400">{api.statusText}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleApi(api.id)}
                  className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                    api.active ? "bg-orange-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-all ${
                      api.active ? "right-0.5" : "left-0.5"
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Action Proof Modal */}
      {selectedProofIssue && (
        <ActionProofModal
          issue={selectedProofIssue}
          onClose={() => setSelectedProofIssue(null)}
          onSubmitProof={handleOfficerSubmitProof}
        />
      )}

      {/* Complaint Tracking Modal */}
      {selectedTrackingIssue && (
        <ComplaintTrackingModal
          issue={selectedTrackingIssue}
          onClose={() => setSelectedTrackingIssue(null)}
          isOfficerRole={true}
          user={user}
          onRefreshIssues={onRefreshIssues}
          onOfficerUploadProof={(issue) => {
            setSelectedTrackingIssue(null);
            setSelectedProofIssue(issue);
          }}
        />
      )}

      {/* COMPLAINT CLOSURE AUTHORIZATION MODAL */}
      {selectedCloseIssue && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-lg w-full text-white shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">gavel</span>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    Complaint Closure Sign-Off
                  </h3>
                  <p className="text-[10px] text-white/50">
                    Official Ticket #{selectedCloseIssue.ticketId || selectedCloseIssue.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCloseIssue(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {(() => {
              const isAdmin = activeRole === "admin";
              const isDeptHead =
                (activeRole === "official" || activeRole === "admin") &&
                (!activeUserDept ||
                  activeUserDept === "All Departments" ||
                  activeUserDept.toLowerCase() === selectedCloseIssue.department.toLowerCase());

              const canClose = isAdmin || isDeptHead;

              return (
                <div className="space-y-4">
                  {/* Issue Summary */}
                  <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-orange-400">
                        {selectedCloseIssue.category}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {selectedCloseIssue.department}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {selectedCloseIssue.title}
                    </div>
                    <div className="text-[11px] text-white/60">
                      📍 {selectedCloseIssue.locationName}
                    </div>
                  </div>

                  {/* Authority Verification Banner */}
                  {canClose ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                      <span className="material-symbols-outlined text-lg text-emerald-400">
                        verified
                      </span>
                      <div>
                        <span className="font-bold">Authority Confirmed:</span> You are logged in as{" "}
                        <span className="font-black underline">
                          {isAdmin ? "State System Admin" : `Head of ${selectedCloseIssue.department}`}
                        </span>{" "}
                        and have sign-off permission to close this complaint.
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-red-300">
                      <span className="material-symbols-outlined text-lg text-red-400">
                        lock
                      </span>
                      <div>
                        <span className="font-bold">Closure Restricted:</span> You are active as{" "}
                        <span className="font-bold underline">{activeUserDept}</span> officer. Only the{" "}
                        <span className="font-bold text-white">System Admin</span> or the{" "}
                        <span className="font-bold text-white">Head of {selectedCloseIssue.department}</span>{" "}
                        can officially close this complaint.
                      </div>
                    </div>
                  )}

                  {/* Proof Thumbnails if available */}
                  {selectedCloseIssue.actionProof?.afterImageUrl && (
                    <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                        Uploaded Resolution Proof Image
                      </p>
                      <img
                        src={selectedCloseIssue.actionProof.afterImageUrl}
                        alt="Resolution Proof"
                        className="w-full h-36 object-cover rounded-lg border border-emerald-500/40"
                      />
                    </div>
                  )}

                  {/* Form */}
                  {canClose && (
                    <form onSubmit={handleCloseComplaintSubmit} className="space-y-3 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">
                          Official Closure Remarks & Sign-Off Notes
                        </label>
                        <textarea
                          value={closureModalRemarks}
                          onChange={(e) => setClosureModalRemarks(e.target.value)}
                          placeholder="Enter final sign-off inspection notes (e.g., Executive Engineer verified work completion on-site. Quality standards met.)..."
                          className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 min-h-[80px]"
                          required
                        />
                      </div>

                      {closureModalError && (
                        <div className="text-[11px] font-bold text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">
                          {closureModalError}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCloseIssue(null)}
                          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingClose}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">gavel</span>
                          {isSubmittingClose ? "Signing Off..." : "Confirm & Officially Close Ticket"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
