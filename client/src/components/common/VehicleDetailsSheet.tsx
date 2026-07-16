import { motion, AnimatePresence } from "framer-motion";
import {
  X, Fuel, Palette, Calendar, Car, ShieldCheck,
  FileText, Hash, CalendarCheck, BadgeCheck,
} from "lucide-react";
import { getVehicleDetails } from "@/lib/constants";

interface Props {
  open: boolean;
  onClose: () => void;
  vehicle: {
    id: string;
    make: string;
    model: string;
    registrationNumber: string;
    fuelType?: string;
    type?: string;
  };
  owner: {
    name: string;
    avatar?: string;
    rating?: number;
  };
}

export default function VehicleDetailsSheet({ open, onClose, vehicle, owner }: Props) {
  const vd = getVehicleDetails(vehicle);
  const fuelType = vehicle.fuelType ?? vd.fuelType;

  /* deterministic RC expiry — 5 years from purchase */
  const rcExpiryYear = vd.purchaseYear + 15;
  const rcMonths = ["Jan", "Mar", "Apr", "Jun", "Sep", "Nov"];
  const h = vehicle.id.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const rcMonth = rcMonths[Math.abs(h) % rcMonths.length];
  const rcValidTill = `${rcMonth} ${rcExpiryYear}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 rounded-t-3xl max-h-[88vh] overflow-y-auto"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="font-extrabold text-neutral-900 dark:text-neutral-100 text-base">
                  {vehicle.make} {vehicle.model}
                </p>
                <p className="text-xs text-neutral-400">{vehicle.registrationNumber}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 pb-10">

              {/* ── Basic specs ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl p-3">
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Fuel className="w-3 h-3" /> Fuel Type
                  </p>
                  <p className={`font-extrabold text-sm ${fuelType === "Diesel" ? "text-amber-700 dark:text-amber-400" : "text-green-700 dark:text-green-400"}`}>
                    {fuelType}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900 rounded-xl p-3">
                  <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Colour
                  </p>
                  <p className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200">{vd.color}</p>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Purchase Year
                  </p>
                  <p className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200">{vd.purchaseYear}</p>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Car className="w-3 h-3" /> Vehicle Type
                  </p>
                  <p className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200 capitalize">
                    {vehicle.type === "luxury" ? "Premium / Luxury" : (vehicle.type ?? "Car")}
                  </p>
                </div>
              </div>

              {/* ── Insurance ── */}
              <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Insurance Details
                </p>
                <div className="space-y-2.5">
                  <Row label="Insurance Type" value={vd.insuranceType} />
                  <Row label="Valid Until" value={vd.insuranceValidTill} highlight="green" />
                  <Row
                    label="Third Party Cover"
                    value={vd.thirdParty ? "✓ Covered" : "✗ Not covered"}
                    highlight={vd.thirdParty ? "green" : "red"}
                  />
                  <Row
                    label="Own Damage Cover"
                    value={vd.ownDamage ? "✓ Covered" : "✗ Not included"}
                    highlight={vd.ownDamage ? "green" : "orange"}
                  />
                </div>
              </div>

              {/* ── RC (Registration Certificate) ── */}
              <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Registration Certificate (RC)
                </p>
                <div className="space-y-2.5">
                  <Row label="Registration No." value={vehicle.registrationNumber} />
                  <Row label="RC Valid Until" value={rcValidTill} highlight="green" />
                  <Row label="RC Status" value="✓ Valid" highlight="green" />
                  <Row label="Engine Number" value={vd.engineNumber} mono />
                </div>
              </div>

              {/* ── Owner details ── */}
              <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Owner Details</p>
                <div className="flex items-center gap-3 mb-3">
                  {owner.avatar ? (
                    <img
                      src={owner.avatar}
                      alt={owner.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300">
                      {owner.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{owner.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Verified vehicle owner</p>
                    </div>
                  </div>
                  {owner.rating && (
                    <div className="ml-auto flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-full px-2.5 py-1">
                      <span className="text-orange-400">★</span>
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{owner.rating}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <Row label="Vehicle Model" value={vehicle.model} />
                  <Row label="Aadhaar Verified" value="✓ Yes" highlight="green" />
                  <Row label="Driving Licence" value="✓ Valid" highlight="green" />
                </div>
              </div>

              {/* ── Disclaimer ── */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl p-3 flex items-start gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  All vehicle details are verified by Shiftzy Go before listing. Physical copies of insurance
                  and RC will be available at pickup for your inspection.
                </p>
              </div>

              {/* ── Hash reference ── */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
                <Hash className="w-3 h-3" />
                <span>Ref: SHZ-{vehicle.id.toUpperCase()}-{vd.engineNumber.slice(-4)}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── tiny helper for consistent label/value rows ── */
function Row({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: "green" | "red" | "orange";
  mono?: boolean;
}) {
  const valueColor =
    highlight === "green"
      ? "text-green-600 dark:text-green-400"
      : highlight === "red"
      ? "text-red-500 dark:text-red-400"
      : highlight === "orange"
      ? "text-orange-500 dark:text-orange-400"
      : "text-neutral-800 dark:text-neutral-200";

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
      <span className={`font-bold text-sm ${valueColor} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
