import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { NEARBY_SHIFT_REQUESTS } from "@/lib/constants";
import {
  MapPin, ChevronRight, Star, Briefcase, CalendarDays, Clock,
  Shield, Navigation, Lock, ChevronDown, Route, Timer,
  IndianRupee, Phone, MessageCircle
} from "lucide-react";

const VEHICLE_BADGE: Record<string, { label: string; color: string }> = {
  car:  { label: "CAR",  color: "bg-blue-100 text-blue-700" },
  bike: { label: "BIKE", color: "bg-orange-100 text-orange-700" },
  suv:  { label: "SUV",  color: "bg-purple-100 text-purple-700" },
  sedan:{ label: "SEDAN",color: "bg-teal-100 text-teal-700" },
  luxury:{ label: "LUX", color: "bg-yellow-100 text-yellow-700" },
};

const SAMPLE_DATES = [
  { date: "Tomorrow, 27 Jun", time: "08:00 AM" },
  { date: "Today",            time: "07:30 PM" },
  { date: "28 Jun",           time: "06:00 AM" },
  { date: "Tomorrow, 27 Jun", time: "05:30 PM" },
  { date: "29 Jun",           time: "09:00 AM" },
];

const SAMPLE_RATINGS = [4.8, 4.7, 4.9, 4.6, 4.8];

export default function Home() {
  const [, navigate] = useLocation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-20">
      <Header />

      {/* ── Location bar ── */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-neutral-100">
        <button className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:opacity-80 transition-opacity">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          Chennai, Tamil Nadu
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
        </button>
        <button
          onClick={() => navigate("/track")}
          className="flex items-center gap-1.5 border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <Briefcase className="w-3.5 h-3.5" />
          My Rides
        </button>
      </div>

      {/* ── Hero Banner ── */}
      <div
        className="mx-4 mt-4 rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #e8f1fd 0%, #f0f7ff 40%, #dbeafe 100%)",
          minHeight: "140px",
        }}
      >
        {/* City skyline silhouette */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 opacity-10"
          style={{
            background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 60'%3E%3Crect x='10' y='20' width='20' height='40' fill='%231d4ed8'/%3E%3Crect x='35' y='10' width='15' height='50' fill='%231d4ed8'/%3E%3Crect x='55' y='25' width='25' height='35' fill='%231d4ed8'/%3E%3Crect x='85' y='5' width='18' height='55' fill='%231d4ed8'/%3E%3Crect x='108' y='18' width='22' height='42' fill='%231d4ed8'/%3E%3Crect x='250' y='15' width='20' height='45' fill='%231d4ed8'/%3E%3Crect x='275' y='8' width='15' height='52' fill='%231d4ed8'/%3E%3Crect x='295' y='22' width='25' height='38' fill='%231d4ed8'/%3E%3Crect x='325' y='5' width='18' height='55' fill='%231d4ed8'/%3E%3Crect x='348' y='18' width='22' height='42' fill='%231d4ed8'/%3E%3C/svg%3E\") center bottom / cover no-repeat"
          }}
        />

        <div className="relative flex items-center justify-between px-4 py-5">
          {/* Left: tagline */}
          <div className="flex-1 pr-2">
            <h2 className="text-xl font-extrabold text-neutral-900 leading-snug">
              Move your vehicle.
            </h2>
            <h2 className="text-xl font-extrabold text-orange-500 leading-snug">
              Enjoy the journey.
            </h2>
            <p className="text-xs text-neutral-500 mt-2 font-medium">
              Trusted travelers. Safe delivery.
            </p>
          </div>

          {/* Right: car + phone illustration */}
          <div className="relative w-36 h-28 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80"
              alt="Vehicle"
              className="absolute bottom-0 right-0 w-32 h-20 object-cover rounded-xl shadow-md"
              style={{ objectPosition: "center 60%" }}
            />
            {/* Phone with map pin overlay */}
            <div className="absolute top-0 right-0 w-10 h-14 bg-white rounded-lg shadow-lg border border-neutral-200 flex flex-col items-center justify-center gap-1">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="w-5 h-0.5 bg-orange-400 rounded-full" />
              <div className="w-4 h-0.5 bg-blue-300 rounded-full" />
              <div className="w-5 h-0.5 bg-orange-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SHIFT + GO side-by-side ── */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {/* SHIFT — blue */}
        <button
          onClick={() => navigate("/shift-request")}
          className="rounded-2xl p-4 text-left flex flex-col gap-2 active:scale-[0.97] transition-transform shadow-md"
          style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%)" }}
          data-tour="shift-option"
        >
          <div className="flex items-start justify-between">
            {/* Tow truck icon block */}
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl">🚛</span>
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-white/50 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p
              className="text-white font-black leading-none"
              style={{ fontSize: "22px", fontFamily: "Impact, sans-serif", letterSpacing: "1px" }}
            >
              SHIFT
            </p>
            <p className="text-blue-200 text-[11px] font-medium mt-0.5 leading-snug">
              I want to shift<br />my vehicle
            </p>
          </div>
        </button>

        {/* GO — orange */}
        <button
          onClick={() => navigate("/travel")}
          className="rounded-2xl p-4 text-left flex flex-col gap-2 active:scale-[0.97] transition-transform shadow-md"
          style={{ background: "linear-gradient(135deg,#c2410c 0%,#f97316 100%)" }}
          data-tour="go-option"
        >
          <div className="flex items-start justify-between">
            {/* Steering + pin icon block */}
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl">🛞</span>
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-white/50 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p
              className="text-white font-black leading-none"
              style={{ fontSize: "22px", fontFamily: "Impact, sans-serif", letterSpacing: "1px" }}
            >
              GO
            </p>
            <p className="text-orange-200 text-[11px] font-medium mt-0.5 leading-snug">
              I want to travel<br />&amp; save
            </p>
          </div>
        </button>
      </div>

      {/* ── Nearby Available Trips ── */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-extrabold text-neutral-900">Nearby available trips</h2>
          <button
            onClick={() => navigate("/nearby")}
            className="flex items-center gap-0.5 text-xs font-bold text-blue-600"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-neutral-400 font-medium mb-3">Within 5 – 10 km radius</p>

        <div className="space-y-2">
          {NEARBY_SHIFT_REQUESTS.slice(0, 5).map((req, i) => {
            const badge = VEHICLE_BADGE[req.vehicle.type] ?? { label: req.vehicle.type.toUpperCase(), color: "bg-neutral-100 text-neutral-600" };
            const sample = SAMPLE_DATES[i % SAMPLE_DATES.length];
            const rating = SAMPLE_RATINGS[i % SAMPLE_RATINGS.length];
            const isOpen = expandedId === req.id;
            return (
              <motion.div
                key={req.id}
                layout
                transition={{ layout: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } }}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${isOpen ? "border-blue-300 shadow-md" : "border-neutral-100"}`}
              >
                {/* ── Summary row (always visible) ── */}
                <motion.button
                  layout="position"
                  onClick={() => setExpandedId(isOpen ? null : req.id)}
                  className="w-full p-3 flex items-center gap-3 text-left active:bg-neutral-50 transition-colors"
                >
                  {/* Vehicle thumbnail */}
                  <div className="relative shrink-0">
                    <img
                      src={`${req.vehicle.image}?w=80&h=60&q=70&fit=crop`}
                      alt={req.vehicle.model}
                      className="w-16 h-12 rounded-xl object-cover"
                    />
                    <span className={`absolute -bottom-1 -right-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-neutral-900 text-sm leading-tight">
                      {req.pickupLocation.name} → {req.dropLocation.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                      {req.vehicle.make} {req.vehicle.model} · {req.vehicle.registrationNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-neutral-400">
                        <CalendarDays className="w-3 h-3 shrink-0" />
                        <span className="text-[10px]">{sample.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-400">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="text-[10px]">{sample.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: price + rating + chevron */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <p className="font-extrabold text-neutral-900 text-sm">
                      ₹{req.reward.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[9px] text-neutral-400 font-medium">One Way</p>
                    <div className="flex items-center gap-1 mt-1">
                      <img
                        src={`${req.userAvatar}?w=24&h=24&q=60&fit=crop&face`}
                        alt={req.userName}
                        className="w-5 h-5 rounded-full object-cover border border-neutral-200"
                      />
                      <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                      <span className="text-[10px] font-bold text-neutral-700">{rating}</span>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.3 }} className="mt-0.5">
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                    </motion.div>
                  </div>
                </motion.button>

                {/* ── Expanded detail panel (smooth slide-down) ── */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3">
                        <div className="border-t border-dashed border-neutral-200 pt-3">
                          {/* Route detail */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex flex-col items-center pt-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                              <div className="w-0.5 h-7 bg-gradient-to-b from-blue-600 to-orange-500" />
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-neutral-800">{req.pickupLocation.name}</p>
                              <p className="text-[10px] text-neutral-400 mb-2">{req.pickupLocation.address}</p>
                              <p className="text-xs font-bold text-neutral-800">{req.dropLocation.name}</p>
                              <p className="text-[10px] text-neutral-400">{req.dropLocation.address}</p>
                            </div>
                          </div>

                          {/* Stat grid */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-blue-50 rounded-xl p-2 text-center">
                              <Route className="w-3.5 h-3.5 text-blue-600 mx-auto mb-0.5" />
                              <p className="text-[11px] font-extrabold text-neutral-800">{req.distance}</p>
                              <p className="text-[9px] text-neutral-400">Distance</p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-2 text-center">
                              <Timer className="w-3.5 h-3.5 text-orange-600 mx-auto mb-0.5" />
                              <p className="text-[11px] font-extrabold text-neutral-800">{req.estimatedDuration}</p>
                              <p className="text-[9px] text-neutral-400">Duration</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-2 text-center">
                              <IndianRupee className="w-3.5 h-3.5 text-blue-600 mx-auto mb-0.5" />
                              <p className="text-[11px] font-extrabold text-neutral-800">₹{req.reward.toLocaleString("en-IN")}</p>
                              <p className="text-[9px] text-neutral-400">You Save</p>
                            </div>
                          </div>

                          {/* Owner row */}
                          <div className="flex items-center gap-2 bg-neutral-50 rounded-xl p-2 mb-3">
                            <img
                              src={`${req.userAvatar}?w=40&h=40&q=60&fit=crop&face`}
                              alt={req.userName}
                              className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                            />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-neutral-800">{req.userName}</p>
                              <p className="text-[10px] text-neutral-400">Posted {req.postedTime}</p>
                            </div>
                            <div className="flex items-center gap-0.5 bg-white border border-neutral-200 rounded-full px-2 py-0.5">
                              <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                              <span className="text-[10px] font-bold text-neutral-700">{rating}</span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate("/nearby")}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl active:scale-95 transition-all"
                            >
                              Accept &amp; Shift
                            </button>
                            <button
                              onClick={() => navigate("/chat")}
                              className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center active:scale-95 transition-all"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center active:scale-95 transition-all">
                              <Phone className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Trust Indicators ── */}
      <div className="px-4 mt-5 mb-4">
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm">
          <div className="grid grid-cols-4 divide-x divide-neutral-100">
            {[
              { icon: <Shield className="w-4 h-4 text-blue-600" />, line1: "Verified", line2: "Users", line3: "100% Safe" },
              { icon: <Navigation className="w-4 h-4 text-blue-600" />, line1: "Live", line2: "Tracking", line3: "Always On" },
              { icon: <span className="text-sm font-black text-red-600 leading-none">SOS</span>, line1: "SOS", line2: "Support", line3: "24x7 Help" },
              { icon: <Lock className="w-4 h-4 text-blue-600" />, line1: "Secure", line2: "Payments", line3: "Protected" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center py-3 px-1 text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${i === 2 ? "bg-red-50 border border-red-200" : "bg-blue-50"}`}>
                  {item.icon}
                </div>
                <p className="text-[9px] font-bold text-neutral-700 leading-tight">{item.line2}</p>
                <p className="text-[9px] text-neutral-400 leading-tight">{item.line3}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
