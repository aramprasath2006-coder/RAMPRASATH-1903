import { PriorityLevel, CivicIssue } from "../types";

// SLA Configuration Default Hours
export const DEFAULT_SLA_HOURS: Record<PriorityLevel, number> = {
  CRITICAL: 24,
  EMERGENCY: 24,
  HIGH: 48,
  MEDIUM: 72,
  LOW: 168, // 7 days
};

// Department Hierarchy by Escalation Level
export const ESCALATION_ROLES: Record<
  number,
  { title: string; officerRole: string; icon: string; badgeColor: string }
> = {
  0: {
    title: "Level 0: Assigned Department Field Officer",
    officerRole: "Junior Engineer / Field Inspector",
    icon: "badge",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  1: {
    title: "Level 1: Department Senior Supervisor",
    officerRole: "Assistant Executive Engineer / Supervisor",
    icon: "supervisor_account",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  2: {
    title: "Level 2: Municipal / Corporation Higher Officer",
    officerRole: "Executive Engineer / Zonal Deputy Commissioner",
    icon: "shield_person",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  3: {
    title: "Level 3: District-Level Authority",
    officerRole: "District Collector / Municipal Commissioner",
    icon: "gavel",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  4: {
    title: "Level 4: Administrator / State Monitoring Authority",
    officerRole: "State Chief Civic Auditor / Minister Office",
    icon: "account_balance",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
};

// Smart Department Assignment Rules
export function mapCategoryToDepartment(category: string, titleAndDesc: string = ""): string {
  const text = `${category} ${titleAndDesc}`.toLowerCase();

  if (text.includes("garbage") || text.includes("waste") || text.includes("trash") || text.includes("dumping") || text.includes("clean")) {
    return "Sanitation Department";
  }
  if (text.includes("pothole") || text.includes("road") || text.includes("asphalt") || text.includes("footpath") || text.includes("street")) {
    return "Roads & Municipal Engineering";
  }
  if (text.includes("light") || text.includes("lamp") || text.includes("wire") || text.includes("transformer") || text.includes("electrical")) {
    return "Electrical Department";
  }
  if (text.includes("water") || text.includes("leak") || text.includes("pipe") || text.includes("main") || text.includes("supply")) {
    return "Water Supply Department";
  }
  if (text.includes("drainage") || text.includes("sewer") || text.includes("flood") || text.includes("waterlogging") || text.includes("channel")) {
    return "Sanitation & Water Department";
  }
  if (text.includes("property") || text.includes("park") || text.includes("fence") || text.includes("bench")) {
    return "Municipal Engineering Dept";
  }

  return "Municipal Administration";
}

// Compute SLA Deadline Timestamp
export function computeSlaDeadline(
  priorityLevel: PriorityLevel,
  fromTimestamp: number = Date.now()
): number {
  const hours = DEFAULT_SLA_HOURS[priorityLevel] || 48;
  return fromTimestamp + hours * 3600 * 1000;
}

// SLA Breach Check and Time Formatter
export function getSlaStatus(slaDeadline: number) {
  const now = Date.now();
  const diffMs = slaDeadline - now;

  if (diffMs <= 0) {
    const overdueMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
    const hours = Math.floor(overdueMinutes / 60);
    const mins = overdueMinutes % 60;
    return {
      isBreached: true,
      isWarning: false,
      remainingMs: diffMs,
      displayText: `BREACHED BY ${hours}h ${mins}m`,
      shortText: `Breached (+${hours}h)`,
      colorClass: "text-red-400 bg-red-500/20 border-red-500/40",
    };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const isWarning = hours < 4; // SLA warning if under 4 hours remaining

  return {
    isBreached: false,
    isWarning,
    remainingMs: diffMs,
    displayText: `${hours}h ${mins}m remaining`,
    shortText: `${hours}h ${mins}m`,
    colorClass: isWarning
      ? "text-amber-400 bg-amber-500/20 border-amber-500/40"
      : "text-emerald-400 bg-emerald-500/20 border-emerald-500/40",
  };
}

// Compute Priority Level from 0-100 Score
export function calculatePriorityLevel(score: number): PriorityLevel {
  if (score >= 76) return "CRITICAL";
  if (score >= 51) return "HIGH";
  if (score >= 26) return "MEDIUM";
  return "LOW";
}

// Calculate Auto Priority Score
export function calculatePriorityScore(params: {
  severity: number;
  publicImpact: number;
  safetyRisk: number;
  category?: string;
  isSchoolOrHospitalArea?: boolean;
}): number {
  const { severity, publicImpact, safetyRisk, isSchoolOrHospitalArea } = params;

  let score = Math.round(severity * 0.35 + publicImpact * 0.3 + safetyRisk * 0.35);

  if (isSchoolOrHospitalArea) {
    score = Math.min(100, score + 12);
  }

  return Math.max(1, Math.min(100, score));
}

// Automatic Escalation Check for Issue
export function checkAndApplyAutoEscalation(issue: CivicIssue): CivicIssue {
  if (
    issue.status === "Resolved" ||
    issue.status === "Closed" ||
    issue.status === "Awaiting Citizen Verification"
  ) {
    return issue;
  }

  const sla = getSlaStatus(issue.slaDeadline);

  if (sla.isBreached && !issue.slaBreached) {
    // Escalate
    const nextLevel = Math.min(4, issue.escalationLevel + 1);
    const roleInfo = ESCALATION_ROLES[nextLevel];

    const escalationEntry = {
      level: nextLevel,
      fromOfficer: issue.assignedOfficer || "Level 0 Field Officer",
      toOfficer: `${roleInfo.officerRole} (Auto Escalated)`,
      reason: `SLA Deadline Breached (${sla.displayText})`,
      timestamp: Date.now(),
      breachDurationMs: Math.abs(sla.remainingMs),
    };

    const newLogs = [
      {
        id: `log-${Date.now()}`,
        action: `AUTOMATIC ESCALATION TO LEVEL ${nextLevel}`,
        actor: "Civic Action SLA Auto-Escalation Engine",
        timestamp: Date.now(),
        oldStatus: issue.status,
        newStatus: "Escalated",
        notes: `SLA deadline breached. Automatically escalated to ${roleInfo.title}.`,
      },
      ...(issue.activityLogs || []),
    ];

    return {
      ...issue,
      status: "Escalated",
      slaBreached: true,
      slaBreachedAt: Date.now(),
      escalationLevel: nextLevel,
      assignedOfficerRole: roleInfo.officerRole,
      escalationHistory: [escalationEntry, ...(issue.escalationHistory || [])],
      activityLogs: newLogs,
    };
  }

  return issue;
}
