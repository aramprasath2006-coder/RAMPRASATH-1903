import React from "react";
import { NavigationTab } from "../types";

interface BottomNavProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  activeIssueCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  activeIssueCount = 0,
}) => {
  return (
    <nav className="bg-[#050505]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 md:hidden transition-all">
      {/* Home Tab */}
      <button
        onClick={() => onNavigate("home")}
        className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 transition-all duration-150 cursor-pointer ${
          currentTab === "home"
            ? "text-orange-500 scale-105 font-bold"
            : "text-white/60 hover:text-white"
        }`}
      >
        <span
          className="material-symbols-outlined text-[24px]"
          style={{ fontVariationSettings: currentTab === "home" ? "'FILL' 1" : "'FILL' 0" }}
        >
          home
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold mt-0.5">Home</span>
      </button>

      {/* Report Tab */}
      <button
        onClick={() => onNavigate("report")}
        className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 transition-all duration-150 cursor-pointer ${
          currentTab === "report" || currentTab === "analysis"
            ? "text-orange-500 scale-105 font-bold"
            : "text-white/60 hover:text-white"
        }`}
      >
        <span
          className="material-symbols-outlined text-[24px]"
          style={{
            fontVariationSettings:
              currentTab === "report" || currentTab === "analysis" ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          add_circle
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold mt-0.5">Report</span>
      </button>

      {/* My Issues Tab */}
      <button
        onClick={() => onNavigate("dashboard")}
        className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 transition-all duration-150 relative cursor-pointer ${
          currentTab === "dashboard"
            ? "text-orange-500 scale-105 font-bold"
            : "text-white/60 hover:text-white"
        }`}
      >
        <span
          className="material-symbols-outlined text-[24px]"
          style={{ fontVariationSettings: currentTab === "dashboard" ? "'FILL' 1" : "'FILL' 0" }}
        >
          assignment
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold mt-0.5">My Issues</span>
        {activeIssueCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 bg-orange-600 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(249,115,22,0.8)]">
            {activeIssueCount}
          </span>
        )}
      </button>

      {/* Map Tab */}
      <button
        onClick={() => onNavigate("map")}
        className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-all duration-150 cursor-pointer ${
          currentTab === "map"
            ? "text-orange-500 scale-105 font-bold"
            : "text-white/60 hover:text-white"
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: currentTab === "map" ? "'FILL' 1" : "'FILL' 0" }}
        >
          map
        </span>
        <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Map</span>
      </button>

      {/* Admin / Officer Tab */}
      <button
        onClick={() => onNavigate("admin")}
        className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-all duration-150 cursor-pointer ${
          currentTab === "admin"
            ? "text-blue-400 scale-105 font-bold"
            : "text-white/60 hover:text-white"
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: currentTab === "admin" ? "'FILL' 1" : "'FILL' 0" }}
        >
          admin_panel_settings
        </span>
        <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Admin</span>
      </button>

      {/* Login / Profile Tab */}
      <button
        onClick={() => onNavigate("login")}
        className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-all duration-150 cursor-pointer ${
          currentTab === "login"
            ? "text-orange-500 scale-105 font-bold"
            : "text-white/60 hover:text-white"
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: currentTab === "login" ? "'FILL' 1" : "'FILL' 0" }}
        >
          account_circle
        </span>
        <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Login</span>
      </button>
    </nav>
  );
};
