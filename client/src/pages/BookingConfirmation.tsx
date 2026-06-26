import { useLocation } from "wouter";
import { CheckCircle2, Download, Share2, MapPin, Car, Calendar, IndianRupee, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/layout/BottomNav";

export default function BookingConfirmation() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const booking = {
    id: "BK-" + Math.floor(10000 + Math.random() * 90000),
    trackingId: "TRK-" + Math.floor(1000 + Math.random() * 9000),
    vehicle: "Honda City · TN09AB1234",
    from: "Chennai (Perambur)",
    to: "Bangalore (Koramangala)",
    date: "12 Jun 2026 · 09:00 AM",
    distance: "350 km",
    ownerShare: 2100,
    platformFee: 252,
    total: 2352,
    driverName: "Karthik R.",
    driverPhone: "+91 98765 43210",
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${label} copied!`, description: text });
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Shiftzy Go — Booking Confirmed",
        text: `My vehicle shift is booked! Tracking ID: ${booking.trackingId} · ${booking.from} → ${booking.to}`,
      });
    } else {
      copyToClipboard(booking.trackingId, "Tracking ID");
    }
  };

  const handleDownloadInvoice = () => {
    toast({
      title: "Invoice Downloaded",
      description: `Invoice for booking ${booking.id} has been saved.`,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
      {/* Success Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 pt-14 pb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/40"
              style={{ width: 80 + i * 60, height: 80 + i * 60, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          ))}
        </div>
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-xl">
            <CheckCircle2 className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-white font-extrabold text-2xl">Booking Confirmed!</h1>
          <p className="text-blue-200 text-sm mt-1">Your vehicle shift is all set</p>

          {/* Booking ID chip */}
          <button
            onClick={() => copyToClipboard(booking.id, "Booking ID")}
            className="mt-4 flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mx-auto text-white text-sm font-bold"
          >
            <span>{booking.id}</span>
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tracking ID card */}
      <div className="mx-4 -mt-5 bg-orange-500 rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide">Tracking ID</p>
          <p className="text-white font-extrabold text-xl mt-0.5">{booking.trackingId}</p>
        </div>
        <button
          onClick={() => navigate("/track")}
          className="bg-white text-orange-600 font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-1"
        >
          Track <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Trip Details */}
      <div className="px-4 mt-5 space-y-3">
        <h2 className="font-bold text-base text-neutral-800">Trip Details</h2>

        <div className="bg-neutral-50 rounded-2xl p-4 space-y-3">
          <div className="flex gap-3">
            <Car className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-400">Vehicle</p>
              <p className="text-sm font-semibold">{booking.vehicle}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-400">From</p>
              <p className="text-sm font-semibold">{booking.from}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-400">To</p>
              <p className="text-sm font-semibold">{booking.to}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-400">Pickup Date & Time</p>
              <p className="text-sm font-semibold">{booking.date}</p>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Assigned Driver</p>
            <p className="font-bold text-blue-800 mt-0.5">{booking.driverName}</p>
            <p className="text-xs text-blue-600">{booking.driverPhone}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.1-1.1a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
            </svg>
          </button>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-4">
          <p className="font-bold text-sm mb-3">Payment Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Your share (50% of trip cost)</span>
              <span className="font-semibold">₹{booking.ownerShare.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Platform fee</span>
              <span className="font-semibold">₹{booking.platformFee.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-blue-700">
              <span>Total Paid</span>
              <span>₹{booking.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button onClick={handleShare} variant="outline" className="border-blue-200 text-blue-600 gap-2">
            <Share2 className="w-4 h-4" /> Share Trip
          </Button>
          <Button onClick={handleDownloadInvoice} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <Download className="w-4 h-4" /> Invoice
          </Button>
        </div>

        <Button onClick={() => navigate("/")} variant="ghost" className="w-full text-neutral-500">
          Back to Home
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
