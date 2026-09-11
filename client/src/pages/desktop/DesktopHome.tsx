import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import DesktopTopNav from "@/components/layout/DesktopTopNav";
import VehiclePhotoGallery from "@/components/common/VehiclePhotoGallery";
import SendRequestButton from "@/components/common/SendRequestButton";
import VehicleDetailsSheet from "@/components/common/VehicleDetailsSheet";
import heroBanner from "@assets/file_00000000b280720988e7255eb04daace_1783322892934.png";
import {
  NEARBY_SHIFT_REQUESTS, computeFare, vehicleTypeToFareCategory,
  getVehicleImages, getAvailabilityWindow,
} from "@/lib/constants";
import {
  MapPin, ChevronRight, Star, CalendarDays, Clock, Shield, Navigation,
  Lock, Images, Fuel, Truck, Compass, MessageCircle, ArrowRight,
} from "lucide-react";
import { useShiftRequests, SHIFT_STATUS_LABEL } from "@/lib/appStore";

const VEHICLE_BADGE: Record<string, { label: string; color: string }> = {
  car: { label: "Car", color: "bg-blue-100 text-blue-700" },
  bike: { label: "Bike", color: "bg-orange-100 text-orange-700" },
  suv: { label: "SUV", color: "bg-purple-100 text-purple-700" },
  sedan: { label: "Sedan", color: "bg-teal-100 text-teal-700" },
  luxury: { label: "Luxury", color: "bg-yellow-100 text-yellow-700" },
};

const SAMPLE_DATES = [
  { date: "Tomorrow, 27 Jun", time: "08:00 AM" },
  { date: "Today", time: "07:30 PM" },
  { date: "28 Jun", time: "06:00 AM" },
  { date: "Tomorrow, 27 Jun", time: "05:30 PM" },
  { date: "29 Jun", time: "09:00 AM" },
];
const SAMPLE_RATINGS = [4.8, 4.7, 4.9, 4.6, 4.8];

const TRUST_ITEMS = [
  { icon: Shield, label: "Verified Users", sub: "100% Safe" },
  { icon: Navigation, label: "Live Tracking", sub: "Always On" },
  { icon: Lock, label: "Secure Payments", sub: "Protected" },
];

export default function DesktopHome() {
  const [, navigate] = useLocation();
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [vehicleDetailsReq, setVehicleDetailsReq] = useState<typeof NEARBY_SHIFT_REQUESTS[0] | null>(null);
  const shiftRequests = useShiftRequests();
  const activeShift = shiftRequests.find(r => r.status !== "completed" && r.status !== "cancelled");

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <DesktopTopNav />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Hero row: banner + Shift/Go actions ── */}
        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 text-sm font-semibold mb-3">
          <MapPin className="w-4 h-4 text-blue-600" /> Chennai, Tamil Nadu
        </div>
        <div className="grid grid-cols-[1.4fr_1fr] gap-6 mb-8">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-blue-100 dark:border-neutral-800 aspect-[16/9]">
            <img
              src={heroBanner}
              alt="India's Smart Vehicle Shifting App — drop your vehicle details or check available vehicles to travel"
              className="w-full h-full object-contain bg-blue-950 block"
            />
          </div>

          <div className="grid grid-rows-2 gap-4">
            <button
              onClick={() => navigate("/shift-request")}
              className="rounded-2xl p-5 text-left flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%)" }}
            >
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-extrabold text-lg leading-none">Shift a Vehicle</p>
                <p className="text-blue-200 text-sm mt-1">Post a request — a verified traveler or driver moves it for you</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/70 shrink-0" />
            </button>

            <button
              onClick={() => navigate("/travel")}
              className="rounded-2xl p-5 text-left flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "linear-gradient(135deg,#c2410c 0%,#f97316 100%)" }}
            >
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-extrabold text-lg leading-none">Go &amp; Travel</p>
                <p className="text-orange-200 text-sm mt-1">Drive someone's vehicle on your route &amp; travel for less</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/70 shrink-0" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
          {/* ── Main column: nearby trips grid ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">Nearby available trips</h2>
              <button
                onClick={() => navigate("/nearby")}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-neutral-400 font-medium mb-4">Within 5 – 10 km radius</p>

            <div className="grid grid-cols-2 gap-4">
              {NEARBY_SHIFT_REQUESTS.slice(0, 6).map((req, i) => {
                const badge = VEHICLE_BADGE[req.vehicle.type] ?? { label: req.vehicle.type, color: "bg-neutral-100 text-neutral-600" };
                const sample = SAMPLE_DATES[i % SAMPLE_DATES.length];
                const rating = SAMPLE_RATINGS[i % SAMPLE_RATINGS.length];
                const images = getVehicleImages(req.vehicle);
                const km = parseInt(String(req.distance).replace(/[^0-9]/g, ""), 10) || 0;
                const fare = computeFare(km, vehicleTypeToFareCategory(req.vehicle.type, req.vehicle.make));

                return (
                  <motion.div
                    key={req.id}
                    layout
                    className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all flex flex-col"
                  >
                    <button
                      type="button"
                      onClick={() => setGalleryId(req.id)}
                      className="relative group"
                      aria-label={`View photos of ${req.vehicle.make} ${req.vehicle.model}`}
                    >
                      <img
                        src={`${req.vehicle.image}?w=400&h=200&q=70&fit=crop`}
                        alt={req.vehicle.model}
                        className="w-full h-32 object-cover"
                      />
                      <span className={`absolute bottom-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="absolute top-2 right-2 bg-black/65 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Images className="w-3 h-3" /> {images.length}
                      </span>
                    </button>

                    <div className="p-3.5 flex-1 flex flex-col">
                      <p className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm leading-tight">
                        {req.pickupLocation.name} → {req.dropLocation.name}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">
                        {req.vehicle.make} {req.vehicle.model} · {req.vehicle.registrationNumber}
                      </p>
                      {req.vehicle.fuelType && (
                        <span className={`mt-1.5 inline-flex w-fit text-[10px] font-bold px-1.5 py-0.5 rounded-md items-center gap-1 ${req.vehicle.fuelType === "Diesel" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          <Fuel className="w-2.5 h-2.5" /> {req.vehicle.fuelType}
                        </span>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-neutral-400">
                        <span className="flex items-center gap-1 text-[11px]"><CalendarDays className="w-3 h-3" />{sample.date}</span>
                        <span className="flex items-center gap-1 text-[11px]"><Clock className="w-3 h-3" />{sample.time}</span>
                      </div>

                      <div className="flex items-end justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <div>
                          <p className="font-extrabold text-neutral-900 dark:text-neutral-100 text-base leading-none">
                            ₹{fare.total.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-green-600 font-bold mt-1">Save ₹{fare.savings.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{rating}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setVehicleDetailsReq(req)}
                          className="flex-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 rounded-lg py-2 transition-colors"
                        >
                          View details
                        </button>
                        <SendRequestButton request={req} className="flex-1 !py-2 !text-xs" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-4">
            {activeShift && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Active shift request</p>
                  </div>
                  <span className="text-[10px] font-bold bg-white dark:bg-neutral-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
                    {SHIFT_STATUS_LABEL[activeShift.status]}
                  </span>
                </div>
                <p className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">{activeShift.pickup} → {activeShift.drop}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {activeShift.vehicleModel} · {activeShift.driverType === "professional" ? "Professional Driver" : "Traveler"}
                </p>
                <button
                  onClick={() => navigate("/my-rides")}
                  className="w-full mt-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  View in My Rides <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => navigate("/support")}
              className="w-full rounded-2xl p-4 flex items-center gap-3 text-left shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#f97316 100%)" }}
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-extrabold text-sm leading-tight">Have a question?</p>
                <p className="text-white/85 text-xs mt-0.5">Chat with our MD's desk</p>
              </div>
            </button>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Why Shiftzy Go</p>
              <div className="space-y-3">
                {TRUST_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{item.label}</p>
                      <p className="text-[11px] text-neutral-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {vehicleDetailsReq && (
        <VehicleDetailsSheet
          open={!!vehicleDetailsReq}
          onClose={() => setVehicleDetailsReq(null)}
          vehicle={vehicleDetailsReq.vehicle}
          owner={{ name: vehicleDetailsReq.userName, avatar: vehicleDetailsReq.userAvatar, rating: vehicleDetailsReq.rating }}
        />
      )}

      {(() => {
        const galleryReq = NEARBY_SHIFT_REQUESTS.find((r) => r.id === galleryId);
        if (!galleryReq) return null;
        return (
          <VehiclePhotoGallery
            images={getVehicleImages(galleryReq.vehicle)}
            open={!!galleryId}
            onOpenChange={(o) => !o && setGalleryId(null)}
            title={`${galleryReq.vehicle.make} ${galleryReq.vehicle.model}`}
          />
        );
      })()}
    </div>
  );
}
