import React, { useState } from "react";
import { CivicIssue, UserProfile } from "../types";

interface CitizenImpactSectionProps {
  user: UserProfile;
  issues: CivicIssue[];
  compact?: boolean;
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

export interface ImpactBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "reporting" | "resolution" | "category" | "community";
  unlocked: boolean;
  progress: number; // 0 to 100
  progressText: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  unlockedDate?: string;
}

export const CitizenImpactSection: React.FC<CitizenImpactSectionProps> = ({
  user,
  issues,
  compact = false,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "unlocked" | "locked">("all");

  // Edit Profile Modal States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name || "");
  const [editEmail, setEditEmail] = useState(user.email || "");
  const [editMobile, setEditMobile] = useState(user.mobile || "");
  const [editDistrict, setEditDistrict] = useState(user.district || "Chennai Corporation");
  const [editAddress, setEditAddress] = useState(user.address || "");
  const [editPincode, setEditPincode] = useState(user.pincode || "");
  const [editBio, setEditBio] = useState(user.bio || "");
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl || "");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const presetAvatars = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBVpPwVPV6fl-R7ZdKSNTlJrhmXqkdhl7-na-GrzyzOY5_1FN_tX206sEf3_6FWgzOu-gg9mqSALJ0zQrqeGnQFpawDbXcuM3c4m3Bo3YM8QILc4eYUFpcIHlbLna1jVTj8zFdVYy7FbuMrdVL27x1MYDbX-loE1y_VYsCiQz2tq5HchLY2ZNt05TdfiVRXy9kiNoEXb6y2Og5vakUcCXIgvOgzj1Q93cvZP4S_WVT6aC_i6ZbheRy6",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBsiVWurosgMAzbAKgcKDyVO9Oo1lzxA3lKCioBr_Z0X2PM2RsuOZpbR3L-d1Ga9szFTZ1Bp4ppUOLajQbxPTSyuY2HeWI4y57G40H5fgpuSamQij6Q3EmT3CsrCGq1s2RbE6m2W6_mncoh_ieJWf1X3ijGseRSORqlZQHUbEJwyIXBDsKRRKt0BAI3GBEpfpkRqOrkhKKeBxTsyOijKtZ1dD2GpnyWvXJI-DOftV2T-KwzG7FyGwpo",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  ];

  const tnDistricts = [
    "Chennai Corporation",
    "Coimbatore Corporation",
    "Madurai Corporation",
    "Tiruchirappalli Corporation",
    "Salem Corporation",
    "Tirunelveli Corporation",
    "Erode Corporation",
    "Vellore Corporation",
    "Thanjavur Corporation",
    "Dindigul Corporation",
    "Kanchipuram District",
    "Cuddalore District",
    "Other Tamil Nadu Municipality",
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setEditAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...user,
      name: editName.trim() || user.name,
      email: editEmail.trim() || user.email,
      mobile: editMobile.trim() || user.mobile,
      avatarUrl: editAvatarUrl || user.avatarUrl,
      district: editDistrict.trim(),
      address: editAddress.trim(),
      pincode: editPincode.trim(),
      bio: editBio.trim(),
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setIsEditingProfile(false);
    }, 1200);
  };

  // Calculate user specific metrics
  // Check issues reported by user or fallback to all issues if matching
  const userIssues = issues.filter(
    (i) => i.reporter?.toLowerCase() === user.name?.toLowerCase() || issues.length > 0
  );

  const totalSubmitted = userIssues.length;
  const totalResolved = userIssues.filter((i) => i.status === "Resolved").length;
  const totalInProgress = userIssues.filter((i) => i.status === "In Progress").length;
  const emergencyReported = userIssues.filter(
    (i) => i.priority === "EMERGENCY" || i.priority === "HIGH"
  ).length;

  const waterDrainageReported = userIssues.filter((i) =>
    /water|drainage|flood/i.test(i.category)
  ).length;

  const roadReported = userIssues.filter((i) =>
    /road|pothole|street/i.test(i.category)
  ).length;

  const garbageReported = userIssues.filter((i) =>
    /garbage|waste|clean/i.test(i.category)
  ).length;

  const resolutionRate =
    totalSubmitted > 0 ? Math.round((totalResolved / totalSubmitted) * 100) : 0;

  const impactPoints =
    totalSubmitted * 50 + totalResolved * 120 + emergencyReported * 75;

  // Level computation
  let citizenLevel = 1;
  let levelTitle = "Civic Novice";
  let nextLevelPoints = 200;

  if (impactPoints >= 800) {
    citizenLevel = 5;
    levelTitle = "Grand Civic Guardian";
    nextLevelPoints = 1000;
  } else if (impactPoints >= 500) {
    citizenLevel = 4;
    levelTitle = "Community Champion";
    nextLevelPoints = 800;
  } else if (impactPoints >= 300) {
    citizenLevel = 3;
    levelTitle = "Master Reporter";
    nextLevelPoints = 500;
  } else if (impactPoints >= 100) {
    citizenLevel = 2;
    levelTitle = "Active Sentinel";
    nextLevelPoints = 300;
  }

  const levelProgress = Math.min(
    100,
    Math.round((impactPoints / nextLevelPoints) * 100)
  );

  // Dynamic Badges Evaluation
  const badges: ImpactBadge[] = [
    {
      id: "top_reporter",
      title: "Top Reporter",
      description: "Submitted 3 or more verified civic complaints to the portal.",
      icon: "campaign",
      category: "reporting",
      unlocked: totalSubmitted >= 3,
      progress: Math.min(100, Math.round((totalSubmitted / 3) * 100)),
      progressText: `${Math.min(totalSubmitted, 3)} / 3 Submissions`,
      color: "text-amber-400",
      borderColor: "border-amber-500/40",
      bgGlow: "bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
      unlockedDate: "Aug 2026",
    },
    {
      id: "fast_resolver",
      title: "Fast Resolver",
      description: "Has 1 or more reported civic issues fully resolved by authorities.",
      icon: "bolt",
      category: "resolution",
      unlocked: totalResolved >= 1,
      progress: Math.min(100, Math.round((totalResolved / 1) * 100)),
      progressText: `${Math.min(totalResolved, 1)} / 1 Resolved`,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/40",
      bgGlow: "bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
      unlockedDate: "Aug 2026",
    },
    {
      id: "civic_sentinel",
      title: "Civic Sentinel",
      description: "Reported an Emergency or High-priority hazard verified by AI.",
      icon: "shield_with_heart",
      category: "reporting",
      unlocked: emergencyReported >= 1,
      progress: Math.min(100, Math.round((emergencyReported / 1) * 100)),
      progressText: `${Math.min(emergencyReported, 1)} / 1 High Hazard`,
      color: "text-red-400",
      borderColor: "border-red-500/40",
      bgGlow: "bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]",
      unlockedDate: "Aug 2026",
    },
    {
      id: "eco_guardian",
      title: "Water & Flood Guardian",
      description: "Reported water leakage, drainage blockage, or flood hazards.",
      icon: "water_drop",
      category: "category",
      unlocked: waterDrainageReported >= 1,
      progress: Math.min(100, Math.round((waterDrainageReported / 1) * 100)),
      progressText: `${Math.min(waterDrainageReported, 1)} / 1 Water Issue`,
      color: "text-cyan-400",
      borderColor: "border-cyan-500/40",
      bgGlow: "bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]",
      unlockedDate: "Aug 2026",
    },
    {
      id: "road_watchdog",
      title: "Road Watchdog",
      description: "Logged road damage, pothole, or street light infrastructure issues.",
      icon: "edit_road",
      category: "category",
      unlocked: roadReported >= 1,
      progress: Math.min(100, Math.round((roadReported / 1) * 100)),
      progressText: `${Math.min(roadReported, 1)} / 1 Road Issue`,
      color: "text-orange-400",
      borderColor: "border-orange-500/40",
      bgGlow: "bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]",
      unlockedDate: "Aug 2026",
    },
    {
      id: "clean_city_hero",
      title: "Clean City Hero",
      description: "Reported garbage accumulation or public sanitation concerns.",
      icon: "cleaning_services",
      category: "category",
      unlocked: garbageReported >= 1,
      progress: Math.min(100, Math.round((garbageReported / 1) * 100)),
      progressText: `${Math.min(garbageReported, 1)} / 1 Sanitation Issue`,
      color: "text-teal-400",
      borderColor: "border-teal-500/40",
      bgGlow: "bg-teal-500/10 shadow-[0_0_20px_rgba(20,184,166,0.2)]",
      unlockedDate: "Aug 2026",
    },
    {
      id: "community_champion",
      title: "Community Champion",
      description: "Achieved a 50%+ resolution outcome rate for community safety.",
      icon: "workspace_premium",
      category: "community",
      unlocked: resolutionRate >= 50 && totalSubmitted >= 2,
      progress: Math.min(100, resolutionRate),
      progressText: `${resolutionRate}% Resolution Rate`,
      color: "text-purple-400",
      borderColor: "border-purple-500/40",
      bgGlow: "bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      unlockedDate: "Aug 2026",
    },
  ];

  const filteredBadges = badges.filter((b) => {
    if (activeTab === "unlocked") return b.unlocked;
    if (activeTab === "locked") return !b.unlocked;
    return true;
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  if (compact) {
    return (
      <div className="glass-card rounded-2xl border border-orange-500/30 p-4 relative overflow-hidden bg-gradient-to-r from-orange-950/30 via-black to-emerald-950/20">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black text-xs">
              <span className="material-symbols-outlined text-sm">military_tech</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Citizen Impact Score
              </h3>
              <p className="text-[10px] text-white/60">
                Level {citizenLevel} • {levelTitle}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-orange-400">{impactPoints}</span>
            <span className="text-[9px] text-white/50 block font-bold uppercase tracking-widest">
              Impact Pts
            </span>
          </div>
        </div>

        {/* Unlocked Badges Horizontal Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {badges.map((badge) => (
            <div
              key={badge.id}
              title={`${badge.title}: ${badge.description}`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border transition-all ${
                badge.unlocked
                  ? `${badge.color} ${badge.borderColor} ${badge.bgGlow}`
                  : "text-white/30 border-white/10 bg-white/5 grayscale"
              }`}
            >
              <span className="material-symbols-outlined text-xs">{badge.icon}</span>
              <span>{badge.title}</span>
              {badge.unlocked && (
                <span className="material-symbols-outlined text-[10px] text-emerald-400">
                  check_circle
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="glass-card rounded-3xl border border-white/15 p-5 sm:p-7 space-y-6 relative overflow-hidden bg-gradient-to-b from-white/5 via-black/60 to-black/90 shadow-2xl">
      {/* Decorative Background Orb */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Citizen Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            />
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md">
              Lvl {citizenLevel}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {user.name}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
                Verified Citizen
              </span>
              {user.district && (
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">location_on</span>
                  {user.district}
                </span>
              )}
            </div>
            <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mt-0.5">
              {levelTitle} • Government of Tamil Nadu Civic Network
            </p>
            <p className="text-[11px] text-white/50 mt-1 flex flex-wrap items-center gap-2">
              <span>{user.email}</span> • <span>{user.mobile}</span>
              {user.pincode && <span>• PIN: {user.pincode}</span>}
            </p>
            {user.bio && (
              <p className="text-xs text-white/70 italic mt-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 max-w-lg">
                "{user.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Action Controls & Progression */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setEditName(user.name || "");
              setEditEmail(user.email || "");
              setEditMobile(user.mobile || "");
              setEditDistrict(user.district || "Chennai Corporation");
              setEditAddress(user.address || "");
              setEditPincode(user.pincode || "");
              setEditBio(user.bio || "");
              setEditAvatarUrl(user.avatarUrl || "");
              setIsEditingProfile(true);
            }}
            className="bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit Profile
          </button>

          {/* Level Progression Card */}
          <div className="glass-card p-3.5 rounded-2xl border border-white/10 min-w-[220px]">
            <div className="flex justify-between items-center text-xs font-bold text-white mb-1.5">
              <span className="text-white/60 uppercase tracking-widest text-[10px]">
                Level {citizenLevel} Progress
              </span>
              <span className="text-orange-400 font-extrabold">{impactPoints} / {nextLevelPoints} Pts</span>
            </div>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1.5">
              <span>Level {citizenLevel}</span>
              <span>Next: Level {citizenLevel + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Impact Stats Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              Impact Score
            </span>
            <span className="material-symbols-outlined text-orange-400 text-lg">
              military_tech
            </span>
          </div>
          <span className="text-2xl font-black text-orange-400 mt-2">
            {impactPoints} <span className="text-xs font-bold text-white/50">pts</span>
          </span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              Issues Reported
            </span>
            <span className="material-symbols-outlined text-blue-400 text-lg">
              assignment_turned_in
            </span>
          </div>
          <span className="text-2xl font-black text-white mt-2">{totalSubmitted}</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              Successfully Resolved
            </span>
            <span className="material-symbols-outlined text-emerald-400 text-lg">
              task_alt
            </span>
          </div>
          <span className="text-2xl font-black text-emerald-400 mt-2">
            {totalResolved}
          </span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              Resolution Rate
            </span>
            <span className="material-symbols-outlined text-purple-400 text-lg">
              speed
            </span>
          </div>
          <span className="text-2xl font-black text-purple-300 mt-2">
            {resolutionRate}%
          </span>
        </div>
      </div>

      {/* Dynamic Badges Gallery Header */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">
                workspace_premium
              </span>
              Citizen Impact Badges
            </h3>
            <p className="text-xs text-white/60">
              Earned dynamically based on verified civic reports, resolution speed, and community impact.
            </p>
          </div>

          {/* Badge Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "all"
                  ? "bg-orange-500 text-black shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              All ({badges.length})
            </button>
            <button
              onClick={() => setActiveTab("unlocked")}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "unlocked"
                  ? "bg-emerald-500 text-black shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setActiveTab("locked")}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "locked"
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Locked ({badges.length - unlockedCount})
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`glass-card p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                badge.unlocked
                  ? `${badge.borderColor} ${badge.bgGlow} hover:scale-[1.02]`
                  : "border-white/10 bg-white/5 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        badge.unlocked
                          ? `${badge.color} border-white/20 bg-black/40`
                          : "text-white/30 border-white/10 bg-white/5"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {badge.icon}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        {badge.title}
                      </h4>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest ${
                          badge.unlocked ? badge.color : "text-white/40"
                        }`}
                      >
                        {badge.unlocked ? "Unlocked Badge" : "Locked Badge"}
                      </span>
                    </div>
                  </div>

                  {badge.unlocked ? (
                    <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0">
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-white/30 text-lg shrink-0">
                      lock
                    </span>
                  )}
                </div>

                <p className="text-xs text-white/70 leading-relaxed mb-3">
                  {badge.description}
                </p>
              </div>

              {/* Progress Bar / Unlocked Date */}
              <div className="pt-2 border-t border-white/10">
                {badge.unlocked ? (
                  <div className="flex justify-between items-center text-[10px] font-bold text-emerald-400">
                    <span className="uppercase tracking-widest">Achieved</span>
                    <span>Unlocked {badge.unlockedDate || "Recent"}</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-white/50 mb-1">
                      <span>Requirement:</span>
                      <span className="text-orange-400">{badge.progressText}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${badge.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="glass-card rounded-3xl border border-orange-500/30 p-6 sm:p-8 max-w-xl w-full relative shadow-2xl my-8 space-y-6">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-t-3xl"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                  <span className="material-symbols-outlined text-xl">manage_accounts</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Edit Citizen Profile
                  </h3>
                  <p className="text-xs text-white/60">
                    Update your official Tamil Nadu civic profile details
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Success Banner */}
            {saveSuccessMsg && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
                <span className="material-symbols-outlined text-xl text-emerald-400">check_circle</span>
                <span>Profile updated successfully! Refreshing details...</span>
              </div>
            )}

            {/* Profile Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar Selection Section */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Profile Photo & Avatar
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={editAvatarUrl || user.avatarUrl}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-lg"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-orange-500 text-black text-[9px] font-black p-1 rounded-full">
                      <span className="material-symbols-outlined text-xs">photo_camera</span>
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <span className="text-xs font-bold text-white/80 block">Choose Preset Avatar or Upload Custom Photo</span>
                    
                    {/* Preset Avatars Row */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {presetAvatars.map((url, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setEditAvatarUrl(url)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            editAvatarUrl === url ? "border-orange-500 scale-110 shadow-[0_0_12px_rgba(249,115,22,0.6)]" : "border-white/20 hover:border-white/60 opacity-70"
                          }`}
                        >
                          <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    {/* Upload File Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <label
                        htmlFor="photo-file-input"
                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm text-orange-400">upload_file</span>
                        <span>Upload Photo File</span>
                      </label>
                      <input
                        id="photo-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />

                      <span className="text-[10px] text-white/40 font-semibold">JPG, PNG or WEBP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-base">
                      person
                    </span>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter full name"
                      className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-semibold text-white outline-none border border-white/10 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-base">
                      mail
                    </span>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="citizen@tn.gov.in"
                      className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-semibold text-white outline-none border border-white/10 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                    Mobile Number (+91)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-base">
                      call
                    </span>
                    <input
                      type="tel"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      placeholder="+91 9876543210"
                      className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-semibold text-white outline-none border border-white/10 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* District / Corporation */}
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                    District / Corporation
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-base">
                      location_city
                    </span>
                    <select
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-semibold text-white outline-none border border-white/10 focus:border-orange-500 bg-[#090d16] appearance-none cursor-pointer"
                    >
                      {tnDistricts.map((dist) => (
                        <option key={dist} value={dist} className="bg-[#090d16] text-white">
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address & Pincode Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                    Ward / Street Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="e.g. Ward 102, Anna Nagar West"
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-white outline-none border border-white/10 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    placeholder="600040"
                    maxLength={6}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-white outline-none border border-white/10 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Bio / Civic Commitment */}
              <div>
                <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                  Civic Mission & Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share your goals for community improvement and local neighborhood cleanliness..."
                  rows={2}
                  className="glass-input w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-white outline-none border border-white/10 focus:border-orange-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold uppercase tracking-wider shadow-[0_0_16px_rgba(249,115,22,0.4)] cursor-pointer transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
