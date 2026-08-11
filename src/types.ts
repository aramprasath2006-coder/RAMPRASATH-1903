export type IssueStatus =
  | "Submitted"
  | "AI Analyzed"
  | "Assigned"
  | "In Progress"
  | "Action Taken"
  | "Awaiting Citizen Verification"
  | "Resolved"
  | "Reopened"
  | "Escalated"
  | "Closed"
  | "Pending";

export type PriorityLevel = "CRITICAL" | "EMERGENCY" | "HIGH" | "MEDIUM" | "LOW";

export interface IssueBreakdown {
  severity: number;
  publicImpact: number;
  safetyRisk: number;
}

export interface EscalationRecord {
  level: number;
  fromOfficer?: string;
  toOfficer: string;
  reason: string;
  timestamp: number;
  breachDurationMs?: number;
}

export interface ActionProof {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  remarks: string;
  submittedAt: number;
  officerName: string;
  officerRole?: string;
  documentUrl?: string;
}

export interface CitizenVerification {
  verified: boolean;
  feedback?: string;
  rejectionCount: number;
  verifiedAt?: number;
  proofImageUrl?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  timestamp: number;
  oldStatus?: string;
  newStatus?: string;
  notes?: string;
}

export interface CivicIssue {
  id: string;
  ticketId: string;
  title: string;
  category: string;
  description: string;
  status: IssueStatus;
  priority: PriorityLevel;
  priorityScore: number;
  department: string;
  date: string;
  timestamp: number;
  locationName: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  reporter: string;
  breakdown: IssueBreakdown;
  recommendation: string;
  aiConfidence?: number;

  // Government Accountability & SLA Extensions
  slaDeadline: number; // Timestamp in ms
  slaBreached: boolean;
  slaBreachedAt?: number;
  escalationLevel: number; // 0=Officer, 1=Supervisor, 2=Higher Officer, 3=District Authority, 4=Admin Authority
  assignedOfficer?: string;
  assignedOfficerRole?: string;
  escalationHistory?: EscalationRecord[];
  actionProof?: ActionProof;
  citizenVerification?: CitizenVerification;
  activityLogs?: ActivityLog[];

  updates?: {
    date: string;
    text: string;
    author: string;
  }[];
}

export interface AIAnalysisResult {
  detectedIssue: string;
  confidence: number;
  recommendedDept: string;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  severity: number;
  publicImpact: number;
  safetyRisk: number;
  recommendation: string;
  suggestedSlaHours?: number;
}

export type NavigationTab =
  | "home"
  | "report"
  | "analysis"
  | "dashboard"
  | "map"
  | "login"
  | "admin"
  | "transparency";

export type UserRole = "citizen" | "official" | "admin";

export interface UserProfile {
  name: string;
  email: string;
  mobile: string;
  avatarUrl: string;
  role: UserRole;
  isLoggedIn: boolean;
  department?: string;
  district?: string;
  address?: string;
  pincode?: string;
  bio?: string;
}

export interface RoutingRule {
  id: string;
  category: string;
  department: string;
  defaultSlaHours: number;
}

export interface APISetting {
  id: string;
  name: string;
  statusText: string;
  active: boolean;
  isError?: boolean;
}

export interface DepartmentPerformance {
  departmentName: string;
  totalAssigned: number;
  resolvedCount: number;
  inProgressCount: number;
  slaBreachedCount: number;
  escalatedCount: number;
  resolutionRate: number; // percentage
  slaComplianceRate: number; // percentage
  avgResolutionTimeHours: number;
  citizenSatisfactionScore: number; // out of 5
  reopenRate: number; // percentage
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type:
    | "sla_warning"
    | "escalation"
    | "action_proof"
    | "verification_needed"
    | "reopened"
    | "resolved"
    | "info";
  ticketId?: string;
}

export interface AdminSlaConfig {
  criticalSlaHours: number;
  highSlaHours: number;
  mediumSlaHours: number;
  lowSlaHours: number;
  autoEscalationEnabled: boolean;
  warningThresholdHours: number;
}
