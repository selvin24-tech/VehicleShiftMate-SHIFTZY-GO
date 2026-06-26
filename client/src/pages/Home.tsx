import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import TestimonialCard from "@/components/common/TestimonialCard";
import TripCard from "@/components/common/TripCard";
import ShiftRequestCard from "@/components/common/ShiftRequestCard";
import { TESTIMONIALS, RECENT_TRIPS, NEARBY_SHIFT_REQUESTS } from "@/lib/constants";
import {
  MapPin, Navigation, ChevronRight, Car, Bike, Truck,
  Star, Shield, Zap, ArrowRight, Phone, AlertTriangle,
  Clock, IndianRupee, Users
} from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const username = localStorage.getItem("username") || "there";
  const firstName = username.split("_")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="max-w-lg mx-auto bg-gray-50 min-h-screen pb-20">
      <Header />

      {/* ── Greeting strip ── */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Good day 👋</p>
            <h1 className="text-lg font-extrabold text-neutral-900 leading-tight">
              Hello, {displayName}!
            </h1>
          </div>
          {/* Location pill */}
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <MapPin className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">Chennai</span>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-3 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl px-3 py-2">
          <div className="flex -space-x-1.5 shrink-0">
            {["#2563eb","#f97316","#1d4ed8","#ea580c"].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ background: c }} />
            ))}
          </div>
          <span className="text-white text-xs font-bold">4,370+ vehicles safely shifted</span>
          <Star className="w-3.5 h-3.5 text-yellow-300 ml-auto shrink-0 fill-yellow-300" />
          <span className="text-yellow-200 text-xs font-bold">4.9★</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* ══════════════════════════════════════
            SHIFT CARD — immersive vehicle moving
        ══════════════════════════════════════ */}
        <button
          onClick={() => navigate("/shift-request")}
          className="w-full text-left rounded-3xl overflow-hidden shadow-xl active:scale-[0.98] transition-transform duration-150"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 100%)" }}
        >
          {/* Top section */}
          <div className="px-5 pt-5 pb-3 flex items-start justify-between">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-white/90 text-[10px] font-bold tracking-wider uppercase">For Vehicle Owners</span>
              </div>

              {/* Headline */}
              <h2 className="text-white font-black leading-tight mb-1" style={{ fontSize: "26px" }}>
                Move Your<br />
                <span className="text-orange-400">Vehicle</span>
              </h2>
              <p className="text-blue-200 text-xs font-medium leading-relaxed">
                Put your car or bike on the road<br />with a verified traveller
              </p>
            </div>

            {/* Vehicle emoji stack */}
            <div className="relative w-24 h-24 shrink-0">
              <div className="absolute top-0 right-0 text-5xl drop-shadow-2xl" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>🚗</div>
              <div className="absolute bottom-0 left-0 text-3xl opacity-60">🏍️</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="px-5 pb-4 grid grid-cols-3 gap-2">
            {[
              { icon: "🛡️", label: "Verified", sub: "Drivers" },
              { icon: "💰", label: "Save 80%", sub: "vs Transport" },
              { icon: "⚡", label: "Fast", sub: "Matching" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl px-2 py-2 text-center">
                <div className="text-base mb-0.5">{s.icon}</div>
                <div className="text-white text-[10px] font-extrabold leading-none">{s.label}</div>
                <div className="text-blue-300 text-[9px] mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Bottom CTA bar */}
          <div className="mx-4 mb-4 rounded-2xl overflow-hidden">
            {/* Road lanes decoration */}
            <div className="bg-white/10 px-4 py-3 flex items-center justify-between">
              {/* Mini route animation */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex gap-0.5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`h-0.5 w-3 rounded-full ${i % 2 === 0 ? "bg-white/60" : "bg-transparent"}`} />
                  ))}
                </div>
                <div className="text-lg">🚚</div>
                <div className="flex gap-0.5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`h-0.5 w-3 rounded-full ${i % 2 === 0 ? "bg-white/60" : "bg-transparent"}`} />
                  ))}
                </div>
                <div className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-500 rounded-xl px-3 py-2">
                <span className="text-white text-xs font-extrabold">Shift Now</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Change option hint */}
          <div className="mx-4 mb-4 flex items-center gap-2">
            <div className="flex gap-1.5">
              {[{e:"🚗",l:"Car"},{e:"🏍️",l:"Bike"},{e:"🚙",l:"SUV"},{e:"✨",l:"Luxury"}].map(v => (
                <div key={v.l} className="bg-white/15 rounded-xl px-2 py-1 flex items-center gap-1">
                  <span className="text-xs">{v.e}</span>
                  <span className="text-white text-[9px] font-bold">{v.l}</span>
                </div>
              ))}
            </div>
            <span className="text-blue-300 text-[9px] ml-auto">tap to change ↑</span>
          </div>
        </button>

        {/* ══════════════════════════════════════
            GO CARD — book a vehicle & travel
        ══════════════════════════════════════ */}
        <button
          onClick={() => navigate("/travel")}
          className="w-full text-left rounded-3xl overflow-hidden shadow-xl active:scale-[0.98] transition-transform duration-150"
          style={{ background: "linear-gradient(135deg, #7c2d12 0%, #ea580c 40%, #f97316 100%)" }}
        >
          {/* Top section */}
          <div className="px-5 pt-5 pb-3 flex items-start justify-between">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                <span className="text-white/90 text-[10px] font-bold tracking-wider uppercase">For Travellers</span>
              </div>

              {/* Headline */}
              <h2 className="text-white font-black leading-tight mb-1" style={{ fontSize: "26px" }}>
                Drive &amp;<br />
                <span className="text-yellow-300">Earn</span>
              </h2>
              <p className="text-orange-200 text-xs font-medium leading-relaxed">
                Pick a vehicle going your way.<br />Travel cheaper, save more.
              </p>
            </div>

            {/* Road scene */}
            <div className="relative w-24 h-24 shrink-0">
              <div className="absolute top-0 right-0 text-5xl drop-shadow-2xl" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>🛣️</div>
              <div className="absolute bottom-0 left-0 text-3xl opacity-70">🏎️</div>
            </div>
          </div>

          {/* 3 vehicle options */}
          <div className="px-5 pb-4">
            <p className="text-orange-200 text-[9px] font-bold uppercase tracking-wider mb-2">Available Vehicle Types</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { emoji: "🏍️", label: "Bike",    price: "₹4/km",  color: "from-blue-800 to-blue-600" },
                { emoji: "🚗", label: "Budget Car", price: "₹6/km", color: "from-blue-800 to-blue-600" },
                { emoji: "👑", label: "Premium",  price: "₹8/km",  color: "from-blue-800 to-blue-600" },
              ].map(v => (
                <div key={v.label} className="bg-white/15 rounded-2xl px-2 py-3 text-center relative overflow-hidden">
                  <div className="text-2xl mb-1">{v.emoji}</div>
                  <div className="text-white text-[10px] font-extrabold leading-none">{v.label}</div>
                  <div className="text-yellow-300 text-[9px] font-bold mt-1">{v.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA bar */}
          <div className="mx-4 mb-4 bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-yellow-300" />
                <span className="text-white font-extrabold text-sm">Starting ₹4/km</span>
              </div>
              <p className="text-orange-200 text-[10px] mt-0.5">Local &amp; Outstation · All India</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2">
              <span className="text-orange-600 text-xs font-extrabold">Find a Ride</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
            </div>
          </div>

          {/* Change type hint */}
          <div className="mx-4 mb-4 flex items-center gap-2">
            <div className="flex gap-2">
              {["Outstation 🛣️","Local 📍"].map(m => (
                <div key={m} className="bg-white/15 rounded-xl px-2.5 py-1">
                  <span className="text-white text-[9px] font-bold">{m}</span>
                </div>
              ))}
            </div>
            <span className="text-orange-300 text-[9px] ml-auto">tap to switch ↑</span>
          </div>
        </button>

        {/* ── Quick action pills ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: "🗺️", label: "Plan",  path: "/plan" },
            { emoji: "📍", label: "Track", path: "/track" },
            { emoji: "💬", label: "Chat",  path: "/chat" },
            { emoji: "🆘", label: "Help",  path: "/help" },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="bg-white rounded-2xl py-3 flex flex-col items-center gap-1 shadow-sm border border-neutral-100 active:scale-95 transition-transform hover:shadow-md">
              <span className="text-xl">{a.emoji}</span>
              <span className="text-[10px] font-bold text-neutral-600">{a.label}</span>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            NEARBY PICKUPS — blue/orange theme
        ══════════════════════════════════════ */}
        <div>
          {/* Section header */}
          <div
            className="rounded-2xl px-4 py-4 mb-3 overflow-hidden relative shadow-lg"
            style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #f97316 100%)" }}
          >
            {/* Glow blobs */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-orange-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-400/20 rounded-full blur-xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Pulsing radar */}
                <div className="relative w-10 h-10 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                  <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-base leading-tight">Nearby Pickups</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-300 animate-pulse inline-block" />
                    <span className="text-blue-100 text-[10px] font-semibold">Within 5 km · Live updates</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/nearby")}
                className="flex items-center gap-1.5 bg-white text-blue-700 font-bold text-xs px-3 py-2 rounded-full shadow active:scale-95 transition-all"
              >
                See All
                <span className="bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {NEARBY_SHIFT_REQUESTS.length}
                </span>
              </button>
            </div>

            <div className="relative mt-3 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-orange-300 shrink-0" />
              <p className="text-xs text-white font-medium">
                Owners nearby need their vehicle moved — share cost, both save!
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {NEARBY_SHIFT_REQUESTS.slice(0, 2).map((request) => (
              <ShiftRequestCard key={request.id} request={request} />
            ))}
          </div>

          {/* View all button */}
          <button
            onClick={() => navigate("/nearby")}
            className="mt-3 w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#f97316 100%)" }}
          >
            <Navigation className="w-4 h-4" />
            View All {NEARBY_SHIFT_REQUESTS.length} Nearby Vehicles
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── How it works ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100">
          <h3 className="font-extrabold text-neutral-900 text-sm mb-4">How Shiftzy Go Works</h3>
          <div className="space-y-3">
            {[
              { step: "1", icon: "📋", title: "Post your shift request", desc: "Tell us your vehicle type, pickup & drop location.", color: "bg-blue-50 text-blue-600" },
              { step: "2", icon: "🤝", title: "Get matched instantly", desc: "A verified traveller going your route is assigned.", color: "bg-orange-50 text-orange-600" },
              { step: "3", icon: "🚗", title: "Vehicle delivered safely", desc: "Track live. Get notified at every step.", color: "bg-blue-50 text-blue-600" },
              { step: "4", icon: "💸", title: "Both sides save money", desc: "Split fuel cost — owner & traveller both win.", color: "bg-orange-50 text-orange-600" },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg ${s.color}`}>
                  {s.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xs text-neutral-900">{s.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{s.desc}</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-extrabold text-blue-600">{s.step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Trips ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-neutral-900 text-sm">Your Recent Trips</h2>
            <button className="text-xs text-blue-600 font-bold">View All</button>
          </div>
          {RECENT_TRIPS.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>

        {/* ── Testimonials ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-neutral-900 text-sm">What Our Users Say</h2>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
              <span className="text-xs font-bold text-orange-600">4.9 / 5</span>
            </div>
          </div>
          <div className="overflow-x-auto flex -mx-4 px-4 py-1 gap-3 pb-2">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>

        {/* ── Plan Journey ── */}
        <div
          className="rounded-3xl p-5 overflow-hidden relative"
          style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%)" }}
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />
          <div className="relative">
            <h2 className="font-extrabold text-white text-base mb-1">Plan Your Journey 🗺️</h2>
            <p className="text-blue-200 text-xs mb-4">
              Get route suggestions &amp; cost estimates before you book.
            </p>
            <button
              onClick={() => navigate("/plan")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 active:scale-95 transition-all"
            >
              Start Planning <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Emergency ── */}
        <div className="bg-white rounded-3xl p-5 border-2 border-red-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-red-900 text-sm">24/7 Emergency Support</h2>
              <p className="text-red-400 text-[10px]">Always here when you need us</p>
            </div>
          </div>
          <p className="text-neutral-500 text-xs mb-3">
            Need immediate help during your trip? Our support team is available round the clock.
          </p>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex-1 justify-center active:scale-95">
              <Phone className="w-3.5 h-3.5" /> Call Emergency
            </button>
            <button
              onClick={() => navigate("/help")}
              className="border-2 border-red-200 text-red-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-red-50 active:scale-95"
            >
              Get Help
            </button>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
