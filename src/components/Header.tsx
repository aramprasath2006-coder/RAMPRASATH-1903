import React, { useState, useEffect } from "react";
import { NavigationTab, UserProfile, NotificationItem } from "../types";
import { NotificationCenter } from "./NotificationCenter";

interface HeaderProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  user: UserProfile;
  onToggleUserRole: () => void;
  notifications?: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onSelectTicket?: (ticketId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  user,
  onToggleUserRole,
  notifications = [
    {
      id: "n1",
      title: "🚨 SLA BREACHED",
      message: "Ticket #CIV-2026-000184 breached 24h SLA. Auto-escalated to Executive Engineer.",
      timestamp: Date.now() - 3600000,
      read: false,
      type: "escalation",
      ticketId: "CIV-2026-000184",
    },
    {
      id: "n2",
      title: "📸 PROOF UPLOADED",
      message: "Resolution proof photos uploaded for Pothole #CIV-2026-000185. Verification required.",
      timestamp: Date.now() - 7200000,
      read: false,
      type: "action_proof",
      ticketId: "CIV-2026-000185",
    },
  ],
  onMarkNotificationRead = () => {},
  onSelectTicket,
}) => {
  return (
    <header className="bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 flex justify-between items-center w-full px-4 sm:px-8 py-3 max-w-[1440px] mx-auto transition-all text-white">
      {/* Emblem & Branding */}
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-3 group text-left focus:outline-none cursor-pointer"
      >
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 border-2 border-emerald-500/40 shadow-[0_0_18px_rgba(16,185,129,0.35)] group-hover:border-orange-500 group-hover:scale-105 transition-all flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src="/tn_seal.svg"
            alt="Government of Tamil Nadu Official Emblem"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-black text-xl sm:text-2xl text-white tracking-[0.08em] uppercase">
              Civic<span className="text-orange-500">AI</span>
            </h1>
            <span className="hidden sm:inline-block bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
              Govt of TN
            </span>
          </div>
          <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.15em] -mt-0.5">
            {user.role === "admin" ? "Officer Portal • Tamil Nadu" : "Govt of Tamil Nadu Civic Portal"}
          </span>
        </div>
      </button>

      {/* Center Nav for Desktop */}
      <nav className="hidden md:flex items-center gap-1.5 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
        <button
          onClick={() => onNavigate("home")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer ${
            currentTab === "home"
              ? "bg-orange-500 text-black shadow-[0_0_16px_rgba(249,115,22,0.4)] font-extrabold"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onNavigate("report")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer ${
            currentTab === "report" || currentTab === "analysis"
              ? "bg-orange-500 text-black shadow-[0_0_16px_rgba(249,115,22,0.4)] font-extrabold"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          Report
        </button>
        <button
          onClick={() => onNavigate("dashboard")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer ${
            currentTab === "dashboard"
              ? "bg-orange-500 text-black shadow-[0_0_16px_rgba(249,115,22,0.4)] font-extrabold"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          My Issues
        </button>
        <button
          onClick={() => onNavigate("transparency")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer ${
            currentTab === "transparency"
              ? "bg-emerald-500 text-black shadow-[0_0_16px_rgba(16,185,129,0.4)] font-extrabold"
              : "text-emerald-400 hover:bg-emerald-500/10"
          }`}
        >
          Transparency
        </button>
        <button
          onClick={() => onNavigate("map")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer ${
            currentTab === "map"
              ? "bg-orange-500 text-black shadow-[0_0_16px_rgba(249,115,22,0.4)] font-extrabold"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          Live Map
        </button>
        <button
          onClick={() => onNavigate("admin")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer ${
            currentTab === "admin"
              ? "bg-blue-600 text-white shadow-[0_0_16px_rgba(37,99,235,0.4)] font-extrabold"
              : "text-blue-400 hover:bg-blue-500/10"
          }`}
        >
          Officer Command
        </button>
        <button
          onClick={() => onNavigate("login")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center gap-1.5 ${
            currentTab === "login"
              ? "bg-orange-500 text-black shadow-[0_0_16px_rgba(249,115,22,0.4)] font-extrabold"
              : "text-white/80 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">login</span>
          Login / Account
        </button>
      </nav>

      {/* Right Controls: Notifications + Role Toggle + Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationCenter
          notifications={notifications}
          onMarkRead={onMarkNotificationRead}
          onSelectTicket={onSelectTicket}
        />

        {/* Role Toggle Button */}
        <button
          onClick={onToggleUserRole}
          title={`Switch Role (Current: ${user.role})`}
          className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-bold px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:border-orange-500/50 transition-all text-white/80 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          Role: <span className="capitalize text-orange-400 font-extrabold">{user.role}</span>
        </button>

        {/* Avatar */}
        <button
          onClick={() => onNavigate("login")}
          className="relative group w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/20 hover:border-orange-500 transition-all focus:outline-none cursor-pointer"
          title={user.isLoggedIn ? `Logged in as ${user.name}` : "Click to Login"}
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
