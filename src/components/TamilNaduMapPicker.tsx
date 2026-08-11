import React, { useState, useRef, useEffect } from "react";

export interface TNLocation {
  name: string;
  district: string;
  lat: number;
  lng: number;
}

export const TN_DISTRICTS: TNLocation[] = [
  { name: "Chennai City", district: "Chennai District", lat: 13.0827, lng: 80.2707 },
  { name: "Coimbatore Central", district: "Coimbatore District", lat: 11.0168, lng: 76.9558 },
  { name: "Madurai Junction", district: "Madurai District", lat: 9.9252, lng: 78.1198 },
  { name: "Tiruchirappalli (Trichy)", district: "Tiruchirappalli District", lat: 10.7905, lng: 78.7047 },
  { name: "Salem Main Road", district: "Salem District", lat: 11.6643, lng: 78.1460 },
  { name: "Tirunelveli Town", district: "Tirunelveli District", lat: 8.7139, lng: 77.7567 },
  { name: "Vellore Fort Area", district: "Vellore District", lat: 12.9165, lng: 79.1325 },
  { name: "Erode Central", district: "Erode District", lat: 11.3410, lng: 77.7172 },
  { name: "Thanjavur Temple Circle", district: "Thanjavur District", lat: 10.7870, lng: 79.1378 },
  { name: "Kanchipuram Silk Hub", district: "Kanchipuram District", lat: 12.8342, lng: 79.7036 },
  { name: "Kanyakumari Coast", district: "Kanyakumari District", lat: 8.0883, lng: 77.5385 },
  { name: "Tiruppur Textile Zone", district: "Tiruppur District", lat: 11.1085, lng: 77.3411 },
  { name: "Dindigul Bypass", district: "Dindigul District", lat: 10.3673, lng: 77.9803 },
  { name: "Cuddalore Port", district: "Cuddalore District", lat: 11.7480, lng: 79.7714 },
  { name: "Thoothukudi (Tuticorin)", district: "Thoothukudi District", lat: 8.7642, lng: 78.1348 },
  { name: "Ramanathapuram", district: "Ramanathapuram District", lat: 9.3639, lng: 78.8395 },
];

export function findNearestDistrict(lat: number, lng: number): TNLocation {
  let nearest = TN_DISTRICTS[0];
  let minDistance = Infinity;

  TN_DISTRICTS.forEach((item) => {
    const d = Math.hypot(item.lat - lat, item.lng - lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = item;
    }
  });

  return nearest;
}

interface TamilNaduMapPickerProps {
  selectedLat: number;
  selectedLng: number;
  onLocationSelect: (lat: number, lng: number, locationName: string) => void;
  compact?: boolean;
}

export const TamilNaduMapPicker: React.FC<TamilNaduMapPickerProps> = ({
  selectedLat,
  selectedLng,
  onLocationSelect,
  compact = false,
}) => {
  const [pinLat, setPinLat] = useState<number>(selectedLat || 13.0827);
  const [pinLng, setPinLng] = useState<number>(selectedLng || 80.2707);
  const [districtInfo, setDistrictInfo] = useState<TNLocation>(() =>
    findNearestDistrict(selectedLat || 13.0827, selectedLng || 80.2707)
  );
  const [customArea, setCustomArea] = useState<string>("");

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Bounds for Tamil Nadu Map Projection
  // TN Lat range: ~ 8.0° N (South) to 13.6° N (North)
  // TN Lng range: ~ 76.2° E (West) to 80.4° E (East)
  const MIN_LAT = 8.0;
  const MAX_LAT = 13.6;
  const MIN_LNG = 76.2;
  const MAX_LNG = 80.4;

  // Convert lat/lng to percentage X/Y inside map container
  const latLngToPercent = (lat: number, lng: number) => {
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 100; // inverted Y
    return {
      x: Math.min(Math.max(x, 4), 96),
      y: Math.min(Math.max(y, 4), 96),
    };
  };

  // Convert click position X/Y inside map container to lat/lng
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = Math.min(Math.max(clickX / rect.width, 0), 1);
    const percentY = Math.min(Math.max(clickY / rect.height, 0), 1);

    const calcLng = MIN_LNG + percentX * (MAX_LNG - MIN_LNG);
    const calcLat = MAX_LAT - percentY * (MAX_LAT - MIN_LAT);

    const nearest = findNearestDistrict(calcLat, calcLng);

    setPinLat(calcLat);
    setPinLng(calcLng);
    setDistrictInfo(nearest);

    const formattedLoc = customArea.trim()
      ? `${customArea.trim()}, ${nearest.district}, Tamil Nadu`
      : `${nearest.name}, ${nearest.district}, Tamil Nadu`;

    onLocationSelect(calcLat, calcLng, formattedLoc);
  };

  const handleSelectDistrictPill = (dist: TNLocation) => {
    setPinLat(dist.lat);
    setPinLng(dist.lng);
    setDistrictInfo(dist);

    const formattedLoc = customArea.trim()
      ? `${customArea.trim()}, ${dist.district}, Tamil Nadu`
      : `${dist.name}, ${dist.district}, Tamil Nadu`;

    onLocationSelect(dist.lat, dist.lng, formattedLoc);
  };

  const pinPercent = latLngToPercent(pinLat, pinLng);

  useEffect(() => {
    if (selectedLat && selectedLng) {
      setPinLat(selectedLat);
      setPinLng(selectedLng);
      setDistrictInfo(findNearestDistrict(selectedLat, selectedLng));
    }
  }, [selectedLat, selectedLng]);

  return (
    <div className="space-y-3 text-white">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/40 p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
            <span className="material-symbols-outlined text-lg">pin_drop</span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider block">
              Tamil Nadu State Map Location Picker
            </span>
            <p className="text-xs font-bold text-white">
              {districtInfo.district} ({pinLat.toFixed(4)}°N, {pinLng.toFixed(4)}°E)
            </p>
          </div>
        </div>

        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2.5 py-1 rounded-full self-start sm:self-center">
          Tap Map to Mark Pin
        </span>
      </div>

      {/* Quick District Selector Pills */}
      <div className="space-y-1">
        <label className="text-[9px] font-black uppercase text-white/50 tracking-widest block">
          Select Major District / City in Tamil Nadu
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {TN_DISTRICTS.map((dist) => {
            const isSelected = districtInfo.district === dist.district;
            return (
              <button
                type="button"
                key={dist.district}
                onClick={() => handleSelectDistrictPill(dist)}
                className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-orange-500 text-black border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 border-white/10"
                }`}
              >
                {dist.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Tamil Nadu Canvas / Vector Map Container */}
      <div
        ref={mapContainerRef}
        onClick={handleMapClick}
        className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-orange-500/40 bg-[#030712] cursor-crosshair shadow-2xl group select-none"
      >
        {/* Tamil Nadu Vector Outline Base SVG */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-60 transition-opacity"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Stylized Tamil Nadu State Boundary Polygon */}
          <polygon
            points="
              85,10 95,20 90,30 82,38 88,50 92,65 80,82 65,95 45,98 25,85 10,75 5,60 15,45 30,30 40,25 60,15 75,5
            "
            fill="#0f172a"
            stroke="#f97316"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />

          {/* District Grid Overlay Lines */}
          <path
            d="
              M 10,75 Q 45,60 90,30
              M 25,85 Q 50,50 85,10
              M 5,60 Q 50,40 88,50
              M 40,25 L 65,95
              M 60,15 L 80,82
            "
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
        </svg>

        {/* Map Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* State Label overlay */}
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 pointer-events-none">
          <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Tamil Nadu State Boundary Map
          </span>
        </div>

        {/* Static District Pin Indicators across TN */}
        {TN_DISTRICTS.map((d) => {
          const pos = latLngToPercent(d.lat, d.lng);
          return (
            <div
              key={d.district}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60"></div>
              <span className="text-[7px] text-white/40 font-bold hidden sm:inline-block ml-1">
                {d.name.split(" ")[0]}
              </span>
            </div>
          );
        })}

        {/* Dynamic Placed Complaint Pin */}
        <div
          style={{ left: `${pinPercent.x}%`, top: `${pinPercent.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-300 ease-out z-30"
        >
          {/* Pin Label Banner */}
          <div className="bg-orange-500 text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xl mb-1 whitespace-nowrap animate-bounce flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">report</span>
            Complaint Pin Here
          </div>

          {/* Marker Pin Icon & Pulsing Halo */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-orange-500/40 animate-ping"></div>
            <span className="material-symbols-outlined text-orange-500 text-3xl drop-shadow-[0_0_16px_rgba(249,115,22,0.9)]">
              location_on
            </span>
          </div>
        </div>

        {/* Bottom Helper Hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-orange-500/30 pointer-events-none">
          <p className="text-[9px] text-orange-300 font-bold uppercase tracking-wider">
            👈 Click anywhere on Tamil Nadu map to adjust marker
          </p>
        </div>
      </div>

      {/* Specific Street / Landmark Optional Sub-input */}
      <div className="pt-1">
        <label className="text-[9px] font-black uppercase text-white/50 tracking-widest block mb-1">
          Street / Landmark / Ward Detail in {districtInfo.name}
        </label>
        <input
          type="text"
          value={customArea}
          onChange={(e) => {
            setCustomArea(e.target.value);
            const formatted = e.target.value.trim()
              ? `${e.target.value.trim()}, ${districtInfo.district}, Tamil Nadu`
              : `${districtInfo.name}, ${districtInfo.district}, Tamil Nadu`;
            onLocationSelect(pinLat, pinLng, formatted);
          }}
          placeholder="e.g. Anna Nagar 2nd Main Road, Ward 102"
          className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>
  );
};
