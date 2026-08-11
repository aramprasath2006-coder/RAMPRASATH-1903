import React, { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { CivicIssue, NavigationTab } from "../types";
import { TamilNaduMapPicker, TN_DISTRICTS, findNearestDistrict } from "./TamilNaduMapPicker";

interface LiveMapScreenProps {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  onNavigate: (tab: NavigationTab) => void;
}

type MapMode = "HEATMAP" | "PINS" | "HYBRID";

// World / India / Tamil Nadu GeoJSON topological mesh URL for react-simple-maps
const INDIA_GEO_JSON =
  "https://cdn.jsdelivr.net/gh/john-guerra/mapa_colombia/dist/topojson/world.json";

// Tamil Nadu Center Coordinates
const TN_CENTER_LNG = 78.6569;
const TN_CENTER_LAT = 11.1271;

export const LiveMapScreen: React.FC<LiveMapScreenProps> = ({
  issues,
  onSelectIssue,
  onNavigate,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(
    issues.length > 0 ? issues[0] : null
  );
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [mapMode, setMapMode] = useState<MapMode>("HYBRID");
  const [heatRadius, setHeatRadius] = useState<number>(45);
  const [tnMapCenter, setTnMapCenter] = useState<[number, number]>([TN_CENTER_LNG, TN_CENTER_LAT]);
  const [showMarkModal, setShowMarkModal] = useState<boolean>(false);

  const filteredIssues = useMemo(() => {
    return activeCategory === "ALL"
      ? issues
      : issues.filter((i) =>
          i.category.toLowerCase().includes(activeCategory.toLowerCase())
        );
  }, [issues, activeCategory]);

  // Compute map center from average lat/lng of current issues or fallback to TN Center
  const centerCoords: [number, number] = useMemo(() => {
    if (filteredIssues.length === 0) return tnMapCenter;
    const validIssues = filteredIssues.filter((i) => i.lng && i.lat && i.lng > 70 && i.lng < 85);
    if (validIssues.length === 0) return tnMapCenter;

    const avgLng =
      validIssues.reduce((acc, i) => acc + (i.lng || TN_CENTER_LNG), 0) /
      validIssues.length;
    const avgLat =
      validIssues.reduce((acc, i) => acc + (i.lat || TN_CENTER_LAT), 0) /
      validIssues.length;
    return [avgLng, avgLat];
  }, [filteredIssues, tnMapCenter]);

  // Compute incident density hotspots
  const densityHotspots = useMemo(() => {
    const total = filteredIssues.length;
    const emergencyCount = filteredIssues.filter(
      (i) => i.priority === "EMERGENCY"
    ).length;
    const highCount = filteredIssues.filter((i) => i.priority === "HIGH").length;
    const avgPriority = total
      ? Math.round(
          filteredIssues.reduce((acc, i) => acc + i.priorityScore, 0) / total
        )
      : 0;

    return {
      total,
      emergencyCount,
      highCount,
      avgPriority,
    };
  }, [filteredIssues]);

  // Group issues into Tamil Nadu District Clusters for Geo-spatial density overlay
  const districtClusters = useMemo(() => {
    const map: Record<
      string,
      {
        district: string;
        name: string;
        lat: number;
        lng: number;
        issueCount: number;
        emergencyCount: number;
        maxPriority: number;
        issues: CivicIssue[];
      }
    > = {};

    TN_DISTRICTS.forEach((d) => {
      map[d.district] = {
        district: d.district,
        name: d.name,
        lat: d.lat,
        lng: d.lng,
        issueCount: 0,
        emergencyCount: 0,
        maxPriority: 0,
        issues: [],
      };
    });

    filteredIssues.forEach((issue) => {
      const lat = issue.lat || TN_CENTER_LAT;
      const lng = issue.lng || TN_CENTER_LNG;
      const nearest = findNearestDistrict(lat, lng);

      if (!map[nearest.district]) {
        map[nearest.district] = {
          district: nearest.district,
          name: nearest.name,
          lat: nearest.lat,
          lng: nearest.lng,
          issueCount: 0,
          emergencyCount: 0,
          maxPriority: 0,
          issues: [],
        };
      }

      const cluster = map[nearest.district];
      cluster.issueCount += 1;
      if (issue.priority === "EMERGENCY" || issue.priority === "CRITICAL") {
        cluster.emergencyCount += 1;
      }
      cluster.maxPriority = Math.max(cluster.maxPriority, issue.priorityScore || 50);
      cluster.issues.push(issue);
    });

    return Object.values(map);
  }, [filteredIssues]);

  const getMarkerColor = (priority: string) => {
    switch (priority) {
      case "EMERGENCY":
        return "bg-red-500 text-black ring-4 ring-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.8)]";
      case "HIGH":
        return "bg-orange-500 text-black ring-4 ring-orange-500/40 shadow-[0_0_16px_rgba(249,115,22,0.8)]";
      case "MEDIUM":
        return "bg-blue-600 text-white ring-4 ring-blue-500/40";
      default:
        return "bg-slate-700 text-white ring-4 ring-slate-500/40";
    }
  };

  const getHeatFill = (score: number) => {
    if (score >= 90) return "url(#emergencyHeat)";
    if (score >= 70) return "url(#highHeat)";
    return "url(#mediumHeat)";
  };

  return (
    <main className="flex-1 pb-28 md:pb-12 max-w-[1440px] mx-auto w-full px-4 sm:px-6 pt-6 relative z-10">
      {/* Top Map Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-400">
                map
              </span>
              Live Civic Action Map & Heatmap
            </h1>
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
              Density Analytics
            </span>
          </div>
          <p className="text-xs text-white/60">
            Real-time incident density mapping, geographical heat clusters, AI
            priority scores, and municipal responses.
          </p>
        </div>

        {/* View Mode & Category Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Map Layer Mode Switcher */}
          <div className="bg-black/60 p-1 rounded-2xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setMapMode("HEATMAP")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === "HEATMAP"
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-black shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                local_fire_department
              </span>
              Heatmap Layer
            </button>
            <button
              onClick={() => setMapMode("PINS")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === "PINS"
                  ? "bg-orange-500 text-black shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                location_on
              </span>
              Pins Only
            </button>
            <button
              onClick={() => setMapMode("HYBRID")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === "HYBRID"
                  ? "bg-emerald-500 text-black shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">layers</span>
              Hybrid
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {["ALL", "Road", "Water", "Garbage", "Light"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Map Stage */}
      <div className="relative w-full h-[540px] sm:h-[620px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#030712]">
        {/* SVG Heat Gradients Definition for react-simple-maps Layer */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            {/* Emergency Priority Heat Circle Gradient */}
            <radialGradient id="emergencyHeat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.55" />
              <stop offset="75%" stopColor="#eab308" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            {/* High Priority Heat Circle Gradient */}
            <radialGradient id="highHeat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>

            {/* Medium/Low Priority Heat Circle Gradient */}
            <radialGradient id="mediumHeat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Base Map Grid & Radar Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        {/* React Simple Maps Geographical Component */}
        <div className="w-full h-full relative z-10">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 5200,
              center: centerCoords,
            }}
            className="w-full h-full"
          >
            <ZoomableGroup center={centerCoords} zoom={1}>
              <Geographies geography={INDIA_GEO_JSON}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#0f172a"
                      stroke="#f97316"
                      strokeWidth={0.8}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#1e293b", outline: "none" },
                        pressed: { fill: "#334155", outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Tamil Nadu District Cluster Density Overlay Layer */}
              {districtClusters.map((cluster) => {
                if (cluster.issueCount === 0) return null;
                const radius = Math.min(30 + cluster.issueCount * 8, 70);

                return (
                  <Marker
                    key={`district-cluster-${cluster.district}`}
                    coordinates={[cluster.lng, cluster.lat] as [number, number]}
                    onClick={() => {
                      if (cluster.issues.length > 0) {
                        setSelectedIssue(cluster.issues[0]);
                      }
                      setTnMapCenter([cluster.lng, cluster.lat]);
                    }}
                  >
                    <g className="cursor-pointer group">
                      {/* Cluster Pulsing Heat Ring */}
                      <circle
                        r={radius}
                        fill={
                          cluster.emergencyCount > 0
                            ? "#ef4444"
                            : cluster.maxPriority >= 75
                            ? "#f97316"
                            : "#3b82f6"
                        }
                        opacity={0.25}
                        className="animate-ping"
                      />
                      <circle
                        r={radius * 0.75}
                        fill={
                          cluster.emergencyCount > 0
                            ? "#ef4444"
                            : cluster.maxPriority >= 75
                            ? "#f97316"
                            : "#3b82f6"
                        }
                        opacity={0.4}
                      />
                      {/* Cluster Badge Circle */}
                      <circle
                        r={14}
                        fill="#030712"
                        stroke={
                          cluster.emergencyCount > 0
                            ? "#ef4444"
                            : cluster.maxPriority >= 75
                            ? "#f97316"
                            : "#3b82f6"
                        }
                        strokeWidth={2}
                      />
                      {/* Cluster Issue Count Text */}
                      <text
                        textAnchor="middle"
                        y={4}
                        style={{
                          fontFamily: "sans-serif",
                          fontSize: 10,
                          fontWeight: "900",
                          fill: "#ffffff",
                        }}
                      >
                        {cluster.issueCount}
                      </text>
                      {/* District Label Tag */}
                      <text
                        textAnchor="middle"
                        y={24}
                        style={{
                          fontFamily: "sans-serif",
                          fontSize: 9,
                          fontWeight: "bold",
                          fill: "#f97316",
                        }}
                      >
                        {cluster.name.split(" ")[0]}
                      </text>
                    </g>
                  </Marker>
                );
              })}

              {/* Render Incident Heatmap Density Layer */}
              {(mapMode === "HEATMAP" || mapMode === "HYBRID") &&
                filteredIssues.map((issue) => {
                  const lng = issue.lng || TN_CENTER_LNG;
                  const lat = issue.lat || TN_CENTER_LAT;
                  const radius = (heatRadius * (issue.priorityScore || 70)) / 100;

                  return (
                    <Marker key={`heat-${issue.id}`} coordinates={[lng, lat] as [number, number]}>
                      {/* Outer Pulse Halo */}
                      <circle
                        r={radius * 1.25}
                        fill={getHeatFill(issue.priorityScore)}
                        className="animate-pulse opacity-80"
                      />
                      {/* Inner High Density Core */}
                      <circle
                        r={radius * 0.65}
                        fill={getHeatFill(issue.priorityScore)}
                      />
                    </Marker>
                  );
                })}

              {/* Render Point Location Pins Layer */}
              {(mapMode === "PINS" || mapMode === "HYBRID") &&
                filteredIssues.map((issue) => {
                  const lng = issue.lng || TN_CENTER_LNG;
                  const lat = issue.lat || TN_CENTER_LAT;
                  const isSelected = selectedIssue?.id === issue.id;

                  return (
                    <Marker
                      key={`pin-${issue.id}`}
                      coordinates={[lng, lat] as [number, number]}
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <g className="cursor-pointer group hover:scale-125 transition-transform duration-200">
                        {/* Glow indicator */}
                        <circle
                          r={isSelected ? 18 : 12}
                          fill={
                            issue.priority === "EMERGENCY"
                              ? "#ef4444"
                              : issue.priority === "HIGH"
                              ? "#f97316"
                              : "#3b82f6"
                          }
                          opacity={0.35}
                          className="animate-ping"
                        />
                        {/* Pin Dot */}
                        <circle
                          r={isSelected ? 10 : 7}
                          fill={
                            issue.priority === "EMERGENCY"
                              ? "#ef4444"
                              : issue.priority === "HIGH"
                              ? "#f97316"
                              : "#3b82f6"
                          }
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                        {/* Label Badge */}
                        <text
                          textAnchor="middle"
                          y={-14}
                          style={{
                            fontFamily: "sans-serif",
                            fontSize: 10,
                            fontWeight: "bold",
                            fill: "#ffffff",
                          }}
                        >
                          {issue.title.split(" ")[0]} ({issue.priorityScore})
                        </text>
                      </g>
                    </Marker>
                  );
                })}
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Top Control Bar on Map */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          <div className="glass-panel px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2 shadow-lg border border-white/15 bg-black/60">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
            <span className="uppercase tracking-wider text-[10px] text-orange-400 font-black">
              Tamil Nadu Civic Map
            </span>
          </div>

          <button
            onClick={() => setShowMarkModal(true)}
            className="bg-orange-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-full shadow-[0_0_16px_rgba(249,115,22,0.6)] hover:bg-orange-400 flex items-center gap-1.5 cursor-pointer border border-orange-300"
          >
            <span className="material-symbols-outlined text-sm">pin_drop</span>
            Mark Complaint on TN Map
          </button>

          <button
            onClick={() => onNavigate("report")}
            className="bg-white/10 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-full hover:bg-white/20 flex items-center gap-1 cursor-pointer border border-white/20"
          >
            <span className="material-symbols-outlined text-sm">edit_document</span>
            File Report
          </button>
        </div>

        {/* Heatmap Legend & Radius Control Overlay */}
        <div className="absolute top-4 right-4 z-20 glass-card p-3 rounded-2xl border border-white/15 shadow-xl max-w-[220px] hidden sm:block">
          <span className="text-[9px] font-black uppercase text-white/50 tracking-widest block mb-2">
            Incident Density Legend
          </span>

          {/* Gradient Color Bar */}
          <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 via-orange-500 to-red-500 mb-1"></div>
          <div className="flex justify-between text-[9px] text-white/70 font-bold uppercase tracking-wider mb-3">
            <span>Low</span>
            <span>Moderate</span>
            <span className="text-red-400">Severe</span>
          </div>

          {/* Heat Radius Slider */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex justify-between items-center text-[9px] font-bold text-white/80 mb-1">
              <span>Heat Radius:</span>
              <span className="text-orange-400">{heatRadius}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={heatRadius}
              onChange={(e) => setHeatRadius(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer h-1.5 bg-white/20 rounded-lg"
            />
          </div>
        </div>

        {/* Selected Issue Preview Card Drawer */}
        {selectedIssue && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:max-w-md z-30 glass-card p-5 rounded-3xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div>
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                  #{selectedIssue.id} • {selectedIssue.category}
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {selectedIssue.title}
                </h3>
              </div>

              <span
                className={`text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
                  selectedIssue.priority === "EMERGENCY"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                }`}
              >
                {selectedIssue.priority}
              </span>
            </div>

            <p className="text-xs text-white/70 line-clamp-2 mb-3">
              {selectedIssue.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <span className="font-bold text-orange-400">
                {selectedIssue.department}
              </span>

              <button
                onClick={() => onSelectIssue(selectedIssue)}
                className="bg-orange-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-full hover:bg-orange-400 flex items-center gap-1 cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.4)]"
              >
                Full Details
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Density Analytics Summary Bar */}
      <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
            <span className="material-symbols-outlined">map</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">
              Active Map Clusters
            </span>
            <span className="text-lg font-black text-white">
              {densityHotspots.total} Hotspots
            </span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <span className="material-symbols-outlined">local_fire_department</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">
              Emergency Zones
            </span>
            <span className="text-lg font-black text-red-400">
              {densityHotspots.emergencyCount} Severe
            </span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">
              High Priority Density
            </span>
            <span className="text-lg font-black text-amber-300">
              {densityHotspots.highCount} Elevated
            </span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <span className="material-symbols-outlined">speed</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">
              Avg Heat Index
            </span>
            <span className="text-lg font-black text-white">
              {densityHotspots.avgPriority} / 100
            </span>
          </div>
        </div>
      </section>

      {/* Tamil Nadu Interactive Map Complaint Marker Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-card rounded-3xl border border-orange-500/30 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400 text-2xl">location_on</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    Mark Complaint on Tamil Nadu Map
                  </h3>
                  <p className="text-xs text-white/60">
                    Tap any district or location across Tamil Nadu to set complaint pin
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMarkModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <TamilNaduMapPicker
              selectedLat={13.0827}
              selectedLng={80.2707}
              onLocationSelect={(lat, lng, loc) => {
                // Pre-selected for reporting
              }}
            />

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowMarkModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowMarkModal(false);
                  onNavigate("report");
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold uppercase tracking-wider shadow-[0_0_16px_rgba(249,115,22,0.5)] cursor-pointer flex items-center gap-2"
              >
                <span>Proceed to File Report</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

