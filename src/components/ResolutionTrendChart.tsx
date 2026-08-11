import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface TrendDataPoint {
  date: string;
  avgHours: number;
  resolved: number;
  reported: number;
  emergencyAvg: number;
}

const mockTrendData: TrendDataPoint[] = [
  { date: "Jul 12", avgHours: 42, resolved: 14, reported: 18, emergencyAvg: 4.2 },
  { date: "Jul 15", avgHours: 38, resolved: 19, reported: 22, emergencyAvg: 3.8 },
  { date: "Jul 18", avgHours: 35, resolved: 24, reported: 20, emergencyAvg: 3.1 },
  { date: "Jul 21", avgHours: 31, resolved: 28, reported: 25, emergencyAvg: 2.9 },
  { date: "Jul 24", avgHours: 29, resolved: 32, reported: 28, emergencyAvg: 2.4 },
  { date: "Jul 27", avgHours: 26, resolved: 35, reported: 30, emergencyAvg: 2.1 },
  { date: "Jul 30", avgHours: 24, resolved: 41, reported: 36, emergencyAvg: 1.8 },
  { date: "Aug 02", avgHours: 22, resolved: 38, reported: 34, emergencyAvg: 1.6 },
  { date: "Aug 05", avgHours: 19, resolved: 45, reported: 40, emergencyAvg: 1.4 },
  { date: "Aug 08", avgHours: 18, resolved: 50, reported: 44, emergencyAvg: 1.2 },
];

const categoryResolution = [
  { category: "Roads & Potholes", avgTime: "22h", speed: "-24%", score: 92 },
  { category: "Sanitation & Trash", avgTime: "12h", speed: "-35%", score: 98 },
  { category: "Street Lighting", avgTime: "16h", speed: "-18%", score: 95 },
  { category: "Water Supply", avgTime: "8h", speed: "-42%", score: 99 },
];

export const ResolutionTrendChart: React.FC = () => {
  const [metricView, setMetricView] = useState<"time" | "volume">("time");
  const [timeRange, setTimeRange] = useState<"30d" | "14d">("30d");

  const displayData =
    timeRange === "14d" ? mockTrendData.slice(-5) : mockTrendData;

  return (
    <section className="glass-card rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-orange-400 text-xl">
              analytics
            </span>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Resolution Time Trend Analysis
            </h2>
          </div>
          <p className="text-xs text-white/60">
            Past 30-day performance telemetry & municipal SLA response rates
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-2">
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex text-[10px] font-bold uppercase tracking-wider">
            <button
              onClick={() => setMetricView("time")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === "time"
                  ? "bg-orange-500 text-black font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Avg Hours
            </button>
            <button
              onClick={() => setMetricView("volume")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === "volume"
                  ? "bg-orange-500 text-black font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Volume Ratio
            </button>
          </div>

          <button
            onClick={() => setTimeRange(timeRange === "30d" ? "14d" : "30d")}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Range: {timeRange}
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-3 gap-2 mb-5 bg-black/40 p-3 rounded-xl border border-white/5">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
            Avg Resolution
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-white">18.2</span>
            <span className="text-[10px] font-bold text-orange-400">Hours</span>
          </div>
        </div>

        <div className="flex flex-col border-x border-white/10 px-2 sm:px-3">
          <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
            SLA Improvement
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400">-57%</span>
            <span className="text-[9px] text-emerald-400/80 font-bold hidden sm:inline">Faster</span>
          </div>
        </div>

        <div className="flex flex-col pl-1 sm:pl-2">
          <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
            Emergency Response
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-orange-400">1.2</span>
            <span className="text-[10px] font-bold text-white/60">Hours</span>
          </div>
        </div>
      </div>

      {/* Recharts Chart Container */}
      <div className="w-full">
        <div className="flex items-center justify-between sm:hidden mb-1">
          <span className="text-[10px] font-bold text-orange-400/80 uppercase tracking-widest flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">touch_app</span>
            Timeline Swipe Active
          </span>
          <span className="text-[9px] text-white/40 font-mono">10 Data Points</span>
        </div>

        <div className="overflow-x-auto w-full pb-2 scrollbar-thin">
          <div className="h-64 min-w-[500px] sm:min-w-full">
            <ResponsiveContainer width="100%" height="100%">
              {metricView === "time" ? (
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvgHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />

              <XAxis
                dataKey="date"
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={11}
                tickLine={false}
                unit="h"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d0d0d",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.8)",
                  padding: "10px 14px",
                  fontSize: "12px",
                }}
                formatter={(value: any, name: any) => {
                  if (name === "avgHours") return [`${value} hrs`, "Standard Avg Resolution"];
                  if (name === "emergencyAvg") return [`${value} hrs`, "Emergency Avg"];
                  return [value, name];
                }}
              />

              <Area
                type="monotone"
                dataKey="avgHours"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAvgHours)"
                name="avgHours"
              />
              <Area
                type="monotone"
                dataKey="emergencyAvg"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorEmergency)"
                name="emergencyAvg"
              />
            </AreaChart>
          ) : (
            <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d0d0d",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  padding: "10px 14px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  paddingTop: "10px",
                }}
              />
              <Bar dataKey="reported" name="New Reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved Issues" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  </div>

  {/* Category Breakdown Snippets */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">
          Category SLA Breakdown
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categoryResolution.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold text-white/70 truncate">
                {cat.category}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-black text-orange-400">{cat.avgTime}</span>
                <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {cat.speed}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
