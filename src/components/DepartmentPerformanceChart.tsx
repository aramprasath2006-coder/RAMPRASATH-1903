import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { CivicIssue } from "../types";

interface DepartmentPerformanceChartProps {
  issues?: CivicIssue[];
}

export interface DeptMetric {
  deptKey: string;
  deptName: string;
  shortName: string;
  avgResolutionHours: number;
  slaTargetHours: number;
  slaCompliancePct: number;
  totalTickets: number;
  resolvedTickets: number;
  breachedTickets: number;
}

const DEFAULT_DEPT_METRICS: DeptMetric[] = [
  {
    deptKey: "water",
    deptName: "CMWSSB (Metro Water & Sewage)",
    shortName: "Metro Water",
    avgResolutionHours: 11.4,
    slaTargetHours: 24,
    slaCompliancePct: 96,
    totalTickets: 38,
    resolvedTickets: 36,
    breachedTickets: 2,
  },
  {
    deptKey: "electricity",
    deptName: "TANGEDCO (Electricity Board)",
    shortName: "Electricity Board",
    avgResolutionHours: 15.2,
    slaTargetHours: 24,
    slaCompliancePct: 91,
    totalTickets: 42,
    resolvedTickets: 38,
    breachedTickets: 4,
  },
  {
    deptKey: "sanitation",
    deptName: "GCC Solid Waste Management",
    shortName: "GCC Sanitation",
    avgResolutionHours: 18.5,
    slaTargetHours: 36,
    slaCompliancePct: 88,
    totalTickets: 54,
    resolvedTickets: 47,
    breachedTickets: 7,
  },
  {
    deptKey: "pwd",
    deptName: "Public Works Department (PWD)",
    shortName: "PWD Roads",
    avgResolutionHours: 28.6,
    slaTargetHours: 48,
    slaCompliancePct: 82,
    totalTickets: 29,
    resolvedTickets: 24,
    breachedTickets: 5,
  },
  {
    deptKey: "highways",
    deptName: "State Highways & Traffic",
    shortName: "State Highways",
    avgResolutionHours: 34.2,
    slaTargetHours: 48,
    slaCompliancePct: 76,
    totalTickets: 21,
    resolvedTickets: 16,
    breachedTickets: 5,
  },
  {
    deptKey: "health",
    deptName: "Public Health & Vector Control",
    shortName: "Public Health",
    avgResolutionHours: 13.8,
    slaTargetHours: 24,
    slaCompliancePct: 94,
    totalTickets: 31,
    resolvedTickets: 29,
    breachedTickets: 2,
  },
];

export const DepartmentPerformanceChart: React.FC<DepartmentPerformanceChartProps> = ({
  issues = [],
}) => {
  const [metricView, setMetricView] = useState<"time" | "compliance">("time");
  const [sortBy, setSortBy] = useState<"fastest" | "volume" | "compliance">("fastest");

  // Compute live metrics merged with base baseline data
  const deptData = useMemo(() => {
    if (!issues || issues.length === 0) return DEFAULT_DEPT_METRICS;

    const map: Record<string, DeptMetric> = {};

    // Initialize map from DEFAULT_DEPT_METRICS
    DEFAULT_DEPT_METRICS.forEach((d) => {
      map[d.deptName] = { ...d };
    });

    // Process live issues
    issues.forEach((issue) => {
      const deptName = issue.department || "Public Works Department (PWD)";
      if (!map[deptName]) {
        map[deptName] = {
          deptKey: deptName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          deptName: deptName,
          shortName: deptName.split("(")[0].trim(),
          avgResolutionHours: 20,
          slaTargetHours: 36,
          slaCompliancePct: 85,
          totalTickets: 0,
          resolvedTickets: 0,
          breachedTickets: 0,
        };
      }

      const entry = map[deptName];
      entry.totalTickets += 1;
      if (issue.status === "Resolved" || issue.status === "Closed") {
        entry.resolvedTickets += 1;
      }
      if (issue.slaBreached) {
        entry.breachedTickets += 1;
      }
    });

    // Recompute compliance
    const list = Object.values(map).map((dept) => {
      const compliance =
        dept.totalTickets > 0
          ? Math.round(((dept.totalTickets - dept.breachedTickets) / dept.totalTickets) * 100)
          : dept.slaCompliancePct;

      return {
        ...dept,
        slaCompliancePct: compliance,
      };
    });

    // Sort according to selection
    return [...list].sort((a, b) => {
      if (sortBy === "fastest") return a.avgResolutionHours - b.avgResolutionHours;
      if (sortBy === "compliance") return b.slaCompliancePct - a.slaCompliancePct;
      return b.totalTickets - a.totalTickets;
    });
  }, [issues, sortBy]);

  const fastestDept = useMemo(() => {
    return [...deptData].sort((a, b) => a.avgResolutionHours - b.avgResolutionHours)[0];
  }, [deptData]);

  const highestComplianceDept = useMemo(() => {
    return [...deptData].sort((a, b) => b.slaCompliancePct - a.slaCompliancePct)[0];
  }, [deptData]);

  return (
    <section className="glass-card rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
      {/* Background glow accent */}
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-orange-400 text-xl">
              domain_verification
            </span>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Department SLA Performance Comparison
            </h2>
          </div>
          <p className="text-xs text-white/60">
            Side-by-side benchmark of average resolution times & SLA compliance across TN civic departments
          </p>
        </div>

        {/* View & Sorting Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex text-[10px] font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setMetricView("time")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === "time"
                  ? "bg-orange-500 text-black font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Avg Hours vs SLA
            </button>
            <button
              type="button"
              onClick={() => setMetricView("compliance")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === "compliance"
                  ? "bg-orange-500 text-black font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              SLA Compliance %
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/60 border border-white/15 text-white text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="fastest">Sort: Fastest First</option>
            <option value="compliance">Sort: Highest SLA %</option>
            <option value="volume">Sort: Ticket Volume</option>
          </select>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-black/40 p-3 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <span className="material-symbols-outlined text-lg">speed</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">
              Fastest Resolution
            </span>
            <span className="text-xs font-black text-emerald-400 block truncate">
              {fastestDept?.shortName} ({fastestDept?.avgResolutionHours}h)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:border-x sm:border-white/10 sm:px-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <span className="material-symbols-outlined text-lg">verified</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">
              Top SLA Compliance
            </span>
            <span className="text-xs font-black text-blue-400 block truncate">
              {highestComplianceDept?.shortName} ({highestComplianceDept?.slaCompliancePct}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-1">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
            <span className="material-symbols-outlined text-lg">account_balance</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">
              Departments Evaluated
            </span>
            <span className="text-xs font-black text-white block">
              6 Tamil Nadu Municipal Wings
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Component */}
      <div className="w-full">
        <div className="flex items-center justify-between sm:hidden mb-1">
          <span className="text-[10px] font-bold text-orange-400/80 uppercase tracking-widest flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">touch_app</span>
            Horizontal Swipe Active
          </span>
          <span className="text-[9px] text-white/40 font-mono">6 Departments</span>
        </div>

        <div className="overflow-x-auto w-full pb-2 scrollbar-thin">
          <div className="h-72 min-w-[560px] sm:min-w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {metricView === "time" ? (
                <BarChart data={deptData} margin={{ top: 15, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis
                dataKey="shortName"
                stroke="rgba(255, 255, 255, 0.5)"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.5)"
                fontSize={11}
                tickLine={false}
                unit="h"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#090d16",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "14px",
                  color: "#ffffff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.9)",
                  padding: "12px 16px",
                  fontSize: "12px",
                }}
                formatter={(value: any, name: any) => {
                  if (name === "avgResolutionHours") return [`${value} Hours`, "Actual Avg Resolution"];
                  if (name === "slaTargetHours") return [`${value} Hours`, "Mandated SLA Target"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Department: ${label}`}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  paddingTop: "12px",
                }}
              />
              <Bar
                dataKey="avgResolutionHours"
                name="Actual Avg Resolution (Hours)"
                fill="#f97316"
                radius={[6, 6, 0, 0]}
              >
                {deptData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.avgResolutionHours <= 15 ? "#10b981" : entry.avgResolutionHours <= 25 ? "#f97316" : "#ef4444"}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="slaTargetHours"
                name="Mandated SLA Target (Hours)"
                fill="#3b82f6"
                opacity={0.4}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          ) : (
            <BarChart data={deptData} margin={{ top: 15, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis
                dataKey="shortName"
                stroke="rgba(255, 255, 255, 0.5)"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.5)"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#090d16",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "14px",
                  color: "#ffffff",
                  padding: "12px 16px",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [`${value}%`, "SLA On-Time Compliance"]}
              />
              <Bar
                dataKey="slaCompliancePct"
                name="SLA Compliance Rate (%)"
                radius={[6, 6, 0, 0]}
              >
                {deptData.map((entry, index) => (
                  <Cell
                    key={`cell-comp-${index}`}
                    fill={entry.slaCompliancePct >= 90 ? "#10b981" : entry.slaCompliancePct >= 80 ? "#3b82f6" : "#f97316"}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  </div>

  {/* Footer Department Pills */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
        <span className="text-[10px] font-bold uppercase text-white/40 tracking-wider">
          💡 SLA Benchmark Target: 24h - 48h across Tamil Nadu Municipal Authorities
        </span>
        <span className="text-[10px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
          ● Real-time Recharts Analytics Engine
        </span>
      </div>
    </section>
  );
};
