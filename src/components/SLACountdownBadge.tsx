import React, { useState, useEffect } from "react";
import { getSlaStatus } from "../utils/slaEngine";

interface SLACountdownBadgeProps {
  slaDeadline: number;
  slaBreached?: boolean;
  compact?: boolean;
}

export const SLACountdownBadge: React.FC<SLACountdownBadgeProps> = ({
  slaDeadline,
  slaBreached,
  compact = false,
}) => {
  const [slaInfo, setSlaInfo] = useState(() => getSlaStatus(slaDeadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setSlaInfo(getSlaStatus(slaDeadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [slaDeadline]);

  if (slaBreached || slaInfo.isBreached) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-black uppercase tracking-wider rounded-full border border-red-500/40 bg-red-500/20 text-red-400 animate-pulse ${
          compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]"
        }`}
        title="SLA Deadline Breached - Issue Automatically Escalated"
      >
        <span className="material-symbols-outlined text-[12px]">alarm_off</span>
        <span>{compact ? slaInfo.shortText : `🚨 ${slaInfo.displayText}`}</span>
      </span>
    );
  }

  if (slaInfo.isWarning) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-300 ${
          compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]"
        }`}
        title="SLA Warning: Less than 4 hours remaining"
      >
        <span className="material-symbols-outlined text-[12px]">warning</span>
        <span>{compact ? slaInfo.shortText : `⏳ SLA WARNING: ${slaInfo.displayText}`}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ${
        compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]"
      }`}
    >
      <span className="material-symbols-outlined text-[12px]">schedule</span>
      <span>{compact ? slaInfo.shortText : `SLA: ${slaInfo.displayText}`}</span>
    </span>
  );
};
