import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import {
  useShiftRequests,
  useGoRequests,
  updateShiftStatus,
  updateGoStatus,
  SHIFT_STATUS_LABEL,
  GO_STATUS_LABEL,
  type ShiftRequestRecord,
  type GoRequestRecord,
  type ShiftStatus,
  type GoStatus,
} from "@/lib/appStore";
import {
  Truck, Navigation, ArrowRight, CalendarDays, Clock, Car,
  User, Route, IndianRupee, PackageOpen, X,
} from "lucide-react";

type Segment = "active" | "shift" | "go";

const STATUS_STYLE: Record<string, string> = {
  pending_traveler: "bg-orange-100 text-orange-700",
  waiting_driver: "bg-orange-100 text-orange-700",
  accepted: "bg-blue-100 text-blue-700",
  in_transit: "bg-blue-100 text-blue-700",
  requested: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const isActiveStatus = (s: ShiftStatus | GoStatus) =>
  s !== "completed" && s !== "cancelled";

const cardAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function StatusBadge({ label, status }: { label: string; status: string }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${STATUS_STYLE[status] ?? "bg-neutral-100 text-neutral-600"}`}>
      {label}
    </span>
  );
}

function RouteLine({ pickup, drop }: { pickup: string; drop: string }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="font-extrabold text-neutral-900 text-sm truncate max-w-[38%]">{pickup}</span>
      <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
      <span className="font-extrabold text-neutral-900 text-sm truncate max-w-[38%]">{drop}</span>
    </div>
  );
}

function ShiftCard({ req, index }: { req: ShiftRequestRecord; index: number }) {
  const active = isActiveStatus(req.status);
  return (
    <motion.div
      layout
      {...cardAnim}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
      className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Truck className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <RouteLine pickup={req.pickup} drop={req.drop} />
        </div>
        <StatusBadge label={SHIFT_STATUS_LABEL[req.status]} status={req.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500 pl-11">
        <span className="flex items-center gap-1"><Car className="w-3 h-3" />{req.vehicleType}{req.vehicleModel ? ` · ${req.vehicleModel}` : ""}</span>
        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{req.date}</span>
        {req.timeRange && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{req.timeRange}</span>}
      </div>

      <div className="flex items-center justify-between mt-3 pl-11">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600">
          <User className="w-3 h-3 text-orange-500" />
          {req.driverType === "professional" ? "Professional Driver" : "Traveler"}
        </span>
        {active && (
          <button
            onClick={() => updateShiftStatus(req.id, "cancelled")}
            className="text-[11px] font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}

function GoCard({ req, index }: { req: GoRequestRecord; index: number }) {
  const active = isActiveStatus(req.status);
  return (
    <motion.div
      layout
      {...cardAnim}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
      className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Navigation className="w-4.5 h-4.5 text-orange-500" />
          </div>
          <RouteLine pickup={req.pickup} drop={req.drop} />
        </div>
        <StatusBadge label={GO_STATUS_LABEL[req.status]} status={req.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500 pl-11">
        <span className="flex items-center gap-1"><Car className="w-3 h-3" />{req.vehicleType}</span>
        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{req.date}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{req.time}</span>
        <span className="capitalize flex items-center gap-1"><Route className="w-3 h-3" />{req.mode}</span>
      </div>

      <div className="flex items-center justify-between mt-3 pl-11">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-0.5 text-sm font-extrabold text-neutral-900">
            <IndianRupee className="w-3.5 h-3.5" />{req.estFare.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">{req.distanceKm} km</span>
        </div>
        {active && (
          <button
            onClick={() => updateGoStatus(req.id, "cancelled")}
            className="text-[11px] font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ title, note }: { title: string; note: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-center py-16 px-6"
    >
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <PackageOpen className="w-8 h-8 text-blue-400" />
      </div>
      <p className="font-bold text-neutral-800 text-sm">{title}</p>
      <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">{note}</p>
    </motion.div>
  );
}

export default function MyRides() {
  const [, navigate] = useLocation();
  const [segment, setSegment] = useState<Segment>("active");

  const shifts = useShiftRequests();
  const gos = useGoRequests();

  const activeShifts = shifts.filter((r) => isActiveStatus(r.status));
  const activeGos = gos.filter((r) => isActiveStatus(r.status));
  const activeCount = activeShifts.length + activeGos.length;

  const segments: { key: Segment; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "shift", label: "Shift History" },
    { key: "go", label: "Go History" },
  ];

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-24">
      <Header title="My Rides" showBackButton showAnimation={false} />

      {/* Title */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-extrabold text-neutral-900">My Rides</h1>
        <p className="text-xs text-neutral-400 mt-0.5 font-medium">
          Track your Shift and Go requests all in one place.
        </p>
      </div>

      {/* Segmented tabs */}
      <div className="px-4 sticky top-[57px] bg-white z-10 pb-2">
        <div className="flex bg-neutral-100 rounded-xl p-1 gap-1">
          {segments.map((s) => (
            <button
              key={s.key}
              onClick={() => setSegment(s.key)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                segment === s.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              {s.label}
              {s.key === "active" && activeCount > 0 && (
                <span className="ml-1 text-[10px] font-bold text-orange-500">({activeCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        <AnimatePresence mode="wait">
          {/* ── ACTIVE ── */}
          {segment === "active" && (
            <motion.div key="active" className="space-y-3">
              {activeCount === 0 ? (
                <EmptyState
                  title="No active rides right now"
                  note="Create a Shift or Go request to see it here."
                />
              ) : (
                <>
                  {activeShifts.map((r, i) => (
                    <ShiftCard key={r.id} req={r} index={i} />
                  ))}
                  {activeGos.map((r, i) => (
                    <GoCard key={r.id} req={r} index={activeShifts.length + i} />
                  ))}
                </>
              )}
            </motion.div>
          )}

          {/* ── SHIFT HISTORY ── */}
          {segment === "shift" && (
            <motion.div key="shift" className="space-y-3">
              {shifts.length === 0 ? (
                <EmptyState
                  title="No shift requests yet"
                  note="Create a Shift request to move your vehicle and see it here."
                />
              ) : (
                shifts.map((r, i) => <ShiftCard key={r.id} req={r} index={i} />)
              )}
            </motion.div>
          )}

          {/* ── GO HISTORY ── */}
          {segment === "go" && (
            <motion.div key="go" className="space-y-3">
              {gos.length === 0 ? (
                <EmptyState
                  title="No Go trips yet"
                  note="Create a Go request to travel and save, then find it here."
                />
              ) : (
                gos.map((r, i) => <GoCard key={r.id} req={r} index={i} />)
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create shortcut */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate("/shift-request")}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold py-3 hover:bg-blue-100 transition-colors"
          >
            <Truck className="w-4 h-4" /> New Shift
          </button>
          <button
            onClick={() => navigate("/travel")}
            className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 text-xs font-bold py-3 hover:bg-orange-100 transition-colors"
          >
            <Navigation className="w-4 h-4" /> New Go
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
