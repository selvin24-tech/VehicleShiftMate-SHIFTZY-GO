import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { AVAILABLE_VEHICLES, LOCATIONS, CHENNAI_LOCALITIES } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Star, CheckCircle2, X } from "lucide-react";

/* ─── Approx distances (km) between outstation cities ─── */
const CITY_DISTANCES: Record<string, Record<string, number>> = {
  Chennai:        { Tiruvannamalai: 185, Bangalore: 345, Coimbatore: 495, Madurai: 460, Salem: 335, Tirupati: 135, Pondicherry: 160, Kochi: 685 },
  Tiruvannamalai: { Chennai: 185, Bangalore: 220, Coimbatore: 310, Madurai: 280, Salem: 150, Tirupati: 230, Pondicherry: 130, Kochi: 500 },
  Bangalore:      { Chennai: 345, Tiruvannamalai: 220, Coimbatore: 365, Madurai: 440, Salem: 250, Tirupati: 160, Pondicherry: 310, Kochi: 600 },
  Coimbatore:     { Chennai: 495, Tiruvannamalai: 310, Bangalore: 365, Madurai: 215, Salem: 165, Tirupati: 450, Pondicherry: 380, Kochi: 200 },
  Madurai:        { Chennai: 460, Tiruvannamalai: 280, Bangalore: 440, Coimbatore: 215, Salem: 295, Tirupati: 420, Pondicherry: 320, Kochi: 380 },
  Salem:          { Chennai: 335, Tiruvannamalai: 150, Bangalore: 250, Coimbatore: 165, Madurai: 295, Tirupati: 295, Pondicherry: 240, Kochi: 370 },
  Tirupati:       { Chennai: 135, Tiruvannamalai: 230, Bangalore: 160, Coimbatore: 450, Madurai: 420, Salem: 295, Pondicherry: 200, Kochi: 750 },
  Pondicherry:    { Chennai: 160, Tiruvannamalai: 130, Bangalore: 310, Coimbatore: 380, Madurai: 320, Salem: 240, Tirupati: 200, Kochi: 550 },
  Kochi:          { Chennai: 685, Tiruvannamalai: 500, Bangalore: 600, Coimbatore: 200, Madurai: 380, Salem: 370, Tirupati: 750, Pondicherry: 550 },
};

/* ─── Local area distance estimate (flat) ─── */
const LOCAL_DISTANCE_KM = 18;

/* ─── 3 Vehicle categories ─── */
const VEHICLE_CATEGORIES = [
  {
    id: "bike",
    emoji: "🏍️",
    label: "Bike",
    tag: "Budget Friendly",
    tagColor: "bg-blue-100 text-blue-700",
    desc: "Quick & Economical",
    detail: "Ideal for solo travellers. Fastest for short distances.",
    examples: ["Bajaj Pulsar", "TVS Apache", "Royal Enfield", "Yamaha R15", "KTM Duke", "Hero Xpulse"],
    pricePerKm: 4,          // traveler's share per km
    color: "from-blue-500 to-blue-700",
    borderColor: "border-blue-300",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    vehicles: AVAILABLE_VEHICLES.filter(v => v.type === "bike"),
  },
  {
    id: "car",
    emoji: "🚗",
    label: "Budget Car",
    tag: "Most Popular",
    tagColor: "bg-green-100 text-green-700",
    desc: "Comfortable & Practical",
    detail: "Sedans & hatchbacks. Great for 1–4 passengers.",
    examples: ["Maruti Swift", "Honda City", "Tata Nexon", "Hyundai i20", "Kia Seltos", "Skoda Slavia"],
    pricePerKm: 6,
    color: "from-green-500 to-emerald-600",
    borderColor: "border-green-300",
    bgLight: "bg-green-50",
    textColor: "text-green-700",
    vehicles: AVAILABLE_VEHICLES.filter(v => v.type === "car"),
  },
  {
    id: "premium",
    emoji: "👑",
    label: "Premium / SUV",
    tag: "Top Comfort",
    tagColor: "bg-orange-100 text-orange-700",
    desc: "Spacious & Luxurious",
    detail: "SUVs & luxury cars. Perfect for long routes & families.",
    examples: ["Mahindra XUV700", "BMW 5 Series", "Mercedes E-Class", "Audi A6", "Range Rover", "Toyota Fortuner"],
    pricePerKm: 8,
    color: "from-orange-500 to-orange-600",
    borderColor: "border-orange-300",
    bgLight: "bg-orange-50",
    textColor: "text-orange-700",
    vehicles: AVAILABLE_VEHICLES.filter(v => v.type === "suv" || v.type === "luxury"),
  },
];

/* ─── helpers ─── */
function getDistance(from: string, to: string, isLocal: boolean) {
  if (isLocal) return LOCAL_DISTANCE_KM;
  return CITY_DISTANCES[from]?.[to] ?? CITY_DISTANCES[to]?.[from] ?? 300;
}

function calcPrice(pricePerKm: number, distKm: number) {
  const raw = pricePerKm * distKm;
  return Math.round(raw / 50) * 50; // round to nearest ₹50
}

/* ─── MAIN COMPONENT ─── */
export default function Travel() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [mode, setMode] = useState<"outstation" | "local">("outstation");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [travelDate, setTravelDate] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [travelTime, setTravelTime] = useState("09:00");
  const [searched, setSearched] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const locations = mode === "outstation" ? LOCATIONS : CHENNAI_LOCALITIES;
  const canSearch = pickup && drop && pickup !== drop;
  const distKm = searched ? getDistance(pickup, drop, mode === "local") : 0;

  const handleSearch = () => {
    if (!canSearch) {
      toast({ title: "Select pickup & drop", description: "Please choose two different locations.", variant: "destructive" });
      return;
    }
    setSearched(true);
    setExpandedCategory(null);
  };

  const resetSearch = () => {
    setSearched(false);
    setPickup("");
    setDrop("");
    setExpandedCategory(null);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <Header title="Find a Vehicle to Drive" variant="secondary" showAnimation={true} />

      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <button onClick={() => navigate("/")}
          className="bg-black text-white shadow-lg hover:bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center">
          <ChevronLeft className="h-7 w-7" />
        </button>
      </div>

      <div className="p-4 space-y-5">

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl px-4 py-4 border border-blue-100">
          <p className="text-lg font-bold text-blue-900 leading-snug">Are you moving somewhere? 🚀</p>
          <p className="text-sm text-blue-600 mt-1">Pick your route → choose your vehicle → start your journey</p>
        </div>

        {/* ─── STEP 1: Mode toggle ─── */}
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Step 1 — Select Travel Type</p>
          <div className="bg-neutral-100 rounded-xl p-1 flex w-full">
            {[
              { val: "outstation", emoji: "🛣️", label: "Outstation" },
              { val: "local",      emoji: "📍", label: "Local" },
            ].map(tab => (
              <button key={tab.val} type="button"
                onClick={() => { setMode(tab.val as any); setSearched(false); setPickup(""); setDrop(""); setExpandedCategory(null); }}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm flex flex-col items-center gap-0.5 transition-all duration-200
                  ${mode === tab.val ? "bg-white shadow text-blue-700 border-b-2 border-blue-600" : "text-neutral-500"}`}>
                <span className="text-2xl">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── STEP 2: Route picker ─── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Step 2 — Select Your Route</p>
            {searched && (
              <button onClick={resetSearch} className="text-xs text-red-500 font-semibold flex items-center gap-1">
                <X className="w-3 h-3" /> Change
              </button>
            )}
          </div>

          {/* Route card */}
          <div className="rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
            style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#fff7ed 100%)" }}>
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <span>🗺️</span>
              <p className="text-sm font-bold text-neutral-700">
                {mode === "outstation" ? "Pick your start & destination city" : "Pick your pickup & drop area"}
              </p>
            </div>

            <div className="px-4 pb-4 flex gap-3">
              {/* Route line */}
              <div className="flex flex-col items-center pt-1" style={{ width: 28, minWidth: 28 }}>
                <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex flex-col gap-1 my-1.5">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-0.5 h-2 bg-neutral-300 rounded-full mx-auto" />)}
                </div>
                <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* Selects */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Pickup */}
                <div className="bg-white rounded-xl shadow-sm border border-green-100 p-3">
                  <p className="text-xs font-bold text-green-600 mb-1">● Pickup {mode === "outstation" ? "City" : "Area"}</p>
                  <select value={pickup} onChange={e => { setPickup(e.target.value); setSearched(false); }}
                    className="w-full text-sm font-medium text-neutral-800 bg-transparent border-none outline-none appearance-none cursor-pointer">
                    <option value="">Choose pickup {mode === "outstation" ? "city" : "area"}...</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>

                {/* Drop */}
                <div className="bg-white rounded-xl shadow-sm border border-red-100 p-3">
                  <p className="text-xs font-bold text-red-500 mb-1">● Drop {mode === "outstation" ? "City" : "Area"}</p>
                  <select value={drop} onChange={e => { setDrop(e.target.value); setSearched(false); }}
                    className="w-full text-sm font-medium text-neutral-800 bg-transparent border-none outline-none appearance-none cursor-pointer">
                    <option value="">Choose drop {mode === "outstation" ? "city" : "area"}...</option>
                    {locations.filter(l => l !== pickup).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Route preview pill */}
            {pickup && drop && (
              <div className="mx-4 mb-4 px-3 py-2 rounded-xl bg-white border border-blue-100 shadow-inner flex items-center gap-2">
                <span className="text-green-600 font-bold text-sm">{pickup}</span>
                <div className="flex-1 flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => <div key={i} className="flex-1 h-0.5 bg-blue-300 rounded-full" />)}
                  <span className="text-base">🚗</span>
                  {[...Array(5)].map((_, i) => <div key={i} className="flex-1 h-0.5 bg-blue-300 rounded-full" />)}
                </div>
                <span className="text-red-500 font-bold text-sm">{drop}</span>
              </div>
            )}
          </div>

          {/* Date & Time (outstation only) */}
          {mode === "outstation" && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white border border-blue-100 rounded-xl p-3 shadow-sm">
                <p className="text-xs font-bold text-blue-600 mb-1">📅 Travel Date</p>
                <input type="date" min={new Date().toISOString().split("T")[0]} value={travelDate}
                  onChange={e => setTravelDate(e.target.value)}
                  className="w-full text-sm font-medium text-neutral-800 border-none outline-none bg-transparent" />
              </div>
              <div className="bg-white border border-orange-100 rounded-xl p-3 shadow-sm">
                <p className="text-xs font-bold text-orange-500 mb-1">🕐 Pickup Time</p>
                <input type="time" value={travelTime} onChange={e => setTravelTime(e.target.value)}
                  className="w-full text-sm font-medium text-neutral-800 border-none outline-none bg-transparent" />
              </div>
            </div>
          )}

          {/* Search button */}
          {!searched && (
            <button type="button" disabled={!canSearch} onClick={handleSearch}
              className="w-full mt-4 py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canSearch
                  ? "linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#7c3aed 100%)"
                  : "#9ca3af",
                boxShadow: canSearch ? "0 8px 24px rgba(37,99,235,0.35)" : "none",
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Find Available Vehicles
            </button>
          )}
        </div>

        {/* ─── STEP 3: 3 Vehicle Categories ─── */}
        {searched && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Step 3 — Choose Your Vehicle Type</p>
              <p className="text-sm text-neutral-600">
                <span className="font-bold text-blue-700">{pickup}</span> → <span className="font-bold text-red-600">{drop}</span>
                <span className="text-neutral-400 ml-2">· ~{distKm} km</span>
              </p>
            </div>

            {VEHICLE_CATEGORIES.map(cat => {
              const estPrice = calcPrice(cat.pricePerKm, distKm);
              const isExpanded = expandedCategory === cat.id;

              return (
                <div key={cat.id} className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${isExpanded ? cat.borderColor : "border-neutral-100"}`}>

                  {/* Category header card */}
                  <button className={`w-full text-left ${isExpanded ? cat.bgLight : "bg-white"} p-4 flex items-center gap-4 transition-colors`}
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}>

                    {/* Icon bubble */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-md shrink-0`}>
                      {cat.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-extrabold text-base text-neutral-900">{cat.label}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.tagColor}`}>{cat.tag}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mb-1">{cat.detail}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-extrabold ${cat.textColor}`}>₹{estPrice.toLocaleString()}</span>
                        <span className="text-xs text-neutral-400">est. your share</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">₹{cat.pricePerKm}/km · {distKm} km</p>
                    </div>

                    {/* Chevron */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isExpanded ? "bg-blue-600 text-white rotate-90" : "bg-neutral-100 text-neutral-400"}`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Example models strip */}
                  {!isExpanded && (
                    <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
                      {cat.examples.map(ex => (
                        <span key={ex} className="text-[10px] font-semibold text-neutral-500 bg-neutral-50 border border-neutral-100 px-2 py-1 rounded-full whitespace-nowrap">{ex}</span>
                      ))}
                    </div>
                  )}

                  {/* Expanded: vehicle list */}
                  {isExpanded && (
                    <div className="divide-y divide-neutral-100">
                      {cat.vehicles.map(v => (
                        <div key={v.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors">
                          <img src={v.image} alt={v.model}
                            className="w-16 h-12 object-cover rounded-xl shrink-0 border border-neutral-100" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-sm text-neutral-900">{v.make} {v.model}</p>
                              {v.availabilityStatus === "available" && (
                                <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">● Available</span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400">{v.ownerName} · ⭐ {v.rating}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {v.features?.slice(0, 2).map(f => (
                                <span key={f} className="text-[9px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full">{f}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-extrabold text-sm ${cat.textColor}`}>₹{estPrice.toLocaleString()}</p>
                            <p className="text-[10px] text-neutral-400">your share</p>
                            <button
                              onClick={() => navigate(`/vehicle/${v.id}`)}
                              className={`mt-1.5 text-[11px] font-bold text-white px-3 py-1.5 rounded-xl bg-gradient-to-r ${cat.color} active:scale-95`}>
                              Book
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Summary info */}
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-2">💡 How Shiftzy Go Pricing Works</p>
              <div className="space-y-1">
                <p className="text-xs text-neutral-600">• Both owner & traveller <strong>split the trip cost 50–50</strong></p>
                <p className="text-xs text-neutral-600">• You pay far less than a bus, train, or cab alone</p>
                <p className="text-xs text-neutral-600">• Price shown above is <strong>your estimated share</strong></p>
                <p className="text-xs text-neutral-600">• Final price confirmed at booking based on fuel rates</p>
              </div>
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}
