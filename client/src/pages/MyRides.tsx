import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import DesktopTopNav from "@/components/layout/DesktopTopNav";
import { useIsDesktop } from "@/hooks/use-desktop";
import {
  Truck, ArrowRight, PackageOpen, IndianRupee, CheckCircle2, Clock, XCircle,
} from "lucide-react";

type Segment = "active" | "history";

/** Real (server-backed) shift request with its priced trip + payment. */
type PricedRequest = {
  id: number;
  pickupLocation: string;
  dropLocation: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  rejectionReason?: string | null;
  createdAt: string;
  vehicle: { make: string; model: string } | null;
  trip: { id: number; price: string; status: string } | null;
  payment: { status: string } | null;
};

const isFinal = (r: PricedRequest) =>
  r.status === "rejected" || r.trip?.status === "completed" || r.trip?.status === "cancelled";

function RequestCard({ r }: { r: PricedRequest }) {
  const [, navigate] = useLocation();
  const paid = r.payment?.status === "paid" || ["scheduled", "in_transit", "completed"].includes(r.trip?.status || "");

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-neutral-900 text-sm truncate max-w-[38%]">{r.pickupLocation}</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-extrabold text-neutral-900 text-sm truncate max-w-[38%]">{r.dropLocation}</span>
          </div>
        </div>
        {r.status === "pending" && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" /> Under review
          </span>
        )}
        {r.status === "rejected" && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1 shrink-0">
            <XCircle className="w-3 h-3" /> Declined
          </span>
        )}
        {r.trip && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${paid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
            {paid ? r.trip.status.replace(/_/g, " ") : "Payment due"}
          </span>
        )}
      </div>

      {r.vehicle && (
        <p className="text-[11px] text-neutral-500 pl-11">{r.vehicle.make} {r.vehicle.model}</p>
      )}

      {r.status === "rejected" && r.rejectionReason && (
        <p className="text-xs text-red-600 pl-11 mt-1">Reason: {r.rejectionReason}</p>
      )}

      {r.status === "pending" && !r.trip && (
        <p className="text-xs text-neutral-400 pl-11 mt-1">
          Our team reviews every request manually — you'll be notified once it's priced.
        </p>
      )}

      {r.trip && (
        <div className="flex items-center justify-between mt-3 pl-11">
          <span className="text-lg font-extrabold text-neutral-900 flex items-center">
            <IndianRupee className="w-4 h-4" />
            {Number(r.trip.price).toLocaleString("en-IN")}
          </span>
          {paid ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
              <CheckCircle2 className="w-4 h-4" /> {r.trip.status.replace(/_/g, " ")}
            </span>
          ) : (
            <button
              onClick={() => navigate(`/trip-payment/${r.trip!.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              View &amp; Pay
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function EmptyState({ title, note }: { title: string; note: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <PackageOpen className="w-8 h-8 text-blue-400" />
      </div>
      <p className="font-bold text-neutral-800 text-sm">{title}</p>
      <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">{note}</p>
    </motion.div>
  );
}

export default function MyRides() {
  const [segment, setSegment] = useState<Segment>("active");

  const { data: requests = [] } = useQuery<PricedRequest[]>({
    queryKey: ["/api/shift-requests"],
    refetchInterval: 15000,
  });

  const active = requests.filter((r) => !isFinal(r));
  const history = requests.filter((r) => isFinal(r));
  const shown = segment === "active" ? active : history;

  const isDesktop = useIsDesktop();
  const gridCls = isDesktop ? "grid grid-cols-2 gap-3" : "space-y-3";

  const segments: { key: Segment; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "history", label: "History" },
  ];

  const segmentContent = (
    <AnimatePresence mode="wait">
      <motion.div key={segment} className={shown.length === 0 ? "" : gridCls}>
        {shown.length === 0 ? (
          <EmptyState
            title={segment === "active" ? "No active requests right now" : "No history yet"}
            note="Create a Shift Request to move your vehicle and track it here."
          />
        ) : (
          shown.map((r) => <RequestCard key={r.id} r={r} />)
        )}
      </motion.div>
    </AnimatePresence>
  );

  const segmentTabs = (variant: "mobile" | "desktop") => (
    <div className={variant === "mobile" ? "flex bg-neutral-100 rounded-xl p-1 gap-1" : "flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 gap-1 w-fit"}>
      {segments.map((s) => (
        <button key={s.key} onClick={() => setSegment(s.key)}
          className={`${variant === "mobile" ? "flex-1" : "px-5"} py-2 text-xs font-bold rounded-lg transition-all ${
            segment === s.key ? "bg-white dark:bg-neutral-900 text-blue-600 shadow-sm" : "text-neutral-500"
          }`}
        >
          {s.label}
          {s.key === "active" && active.length > 0 && (
            <span className="ml-1 text-[10px] font-bold text-orange-500">({active.length})</span>
          )}
        </button>
      ))}
    </div>
  );

  if (isDesktop === undefined) return <div className="min-h-screen bg-white dark:bg-neutral-950" />;

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <DesktopTopNav />
        <main className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">My Rides</h1>
          <p className="text-sm text-neutral-500 mt-1 mb-5">
            Every shift request you've submitted, priced by our team, and paid for.
          </p>
          {segmentTabs("desktop")}
          <div className="mt-5">{segmentContent}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-24">
      <Header title="My Rides" showBackButton showAnimation={false} />

      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-extrabold text-neutral-900">My Rides</h1>
        <p className="text-xs text-neutral-400 mt-0.5 font-medium">
          Every shift request you've submitted, priced by our team, and paid for.
        </p>
      </div>

      <div className="px-4 sticky top-[57px] bg-white z-10 pb-2">
        {segmentTabs("mobile")}
      </div>

      <div className="px-4 py-3 space-y-3">
        {segmentContent}
      </div>

      <BottomNav />
    </div>
  );
}
