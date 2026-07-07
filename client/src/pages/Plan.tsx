import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { LOCATIONS, NEARBY_SHIFT_REQUESTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { addStoredNotif } from "@/lib/notificationsStore";
import {
  Bell, BellRing, MapPin, CalendarDays, Clock, Trash2,
  CheckCircle2, ChevronRight, Car, Route as RouteIcon,
} from "lucide-react";

/* ── Plan store (localStorage) ─────────────────────────────────────── */
const PLANS_KEY = "shiftzy_plans";

interface SavedPlan {
  id: string;
  pickup: string;
  drop: string;
  date: string;   // ISO date string e.g. "2026-07-12"
  time: string;   // "HH:MM"
  savedAt: number;
  notified: boolean;
}

function loadPlans(): SavedPlan[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePlans(plans: SavedPlan[]) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatDisplayDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

function formatDisplayTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* Generate time options every 30 min */
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const min of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
}

/* Check if any nearby shift matches pickup/drop cities */
function findMatchingShifts(pickup: string, drop: string) {
  return NEARBY_SHIFT_REQUESTS.filter((sr) => {
    const p = sr.pickupLocation.name.toLowerCase();
    const d = sr.dropLocation.name.toLowerCase();
    return p.includes(pickup.toLowerCase()) || pickup.toLowerCase().includes(p) ||
           d.includes(drop.toLowerCase()) || drop.toLowerCase().includes(d);
  });
}

export default function Plan() {
  const { toast } = useToast();

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("09:00");
  const [plans, setPlans] = useState<SavedPlan[]>(loadPlans);

  /* Persist whenever plans change */
  useEffect(() => { savePlans(plans); }, [plans]);

  const handleNotify = () => {
    if (!pickup || !drop) {
      toast({ title: "Missing details", description: "Please select both pickup and drop locations.", variant: "destructive" });
      return;
    }
    if (pickup === drop) {
      toast({ title: "Same location", description: "Pickup and drop cannot be the same.", variant: "destructive" });
      return;
    }

    /* Save plan */
    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      pickup,
      drop,
      date,
      time,
      savedAt: Date.now(),
      notified: false,
    };

    setPlans((prev) => [newPlan, ...prev]);

    /* Toast confirmation */
    toast({
      title: "🔔 Alert Set!",
      description: `You have previously requested a RoadAway on ${pickup} → ${drop}, ${formatDisplayDate(date)} at ${formatDisplayTime(time)}.`,
    });

    /* Check if any existing shift already matches — fire bell notification */
    const matches = findMatchingShifts(pickup, drop);
    if (matches.length > 0) {
      const m = matches[0];
      const mName = `${m.vehicle.make} ${m.vehicle.model}`;
      setTimeout(() => {
        addStoredNotif({
          category: "bookings",
          iconKey: "accepted",
          color: "blue",
          title: "Shift Available for Your Plan!",
          body: `On your requested plan (${pickup} → ${drop}), a booking is available: ${mName} · ${m.pickupLocation.name} → ${m.dropLocation.name} · ${m.pickupTime}`,
        });
        toast({
          title: "🚗 Shift Found!",
          description: `A ${mName} is available matching your plan. Check the Home screen!`,
        });
      }, 800);
    }

    /* Reset form */
    setPickup("");
    setDrop("");
    setDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
    setTime("09:00");
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Plan removed" });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
      <Header title="Plan Your Trip" variant="primary" />

      <div className="px-4 py-5 space-y-5">

        {/* ── Form card ── */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-5 py-4">
            <p className="text-white font-extrabold text-base">Set a Shift Alert</p>
            <p className="text-blue-200 text-xs mt-0.5">
              Tell us when & where — we'll notify you when a matching shift is available.
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Pickup */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Pickup Location
              </label>
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              >
                <option value="">Select city</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Drop */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1.5">
                <RouteIcon className="w-3.5 h-3.5 text-orange-500" /> Drop Location
              </label>
              <select
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              >
                <option value="">Select city</option>
                {LOCATIONS.filter((l) => l !== pickup).map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Date + Time in a grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-500" /> Time
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{formatDisplayTime(t)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview */}
            {pickup && drop && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <Bell className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 leading-snug">
                  Alert for <strong>{pickup} → {drop}</strong> on{" "}
                  <strong>{formatDisplayDate(date)}</strong> at{" "}
                  <strong>{formatDisplayTime(time)}</strong>
                </p>
              </div>
            )}

            {/* Notify button */}
            <button
              onClick={handleNotify}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-200"
            >
              <BellRing className="w-5 h-5" />
              Notify Me
            </button>
          </div>
        </div>

        {/* ── Saved Plans list ── */}
        {plans.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" /> Your Active Alerts ({plans.length})
            </p>

            {plans.map((plan) => {
              const matches = findMatchingShifts(plan.pickup, plan.drop);
              return (
                <div key={plan.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4">
                    {/* Route */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <div className="w-0.5 h-4 bg-gradient-to-b from-blue-600 to-orange-500" />
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-neutral-800">{plan.pickup}</p>
                        <p className="text-xs font-bold text-neutral-800 mt-1">{plan.drop}</p>
                      </div>
                      <button onClick={() => deletePlan(plan.id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 active:scale-95 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Date + Time */}
                    <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDisplayDate(plan.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDisplayTime(plan.time)}</span>
                    </div>

                    {/* Match indicator */}
                    {matches.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <p className="text-[10px] font-bold text-green-700 flex items-center gap-1 mb-1.5">
                          <CheckCircle2 className="w-3 h-3" /> {matches.length} shift{matches.length > 1 ? "s" : ""} available now!
                        </p>
                        {matches.slice(0, 2).map((sr) => (
                          <div key={sr.id} className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2 mb-1">
                            <Car className="w-3.5 h-3.5 text-green-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-green-800 truncate">
                                {sr.vehicle.make} {sr.vehicle.model}
                              </p>
                              <p className="text-[10px] text-green-600">{sr.pickupTime}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips */}
        <div className="bg-neutral-50 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Planning Tips</p>
          {[
            "Set alerts 2–3 days ahead for better availability.",
            "You can add multiple alerts for different routes.",
            "We'll notify you the moment a matching shift is posted.",
            "Carry your valid driving licence for vehicle pickup.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-blue-500 text-xs mt-0.5">•</span>
              <p className="text-xs text-neutral-500 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
