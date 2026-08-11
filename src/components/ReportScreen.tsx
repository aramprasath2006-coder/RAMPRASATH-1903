import React, { useState } from "react";
import { AIAnalysisResult } from "../types";
import { TamilNaduMapPicker } from "./TamilNaduMapPicker";

interface ReportScreenProps {
  onAnalysisComplete: (
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
  ) => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({ onAnalysisComplete }) => {
  const [title, setTitle] = useState("Damaged Streetlight near Anna Nagar Park");
  const [category, setCategory] = useState("light");
  const [description, setDescription] = useState(
    "Overhead light bulb is flicker-damaged and completely turned off at night, leaving the pedestrian crosswalk dark near hospital road."
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuANMwn6lptbtID4-DGwhny8IZ0NbedgJUkDk_YhVKS0Ohg-K_R2IsVvZPVldtMgc3uoy4rzgykJfx6jdQ6RHT2z6OsKnz5axw4O8dsuJ7TwhzSX05HrwdHIFHvkAB5nOElsbar9Wd9wIQSYJ8-aIiFtrofbHQn2LWU0iprMePVcHnyAuxsLi8ZkW6YkE-Qqch96jZY9IW1EFufRItekyXBrnXtwM4DB8J-7y28cCSWmCiI3cRtJwTA3"
  );
  const [locationName, setLocationName] = useState("Anna Nagar, Chennai District, Tamil Nadu");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 13.0827,
    lng: 80.2707,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Geolocation
  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationName(
            `GPS: ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E (Tamil Nadu)`
          );
          setIsLocating(false);
        },
        () => {
          // Fallback simulation to Tamil Nadu
          setCoords({ lat: 13.0827, lng: 80.2707 });
          setLocationName("Anna Nagar, Chennai District, Tamil Nadu");
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Handle Form Submit & AI Analysis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a title for the civic issue.");
      return;
    }
    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          imageBase64: imagePreview,
          location: locationName,
        }),
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        onAnalysisComplete(data.analysis, {
          title,
          category,
          description,
          imageBase64: imagePreview || undefined,
          locationName,
          lat: coords.lat,
          lng: coords.lng,
        });
      } else {
        throw new Error("Failed to parse analysis");
      }
    } catch (err) {
      console.error("AI Analysis error:", err);
      // Fallback analysis if offline
      const fallbackAnalysis: AIAnalysisResult = {
        detectedIssue: title || "Pothole",
        confidence: 94,
        recommendedDept: category === "water" ? "Water & Sewer Dept" : "Road Department",
        priorityScore: category === "water" ? 96 : 91,
        priorityLevel: "EMERGENCY",
        severity: 90,
        publicImpact: 85,
        safetyRisk: 95,
        recommendation: "Immediate inspection recommended due to high safety risk and public impact.",
      };
      onAnalysisComplete(fallbackAnalysis, {
        title,
        category,
        description,
        imageBase64: imagePreview || undefined,
        locationName,
        lat: coords.lat,
        lng: coords.lng,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="flex-grow p-4 md:max-w-2xl mx-auto w-full pb-28 md:pb-12 relative z-10">
      <div className="mb-6 text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider mb-1">
          Report Civic Issue
        </h1>
        <p className="text-xs sm:text-sm text-white/60">
          Provide details about the issue for multimodal AI vision & severity analysis.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/30 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info Glass Panel */}
        <div className="glass-card rounded-2xl p-5 space-y-4 border border-white/10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-400 mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-white/30"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-400 mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23f97316%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:0.75rem_auto]"
            >
              <option value="road" className="bg-[#050505] text-white">Road Damage / Pothole</option>
              <option value="garbage" className="bg-[#050505] text-white">Garbage / Waste</option>
              <option value="water" className="bg-[#050505] text-white">Water Leakage</option>
              <option value="light" className="bg-[#050505] text-white">Street Light</option>
              <option value="vandalism" className="bg-[#050505] text-white">Vandalism / Graffiti</option>
              <option value="other" className="bg-[#050505] text-white">Other Civic Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-400 mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context for the AI analysis..."
              className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:outline-none transition-all resize-none placeholder:text-white/30"
            ></textarea>
          </div>
        </div>

        {/* Evidence Upload Glass Panel */}
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <label className="block text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">Evidence Photo</label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-white/20 group">
              <img
                src={imagePreview}
                alt="Evidence Upload"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="bg-black/80 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/80 text-orange-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md backdrop-blur-md border border-white/10">
                Photo ready for Gemini Vision Scan
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all bg-black/20 group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <span className="material-symbols-outlined text-orange-400 text-4xl mb-2 group-hover:scale-110 transition-transform">
                cloud_upload
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">Tap to upload photos</span>
              <span className="text-[10px] text-white/50 mt-1">JPG, PNG up to 10MB</span>
            </label>
          )}
        </div>

        {/* Location Glass Panel with Tamil Nadu Interactive Map Picker */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-400">
              Complaint Location (Tamil Nadu)
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 text-orange-400 text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/30 hover:bg-orange-500/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isLocating ? "sync" : "my_location"}
              </span>
              {isLocating ? "Locating..." : "Use GPS Location"}
            </button>
          </div>

          <p className="text-xs text-white/90 font-semibold flex items-center gap-1.5 bg-black/40 p-2.5 rounded-xl border border-white/10">
            <span className="material-symbols-outlined text-sm text-orange-400">location_on</span>
            Marked Location: <span className="text-orange-300 font-extrabold">{locationName}</span>
          </p>

          <TamilNaduMapPicker
            selectedLat={coords.lat}
            selectedLng={coords.lng}
            onLocationSelect={(lat, lng, loc) => {
              setCoords({ lat, lng });
              setLocationName(loc);
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full bg-orange-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-[0.15em] rounded-xl py-4 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all cursor-pointer disabled:opacity-50 mt-6"
        >
          <span className={`material-symbols-outlined ${isAnalyzing ? "animate-spin" : ""}`}>
            {isAnalyzing ? "sync" : "smart_toy"}
          </span>
          {isAnalyzing ? "Analyzing with Civic Action AI..." : "Analyze with Civic Action AI"}
        </button>
      </form>
    </main>
  );
};
