import React, { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { HomeScreen } from "./components/HomeScreen";
import { ReportScreen } from "./components/ReportScreen";
import { AnalysisScreen } from "./components/AnalysisScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { LiveMapScreen } from "./components/LiveMapScreen";
import { LoginScreen } from "./components/LoginScreen";
import { AdminScreen } from "./components/AdminScreen";
import { ComplaintTrackingModal } from "./components/ComplaintTrackingModal";
import { PublicTransparencyDashboard } from "./components/PublicTransparencyDashboard";
import { DemoSimulationPanel } from "./components/DemoSimulationPanel";
import { ActionProofModal } from "./components/ActionProofModal";
import { AIAnalysisResult, CivicIssue, NavigationTab, UserProfile, NotificationItem } from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>("home");
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedModalIssue, setSelectedModalIssue] = useState<CivicIssue | null>(null);
  const [selectedProofIssue, setSelectedProofIssue] = useState<CivicIssue | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: "🚨 SLA BREACHED",
      message: "Water Main Ticket #CIV-2026-000184 breached SLA. Auto-escalated to Executive Engineer.",
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
  ]);

  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysisResult | null>(null);
  const [lastFormData, setLastFormData] = useState<{
    title: string;
    category: string;
    description: string;
    imageBase64?: string;
    locationName: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [user, setUser] = useState<UserProfile>({
    name: "Michael Chen",
    email: "michael.c@tn.gov.in",
    mobile: "+91 9876543210",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBVpPwVPV6fl-R7ZdKSNTlJrhmXqkdhl7-na-GrzyzOY5_1FN_tX206sEf3_6FWgzOu-gg9mqSALJ0zQrqeGnQFpawDbXcuM3c4m3Bo3YM8QILc4eYUFpcIHlbLna1jVTj8zFdVYy7FbuMrdVL27x1MYDbX-loE1y_VYsCiQz2tq5HchLY2ZNt05TdfiVRXy9kiNoEXb6y2Og5vakUcCXIgvOgzj1Q93cvZP4S_WVT6aC_i6ZbheRy6",
    role: "citizen",
    isLoggedIn: true,
    district: "Chennai Corporation",
    address: "Anna Nagar, Ward 102",
    pincode: "600040",
    bio: "Civic advocate active in Tamil Nadu urban infrastructure & public hygiene monitoring.",
  });

  // Fetch civic issues from backend API with periodic live polling
  const fetchIssues = () => {
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.issues)) {
          setIssues(data.issues);
        }
      })
      .catch((err) => console.warn("Failed to load backend issues:", err));
  };

  useEffect(() => {
    fetchIssues();
    const pollInterval = setInterval(fetchIssues, 4000);
    return () => clearInterval(pollInterval);
  }, []);

  // Real-time SLA notification trigger: checks if issue status is not 'Resolved'/'Closed'
  // and SLA deadline is within 2 hours, generating a high-priority push notification for assigned officer.
  useEffect(() => {
    if (!issues || issues.length === 0) return;

    const now = Date.now();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    setNotifications((prevNotifs) => {
      const addedNotifs: NotificationItem[] = [];

      issues.forEach((issue) => {
        if (issue.status === "Resolved" || issue.status === "Closed") return;
        if (!issue.slaDeadline) return;

        const timeRemaining = issue.slaDeadline - now;
        // Check if SLA deadline is within 2 hours (including overdue/breached)
        if (timeRemaining <= twoHoursMs) {
          const ticketRef = issue.ticketId || issue.id;
          const notifId = `sla-warning-${ticketRef}`;

          // Check if notification already exists for this ticket
          const exists = prevNotifs.some(
            (n) => n.id === notifId || (n.type === "sla_warning" && n.ticketId === ticketRef)
          );

          if (!exists) {
            const officerName = issue.assignedOfficer || `${issue.department} Officer`;
            const hoursLeft = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
            const minsLeft = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));
            const timeText = timeRemaining <= 0 ? "OVERDUE / BREACHED" : `${hoursLeft}h ${minsLeft}m remaining`;

            addedNotifs.push({
              id: notifId,
              title: "🚨 HIGH-PRIORITY SLA WARNING",
              message: `Officer Push Alert for ${officerName}: Ticket #${ticketRef} (${issue.title}) SLA deadline is within 2 hours! [${timeText}]`,
              timestamp: now,
              read: false,
              type: "sla_warning",
              ticketId: ticketRef,
            });
          }
        }
      });

      if (addedNotifs.length === 0) return prevNotifs;
      return [...addedNotifs, ...prevNotifs];
    });
  }, [issues]);

  // Handle AI analysis completed
  const handleAnalysisComplete = (
    analysis: AIAnalysisResult,
    formData: {
      title: string;
      category: string;
      description: string;
      imageBase64?: string;
      locationName: string;
      lat: number;
      lng: number;
    }
  ) => {
    setLastAnalysis(analysis);
    setLastFormData(formData);
    setCurrentTab("analysis");
  };

  // Submit confirmed complaint to backend
  const handleSubmitComplaint = async () => {
    if (!lastAnalysis || !lastFormData) return;

    const newIssuePayload = {
      title: lastFormData.title,
      category:
        lastFormData.category === "light"
          ? "Street Light"
          : lastFormData.category === "water"
          ? "Water Leakage"
          : lastFormData.category === "garbage"
          ? "Garbage / Waste"
          : "Road Damage",
      description: lastFormData.description,
      priority: lastAnalysis.priorityLevel,
      priorityScore: lastAnalysis.priorityScore,
      department: lastAnalysis.recommendedDept,
      locationName: lastFormData.locationName,
      lat: lastFormData.lat,
      lng: lastFormData.lng,
      imageUrl: lastFormData.imageBase64,
      reporter: user.name,
      breakdown: {
        severity: lastAnalysis.severity,
        publicImpact: lastAnalysis.publicImpact,
        safetyRisk: lastAnalysis.safetyRisk,
      },
      recommendation: lastAnalysis.recommendation,
      aiConfidence: lastAnalysis.confidence,
    };

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIssuePayload),
      });

      const data = await res.json();
      if (data.success && data.issue) {
        setIssues((prev) => [data.issue, ...prev]);
      }
    } catch (err) {
      console.error("Error posting issue:", err);
    }

    setCurrentTab("dashboard");
  };

  // Toggle User Role
  const handleToggleUserRole = () => {
    setUser((prev) => {
      const nextRole = prev.role === "citizen" ? "admin" : "citizen";
      return {
        ...prev,
        role: nextRole,
        name: nextRole === "admin" ? "Sarah Jenkins (Officer)" : "Michael Chen",
      };
    });
  };

  // Update status
  const handleUpdateIssueStatus = (id: string, newStatus: any) => {
    fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(() => fetchIssues())
      .catch((err) => console.warn("Update status error:", err));
  };

  // Citizen Re-verification Handler
  const handleCitizenVerify = async (issueId: string, verified: boolean, feedback?: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/citizen-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified, feedback }),
      });
      const data = await res.json();
      if (data.success) {
        fetchIssues();
        setSelectedModalIssue(null);
      }
    } catch (err) {
      console.error("Citizen verification failed:", err);
    }
  };

  // Officer Proof Upload Handler
  const handleOfficerProofUpload = async (
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
      if (data.success) {
        fetchIssues();
        setSelectedProofIssue(null);
      }
    } catch (err) {
      console.error("Proof upload failed:", err);
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleSelectNotificationTicket = (ticketId: string) => {
    const found = issues.find((i) => i.id === ticketId || i.ticketId === ticketId);
    if (found) {
      setSelectedModalIssue(found);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans antialiased relative overflow-x-hidden">
      {/* Background Ambient Light Orbs - Immersive UI Theme */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-orange-600/15 blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute top-[40%] right-[20%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full bg-orange-500/5 blur-[100px]"></div>
      </div>

      {/* Top Shared Header */}
      <Header
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        user={user}
        onToggleUserRole={handleToggleUserRole}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onSelectTicket={handleSelectNotificationTicket}
      />

      {/* Main Tab Render */}
      <div className="flex-1 flex flex-col">
        {currentTab === "home" && <HomeScreen onNavigate={setCurrentTab} />}

        {currentTab === "report" && (
          <ReportScreen onAnalysisComplete={handleAnalysisComplete} />
        )}

        {currentTab === "analysis" && lastAnalysis && lastFormData && (
          <AnalysisScreen
            analysis={lastAnalysis}
            formData={lastFormData}
            onSubmitComplaint={handleSubmitComplaint}
            onEditReport={() => setCurrentTab("report")}
          />
        )}

        {currentTab === "dashboard" && (
          <DashboardScreen
            issues={issues}
            user={user}
            onSelectIssue={(issue) => setSelectedModalIssue(issue)}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === "transparency" && <PublicTransparencyDashboard />}

        {currentTab === "map" && (
          <LiveMapScreen
            issues={issues}
            onSelectIssue={(issue) => setSelectedModalIssue(issue)}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === "login" && (
          <LoginScreen
            user={user}
            issues={issues}
            onLoginSuccess={(loggedInUser) => {
              setUser(loggedInUser);
              setCurrentTab("dashboard");
            }}
            onUpdateUser={(updatedUser) => setUser(updatedUser)}
          />
        )}

        {currentTab === "admin" && (
          <AdminScreen
            issues={issues}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            onRefreshIssues={fetchIssues}
            user={user}
            onUpdateUser={setUser}
          />
        )}
      </div>

      {/* Shared Accountability & Complaint Tracking Modal */}
      {selectedModalIssue && (
        <ComplaintTrackingModal
          issue={selectedModalIssue}
          onClose={() => setSelectedModalIssue(null)}
          onCitizenVerify={handleCitizenVerify}
          onOfficerUploadProof={(issue) => {
            setSelectedModalIssue(null);
            setSelectedProofIssue(issue);
          }}
          isOfficerRole={user.role === "official" || user.role === "admin"}
          user={user}
          onRefreshIssues={fetchIssues}
        />
      )}

      {/* Action Proof Modal for Officers */}
      {selectedProofIssue && (
        <ActionProofModal
          issue={selectedProofIssue}
          onClose={() => setSelectedProofIssue(null)}
          onSubmitProof={(issueId, proofData) => handleOfficerProofUpload(issueId, proofData)}
        />
      )}

      {/* Floating Presentation & Demo Control Bar */}
      <DemoSimulationPanel
        issues={issues}
        onRefreshIssues={fetchIssues}
        onToggleUserRole={handleToggleUserRole}
        userRole={user.role}
      />

      {/* Persistent Bottom Nav for Mobile */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        activeIssueCount={issues.filter((i) => i.status !== "Resolved" && i.status !== "Closed").length}
      />
    </div>
  );
}
