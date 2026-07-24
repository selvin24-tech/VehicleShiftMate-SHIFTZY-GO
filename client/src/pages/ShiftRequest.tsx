import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { LOCATIONS, CHENNAI_LOCALITIES, DETAILED_VEHICLE_TYPES } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { addShiftRequest } from "@/lib/appStore";
import {
  ChevronLeft, CircleCheck, ChevronRight,
  Shield, Users, Building2, Home, Clock, User, Phone,
  KeyRound, StickyNote, MapPin, CheckCircle2, RefreshCw
} from "lucide-react";

/* ─── Hubs ─── */
const HUBS = [
  { id: "h1", city: "Chennai",    name: "Shiftzy Chennai Hub",    address: "Guindy Industrial Estate, Chennai" },
  { id: "h2", city: "Bangalore",  name: "Shiftzy Bangalore Hub",  address: "Electronic City Phase 1, Bangalore" },
  { id: "h3", city: "Coimbatore", name: "Shiftzy Coimbatore Hub", address: "Peelamedu, Coimbatore" },
  { id: "h4", city: "Madurai",    name: "Shiftzy Madurai Hub",    address: "Mattuthavani Bus Stand Area, Madurai" },
  { id: "h5", city: "Pondicherry", name: "Shiftzy Pondicherry Hub", address: "Beach Road, Pondicherry" },
];

const TIME_SLOTS = [
  { id: "morning",   label: "Morning",   sub: "8 AM – 12 PM", emoji: "🌅" },
  { id: "afternoon", label: "Afternoon", sub: "12 PM – 5 PM",  emoji: "☀️" },
  { id: "evening",   label: "Evening",   sub: "5 PM – 9 PM",   emoji: "🌆" },
];

const KEY_HANDOVER = [
  { id: "present",  label: "I will be present",       desc: "Owner / receiver at the address",    emoji: "🙋" },
  { id: "guard",    label: "Leave with guard",         desc: "Hand over keys to security/guard",   emoji: "🛡️" },
  { id: "lock",     label: "Smart lock / key box",     desc: "Driver uses code to secure vehicle", emoji: "🔐" },
  { id: "neighbour",label: "Leave with neighbour",     desc: "Agreed neighbour receives the keys", emoji: "🏠" },
];

/* ─── Schema ─── */
const formSchema = z.object({
  vehicleType:        z.enum(["car", "bike", "suv", "luxury"]).optional(),
  vehicleModel:       z.string().min(2, "Vehicle model is required"),
  registrationNumber: z.string().min(5, "Valid registration number is required"),
  pickupLocation:     z.string().min(2, "Pickup location is required"),
  dropLocation:       z.string().min(2, "Drop location is required"),
  travelDate:         z.string().min(1, "Travel date is required"),
  pickupTimeFrom:     z.string().min(1, "Start time is required"),
  pickupTimeTo:       z.string().min(1, "End time is required"),
  insuranceExpiryDate:z.string().min(2, "Insurance expiry date is required"),
  luxuryBrand:        z.string().optional(),
}).refine((d) => d.pickupTimeTo > d.pickupTimeFrom, {
  message: "End time must be after the start time",
  path: ["pickupTimeTo"],
});

type FormValues = z.infer<typeof formSchema>;
type DriverType  = "professional" | "traveler" | null;
type DropPref    = "hub" | "home" | null;

/* ─── COMPONENT ─── */
export default function ShiftRequest() {
  const [, navigate] = useLocation();
  const { toast }    = useToast();

  /* vehicle form state */
  const [selectedVehicleType, setSelectedVehicleType] = useState<"car"|"bike"|"suv"|"luxury"|null>(null);
  const [showLuxuryField, setShowLuxuryField]         = useState(false);
  const [photoPreview, setPhotoPreview]               = useState<string | null>(null);
  const [photoFile, setPhotoFile]                     = useState<File | null>(null);
  const [showSuccessDialog, setShowSuccessDialog]     = useState(false);
  const [isUploading, setIsUploading]                 = useState(false);

  /* route mode */
  const [shiftMode, setShiftMode] = useState<"outstation" | "local">("outstation");

  /* new driver / drop preference state */
  const [driverType,    setDriverType]    = useState<DriverType>(null);
  const [dropPref,      setDropPref]      = useState<DropPref>(null);
  const [selectedHub,   setSelectedHub]   = useState("");
  const [hubCollection, setHubCollection] = useState("");
  const [timeSlot,      setTimeSlot]      = useState("");
  const [keyHandover,   setKeyHandover]   = useState("");
  const [receiverName,  setReceiverName]  = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [deliveryAddr,  setDeliveryAddr]  = useState("");
  const [specialNote,   setSpecialNote]   = useState("");
  const [agreedTerms,   setAgreedTerms]   = useState(false);
  const [attempted,     setAttempted]     = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleType: undefined, vehicleModel: "", registrationNumber: "",
      pickupLocation: "", dropLocation: "", travelDate: "", pickupTimeFrom: "", pickupTimeTo: "", insuranceExpiryDate: "", luxuryBrand: "",
    },
  });

  const vehicleModels = selectedVehicleType ? DETAILED_VEHICLE_TYPES[selectedVehicleType] || [] : [];

  const changeVehicleType = (t: "car"|"bike"|"suv"|"luxury") => {
    form.setValue("vehicleType", t);
    setShowLuxuryField(t === "luxury");
    setSelectedVehicleType(t);
    form.setValue("vehicleModel", "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormValues) => {
    setAttempted(true);
    const rcStatus = localStorage.getItem("rcStatus");
    if (!rcStatus || rcStatus === "none") {
      toast({ title: "RC document upload pending", description: "Please upload your vehicle RC in Profile → Documents to submit a shift request.", variant: "destructive" });
      navigate("/profile?tab=docs");
      return;
    }
    if (!driverType) {
      toast({ title: "Select driver type", description: "Choose Professional Driver or Traveler.", variant: "destructive" });
      return;
    }
    if (driverType === "traveler" && !dropPref) {
      toast({ title: "Select drop preference", description: "Choose Common Hub or Home Drop.", variant: "destructive" });
      return;
    }
    if (!agreedTerms) {
      toast({ title: "Accept the shifter terms", description: "Please confirm the vehicle owner acknowledgment to continue.", variant: "destructive" });
      return;
    }
    try {
      setIsUploading(true);
      const payload = {
        ...data,
        driverType,
        dropPreference: dropPref,
        ...(dropPref === "hub"  ? { selectedHub, hubCollectionTime: hubCollection }          : {}),
        ...(dropPref === "home" ? { deliveryAddress: deliveryAddr, timeSlot, keyHandover,
                                    receiverName, receiverPhone, specialNote }               : {}),
        photoUploaded: !!photoFile,
      };
      if (data.vehicleType !== "luxury") delete payload.luxuryBrand;
      await apiRequest("POST", "/api/shift-requests", payload);
      addShiftRequest({
        pickup: data.pickupLocation,
        drop: data.dropLocation,
        vehicleType: data.vehicleType ?? selectedVehicleType ?? "car",
        vehicleModel: data.vehicleModel,
        driverType,
        date: data.travelDate,
        timeRange: `${data.pickupTimeFrom} – ${data.pickupTimeTo}`,
      });
      setShowSuccessDialog(true);
      queryClient.invalidateQueries({ queryKey: ["/api/shift-requests"] });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  /* ── small helpers ── */
  const SelectionCard = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${active ? "border-blue-500 bg-blue-50" : "border-neutral-200 bg-white hover:border-blue-200"}`}>
      {children}
    </button>
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
      <Header title="Shift Your Vehicle" showAnimation={true} />

      {/* Back */}
      <div className="fixed top-4 left-4 z-50">
        <button onClick={() => navigate("/")}
          className="bg-black text-white shadow-lg hover:bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center">
          <ChevronLeft className="h-7 w-7" />
        </button>
      </div>

      <div className="px-4 py-6">

        {/* ── RC warning banner ── */}
        {(() => {
          const rcStatus = localStorage.getItem("rcStatus");
          if (rcStatus === "pending" || rcStatus === "verified") return null;
          return (
            <a href="/profile?tab=docs" className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4 active:scale-98 transition-all">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-lg">⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-red-700">Your RC document upload is pending</p>
                <p className="text-xs text-red-500 mt-0.5">Upload your RC in Profile → Documents to book a shift</p>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
            </a>
          );
        })()}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* ════════════════════════════════
                SECTION A — VEHICLE DETAILS
            ════════════════════════════════ */}
            <div>
              <SectionTitle number="1" label="Vehicle Details" />

              {/* Vehicle Type */}
              <FormField control={form.control} name="vehicleType" render={({ field }) => (
                <FormItem className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel className="text-neutral-700 font-medium">Vehicle Type</FormLabel>
                  </div>
                  <FormControl>
                    {selectedVehicleType ? (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-3xl">{selectedVehicleType === "car" ? "🚗" : selectedVehicleType === "bike" ? "🏍️" : selectedVehicleType === "suv" ? "🚙" : "✨"}</span>
                        <div>
                          <p className="font-bold text-blue-700 capitalize">{selectedVehicleType === "luxury" ? "Premium" : selectedVehicleType}</p>
                          <p className="text-xs text-neutral-500">{selectedVehicleType === "car" ? "Sedans, Hatchbacks" : selectedVehicleType === "bike" ? "Scooters, Motorbikes" : selectedVehicleType === "suv" ? "Big & Spacious" : "Top-end vehicles"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedVehicleType(null)}
                          className="ml-auto flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-md active:scale-95 transition-all"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { type: "car",    emoji: "🚗", label: "Car",     desc: "Sedans, Hatchbacks" },
                          { type: "bike",   emoji: "🏍️", label: "Bike",    desc: "Scooters, Motorbikes" },
                          { type: "suv",    emoji: "🚙", label: "SUV",     desc: "Big & Spacious" },
                          { type: "luxury", emoji: "✨", label: "Premium", desc: "Top-end vehicles" },
                        ].map(v => (
                          <button key={v.type} type="button" onClick={() => changeVehicleType(v.type as any)}
                            className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm hover:border-blue-400 hover:bg-blue-50 active:scale-95 transition-all">
                            <span className="text-3xl mb-1">{v.emoji}</span>
                            <span className="font-semibold text-sm">{v.label}</span>
                            <span className="text-xs text-neutral-500 mt-0.5">{v.desc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            </div>

            {selectedVehicleType && (<>

            {/* Vehicle Model + Registration — shown only after type selected */}
            <div>
              {showLuxuryField && (
                <FormField control={form.control} name="luxuryBrand" render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="text-neutral-700 font-medium">Luxury Brand</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1">
                        <option value="">Select Brand</option>
                        {["BMW","Audi","Mercedes","Jaguar","Land Rover","Lexus","Other"].map(b => <option key={b}>{b}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="vehicleModel" render={({ field }) => (
                <FormItem className="mb-5">
                  <FormLabel className="text-neutral-700 font-medium">Vehicle Model</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1">
                      <option value="">Select vehicle model</option>
                      {vehicleModels.map((m: any, i: number) => (
                        <option key={i} value={`${m.name} (${m.model})`}>{m.name} — {m.model} ({m.range})</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="registrationNumber" render={({ field }) => (
                <FormItem className="mb-5">
                  <FormLabel className="text-neutral-700 font-medium">Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. TN 01 AB 1234" {...field}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* ════════════════════════════════
                SECTION B — LOCATION DETAILS
            ════════════════════════════════ */}
            <div>
              <SectionTitle number="2" label="Location Details" />

              {/* Outstation / Local toggle */}
              <div className="flex bg-neutral-100 rounded-xl p-1 mb-4">
                {(["outstation", "local"] as const).map(m => (
                  <button key={m} type="button" onClick={() => { setShiftMode(m); form.setValue("pickupLocation", ""); form.setValue("dropLocation", ""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${shiftMode === m ? "bg-white shadow text-blue-600" : "text-neutral-500"}`}>
                    {m === "outstation" ? "🛣️  Outstation" : "🏙️  Local (City)"}
                  </button>
                ))}
              </div>

              <FormField control={form.control} name="pickupLocation" render={({ field }) => (
                <FormItem className="mb-5">
                  <FormLabel className="text-neutral-700 font-medium">Pickup Location</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1">
                      <option value="">Select pickup city</option>
                      {(shiftMode === "local" ? CHENNAI_LOCALITIES : LOCATIONS).map(l => <option key={l}>{l}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="dropLocation" render={({ field }) => (
                <FormItem className="mb-5">
                  <FormLabel className="text-neutral-700 font-medium">Drop Location</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1">
                      <option value="">Select destination city</option>
                      {(shiftMode === "local" ? CHENNAI_LOCALITIES : LOCATIONS).map(l => <option key={l}>{l}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="travelDate" render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-neutral-700 font-medium">Travel Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="mb-5">
                <FormLabel className="text-neutral-700 font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" /> Pickup Time Range
                </FormLabel>
                <p className="text-xs text-neutral-400 mb-2 mt-0.5">
                  Set the window you're available for handover (e.g. 9:00 – 11:30). Drivers pick a slot inside it.
                </p>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <FormField control={form.control} name="pickupTimeFrom" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-neutral-500">From</FormLabel>
                      <FormControl>
                        <Input type="time" {...field}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pickupTimeTo" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-neutral-500">To</FormLabel>
                      <FormControl>
                        <Input type="time" {...field}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <FormField control={form.control} name="insuranceExpiryDate" render={({ field }) => (
                <FormItem className="mb-5">
                  <FormLabel className="text-neutral-700 font-medium">Insurance Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* ════════════════════════════════
                SECTION C — WHO WILL DRIVE?
            ════════════════════════════════ */}
            <div>
              <SectionTitle number="3" label="Who Will Drive Your Vehicle?" />
              <p className="text-sm text-neutral-500 mb-4">Choose how you want your vehicle to be moved</p>

              <div className="space-y-3">
                {/* Option 1 — Professional Driver */}
                <SelectionCard active={driverType === "professional"} onClick={() => { setDriverType("professional"); setDropPref(null); }}>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${driverType === "professional" ? "bg-blue-600" : "bg-neutral-100"}`}>
                      <Shield className={`w-6 h-6 ${driverType === "professional" ? "text-white" : "text-neutral-500"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-neutral-900">Professional Driver</p>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Verified & Licensed</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">A trained, background-verified driver is assigned to shift your vehicle. Door-to-door service guaranteed.</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {["Background Verified","Insurance Covered","Fixed Rate","Door to Door"].map(t => (
                          <span key={t} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                    {driverType === "professional" && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />}
                  </div>
                </SelectionCard>

                {/* Option 2 — Traveler */}
                <SelectionCard active={driverType === "traveler"} onClick={() => setDriverType("traveler")}>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${driverType === "traveler" ? "bg-orange-500" : "bg-neutral-100"}`}>
                      <Users className={`w-6 h-6 ${driverType === "traveler" ? "text-white" : "text-neutral-500"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-neutral-900">Traveler / Professional Driver</p>
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Shared Cost · Save More</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">A verified traveler going the same route drives your vehicle. Both of you share the trip cost — saving you up to 80%.</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {["Verified ID","Rated Driver","Shared Cost","Eco-Friendly"].map(t => (
                          <span key={t} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                    {driverType === "traveler" && <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-1" />}
                  </div>
                </SelectionCard>
              </div>
              {attempted && !driverType && (
                <p className="text-xs text-red-500 mt-2">Please choose who will drive your vehicle.</p>
              )}
            </div>

            {/* ════════════════════════════════
                SECTION D — DROP PREFERENCE
                (shows only when Traveler picked)
            ════════════════════════════════ */}
            {driverType === "traveler" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <SectionTitle number="4" label="Where Should the Vehicle Be Dropped?" />
                <p className="text-sm text-neutral-500 mb-4">Choose how the traveler hands over your vehicle at the destination</p>

                <div className="space-y-3">
                  {/* Common Hub */}
                  <SelectionCard active={dropPref === "hub"} onClick={() => setDropPref("hub")}>
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${dropPref === "hub" ? "bg-blue-600" : "bg-neutral-100"}`}>
                        <Building2 className={`w-6 h-6 ${dropPref === "hub" ? "text-white" : "text-neutral-500"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-neutral-900">Common Hub Drop</p>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recommended</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">The traveler drops your vehicle at a Shiftzy-managed hub near the destination. You collect it at your convenience — no time pressure.</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {["Secure Parking","CCTV Monitored","24hr Access","Flexible Pickup"].map(t => (
                            <span key={t} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                      {dropPref === "hub" && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />}
                    </div>
                  </SelectionCard>

                  {/* Home Drop */}
                  <SelectionCard active={dropPref === "home"} onClick={() => setDropPref("home")}>
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${dropPref === "home" ? "bg-orange-500" : "bg-neutral-100"}`}>
                        <Home className={`w-6 h-6 ${dropPref === "home" ? "text-white" : "text-neutral-500"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-neutral-900">Home Drop</p>
                          <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Door to Door</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">The traveler delivers your vehicle directly to your home or office address. Provide your details below after selecting.</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {["Direct Delivery","Time Slot Pick","Key Handover","Extra Convenience"].map(t => (
                            <span key={t} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                      {dropPref === "home" && <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-1" />}
                    </div>
                  </SelectionCard>
                </div>
                {attempted && driverType === "traveler" && !dropPref && (
                  <p className="text-xs text-red-500 mt-2">Please choose a drop preference.</p>
                )}
              </div>
            )}

            {/* ════════════════════════════════
                SECTION E — HUB DETAILS
                (shows when Common Hub selected)
            ════════════════════════════════ */}
            {driverType === "traveler" && dropPref === "hub" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                <SectionTitle number="5" label="Hub Details" />

                {/* Hub selection */}
                <div>
                  <Label className="text-neutral-700 font-medium mb-2 block">Select Nearest Hub</Label>
                  <div className="space-y-2">
                    {HUBS.map(hub => (
                      <button key={hub.id} type="button" onClick={() => setSelectedHub(hub.id)}
                        className={`w-full text-left rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${selectedHub === hub.id ? "border-blue-500 bg-blue-50" : "border-neutral-100 bg-white hover:border-blue-200"}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedHub === hub.id ? "bg-blue-600" : "bg-neutral-100"}`}>
                          <Building2 className={`w-4 h-4 ${selectedHub === hub.id ? "text-white" : "text-neutral-400"}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-neutral-900">{hub.name}</p>
                          <p className="text-xs text-neutral-400">{hub.address}</p>
                        </div>
                        {selectedHub === hub.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collection date/time */}
                <div>
                  <Label className="text-neutral-700 font-medium mb-1 block">Preferred Collection Date & Time</Label>
                  <Input type="datetime-local" value={hubCollection} onChange={e => setHubCollection(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <p className="text-xs text-neutral-400 mt-1">You can collect anytime during hub operating hours (7 AM – 10 PM)</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 mb-1">📦 What happens at the Hub?</p>
                  <p className="text-xs text-neutral-600">The traveler checks in your vehicle at the hub. Our team inspects and parks it securely. You receive an SMS when it's ready to collect. No rush — vehicle is safe with us.</p>
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                SECTION F — HOME DROP DETAILS
                (shows when Home Drop selected)
            ════════════════════════════════ */}
            {driverType === "traveler" && dropPref === "home" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                <SectionTitle number="5" label="Home Drop Details" />

                {/* Delivery Address */}
                <div>
                  <Label className="text-neutral-700 font-medium mb-1 block flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-500" /> Delivery Address
                  </Label>
                  <textarea rows={3} value={deliveryAddr} onChange={e => setDeliveryAddr(e.target.value)}
                    placeholder="Enter full delivery address (house no., street, landmark, city, pin)..."
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                </div>

                {/* Preferred Time Slot */}
                <div>
                  <Label className="text-neutral-700 font-medium mb-2 block flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-500" /> Preferred Delivery Time Slot
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(slot => (
                      <button key={slot.id} type="button" onClick={() => setTimeSlot(slot.id)}
                        className={`rounded-xl border-2 p-3 text-center transition-all ${timeSlot === slot.id ? "border-orange-500 bg-orange-50" : "border-neutral-200 bg-white hover:border-orange-200"}`}>
                        <p className="text-xl mb-1">{slot.emoji}</p>
                        <p className="text-xs font-bold text-neutral-800">{slot.label}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{slot.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Receiver Details */}
                <div>
                  <Label className="text-neutral-700 font-medium mb-2 block flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-500" /> Receiver Details
                  </Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input value={receiverName} onChange={e => setReceiverName(e.target.value)}
                        placeholder="Receiver full name"
                        className="pl-9 border-neutral-300 focus:ring-blue-500" />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)}
                        placeholder="Receiver phone number"
                        className="pl-9 border-neutral-300 focus:ring-blue-500" type="tel" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">This person will receive the keys from the traveler</p>
                </div>

                {/* Key Handover */}
                <div>
                  <Label className="text-neutral-700 font-medium mb-2 block flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-purple-500" /> Key Handover Method
                  </Label>
                  <div className="space-y-2">
                    {KEY_HANDOVER.map(opt => (
                      <button key={opt.id} type="button" onClick={() => setKeyHandover(opt.id)}
                        className={`w-full text-left rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${keyHandover === opt.id ? "border-blue-500 bg-blue-50" : "border-neutral-100 bg-white hover:border-blue-200"}`}>
                        <span className="text-xl shrink-0">{opt.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-neutral-900">{opt.label}</p>
                          <p className="text-xs text-neutral-400">{opt.desc}</p>
                        </div>
                        {keyHandover === opt.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <Label className="text-neutral-700 font-medium mb-1 block flex items-center gap-1.5">
                    <StickyNote className="w-4 h-4 text-yellow-500" /> Special Instructions <span className="text-neutral-400 font-normal text-xs">(optional)</span>
                  </Label>
                  <textarea rows={2} value={specialNote} onChange={e => setSpecialNote(e.target.value)}
                    placeholder="e.g. Gate code is #1234, Park in slot B2, Call 10 min before arrival..."
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm resize-none" />
                </div>
              </div>
            )}

            {/* ════════════════════════════════
                SECTION G — VEHICLE PHOTO + SUBMIT
            ════════════════════════════════ */}
            <div>
              <SectionTitle number={driverType === "traveler" ? "6" : "4"} label="Vehicle Photo" />
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center">
                {photoPreview ? (
                  <div className="mb-2">
                    <img src={photoPreview} alt="Vehicle preview" className="max-h-40 mx-auto rounded-lg" />
                    <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="mt-2 text-xs text-red-500 underline">Remove photo</button>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-neutral-500 text-sm mb-3">Upload a clear photo of your vehicle</p>
                    <label className="cursor-pointer inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                      Choose Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Shifter T&C acknowledgment */}
            <label className="flex items-start gap-3 bg-blue-50/60 rounded-2xl border border-blue-200 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
              />
              <span className="text-xs text-neutral-600 leading-relaxed">
                As the vehicle owner, I confirm my vehicle has valid RC &amp; insurance, is roadworthy, and the details
                provided are accurate. I authorise a verified Shiftzy traveler to drive it for the agreed route and
                accept the{" "}
                <a href="/terms" className="text-blue-600 font-semibold underline">Terms &amp; Conditions</a>.
              </span>
            </label>
            {attempted && !agreedTerms && (
              <p className="text-xs text-red-500 -mt-3">Please confirm the owner acknowledgment to continue.</p>
            )}

            {/* Submit */}
            <Button type="submit" disabled={isUploading || !agreedTerms}
              className="w-full py-4 text-base font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              {isUploading ? "Submitting…" : "Submit Shift Request 🚗"}
            </Button>

            </>)}

          </form>
        </Form>
      </div>

      {/* ── Success Dialog ── */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CircleCheck className="w-9 h-9 text-blue-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Request Submitted! 🎉</DialogTitle>
            <p className="text-center text-neutral-500 text-sm mt-1">
              {driverType === "professional"
                ? "A professional driver will be assigned within 2 hours. You'll get an SMS & in-app notification."
                : dropPref === "hub"
                ? "We're matching you with a traveler going your route. Your vehicle will be delivered to the selected hub."
                : "We're matching you with a traveler going your route. They will deliver your vehicle directly to your address."}
            </p>
          </DialogHeader>
          <div className="bg-neutral-50 rounded-xl p-3 space-y-1.5 text-xs text-neutral-600">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Request ID: <strong>SHF-{Math.floor(Math.random() * 90000) + 10000}</strong></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Driver type: <strong className="capitalize">{driverType}</strong></div>
            {dropPref && <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Drop preference: <strong>{dropPref === "hub" ? "Common Hub" : "Home Drop"}</strong></div>}
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowSuccessDialog(false); navigate("/"); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3">
              Go to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}

/* ─── Small reusable section title ─── */
function SectionTitle({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-extrabold">{number}</span>
      </div>
      <h2 className="font-bold text-base text-neutral-900">{label}</h2>
      <div className="flex-1 h-px bg-neutral-100" />
    </div>
  );
}
