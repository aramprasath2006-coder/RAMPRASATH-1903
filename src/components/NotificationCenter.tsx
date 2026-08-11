import React, { useState } from "react";
import { NotificationItem } from "../types";

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onSelectTicket?: (ticketId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onSelectTicket,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer focus:outline-none"
        title="Notifications & SLA Alerts"
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-2xl p-4 shadow-2xl border border-white/20 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/10">
            <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
              <span className="material-symbols-outlined text-base">notifications_active</span>
              Accountability Alerts ({notifications.length})
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/50 hover:text-white text-xs font-bold"
            >
              Close
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
            {notifications.length === 0 ? (
              <p className="text-white/50 text-center py-6">No recent alerts.</p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onMarkRead(item.id);
                    if (item.ticketId && onSelectTicket) {
                      onSelectTicket(item.ticketId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    item.read
                      ? "bg-white/5 border-white/10 text-white/70"
                      : "bg-orange-500/10 border-orange-500/30 text-white font-medium shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span
                      className={`font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded ${
                        item.type === "escalation"
                          ? "bg-red-500/20 text-red-400"
                          : item.type === "sla_warning"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-[9px] text-white/40 shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{item.message}</p>
                  {item.ticketId && (
                    <span className="inline-block mt-1 text-[9px] font-mono text-orange-400 underline font-bold">
                      View Ticket #{item.ticketId} →
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
