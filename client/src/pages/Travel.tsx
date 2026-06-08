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

        {/* STEP 1: Outstation / Local Tabs */}
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Step 1 — Select Journey Type</p>
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
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Step 2 — Choose Vehicle Type</p>
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

        {/* STEP 3: Pickup & Drop — only shown after vehicle type is selected */}
        {selectedVehicleType && (
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Step 3 — Enter Pickup & Drop</p>

            {viewMode === "outstation" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Pickup Location</label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full p-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                  >
                    <option value="">Select city</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Drop Location</label>
                  <select
                    value={dropLocation}
                    onChange={(e) => setDropLocation(e.target.value)}
                    className="w-full p-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                  >
                    <option value="">Select city</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Pickup Area</label>
                  <select
                    value={selectedPickupLocality}
                    onChange={(e) => setSelectedPickupLocality(e.target.value)}
                    className="w-full p-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                  >
                    <option value="">Any area</option>
                    {CHENNAI_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Drop Area</label>
                  <select
                    value={selectedDropLocality}
                    onChange={(e) => setSelectedDropLocality(e.target.value)}
                    className="w-full p-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                  >
                    <option value="">Any area</option>
                    {CHENNAI_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Search button */}
            {viewMode === "outstation" && (
              <Button
                type="button"
                disabled={!pickupLocation || !dropLocation}
                onClick={handleSearch}
                className="w-full mt-3 bg-secondary-500 text-white disabled:opacity-40"
              >
                Search Vehicles
              </Button>
            )}
          </div>
        )}

      </div>

      {/* Results */}
      <div className="px-4 py-5">
        {viewMode === "outstation" ? (
          <>
            {searchResults.length > 0 && (
              <>
                <h2 className="font-bold text-lg mb-4">Available Vehicles</h2>
                <div className="space-y-4 mb-8">
                  {searchResults.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                    />
                  ))}
                </div>

                <h2 className="font-bold text-lg mb-4">Nearby Shift Requests</h2>
                {NEARBY_SHIFT_REQUESTS.length > 0 ? (
                  <div className="space-y-4">
                    {NEARBY_SHIFT_REQUESTS.map((request) => (
                      <ShiftRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No shift requests available.</p>
                  </div>
                )}
              </>
            )}

            {!selectedVehicleType && (
              <div className="text-center py-12 text-neutral-400">
                <span className="text-4xl block mb-3">🚗</span>
                <p className="font-medium">Choose a vehicle type above to get started</p>
              </div>
            )}

            {selectedVehicleType && (!pickupLocation || !dropLocation) && (
              <div className="text-center py-12 text-neutral-400">
                <span className="text-4xl block mb-3">📍</span>
                <p className="font-medium">Select pickup & drop locations to search</p>
              </div>
            )}
          </>
        ) : (
          <>
            {!selectedVehicleType ? (
              <div className="text-center py-12 text-neutral-400">
                <span className="text-4xl block mb-3">🏍️</span>
                <p className="font-medium">Choose a vehicle type above to get started</p>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-lg mb-4">Local Shift Requests</h2>
                {filteredLocalRequests.length > 0 ? (
                  <div className="space-y-4">
                    {filteredLocalRequests.map((request) => (
                      <ShiftRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No local shift requests found.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
