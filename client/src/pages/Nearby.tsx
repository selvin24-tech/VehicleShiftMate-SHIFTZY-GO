import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, MapPin, Navigation, Zap } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ShiftRequestCard from "@/components/common/ShiftRequestCard";
import { NEARBY_SHIFT_REQUESTS } from "@/lib/constants";

const VEHICLE_FILTERS = [
  { label: "All", value: "all" },
  { label: "🚗 Car", value: "car" },
  { label: "🚙 SUV", value: "suv" },
  { label: "🏍️ Bike", value: "bike" },
];

export default function Nearby() {
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = activeFilter === "all"
    ? NEARBY_SHIFT_REQUESTS
    : NEARBY_SHIFT_REQUESTS.filter(r => r.vehicle.type === activeFilter);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base leading-tight">Nearby Pickups</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600 font-semibold">Within 5 km of you</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <Navigation className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-bold text-green-700">{NEARBY_SHIFT_REQUESTS.length} near you</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {VEHICLE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all active:scale-95 ${
                activeFilter === f.value
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-green-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info strip */}
      <div className="mx-4 mt-4 mb-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          These vehicle owners need their vehicles moved — share the trip cost and both of you save!
        </p>
      </div>

      {/* Cards */}
      <div className="px-4 space-y-4">
        {filtered.length > 0 ? (
          filtered.map(request => (
            <ShiftRequestCard key={request.id} request={request} showDetails />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="font-semibold text-neutral-600">No {activeFilter === "all" ? "" : activeFilter + " "}vehicles nearby</p>
            <p className="text-sm text-neutral-400 mt-1">Try a different filter or check back later</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
