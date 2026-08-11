import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Helper: Calculate SLA deadline ms based on priority
function getSlaMsByPriority(priority: string): number {
  switch (priority?.toUpperCase()) {
    case "CRITICAL":
    case "EMERGENCY":
      return 24 * 3600 * 1000; // 24 hours
    case "HIGH":
      return 48 * 3600 * 1000; // 48 hours
    case "MEDIUM":
      return 72 * 3600 * 1000; // 72 hours
    case "LOW":
    default:
      return 7 * 24 * 3600 * 1000; // 7 days
  }
}

// Initial mock store for civic issues with Government Accountability & SLA metadata
let civicIssuesStore: any[] = [
  {
    id: "CIV-2026-000184",
    ticketId: "CIV-2026-000184",
    title: "High-Risk Water Main Breach",
    category: "Water Leakage",
    description: "Gushing high-pressure water break flooding commercial lane and weakening pavement foundation near hospital route.",
    status: "Escalated",
    priority: "CRITICAL",
    priorityScore: 98,
    department: "Water Supply & Sewerage Board",
    date: "Aug 8, 2026",
    timestamp: Date.now() - 30 * 3600 * 1000, // Created 30h ago (breached 24h SLA)
    slaDeadline: Date.now() - 6 * 3600 * 1000, // Breached 6 hours ago
    slaBreached: true,
    slaBreachedAt: Date.now() - 6 * 3600 * 1000,
    escalationLevel: 2, // Escalated to Level 2
    assignedOfficer: "Rajesh Kumar (Senior Exec Engineer)",
    assignedOfficerRole: "Executive Engineer / Zonal Deputy Commissioner",
    locationName: "Elm Ave & Hospital Road",
    lat: 13.0827,
    lng: 80.2707,
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=600&auto=format&fit=crop&q=80",
    reporter: "Michael Chen",
    breakdown: {
      severity: 98,
      publicImpact: 95,
      safetyRisk: 99
    },
    recommendation: "Emergency valve shutdown and immediate repair team deployment.",
    aiConfidence: 98,
    escalationHistory: [
      {
        level: 1,
        fromOfficer: "Field Inspector Arumugam",
        toOfficer: "Supervisor Ramesh (Water Board)",
        reason: "SLA Warning threshold crossed (20h elapsed)",
        timestamp: Date.now() - 10 * 3600 * 1000
      },
      {
        level: 2,
        fromOfficer: "Supervisor Ramesh (Water Board)",
        toOfficer: "Rajesh Kumar (Senior Exec Engineer)",
        reason: "🚨 24h SLA Deadline Breached without resolution proof",
        timestamp: Date.now() - 6 * 3600 * 1000
      }
    ],
    activityLogs: [
      {
        id: "log-1",
        action: "COMPLAINT REGISTERED",
        actor: "Michael Chen (Citizen)",
        timestamp: Date.now() - 30 * 3600 * 1000,
        newStatus: "Submitted",
        notes: "Issue reported with live photo evidence."
      },
      {
        id: "log-2",
        action: "AI AUTO-ANALYSIS & ROUTING",
        actor: "CivicAI Core Engine",
        timestamp: Date.now() - 30 * 3600 * 1000 + 120000,
        newStatus: "Assigned",
        notes: "Priority Score: 98/100 (CRITICAL). Assigned to Water Supply & Sewerage Board."
      },
      {
        id: "log-3",
        action: "AUTOMATIC ESCALATION TO LEVEL 2",
        actor: "CivicAI SLA Engine",
        timestamp: Date.now() - 6 * 3600 * 1000,
        oldStatus: "In Progress",
        newStatus: "Escalated",
        notes: "SLA Deadline breached. Auto-escalated to Zonal Executive Engineer."
      }
    ]
  },
  {
    id: "CIV-2026-000185",
    ticketId: "CIV-2026-000185",
    title: "Dangerous Pothole near School Crossing",
    category: "Road Damage",
    description: "Deep asphalt cavity causing traffic slowdown and collision hazards at elementary school pedestrian crossing.",
    status: "Awaiting Citizen Verification",
    priority: "HIGH",
    priorityScore: 88,
    department: "Roads & Municipal Engineering",
    date: "Aug 9, 2026",
    timestamp: Date.now() - 18 * 3600 * 1000,
    slaDeadline: Date.now() + 30 * 3600 * 1000, // 30h remaining
    slaBreached: false,
    escalationLevel: 0,
    assignedOfficer: "K. Vignesh (Field Engineer)",
    assignedOfficerRole: "Junior Engineer / Field Inspector",
    locationName: "Park Road & 5th Ave",
    lat: 13.0878,
    lng: 80.2785,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARVbYeYYJIsFogar6F1gDfV249dQh_ulQcHiVpf-nu8s1xon_C0v7awA9sEUvtKpDoaFEJ4U-Oj51iudElewR7ne2lWV2oyeutzGlIjgEAWaUVDOyTyWhrdD04NkcVP1-1W22oD7flrrOGw2QEiRWzD7LebZ5iiroNi_0ZSIGAuaws_vtK5LS96QCQ5QITNZJbt5scLcDXRr0fWgUPqc-hCorU0nxOk3NBz4kgbeoG8NAo54T2epzL",
    reporter: "Michael Chen",
    breakdown: {
      severity: 90,
      publicImpact: 85,
      safetyRisk: 95
    },
    recommendation: "Cold-mix asphalt patch required with traffic warning cones.",
    aiConfidence: 94,
    actionProof: {
      beforeImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARVbYeYYJIsFogar6F1gDfV249dQh_ulQcHiVpf-nu8s1xon_C0v7awA9sEUvtKpDoaFEJ4U-Oj51iudElewR7ne2lWV2oyeutzGlIjgEAWaUVDOyTyWhrdD04NkcVP1-1W22oD7flrrOGw2QEiRWzD7LebZ5iiroNi_0ZSIGAuaws_vtK5LS96QCQ5QITNZJbt5scLcDXRr0fWgUPqc-hCorU0nxOk3NBz4kgbeoG8NAo54T2epzL",
      afterImageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
      remarks: "Cold-mix asphalt laying and compaction completed. Traffic safety restored.",
      submittedAt: Date.now() - 2 * 3600 * 1000,
      officerName: "K. Vignesh (Field Engineer)"
    },
    citizenVerification: {
      verified: false,
      rejectionCount: 0
    },
    activityLogs: [
      {
        id: "log-1",
        action: "COMPLAINT REGISTERED",
        actor: "Michael Chen",
        timestamp: Date.now() - 18 * 3600 * 1000,
        newStatus: "Submitted",
        notes: "Report logged."
      },
      {
        id: "log-2",
        action: "RESOLUTION PROOF SUBMITTED",
        actor: "K. Vignesh (Field Engineer)",
        timestamp: Date.now() - 2 * 3600 * 1000,
        oldStatus: "In Progress",
        newStatus: "Awaiting Citizen Verification",
        notes: "Asphalt patch applied. Uploaded before and after photo proof."
      }
    ]
  },
  {
    id: "CIV-2026-000186",
    ticketId: "CIV-2026-000186",
    title: "Overflowing Commercial Garbage Dumpster",
    category: "Garbage / Waste",
    description: "Overflowing public dumpsters spilling onto sidewalk causing odor and sanitation concerns.",
    status: "Resolved",
    priority: "MEDIUM",
    priorityScore: 68,
    department: "Sanitation Department",
    date: "Aug 7, 2026",
    timestamp: Date.now() - 48 * 3600 * 1000,
    slaDeadline: Date.now() + 24 * 3600 * 1000,
    slaBreached: false,
    escalationLevel: 0,
    assignedOfficer: "S. Murugan (Sanitation Inspector)",
    assignedOfficerRole: "Field Inspector",
    locationName: "Commercial Complex, Main St",
    lat: 13.0835,
    lng: 80.2720,
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80",
    reporter: "Sarah Jenkins",
    breakdown: {
      severity: 65,
      publicImpact: 72,
      safetyRisk: 60
    },
    recommendation: "Dispatch compactor truck for site clearance.",
    aiConfidence: 91,
    actionProof: {
      beforeImageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80",
      afterImageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80",
      remarks: "Site completely cleared and sanitized with disinfectant powder.",
      submittedAt: Date.now() - 12 * 3600 * 1000,
      officerName: "S. Murugan (Sanitation Inspector)"
    },
    citizenVerification: {
      verified: true,
      feedback: "Great job! Cleared promptly.",
      rejectionCount: 0,
      verifiedAt: Date.now() - 6 * 3600 * 1000
    },
    activityLogs: [
      {
        id: "log-1",
        action: "RESOLVED & VERIFIED BY CITIZEN",
        actor: "Sarah Jenkins (Citizen)",
        timestamp: Date.now() - 6 * 3600 * 1000,
        oldStatus: "Awaiting Citizen Verification",
        newStatus: "Resolved",
        notes: "Citizen verified work satisfaction."
      }
    ]
  },
  {
    id: "CIV-2026-000187",
    ticketId: "CIV-2026-000187",
    title: "Non-Functional Intersection Streetlight",
    category: "Street Light",
    description: "Non-functional overhead street light leaving busy junction dark during night hours.",
    status: "Pending",
    priority: "LOW",
    priorityScore: 45,
    department: "Electrical Department",
    date: "Aug 9, 2026",
    timestamp: Date.now() - 5 * 3600 * 1000,
    slaDeadline: Date.now() + 160 * 3600 * 1000, // 7 days SLA
    slaBreached: false,
    escalationLevel: 0,
    assignedOfficer: "Subramanian (Lineman Supervisor)",
    assignedOfficerRole: "Field Inspector",
    locationName: "Oak Lane & 2nd St",
    lat: 13.0890,
    lng: 80.2750,
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80",
    reporter: "Elena R.",
    breakdown: {
      severity: 40,
      publicImpact: 50,
      safetyRisk: 45
    },
    recommendation: "Schedule LED bulb and choke replacement.",
    aiConfidence: 88,
    activityLogs: [
      {
        id: "log-1",
        action: "COMPLAINT REGISTERED",
        actor: "Elena R.",
        timestamp: Date.now() - 5 * 3600 * 1000,
        newStatus: "Pending",
        notes: "Logged in queue."
      }
    ]
  }
];

// Helper: Initialize Gemini AI Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Function to automatically update SLA status and auto-escalate if breached
function processSlaBreaches() {
  const now = Date.now();
  civicIssuesStore = civicIssuesStore.map((issue) => {
    if (
      issue.status === "Resolved" ||
      issue.status === "Closed" ||
      issue.status === "Awaiting Citizen Verification"
    ) {
      return issue;
    }

    if (now > issue.slaDeadline && !issue.slaBreached) {
      const nextLevel = Math.min(4, (issue.escalationLevel || 0) + 1);
      const roles = [
        "Field Inspector",
        "Senior Department Supervisor",
        "Zonal Executive Engineer",
        "District Collector / Commissioner",
        "State Civic Monitoring Auditor",
      ];

      return {
        ...issue,
        status: "Escalated",
        slaBreached: true,
        slaBreachedAt: now,
        escalationLevel: nextLevel,
        assignedOfficerRole: roles[nextLevel],
        escalationHistory: [
          {
            level: nextLevel,
            fromOfficer: issue.assignedOfficer || "Level 0 Officer",
            toOfficer: `${roles[nextLevel]} (Auto Escalated)`,
            reason: "SLA Deadline Breached",
            timestamp: now,
            breachDurationMs: now - issue.slaDeadline,
          },
          ...(issue.escalationHistory || []),
        ],
        activityLogs: [
          {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            action: `AUTOMATIC ESCALATION TO LEVEL ${nextLevel}`,
            actor: "CivicAI SLA Auto-Escalation Engine",
            timestamp: now,
            oldStatus: issue.status,
            newStatus: "Escalated",
            notes: `SLA deadline breached. Automatically escalated to ${roles[nextLevel]}.`,
          },
          ...(issue.activityLogs || []),
        ],
      };
    }
    return issue;
  });
}

// API Route: AI Issue Analysis using Gemini API
app.post("/api/analyze-issue", async (req, res) => {
  try {
    const { title = "", category = "", description = "", imageBase64, location } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      try {
        const parts: any[] = [];

        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          });
        }

        const prompt = `You are CivicAI, an advanced municipal issue analyzer for smart cities. Analyze the following civic report:
Title: "${title}"
Selected Category: "${category}"
User Description: "${description}"
Location context: "${location || 'Unknown location'}"

Perform Computer Vision and NLP analysis to extract:
1. Detected Issue type (e.g. Pothole, Water Main Break, Garbage Overload, Damaged Streetlight, Illegal Dumping, Vandalism).
2. Confidence level percentage (number between 75 and 99).
3. Recommended Department (e.g. Roads & Municipal Engineering, Water Supply & Sewerage Board, Sanitation Department, Electrical Department).
4. Civic Priority Score (integer between 1 and 100).
5. Priority Level ("CRITICAL" if score >= 76, "HIGH" if score >= 51, "MEDIUM" if score >= 26, "LOW" if score < 26).
6. Severity (score 0-100).
7. Public Impact (score 0-100).
8. Safety Risk (score 0-100).
9. Actionable 1-sentence recommendation note for government officers.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: { parts: [{ text: prompt }, ...parts] },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedIssue: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                recommendedDept: { type: Type.STRING },
                priorityScore: { type: Type.NUMBER },
                priorityLevel: { type: Type.STRING },
                severity: { type: Type.NUMBER },
                publicImpact: { type: Type.NUMBER },
                safetyRisk: { type: Type.NUMBER },
                recommendation: { type: Type.STRING },
              },
              required: [
                "detectedIssue",
                "confidence",
                "recommendedDept",
                "priorityScore",
                "priorityLevel",
                "severity",
                "publicImpact",
                "safetyRisk",
                "recommendation",
              ],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, analysis: parsed, isRealAI: true });
        }
      } catch (err) {
        console.warn("Gemini API call warning, falling back to rule-based engine:", err);
      }
    }

    // Fallback rule-based AI engine
    const textCorpus = `${title} ${description} ${category}`.toLowerCase();

    let detectedIssue = "Pothole / Road Damage";
    let confidence = 94;
    let recommendedDept = "Roads & Municipal Engineering";
    let priorityScore = 88;
    let priorityLevel = "HIGH";
    let severity = 85;
    let publicImpact = 82;
    let safetyRisk = 92;
    let recommendation = "Immediate cold-mix asphalt patching recommended with traffic warning signs.";

    if (textCorpus.includes("water") || textCorpus.includes("leak") || textCorpus.includes("pipe") || category === "water") {
      detectedIssue = "Water Main Breach";
      recommendedDept = "Water Supply & Sewerage Board";
      priorityScore = 96;
      priorityLevel = "CRITICAL";
      severity = 94;
      publicImpact = 92;
      safetyRisk = 98;
      recommendation = "Immediate valve closure and emergency crew dispatch required to prevent road foundation erosion.";
    } else if (textCorpus.includes("garbage") || textCorpus.includes("waste") || textCorpus.includes("trash") || category === "garbage") {
      detectedIssue = "Garbage Accumulation";
      recommendedDept = "Sanitation Department";
      priorityScore = 68;
      priorityLevel = "MEDIUM";
      severity = 65;
      publicImpact = 72;
      safetyRisk = 60;
      recommendation = "Route additional waste management vehicle within 24 hours to clear overflow.";
    } else if (textCorpus.includes("light") || textCorpus.includes("lamp") || category === "light") {
      detectedIssue = "Streetlight Outage";
      recommendedDept = "Electrical Department";
      priorityScore = 48;
      priorityLevel = "LOW";
      severity = 45;
      publicImpact = 50;
      safetyRisk = 48;
      recommendation = "Schedule streetlight bulb and wiring inspection during routine maintenance cycle.";
    }

    res.json({
      success: true,
      analysis: {
        detectedIssue,
        confidence,
        recommendedDept,
        priorityScore,
        priorityLevel,
        severity,
        publicImpact,
        safetyRisk,
        recommendation,
      },
      isRealAI: false,
    });
  } catch (error: any) {
    console.error("Error analyzing issue:", error);
    res.status(500).json({ error: error.message || "Analysis failed" });
  }
});

// GET all civic issues with automatic SLA processing
app.get("/api/issues", (req, res) => {
  processSlaBreaches();
  res.json({ success: true, issues: civicIssuesStore });
});

// POST new civic issue with ticket generation & SLA assignment
app.post("/api/issues", (req, res) => {
  const issueData = req.body;
  const now = Date.now();
  const ticketId = `CIV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const priority = issueData.priority || "HIGH";
  const slaMs = getSlaMsByPriority(priority);

  const newIssue = {
    id: ticketId,
    ticketId: ticketId,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    timestamp: now,
    status: "Assigned",
    slaDeadline: now + slaMs,
    slaBreached: false,
    escalationLevel: 0,
    assignedOfficer: "Assigned Field Officer",
    assignedOfficerRole: "Junior Engineer / Field Inspector",
    escalationHistory: [],
    activityLogs: [
      {
        id: `log-${now}`,
        action: "COMPLAINT REGISTERED",
        actor: issueData.reporter || "Citizen Reporter",
        timestamp: now,
        newStatus: "Submitted",
        notes: `Ticket #${ticketId} created with Priority ${priority} (${issueData.priorityScore || 85}/100). SLA Deadline set for ${new Date(now + slaMs).toLocaleString()}`,
      },
      {
        id: `log-${now + 1}`,
        action: "SMART DEPARTMENT ASSIGNMENT",
        actor: "CivicAI Auto Routing Engine",
        timestamp: now + 500,
        newStatus: "Assigned",
        notes: `Assigned to ${issueData.department || "Municipal Engineering"}.`,
      },
    ],
    ...issueData,
  };

  civicIssuesStore.unshift(newIssue);
  res.json({ success: true, issue: newIssue });
});

// POST officer action proof upload
app.post("/api/issues/:id/action-proof", (req, res) => {
  const { id } = req.params;
  const { beforeImageUrl, afterImageUrl, remarks, officerName } = req.body;

  const index = civicIssuesStore.findIndex((i) => i.id === id || i.ticketId === id);
  if (index !== -1) {
    const issue = civicIssuesStore[index];
    const now = Date.now();

    const actionProof = {
      beforeImageUrl: beforeImageUrl || issue.imageUrl,
      afterImageUrl: afterImageUrl || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
      remarks: remarks || "Resolution work executed on-site. Verified by field team.",
      submittedAt: now,
      officerName: officerName || "Assigned Officer",
    };

    const updatedIssue = {
      ...issue,
      status: "Awaiting Citizen Verification",
      actionProof,
      activityLogs: [
        {
          id: `log-${now}`,
          action: "RESOLUTION PROOF SUBMITTED",
          actor: officerName || "Assigned Government Officer",
          timestamp: now,
          oldStatus: issue.status,
          newStatus: "Awaiting Citizen Verification",
          notes: `Uploaded Before & After photo proof. Remarks: ${remarks || 'Resolution completed.'}`,
        },
        ...(issue.activityLogs || []),
      ],
    };

    civicIssuesStore[index] = updatedIssue;
    return res.json({ success: true, issue: updatedIssue });
  }

  res.status(404).json({ error: "Issue not found" });
});

// POST citizen re-verification (Yes -> Resolved, No -> Reopened & Auto Escalate if rejected multiple times)
app.post("/api/issues/:id/citizen-verify", (req, res) => {
  const { id } = req.params;
  const { verified, feedback, proofImageUrl } = req.body;

  const index = civicIssuesStore.findIndex((i) => i.id === id || i.ticketId === id);
  if (index !== -1) {
    const issue = civicIssuesStore[index];
    const now = Date.now();
    const currentRejections = (issue.citizenVerification?.rejectionCount || 0) + (verified ? 0 : 1);

    let newStatus = verified ? "Resolved" : "Reopened";
    let priorityScore = issue.priorityScore;
    let priority = issue.priority;
    let escalationLevel = issue.escalationLevel;

    // If rejected by citizen repeatedly (>= 2 rejections), boost priority score and escalate
    if (!verified && currentRejections >= 2) {
      priorityScore = Math.min(100, priorityScore + 15);
      priority = "CRITICAL";
      escalationLevel = Math.min(4, escalationLevel + 1);
    }

    const updatedIssue = {
      ...issue,
      status: newStatus,
      priority,
      priorityScore,
      escalationLevel,
      citizenVerification: {
        verified,
        feedback: feedback || (verified ? "Issue resolved satisfactorily." : "Issue remains unresolved on-site."),
        rejectionCount: currentRejections,
        verifiedAt: now,
        proofImageUrl,
      },
      activityLogs: [
        {
          id: `log-${now}`,
          action: verified ? "CITIZEN VERIFIED & RESOLVED" : `CITIZEN REJECTED RESOLUTION (Rejection #${currentRejections})`,
          actor: "Citizen Reporter",
          timestamp: now,
          oldStatus: issue.status,
          newStatus,
          notes: verified
            ? "Citizen confirmed work completion on-site."
            : `Citizen reported issue is still not fixed: "${feedback || 'No comments'}". Complaint reopened.`,
        },
        ...(issue.activityLogs || []),
      ],
    };

    civicIssuesStore[index] = updatedIssue;
    return res.json({ success: true, issue: updatedIssue });
  }

  res.status(404).json({ error: "Issue not found" });
});

// POST manual / auto escalation
app.post("/api/issues/:id/escalate", (req, res) => {
  const { id } = req.params;
  const { reason, officerName } = req.body;

  const index = civicIssuesStore.findIndex((i) => i.id === id || i.ticketId === id);
  if (index !== -1) {
    const issue = civicIssuesStore[index];
    const now = Date.now();
    const nextLevel = Math.min(4, (issue.escalationLevel || 0) + 1);
    const roles = [
      "Field Inspector",
      "Senior Department Supervisor",
      "Zonal Executive Engineer",
      "District Collector / Commissioner",
      "State Civic Monitoring Auditor",
    ];

    const updatedIssue = {
      ...issue,
      status: "Escalated",
      escalationLevel: nextLevel,
      assignedOfficerRole: roles[nextLevel],
      escalationHistory: [
        {
          level: nextLevel,
          fromOfficer: issue.assignedOfficer || "Officer",
          toOfficer: `${roles[nextLevel]} (${officerName || "Manual Escalation"})`,
          reason: reason || "Manual Escalation Request",
          timestamp: now,
        },
        ...(issue.escalationHistory || []),
      ],
      activityLogs: [
        {
          id: `log-${now}`,
          action: `ESCALATED TO LEVEL ${nextLevel}`,
          actor: officerName || "Department Authority",
          timestamp: now,
          oldStatus: issue.status,
          newStatus: "Escalated",
          notes: `Escalated to ${roles[nextLevel]}. Reason: ${reason || "Urgent review required."}`,
        },
        ...(issue.activityLogs || []),
      ],
    };

    civicIssuesStore[index] = updatedIssue;
    return res.json({ success: true, issue: updatedIssue });
  }

  res.status(404).json({ error: "Issue not found" });
});

// POST close complaint - restricted to Admin or respective Department Head
app.post("/api/issues/:id/close", (req, res) => {
  const { id } = req.params;
  const { role, department, closedBy, closureRemarks } = req.body;

  const index = civicIssuesStore.findIndex((i) => i.id === id || i.ticketId === id);
  if (index !== -1) {
    const issue = civicIssuesStore[index];
    const now = Date.now();

    // Verification: Role must be admin OR (official/dept_head and matching issue department)
    const isAdmin = role === "admin";
    const isDeptHead = (role === "official" || role === "dept_head") && (
      !department || department === "All Departments" || department.toLowerCase() === issue.department.toLowerCase()
    );

    if (!isAdmin && !isDeptHead) {
      return res.status(403).json({
        success: false,
        error: `Unauthorized: Only the System Admin or the Head of '${issue.department}' can close this complaint.`
      });
    }

    const updatedIssue = {
      ...issue,
      status: "Closed" as const,
      activityLogs: [
        {
          id: `log-${now}`,
          action: "COMPLAINT CLOSED BY AUTHORITY",
          actor: closedBy || (isAdmin ? "System Admin Authority" : `Department Head (${issue.department})`),
          timestamp: now,
          oldStatus: issue.status,
          newStatus: "Closed",
          notes: closureRemarks || `Complaint officially signed off and closed by ${isAdmin ? 'Admin' : 'Department Head'}.`,
        },
        ...(issue.activityLogs || []),
      ],
    };

    civicIssuesStore[index] = updatedIssue;
    return res.json({ success: true, issue: updatedIssue });
  }

  res.status(404).json({ error: "Issue not found" });
});

// UPDATE status or officer notes
app.patch("/api/issues/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = civicIssuesStore.findIndex((i) => i.id === id || i.ticketId === id);

  if (index !== -1) {
    const issue = civicIssuesStore[index];
    const now = Date.now();

    const updatedIssue = {
      ...issue,
      ...updates,
      activityLogs: [
        {
          id: `log-${now}`,
          action: `STATUS UPDATED TO ${updates.status || issue.status}`,
          actor: updates.updatedBy || "Government Officer",
          timestamp: now,
          oldStatus: issue.status,
          newStatus: updates.status || issue.status,
          notes: updates.notes || `Status changed to ${updates.status || issue.status}`,
        },
        ...(issue.activityLogs || []),
      ],
    };

    civicIssuesStore[index] = updatedIssue;
    return res.json({ success: true, issue: updatedIssue });
  }

  res.status(404).json({ error: "Issue not found" });
});

// GET department performance & accountability metrics
app.get("/api/department-performance", (req, res) => {
  processSlaBreaches();

  const depts = [
    "Water Supply & Sewerage Board",
    "Roads & Municipal Engineering",
    "Sanitation Department",
    "Electrical Department",
  ];

  const performanceList = depts.map((deptName) => {
    const deptIssues = civicIssuesStore.filter((i) => i.department === deptName);
    const totalAssigned = deptIssues.length;
    const resolvedCount = deptIssues.filter((i) => i.status === "Resolved" || i.status === "Closed").length;
    const inProgressCount = deptIssues.filter((i) => i.status === "In Progress" || i.status === "Awaiting Citizen Verification").length;
    const slaBreachedCount = deptIssues.filter((i) => i.slaBreached).length;
    const escalatedCount = deptIssues.filter((i) => i.escalationLevel > 0).length;

    const resolutionRate = totalAssigned > 0 ? Math.round((resolvedCount / totalAssigned) * 100) : 100;
    const slaComplianceRate = totalAssigned > 0 ? Math.round(((totalAssigned - slaBreachedCount) / totalAssigned) * 100) : 100;

    return {
      departmentName: deptName,
      totalAssigned,
      resolvedCount,
      inProgressCount,
      slaBreachedCount,
      escalatedCount,
      resolutionRate,
      slaComplianceRate,
      avgResolutionTimeHours: deptName.includes("Water") ? 28 : deptName.includes("Road") ? 36 : 18,
      citizenSatisfactionScore: deptName.includes("Sanitation") ? 4.6 : 4.2,
      reopenRate: deptName.includes("Water") ? 8 : 4,
    };
  });

  res.json({ success: true, performance: performanceList });
});

// DEMO API: Simulate SLA Breach & Auto Escalation on Issue #1
app.post("/api/demo/simulate-breach", (req, res) => {
  if (civicIssuesStore.length > 0) {
    const target = civicIssuesStore[0];
    const now = Date.now();
    target.slaDeadline = now - 3600000; // Breached 1 hour ago
    target.slaBreached = true;
    target.slaBreachedAt = now - 3600000;
    target.status = "Escalated";
    target.escalationLevel = Math.min(4, (target.escalationLevel || 0) + 1);

    target.escalationHistory = [
      {
        level: target.escalationLevel,
        fromOfficer: target.assignedOfficer || "Level 0 Field Officer",
        toOfficer: "District Collector / Municipal Commissioner (DEMO ESCALATION)",
        reason: "🚨 Demo Trigger: SLA Deadline Breached (Simulated)",
        timestamp: now,
      },
      ...(target.escalationHistory || []),
    ];

    target.activityLogs = [
      {
        id: `demo-log-${now}`,
        action: `DEMO SIMULATED SLA BREACH & AUTO-ESCALATION TO LEVEL ${target.escalationLevel}`,
        actor: "Demo Control Panel",
        timestamp: now,
        newStatus: "Escalated",
        notes: "Presentation mode: SLA breach simulated successfully.",
      },
      ...(target.activityLogs || []),
    ];

    return res.json({ success: true, message: "SLA Breach simulated", issue: target });
  }

  res.status(400).json({ error: "No issues available to simulate breach" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicAI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
