import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VehicleCard from "@/components/common/VehicleCard";
import ShiftRequestCard from "@/components/common/ShiftRequestCard";
import { AVAILABLE_VEHICLES, LOCATIONS, NEARBY_SHIFT_REQUESTS, LOCAL_SHIFT_REQUESTS, CHENNAI_LOCALITIES } from "@/lib/constants";
import { TravelSearchFilters, Vehicle, ShiftRequest } from "@/lib/types";
import { Filter, Calendar, MapPin, IndianRupee, Navigation, ChevronLeft, ChevronDown } from "lucide-react";

export default function Travel() {
  const [, navigate] = useLocation();
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"outstation" | "local">("outstation");
  const [distance, setDistance] = useState([0, 500]);
  const [reward, setReward] = useState([500, 5000]);
  const [filteredLocalRequests, setFilteredLocalRequests] = useState<ShiftRequest[]>([]);
  const [selectedPickupLocality, setSelectedPickupLocality] = useState<string>("");
  const [selectedDropLocality, setSelectedDropLocality] = useState<string>("");
  const [selectedVehicleType, setSelectedVehicleType] = useState<"car" | "bike" | "suv" | "luxury" | null>(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const { toast } = useToast();

  const form = useForm<TravelSearchFilters>({
    defaultValues: {
      searchQuery: "",
      pickupLocation: "",
      destination: "",
      dateRange: "",
      distance: "",
      reward: "",
    },
  });

  const handleSelectVehicleType = (type: "car" | "bike" | "suv" | "luxury") => {
    setSelectedVehicleType(type);
    setPickupLocation("");
    setDropLocation("");
  };

  const handleSearch = () => {
    let filtered = AVAILABLE_VEHICLES;

    if (selectedVehicleType) {
      if (selectedVehicleType === "luxury") {
        filtered = filtered.filter(v =>
          (v.pricePerDay && v.pricePerDay > 2500) ||
          (v.features && v.features.includes("Premium"))
        );
      } else {
        filtered = filtered.filter(v => v.type === selectedVehicleType);
      }
    }

    setSearchResults(filtered);

    if (filtered.length === 0) {
      toast({
        title: "No Results",
        description: "No vehicles match your criteria. Try a different type.",
      });
    }
  };

  const filterLocalRequests = () => {
    let filtered = [...LOCAL_SHIFT_REQUESTS];

    if (selectedVehicleType) {
      filtered = filtered.filter(r => r.vehicle.type === selectedVehicleType);
    }
    if (selectedPickupLocality) {
      filtered = filtered.filter(r =>
        r.pickupLocation.name.toLowerCase() === selectedPickupLocality.toLowerCase()
      );
    }
    if (selectedDropLocality) {
      filtered = filtered.filter(r =>
        r.dropLocation.name.toLowerCase() === selectedDropLocality.toLowerCase()
      );
    }

    setFilteredLocalRequests(filtered);
  };

  useEffect(() => {
    filterLocalRequests();
  }, [selectedVehicleType, selectedPickupLocality, selectedDropLocality]);

  useEffect(() => {
    setSelectedVehicleType(null);
    setPickupLocation("");
    setDropLocation("");
    setSearchResults([]);
    setFilteredLocalRequests(LOCAL_SHIFT_REQUESTS);
  }, [viewMode]);

  const vehicleOptions = [
    { type: "car" as const, emoji: "🚗", label: "Car", desc: "Sedans, Hatchbacks" },
    { type: "suv" as const, emoji: "🚙", label: "SUV", desc: "Big & Spacious" },
    { type: "bike" as const, emoji: "🏍️", label: "Bike", desc: "Scooters, Motorbikes" },
    { type: "luxury" as const, emoji: "✨", label: "Premium", desc: "Top-end vehicles" },
  ];

  const selectedOption = vehicleOptions.find(v => v.type === selectedVehicleType);

  const showResults = selectedVehicleType && (
    (viewMode === "outstation" && pickupLocation && dropLocation) ||
    (viewMode === "local")
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <Header title="Find a Vehicle to Drive" variant="secondary" showAnimation={true} />

      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="default"
          size="lg"
          onClick={() => navigate("/")}
          className="bg-black text-white shadow-lg hover:bg-gray-800 rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
      </div>

      <div className="p-4 bg-white space-y-5">

        {/* Intro question */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-4 py-4 border border-blue-100">
          <p className="text-lg font-bold text-blue-900 leading-snug">
            Are you moving somewhere? 🚀
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Select your travel · Pick your favourite vehicle · Share your location
          </p>
        </div>

        {/* STEP 1: Outstation / Local Tabs */}
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Step 1 — Select Your Travel</p>
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-1.5 flex w-full shadow-md">
            <button
              type="button"
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${viewMode === "outstation"
                ? "bg-white shadow-lg border-b-2 border-primary-500 text-primary-700"
                : "text-neutral-600 hover:bg-white/50"}`}
              onClick={() => setViewMode("outstation")}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-0.5">🛣️</span>
                <span className="text-sm">Outstation</span>
              </div>
            </button>
            <button
              type="button"
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${viewMode === "local"
                ? "bg-white shadow-lg border-b-2 border-primary-500 text-primary-700"
                : "text-neutral-600 hover:bg-white/50"}`}
              onClick={() => setViewMode("local")}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-0.5">📍</span>
                <span className="text-sm">Local</span>
              </div>
            </button>
          </div>
        </div>

        {/* STEP 2: Vehicle Type */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Step 2 — Pick Your Favourite Vehicle</p>
            {selectedVehicleType && (
              <button
                type="button"
                className="text-xs text-primary-600 font-medium underline"
                onClick={() => {
                  setSelectedVehicleType(null);
                  setPickupLocation("");
                  setDropLocation("");
                  setSearchResults([]);
                }}
              >
                Change
              </button>
            )}
          </div>

          {selectedVehicleType && selectedOption ? (
            <div className="bg-primary-50 border-2 border-primary-300 rounded-xl p-3 flex items-center gap-3">
              <span className="text-3xl">{selectedOption.emoji}</span>
              <div>
                <p className="font-bold text-primary-700">{selectedOption.label}</p>
                <p className="text-xs text-neutral-500">{selectedOption.desc}</p>
              </div>
              <span className="ml-auto text-xs bg-primary-600 text-white px-2 py-1 rounded-full">Selected ✓</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {vehicleOptions.map((v) => (
                <button
                  key={v.type}
                  type="button"
                  onClick={() => handleSelectVehicleType(v.type)}
                  className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm hover:border-primary-400 hover:bg-primary-50 active:scale-95 transition-all duration-150"
                >
                  <span className="text-3xl mb-1">{v.emoji}</span>
                  <span className="font-semibold text-sm">{v.label}</span>
                  <span className="text-xs text-neutral-500 mt-0.5">{v.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* STEP 3: Date & Time + Price Filter */}
        {selectedVehicleType && viewMode === "outstation" && (
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Step 3 — Choose Your Date & Budget</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-blue-100 rounded-xl p-3 shadow-sm">
                <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">📅 Travel Date</p>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full text-sm font-medium text-neutral-800 border-none outline-none bg-transparent"
                  defaultValue={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                />
              </div>
              <div className="bg-white border border-orange-100 rounded-xl p-3 shadow-sm">
                <p className="text-xs font-bold text-orange-500 mb-1 flex items-center gap-1">🕐 Pickup Time</p>
                <input
                  type="time"
                  className="w-full text-sm font-medium text-neutral-800 border-none outline-none bg-transparent"
                  defaultValue="09:00"
                />
              </div>
            </div>
            <div className="bg-white border border-neutral-100 rounded-xl p-3 shadow-sm mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-neutral-600">💰 Max Budget (Your Share)</p>
                <p className="text-xs font-bold text-blue-600">₹500 – ₹5,000</p>
              </div>
              <input type="range" min={500} max={5000} step={100} defaultValue={3000}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>₹500</span><span>₹5,000</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Pickup & Drop — only shown after vehicle type is selected */}
        {selectedVehicleType && (
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Step {viewMode === "outstation" ? "4" : "3"} — Select Your Location</p>

            {/* Creative Route Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-neutral-100"
              style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fff7ed 100%)" }}>

              {/* Top tagline banner */}
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <span className="text-base">🗺️</span>
                <p className="text-sm font-bold text-neutral-700">
                  {viewMode === "outstation"
                    ? "Where are you picking up & dropping off?"
                    : "Which areas are you connecting?"}
                </p>
              </div>

              <div className="px-4 pb-4 flex gap-3">
                {/* Route line column */}
                <div className="flex flex-col items-center pt-1" style={{ width: 28, minWidth: 28 }}>
                  {/* Green start pin */}
                  <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-md flex items-center justify-center" style={{ boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  {/* Dashed line */}
                  <div className="flex flex-col gap-1 my-1.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-0.5 h-2 bg-neutral-300 rounded-full mx-auto" />
                    ))}
                  </div>
                  {/* Red drop pin */}
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center" style={{ boxShadow: "0 0 0 3px rgba(239,68,68,0.2)" }}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="w-0.5 h-1.5 bg-red-400 rounded-full" />
                    <div className="w-2 h-0.5 bg-red-400 rounded-full" />
                  </div>
                </div>

                {/* Input fields column */}
                <div className="flex-1 flex flex-col gap-3">
                  {/* Pickup */}
                  <div className="bg-white rounded-xl shadow-sm border border-green-100 p-3">
                    <p className="text-xs font-bold text-green-600 mb-1 flex items-center gap-1">
                      <span>●</span> START — Pickup {viewMode === "outstation" ? "City" : "Area"}
                    </p>
                    <select
                      value={viewMode === "outstation" ? pickupLocation : selectedPickupLocality}
                      onChange={(e) =>
                        viewMode === "outstation"
                          ? setPickupLocation(e.target.value)
                          : setSelectedPickupLocality(e.target.value)
                      }
                      className="w-full text-sm font-medium text-neutral-800 bg-transparent border-none outline-none appearance-none cursor-pointer"
                    >
                      <option value="">
                        {viewMode === "outstation" ? "Choose starting city..." : "Choose starting area..."}
                      </option>
                      {(viewMode === "outstation" ? LOCATIONS : CHENNAI_LOCALITIES).map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Drop */}
                  <div className="bg-white rounded-xl shadow-sm border border-red-100 p-3">
                    <p className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1">
                      <span>●</span> END — Drop {viewMode === "outstation" ? "City" : "Area"}
                    </p>
                    <select
                      value={viewMode === "outstation" ? dropLocation : selectedDropLocality}
                      onChange={(e) =>
                        viewMode === "outstation"
                          ? setDropLocation(e.target.value)
                          : setSelectedDropLocality(e.target.value)
                      }
                      className="w-full text-sm font-medium text-neutral-800 bg-transparent border-none outline-none appearance-none cursor-pointer"
                    >
                      <option value="">
                        {viewMode === "outstation" ? "Choose destination city..." : "Choose drop area..."}
                      </option>
                      {(viewMode === "outstation" ? LOCATIONS : CHENNAI_LOCALITIES).map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Selected route preview */}
              {((viewMode === "outstation" && pickupLocation && dropLocation) ||
                (viewMode === "local" && selectedPickupLocality && selectedDropLocality)) && (
                <div className="mx-4 mb-4 px-3 py-2 rounded-xl bg-white border border-primary-100 shadow-inner flex items-center gap-2">
                  <span className="text-green-500 font-bold text-sm">
                    {viewMode === "outstation" ? pickupLocation : selectedPickupLocality}
                  </span>
                  <div className="flex-1 flex items-center gap-0.5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex-1 h-0.5 bg-primary-300 rounded-full" />
                    ))}
                    <span className="text-base">🚗</span>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex-1 h-0.5 bg-primary-300 rounded-full" />
                    ))}
                  </div>
                  <span className="text-red-500 font-bold text-sm">
                    {viewMode === "outstation" ? dropLocation : selectedDropLocality}
                  </span>
                </div>
              )}
            </div>

            {/* BIG Search Button */}
            {viewMode === "outstation" && (
              <button
                type="button"
                disabled={!pickupLocation || !dropLocation}
                onClick={handleSearch}
                className="w-full mt-4 py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: (!pickupLocation || !dropLocation)
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 50%, #db2777 100%)",
                  boxShadow: (!pickupLocation || !dropLocation)
                    ? "none"
                    : "0 8px 24px rgba(109,40,217,0.35)"
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Search Vehicles
                <span className="text-lg">🚗</span>
              </button>
            )}

            {viewMode === "local" && (
              <button
                type="button"
                onClick={() => {}}
                className="w-full mt-4 py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-3 transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #0ea5e9 100%)",
                  boxShadow: "0 8px 24px rgba(5,150,105,0.3)"
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Find Local Shifts
                <span className="text-lg">📍</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* After search — matched vehicles only */}
      {searchResults.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="font-bold text-lg mb-4">Matched Vehicles</h2>
          <div className="space-y-4">
            {searchResults.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
