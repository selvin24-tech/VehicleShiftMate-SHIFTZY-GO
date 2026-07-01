import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VehiclePhotoGallery from "@/components/common/VehiclePhotoGallery";
import {
  AVAILABLE_VEHICLES, LOCATIONS, CHENNAI_LOCALITIES, computeFare, FUEL_PRICE_PER_LITRE,
  getVehicleImages, getAvailabilityWindow, isWithinWindow,
} from "@/lib/constants";
import { Vehicle } from "@/lib/types";
import { addGoRequest, GO_STATUS_LABEL, type GoRequestRecord } from "@/lib/appStore";
import { ChevronLeft, Star, X, Clock, Images, Camera, Check, CheckCircle2, Send } from "lucide-react";

/* ─── Approx distances (km) between outstation cities ─── */
const CITY_DISTANCES: Record<string, Record<string, number>> = {
  Chennai:     { Bangalore: 345, Coimbatore: 495, Madurai: 460, Pondicherry: 160 },
  Bangalore:   { Chennai: 345, Coimbatore: 365, Madurai: 440, Pondicherry: 310 },
  Coimbatore:  { Chennai: 495, Bangalore: 365, Madurai: 215, Pondicherry: 380 },
  Madurai:     { Chennai: 460, Bangalore: 440, Coimbatore: 215, Pondicherry: 320 },
  Pondicherry: { Chennai: 160, Bangalore: 310, Coimbatore: 380, Madurai: 320 },
};

/* ─── Local area distance estimate (flat) ─── */
const LOCAL_DISTANCE_KM = 18;

/* ─── Vehicle TYPE choices (chosen FIRST, in a draggable selector) ─── */
type TypeId = "car" | "bike" | "suv" | "premium";
const VEHICLE_TYPE_OPTIONS: {
  id: TypeId;
  emoji: string;
  label: string;
  desc: string;
  fareCat: string;
  filter: (v: Vehicle) => boolean;
  gradient: string;
  accent: string;
  border: string;
  bgLight: string;
}[] = [
  { id: "car",     emoji: "🚗", label: "Car",     desc: "Sedans & hatchbacks",  fareCat: "car",     filter: (v) => v.type === "car",    gradient: "from-orange-500 to-orange-600", accent: "text-orange-700", border: "border-orange-400", bgLight: "bg-orange-50" },
  { id: "bike",    emoji: "🏍️", label: "Bike",    desc: "Quick & economical",   fareCat: "bike",    filter: (v) => v.type === "bike",   gradient: "from-blue-500 to-blue-700",     accent: "text-blue-700",   border: "border-blue-400",   bgLight: "bg-blue-50" },
  { id: "suv",     emoji: "🚙", label: "SUV",     desc: "Spacious for families", fareCat: "suv",     filter: (v) => v.type === "suv",    gradient: "from-emerald-500 to-emerald-700", accent: "text-emerald-700", border: "border-emerald-400", bgLight: "bg-emerald-50" },
  { id: "premium", emoji: "👑", label: "Premium", desc: "Luxury & top comfort",  fareCat: "premium", filter: (v) => v.type === "luxury", gradient: "from-purple-600 to-indigo-600", accent: "text-purple-700", border: "border-purple-400", bgLight: "bg-purple-50" },
];

/* ─── helpers ─── */
function getDistance(from: string, to: string, isLocal: boolean) {
  if (isLocal) return LOCAL_DISTANCE_KM;
  return CITY_DISTANCES[from]?.[to] ?? CITY_DISTANCES[to]?.[from] ?? 300;
}

/* ─── MAIN COMPONENT ─── */
export default function Travel() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [selectedType, setSelectedType] = useState<TypeId | null>(null);
  const [mode, setMode] = useState<"outstation" | "local">("outstation");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [travelDate, setTravelDate] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [travelTime, setTravelTime] = useState("09:00");
  const [searched, setSearched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [goRequest, setGoRequest] = useState<GoRequestRecord | null>(null);

  /* photo gallery popup */
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryVehicle, setGalleryVehicle] = useState<Vehicle | null>(null);

  /* draggable type selector */
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, scroll: 0, moved: false });
  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current; if (!el) return;
    drag.current = { down: true, startX: e.clientX, scroll: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current; if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.scroll - dx;
  };
  const endDrag = () => { drag.current.down = false; };

  const typeOpt = VEHICLE_TYPE_OPTIONS.find(t => t.id === selectedType) ?? null;
  const locations = mode === "outstation" ? LOCATIONS : CHENNAI_LOCALITIES;
  const canSearch = !!selectedType && pickup && drop && pickup !== drop;
  const distKm = searched ? getDistance(pickup, drop, mode === "local") : 0;

  const baseVehicles = typeOpt ? AVAILABLE_VEHICLES.filter(typeOpt.filter) : [];
  const matchingVehicles = baseVehicles.filter(v => isWithinWindow(v.id, travelTime));
  const fareTotal = typeOpt ? computeFare(distKm, typeOpt.fareCat).total : 0;

  const openGallery = (v: Vehicle) => {
    setGalleryVehicle(v);
    setGalleryOpen(true);
  };

  const handleSearch = () => {
    setAttempted(true);
    setGoRequest(null);
    if (!selectedType) {
      toast({ title: "Pick a vehicle type", description: "Choose Car, Bike, SUV or Premium first.", variant: "destructive" });
      return;
    }
    if (!canSearch) {
      toast({ title: "Select pickup & drop", description: "Please choose two different locations.", variant: "destructive" });
      return;
    }
    setSearched(true);
  };

  const submitGoRequest = () => {
    if (!typeOpt) return;
    const rec = addGoRequest({
      pickup,
      drop,
      vehicleType: typeOpt.label,
      mode,
      date: travelDate,
      time: travelTime,
      distanceKm: distKm,
      estFare: fareTotal,
    });
    setGoRequest(rec);
    toast({
      title: "Go request sent! 🚗",
      description: "We'll match you with a vehicle owner shortly. Track it under My Rides.",
    });
  };

  const resetSearch = () => {
    setSearched(false);
    setPickup("");
    setDrop("");
    setGoRequest(null);
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
          <p className="text-lg font-bold text-blue-900 leading-snug">Planning to travel somewhere? 🚀</p>
          <p className="text-sm text-blue-600 mt-1">Choose a vehicle → pick travel type → set your route</p>
        </div>

        {/* ─── STEP 1: Vehicle type (DRAGGABLE) ─── */}
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Step 1 — Choose Your Vehicle
            <span className="ml-2 normal-case text-neutral-300">← swipe / drag →</span>
          </p>
          <div
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {VEHICLE_TYPE_OPTIONS.map(opt => {
              const active = selectedType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { if (drag.current.moved) return; setSelectedType(opt.id); setSearched(false); }}
                  className={`snap-center shrink-0 w-36 rounded-2xl border-2 p-4 text-left transition-all duration-200
                    ${active ? `${opt.border} ${opt.bgLight} shadow-md scale-[1.02]` : "border-neutral-100 bg-white"}`}
                  data-testid={`button-type-${opt.id}`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center text-3xl shadow mb-2`}>
                    {opt.emoji}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-base text-neutral-900">{opt.label}</p>
                    {active && <Check className={`w-4 h-4 ${opt.accent}`} />}
                  </div>
                  <p className="text-xs text-neutral-500 leading-tight">{opt.desc}</p>
                </button>
              );
            })}
          </div>
          {attempted && !selectedType && (
            <p className="text-xs text-red-500 mt-1">Please choose a vehicle type to continue.</p>
          )}
        </div>

        {/* ─── STEP 2: Travel type (after a vehicle is chosen) ─── */}
        {selectedType && (
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Step 2 — Select Travel Type</p>
            <div className="bg-neutral-100 rounded-xl p-1 flex w-full">
              {[
                { val: "outstation", emoji: "🛣️", label: "Outstation" },
                { val: "local",      emoji: "📍", label: "Local" },
              ].map(tab => (
                <button key={tab.val} type="button"
                  onClick={() => { setMode(tab.val as any); setSearched(false); setPickup(""); setDrop(""); }}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm flex flex-col items-center gap-0.5 transition-all duration-200
                    ${mode === tab.val ? "bg-white shadow text-blue-700 border-b-2 border-blue-600" : "text-neutral-500"}`}>
                  <span className="text-2xl">{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 3: Route picker ─── */}
        {selectedType && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Step 3 — Select Your Route & Time</p>
            {searched && (
              <button onClick={resetSearch} className="text-xs text-blue-600 font-semibold flex items-center gap-1">
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
                <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex flex-col gap-1 my-1.5">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-0.5 h-2 bg-neutral-300 rounded-full mx-auto" />)}
                </div>
                <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* Selects */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Pickup */}
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-3">
                  <p className="text-xs font-bold text-blue-600 mb-1">● Pickup {mode === "outstation" ? "City" : "Area"}</p>
                  <select value={pickup} onChange={e => { setPickup(e.target.value); setSearched(false); }}
                    className="w-full text-sm font-medium text-neutral-800 bg-transparent border-none outline-none appearance-none cursor-pointer">
                    <option value="">Choose pickup {mode === "outstation" ? "city" : "area"}...</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>

                {/* Drop */}
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-3">
                  <p className="text-xs font-bold text-orange-500 mb-1">● Drop {mode === "outstation" ? "City" : "Area"}</p>
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
                <span className="text-blue-600 font-bold text-sm">{pickup}</span>
                <div className="flex-1 flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => <div key={i} className="flex-1 h-0.5 bg-blue-300 rounded-full" />)}
                  <span className="text-base">{typeOpt?.emoji ?? "🚗"}</span>
                  {[...Array(5)].map((_, i) => <div key={i} className="flex-1 h-0.5 bg-blue-300 rounded-full" />)}
                </div>
                <span className="text-orange-500 font-bold text-sm">{drop}</span>
              </div>
            )}
          </div>

          {/* Date & Time (drives the time-range filtering) */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white border border-blue-100 rounded-xl p-3 shadow-sm">
              <p className="text-xs font-bold text-blue-600 mb-1">📅 Travel Date</p>
              <input type="date" min={new Date().toISOString().split("T")[0]} value={travelDate}
                onChange={e => setTravelDate(e.target.value)}
                className="w-full text-sm font-medium text-neutral-800 border-none outline-none bg-transparent" />
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-3 shadow-sm">
              <p className="text-xs font-bold text-orange-500 mb-1">🕐 Pickup Time</p>
              <input type="time" value={travelTime} onChange={e => { setTravelTime(e.target.value); }}
                className="w-full text-sm font-medium text-neutral-800 border-none outline-none bg-transparent" />
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1.5 px-1">
            We only show vehicles whose owner is available around <span className="font-semibold text-neutral-600">{travelTime}</span>.
          </p>

          {/* Field validation */}
          {attempted && selectedType && (!pickup || !drop) && (
            <p className="text-xs text-red-500 mt-3">Please select both a pickup and a drop location.</p>
          )}
          {attempted && selectedType && pickup && drop && pickup === drop && (
            <p className="text-xs text-red-500 mt-3">Pickup and drop must be different.</p>
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
        )}

        {/* ─── RESULTS: vehicles of chosen type available in time range ─── */}
        <AnimatePresence>
        {searched && typeOpt && (
          <motion.div
            key="go-results"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <p className="text-sm text-neutral-600">
                <span className="font-bold text-blue-700">{pickup}</span> → <span className="font-bold text-orange-600">{drop}</span>
                <span className="text-neutral-400 ml-2">· ~{distKm} km</span>
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {matchingVehicles.length} {typeOpt.label.toLowerCase()}{matchingVehicles.length === 1 ? "" : "s"} available around {travelTime}
                <span className="text-neutral-400"> · est. fare ₹{fareTotal.toLocaleString("en-IN")}</span>
              </p>
            </div>

            {matchingVehicles.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-2">🕐</p>
                <p className="text-sm font-bold text-amber-800">No {typeOpt.label.toLowerCase()}s free at {travelTime}</p>
                <p className="text-xs text-amber-600 mt-1">Owners allocate their own pickup windows. Try a different time or vehicle type.</p>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-neutral-100 overflow-hidden divide-y divide-neutral-100">
                {matchingVehicles.map(v => {
                  const win = getAvailabilityWindow(v.id);
                  const imgs = getVehicleImages(v);
                  return (
                    <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openGallery(v)}
                        className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-neutral-100 group"
                        data-testid={`button-vehicle-photo-${v.id}`}
                      >
                        <img src={v.image} alt={v.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-0 right-0 bg-black/65 text-white text-[10px] px-1 py-0.5 rounded-tl-md flex items-center gap-0.5">
                          <Images className="w-2.5 h-2.5" /> {imgs.length}
                        </span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-neutral-900 truncate">{v.make} {v.model}</p>
                        </div>
                        <p className="text-xs text-neutral-400">{v.ownerName} · ⭐ {v.rating}</p>
                        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {win.label}
                        </p>
                        <button
                          type="button"
                          onClick={() => openGallery(v)}
                          className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium"
                        >
                          <Camera className="w-3 h-3" /> View photos
                        </button>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-extrabold text-sm ${typeOpt.accent}`}>₹{fareTotal.toLocaleString("en-IN")}</p>
                        <p className="text-[10px] text-neutral-400">est. fare</p>
                        <button
                          onClick={() => navigate(`/vehicle/${v.id}?distance=${distKm}&category=${typeOpt.fareCat}&pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}`)}
                          className={`mt-1.5 text-[11px] font-bold text-white px-3 py-1.5 rounded-xl bg-gradient-to-r ${typeOpt.gradient} active:scale-95`}>
                          Book
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── GO REQUEST (confirmation + status) ─── */}
            {goRequest ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-emerald-800 text-sm">Go request sent!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {goRequest.pickup} → {goRequest.drop} · {goRequest.vehicleType}
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-2 bg-white border border-emerald-200 rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-emerald-700">{GO_STATUS_LABEL[goRequest.status]}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/my-rides")}
                  className="w-full mt-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm active:scale-95 transition-all"
                >
                  Track in My Rides
                </button>
              </motion.div>
            ) : (
              <button
                onClick={submitGoRequest}
                className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 active:scale-95 transition-all shadow-md"
              >
                <Send className="w-4 h-4" /> Send Go Request for this route
              </button>
            )}

            {/* Summary info */}
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-2">💡 How Shiftzy Go Pricing Works</p>
              <div className="space-y-1">
                <p className="text-xs text-neutral-600">• Fares are calculated from the <strong>current petrol price ₹{FUEL_PRICE_PER_LITRE}/L</strong> &amp; distance</p>
                <p className="text-xs text-neutral-600">• You only see vehicles whose owner is <strong>available in your time range</strong></p>
                <p className="text-xs text-neutral-600">• Price shown is the <strong>estimated total fare</strong> (incl. app fee &amp; GST)</p>
                <p className="text-xs text-neutral-600">• Final amount is confirmed at checkout</p>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

      </div>

      <VehiclePhotoGallery
        images={galleryVehicle ? getVehicleImages(galleryVehicle) : []}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        title={galleryVehicle ? `${galleryVehicle.make} ${galleryVehicle.model}` : "Vehicle photos"}
      />

      <BottomNav />
    </div>
  );
}
