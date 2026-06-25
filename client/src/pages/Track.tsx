import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Search, MapPin, CheckCircle2, Clock, Camera, Share2, Phone, Navigation, Package, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/layout/BottomNav";

type TripStatus = "not-started" | "inspection" | "in-transit" | "completed";

const TRIP_STAGES = [
  { key: "inspection", label: "Pre-trip Inspection", icon: Camera, done: true },
  { key: "pickup", label: "Vehicle Picked Up", icon: MapPin, done: true },
  { key: "in-transit", label: "In Transit", icon: Navigation, done: true },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, done: false },
];

const MOCK_TRIPS: Record<string, { vehicle: string; from: string; to: string; driver: string; phone: string; status: TripStatus; progress: number; eta: string }> = {
  "TRK-101": { vehicle: "Honda City · TN09AB1234", from: "Chennai (Perambur)", to: "Bangalore (Koramangala)", driver: "Karthik R.", phone: "+91 98765 43210", status: "in-transit", progress: 65, eta: "~3h 20m remaining" },
  "TRK-202": { vehicle: "Maruti Swift · TN22CD5678", from: "Coimbatore", to: "Chennai", driver: "Arjun V.", phone: "+91 87654 32109", status: "inspection", progress: 10, eta: "Departure in ~30 min" },
  "TRK-303": { vehicle: "XUV700 · TN45EF9012", from: "Madurai", to: "Salem", driver: "Ramu S.", phone: "+91 76543 21098", status: "completed", progress: 100, eta: "Delivered" },
};

export default function Track() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const photoRef = useRef<HTMLInputElement>(null);

  const [trackingId, setTrackingId] = useState("");
  const [trip, setTrip] = useState<typeof MOCK_TRIPS[string] | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>("not-started");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTrack = () => {
    if (!trackingId.trim()) {
      toast({ title: "Enter Tracking ID", description: "Please enter your tracking ID.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const found = MOCK_TRIPS[trackingId.toUpperCase()];
      if (found) {
        setTrip(found);
        setTripStatus(found.status);
      } else {
        toast({ title: "Not Found", description: "No trip found for this tracking ID.", variant: "destructive" });
        setTrip(null);
      }
    }, 1000);
  };

  const handleStartTrip = () => {
    setTripStatus("in-transit");
    setTrip(t => t ? { ...t, status: "in-transit", progress: 5, eta: "Trip started" } : t);
    toast({ title: "Trip Started ✅", description: "The vehicle is now in transit. Drive safely!" });
  };

  const handleEndTrip = () => {
    setTripStatus("completed");
    setTrip(t => t ? { ...t, status: "completed", progress: 100, eta: "Delivered" } : t);
    toast({ title: "Trip Completed 🎉", description: "Vehicle delivered successfully! Payment will be released." });
  };

  const handleShareTrip = () => {
    const text = trip ? `Shiftzy Go Trip Update: ${trip.vehicle} — ${trip.from} → ${trip.to} · Tracking: ${trackingId}` : "";
    if (navigator.share) {
      navigator.share({ title: "Shiftzy Go Trip", text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Link Copied", description: "Trip details copied to clipboard." });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      setPhotos(prev => [...prev, url]);
    });
    toast({ title: "Photo Added", description: "Inspection photo uploaded successfully." });
  };

  const progressColor = tripStatus === "completed" ? "bg-green-500" : "bg-blue-500";

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Live Tracking</h1>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">

        {/* Search bar */}
        <div className="flex gap-2">
          <Input
            value={trackingId}
            onChange={e => setTrackingId(e.target.value.toUpperCase())}
            placeholder="Enter Tracking ID (e.g. TRK-101)"
            className="flex-1 uppercase"
            onKeyDown={e => e.key === "Enter" && handleTrack()}
          />
          <Button onClick={handleTrack} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-4 gap-1">
            {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {/* Demo tip */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 flex gap-2">
          <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-700">Try: <strong>TRK-101</strong>, <strong>TRK-202</strong>, or <strong>TRK-303</strong></p>
        </div>

        {/* Trip found */}
        {trip && (
          <>
            {/* Vehicle card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-blue-800">{trip.vehicle}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${tripStatus === "completed" ? "bg-green-500" : "bg-blue-500"}`} />
                    <p className="text-xs font-semibold text-blue-600 capitalize">{tripStatus.replace("-", " ")}</p>
                  </div>
                </div>
                <button onClick={handleShareTrip} className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-blue-600" />
                </button>
              </div>

              {/* Route */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow" />
                  <div className="w-px h-6 bg-neutral-300 border-dashed" />
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white shadow" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="font-semibold text-neutral-700 leading-none">{trip.from}</p>
                  <p className="font-semibold text-neutral-700 leading-none">{trip.to}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                  <span>Progress</span><span>{trip.progress}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full transition-all duration-700 ${progressColor}`} style={{ width: `${trip.progress}%` }} />
                </div>
                <p className="text-xs text-blue-600 font-semibold mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {trip.eta}
                </p>
              </div>
            </div>

            {/* Journey stages */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-4">
              <p className="font-bold text-sm mb-3">Journey Progress</p>
              {TRIP_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isLast = idx === TRIP_STAGES.length - 1;
                const isDone = tripStatus === "completed" || (tripStatus === "in-transit" && idx < 3) || (tripStatus === "inspection" && idx === 0);
                return (
                  <div key={stage.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? "bg-blue-600" : "bg-neutral-100"}`}>
                        <Icon className={`w-4 h-4 ${isDone ? "text-white" : "text-neutral-400"}`} />
                      </div>
                      {!isLast && <div className={`w-px flex-1 my-1 ${isDone ? "bg-blue-300" : "bg-neutral-200"}`} style={{ minHeight: 20 }} />}
                    </div>
                    <div className="pb-3">
                      <p className={`text-sm font-semibold ${isDone ? "text-blue-700" : "text-neutral-400"}`}>{stage.label}</p>
                      {isDone && <p className="text-xs text-green-500 font-medium">✓ Done</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Driver info */}
            <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide">Driver</p>
                <p className="font-bold text-blue-800">{trip.driver}</p>
                <p className="text-xs text-blue-600">{trip.phone}</p>
              </div>
              <a href={`tel:${trip.phone}`} className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Phone className="w-5 h-5" />
              </a>
            </div>

            {/* Share trip */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <p className="font-bold text-sm text-orange-800 mb-1">Share Trip with Family</p>
              <p className="text-xs text-orange-600 mb-3">Let someone you trust track this trip for safety.</p>
              <Button onClick={handleShareTrip} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
                <Share2 className="w-4 h-4" /> Share Live Trip Details
              </Button>
            </div>

            {/* Inspection photos */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm">Inspection Photos</p>
                <button onClick={() => photoRef.current?.click()} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                  <Camera className="w-3.5 h-3.5" /> Add Photo
                </button>
              </div>
              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p, i) => (
                    <img key={i} src={p} alt={`Inspection ${i + 1}`} className="w-full h-20 object-cover rounded-xl border border-neutral-100" />
                  ))}
                </div>
              ) : (
                <button onClick={() => photoRef.current?.click()} className="w-full border-2 border-dashed border-neutral-200 rounded-xl p-6 flex flex-col items-center gap-2 text-neutral-400 hover:border-blue-300 transition-colors">
                  <Upload className="w-6 h-6" />
                  <p className="text-xs font-medium">Tap to add vehicle photos</p>
                </button>
              )}
            </div>

            {/* Trip action buttons */}
            {tripStatus === "inspection" && (
              <Button onClick={handleStartTrip} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base gap-2">
                <Navigation className="w-5 h-5" /> Start Trip
              </Button>
            )}
            {tripStatus === "in-transit" && (
              <Button onClick={handleEndTrip} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base gap-2">
                <CheckCircle2 className="w-5 h-5" /> Mark as Delivered
              </Button>
            )}
            {tripStatus === "completed" && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-green-700">Trip Completed!</p>
                <p className="text-xs text-green-600 mt-1">Payment released. Thank you for using Shiftzy Go!</p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
