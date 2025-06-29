import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { AVAILABLE_VEHICLES, LOCATIONS, NEARBY_SHIFT_REQUESTS, LOCAL_SHIFT_REQUESTS, CHENNAI_LOCALITIES, VEHICLE_TYPES } from "@/lib/constants";
import { TravelSearchFilters, Vehicle, ShiftRequest } from "@/lib/types";
import { Search, Filter, Calendar, MapPin, Clock, IndianRupee, Navigation, ChevronLeft, Check } from "lucide-react";

export default function Travel() {
  const [, navigate] = useLocation();
  const [searchResults, setSearchResults] = useState<Vehicle[]>(AVAILABLE_VEHICLES);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"vehicles" | "requests" | "local">("vehicles");
  const [distance, setDistance] = useState([0, 500]);
  const [reward, setReward] = useState([500, 5000]);
  const [filteredLocalRequests, setFilteredLocalRequests] = useState<ShiftRequest[]>(LOCAL_SHIFT_REQUESTS);
  const [selectedPickupLocality, setSelectedPickupLocality] = useState<string>("");
  const [selectedDropLocality, setSelectedDropLocality] = useState<string>("");
  const [selectedVehicleType, setSelectedVehicleType] = useState<"car" | "bike" | "suv" | "luxury" | null>(null);
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

  const handleFilterClick = (filter: "car" | "bike" | "suv" | "luxury") => {
    if (selectedVehicleType === filter) {
      return;
    }
    
    setSelectedVehicleType(filter);
    
    let filtered = AVAILABLE_VEHICLES;
    if (filter === "car" || filter === "bike" || filter === "suv") {
      filtered = AVAILABLE_VEHICLES.filter(vehicle => vehicle.type === filter);
    } else if (filter === "luxury") {
      filtered = AVAILABLE_VEHICLES.filter(vehicle => 
        (vehicle.pricePerDay && vehicle.pricePerDay > 2500) || 
        (vehicle.features && vehicle.features.includes("Premium"))
      );
    }
    
    setSearchResults(filtered);
  };

  const handleSearch = (data: TravelSearchFilters) => {
    let filtered = AVAILABLE_VEHICLES;
    
    if (data.searchQuery) {
      const query = data.searchQuery.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.make.toLowerCase().includes(query) || 
        vehicle.model.toLowerCase().includes(query)
      );
    }
    
    if (data.pickupLocation) {
      filtered = filtered.filter(() => Math.random() > 0.3);
    }
    
    if (data.destination) {
      filtered = filtered.filter(() => Math.random() > 0.3);
    }
    
    if (selectedVehicleType) {
      if (selectedVehicleType === "car" || selectedVehicleType === "bike" || selectedVehicleType === "suv") {
        filtered = filtered.filter(vehicle => vehicle.type === selectedVehicleType);
      } else if (selectedVehicleType === "luxury") {
        filtered = filtered.filter(vehicle => vehicle.type === "luxury");
      }
    }
    
    setSearchResults(filtered);
    
    if (filtered.length === 0) {
      toast({
        title: "No Results",
        description: "No vehicles match your search criteria. Try different filters.",
      });
    }
  };

  const handleVehicleClick = (vehicleId: string) => {
    navigate(`/vehicle/${vehicleId}`);
  };

  const filterLocalRequests = () => {
    let filtered = [...LOCAL_SHIFT_REQUESTS];
    
    if (selectedVehicleType) {
      filtered = filtered.filter(request => request.vehicle.type === selectedVehicleType);
    }
    
    if (selectedPickupLocality) {
      filtered = filtered.filter(request => 
        request.pickupLocation.name.toLowerCase() === selectedPickupLocality.toLowerCase());
    }
    
    if (selectedDropLocality) {
      filtered = filtered.filter(request => 
        request.dropLocation.name.toLowerCase() === selectedDropLocality.toLowerCase());
    }
    
    setFilteredLocalRequests(filtered);
  };
  
  const handlePickupLocalityChange = (value: string) => {
    setSelectedPickupLocality(value);
    filterLocalRequests();
  };
  
  const handleDropLocalityChange = (value: string) => {
    setSelectedDropLocality(value);
    filterLocalRequests();
  };
  
  useEffect(() => {
    filterLocalRequests();
  }, [selectedVehicleType, selectedPickupLocality, selectedDropLocality]);

  useEffect(() => {
    return () => {
      setSelectedVehicleType(null);
    };
  }, []);

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
      
      <div className="p-4 bg-white">
        <h2 className="heading-3 mb-3">Find Your Ride</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSearch)}>
            <FormField
              control={form.control}
              name="searchQuery"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <Input
                          {...field}
                          placeholder="Search for car, bike models..."
                          className="w-full p-3 pl-10 form-input border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex shrink-0 items-center gap-1 text-neutral-700 h-[42px] px-3"
                          >
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-4/5 sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle>Filter Options</SheetTitle>
                            <SheetDescription>
                              Refine your search with these filters
                            </SheetDescription>
                          </SheetHeader>
                          
                          <div className="py-6 space-y-6">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-secondary-500" />
                                <h3 className="text-sm font-medium">Date Range</h3>
                              </div>
                              <Select
                                onValueChange={(value) => form.setValue('dateRange', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="today">Today</SelectItem>
                                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                                  <SelectItem value="this-week">This Week</SelectItem>
                                  <SelectItem value="next-week">Next Week</SelectItem>
                                  <SelectItem value="this-month">This Month</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-secondary-500" />
                                <h3 className="text-sm font-medium">Distance (km)</h3>
                              </div>
                              <div className="px-2">
                                <Slider
                                  defaultValue={[0, 500]}
                                  max={1000}
                                  step={50}
                                  value={distance}
                                  onValueChange={setDistance}
                                />
                                <div className="flex justify-between mt-2 text-xs text-neutral-500">
                                  <span>{distance[0]} km</span>
                                  <span>{distance[1]} km</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <IndianRupee className="w-4 h-4 mr-2 text-secondary-500" />
                                <h3 className="text-sm font-medium">Reward Range (₹)</h3>
                              </div>
                              <div className="px-2">
                                <Slider
                                  defaultValue={[500, 5000]}
                                  max={10000}
                                  step={500}
                                  value={reward}
                                  onValueChange={setReward}
                                />
                                <div className="flex justify-between mt-2 text-xs text-neutral-500">
                                  <span>₹{reward[0]}</span>
                                  <span>₹{reward[1]}</span>
                                </div>
                              </div>
                            </div>
                            
                            <Button 
                              className="w-full bg-secondary-500 text-white"
                              onClick={() => {
                                form.setValue('distance', `${distance[0]}-${distance[1]}`);
                                form.setValue('reward', `${reward[0]}-${reward[1]}`);
                                setIsFilterOpen(false);
                                form.handleSubmit(handleSearch)();
                              }}
                            >
                              Apply Filters
                            </Button>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-center items-center mb-4">
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-2 flex w-full text-sm sm:text-base shadow-md">
                <button
                  className={`flex-1 py-2 rounded-md font-medium transition-all duration-300 ${viewMode === 'vehicles' 
                    ? 'bg-white shadow-lg border-b-2 border-primary-500 text-primary-700' 
                    : 'text-neutral-700 hover:bg-white/50'}`}
                  onClick={() => setViewMode('vehicles')}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xl mb-1">🚗</span>
                    <span>Available Vehicles</span>
                  </div>
                </button>
                <button
                  className={`flex-1 py-2 rounded-md font-medium transition-all duration-300 ${viewMode === 'requests' 
                    ? 'bg-white shadow-lg border-b-2 border-secondary-500 text-secondary-700' 
                    : 'text-neutral-700 hover:bg-white/50'}`}
                  onClick={() => setViewMode('requests')}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xl mb-1">📝</span>
                    <span>Shift Requests</span>
                  </div>
                </button>
                <button
                  className={`flex-1 py-2 rounded-md font-medium transition-all duration-300 ${viewMode === 'local' 
                    ? 'bg-white shadow-lg border-b-2 border-primary-500 text-primary-700' 
                    : 'text-neutral-700 hover:bg-white/50'}`}
                  onClick={() => setViewMode('local')}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xl mb-1">📍</span>
                    <span>Local</span>
                  </div>
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-secondary-500 text-white mb-4"
            >
              Search Vehicles
            </Button>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <FormField
                control={form.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormControl>
                      <div>
                        <label htmlFor="travel-pickup" className="block form-label text-neutral-500 mb-1">Pickup</label>
                        <select
                          id="travel-pickup"
                          {...field}
                          className="w-full p-2 form-input border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                        >
                          <option value="">Any location</option>
                          {LOCATIONS.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormControl>
                      <div>
                        <label htmlFor="travel-destination" className="block form-label text-neutral-500 mb-1">Destination</label>
                        <select
                          id="travel-destination"
                          {...field}
                          className="w-full p-2 form-input border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                        >
                          <option value="">Any destination</option>
                          {LOCATIONS.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="heading-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 font-bold">Vehicle Type</h3>
                {selectedVehicleType && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedVehicleType(null)}
                    className="text-primary-600 hover:bg-primary-50 rounded-full border border-primary-300"
                  >
                    Change
                  </Button>
                )}
              </div>
                
              {selectedVehicleType ? (
                <div className="bg-white rounded-xl shadow-md p-2 border-2 border-primary-200 mb-3">
                  <div className="flex items-center">
                    <div className="bg-primary-50 rounded-full p-2 mr-3">
                      {selectedVehicleType === "car" && <span className="text-3xl">🚗</span>}
                      {selectedVehicleType === "bike" && <span className="text-3xl">🏍️</span>}
                      {selectedVehicleType === "suv" && <span className="text-3xl">🚙</span>}
                      {selectedVehicleType === "luxury" && <span className="text-3xl">✨</span>}
                    </div>
                    <div>
                      <h3 className="card-title">
                        {selectedVehicleType === "car" && "Car"}
                        {selectedVehicleType === "bike" && "Bike"}
                        {selectedVehicleType === "suv" && "SUV"}
                        {selectedVehicleType === "luxury" && "Premium"}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        {selectedVehicleType === "car" && "Sedans, Hatchbacks – Daily ride, easy to shift"}
                        {selectedVehicleType === "bike" && "Scooters, Motorbikes – Lightweight and quick move"}
                        {selectedVehicleType === "suv" && "Big, Bold & Spacious – Great for road trips & families"}
                        {selectedVehicleType === "luxury" && "Top-end vehicles for a signature travel experience"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedVehicleType === "car" && (
                          <>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">5 Seater</span>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Compact</span>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Fuel Efficient</span>
                          </>
                        )}
                        {selectedVehicleType === "bike" && (
                          <>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">1-2 Seater</span>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Low Cost</span>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Fast Delivery</span>
                          </>
                        )}
                        {selectedVehicleType === "suv" && (
                          <>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">7 Seater</span>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Spacious</span>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Road Trip</span>
                          </>
                        )}
                        {selectedVehicleType === "luxury" && (
                          <>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Premium</span>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Comfort</span>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">High-End</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="vehicle-type-options grid grid-cols-2 gap-3 pt-2 mb-3">
                  <div 
                    className="vehicle-option rounded-xl overflow-hidden shadow transition-all bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                    onClick={() => handleFilterClick("car")}
                  >
                    <div className="p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2">🚗</span>
                      <h3 className="text-responsive-lg font-semibold mb-1">Car</h3>
                      <p className="text-responsive-xs text-neutral-600">Sedans, Hatchbacks – Comfortable daily travel</p>
                    </div>
                  </div>
                  
                  <div 
                    className="vehicle-option rounded-xl overflow-hidden shadow transition-all bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                    onClick={() => handleFilterClick("bike")}
                  >
                    <div className="p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2">🏍️</span>
                      <h3 className="text-responsive-lg font-semibold mb-1">Bike</h3>
                      <p className="text-responsive-xs text-neutral-600">Scooters, Motorbikes – Lightweight and quick move</p>
                    </div>
                  </div>
                  
                  <div 
                    className="vehicle-option rounded-xl overflow-hidden shadow transition-all bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                    onClick={() => handleFilterClick("suv")}
                  >
                    <div className="p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2">🚙</span>
                      <h3 className="text-responsive-lg font-semibold mb-1">SUV</h3>
                      <p className="text-responsive-xs text-neutral-600">Big, Bold & Spacious – Great for road trips & families</p>
                    </div>
                  </div>
                  
                  <div 
                    className="vehicle-option rounded-xl overflow-hidden shadow transition-all bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                    onClick={() => handleFilterClick("luxury")}
                  >
                    <div className="p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2">✨</span>
                      <h3 className="text-responsive-lg font-semibold mb-1">Premium</h3>
                      <p className="text-responsive-xs text-neutral-600">Top-end vehicles for a signature travel experience</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {viewMode === 'local' && (
              <div className="mb-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <label htmlFor="pickup-locality" className="block form-label text-neutral-500 mb-1">Pickup Area</label>
                    <select
                      id="pickup-locality"
                      value={selectedPickupLocality}
                      onChange={(e) => setSelectedPickupLocality(e.target.value)}
                      className="w-full p-2 form-input border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    >
                      <option value="">Any area</option>
                      {CHENNAI_LOCALITIES.map((locality) => (
                        <option key={locality} value={locality}>{locality}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="drop-locality" className="block form-label text-neutral-500 mb-1">Drop Area</label>
                    <select
                      id="drop-locality"
                      value={selectedDropLocality}
                      onChange={(e) => setSelectedDropLocality(e.target.value)}
                      className="w-full p-2 form-input border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    >
                      <option value="">Any area</option>
                      {CHENNAI_LOCALITIES.map((locality) => (
                        <option key={locality} value={locality}>{locality}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            
          </form>
        </Form>
      </div>
      
      <div className="px-4 py-5">
        {viewMode === "vehicles" ? (
          <>
            <h2 className="font-bold text-lg mb-4">Available Vehicles</h2>
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onClick={() => handleVehicleClick(vehicle.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600">No vehicles found matching your criteria.</p>
              </div>
            )}
          </>
        ) : viewMode === "requests" ? (
          <>
            <h2 className="font-bold text-lg mb-4">Nearby Shift Requests</h2>
            {NEARBY_SHIFT_REQUESTS.length > 0 ? (
              <div className="space-y-4">
                {NEARBY_SHIFT_REQUESTS.map((request) => (
                  <ShiftRequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600">No shift requests available.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="font-bold text-lg mb-4">Local Shift Requests</h2>
            
            <div className="mb-4 space-y-3 bg-gradient-to-br from-primary-50 to-secondary-50 p-4 rounded-xl shadow-md border border-primary-100">
              <div className="text-sm font-bold text-neutral-800 mb-2 flex items-center">
                <Navigation className="w-5 h-5 mr-2 text-primary-600" />
                <span>Filter by Area</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pickup-locality" className="block text-xs font-medium text-neutral-600 mb-1">From</label>
                  <select
                    id="pickup-locality"
                    value={selectedPickupLocality}
                    onChange={(e) => handlePickupLocalityChange(e.target.value)}
                    className="w-full p-2 text-sm border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white shadow-sm"
                  >
                    <option value="">Any area</option>
                    {CHENNAI_LOCALITIES.map((locality) => (
                      <option key={locality} value={locality}>{locality}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="drop-locality" className="block text-xs font-medium text-neutral-600 mb-1">To</label>
                  <select
                    id="drop-locality"
                    value={selectedDropLocality}
                    onChange={(e) => handleDropLocalityChange(e.target.value)}
                    className="w-full p-2 text-sm border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white shadow-sm"
                  >
                    <option value="">Any area</option>
                    {CHENNAI_LOCALITIES.map((locality) => (
                      <option key={locality} value={locality}>{locality}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {filteredLocalRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredLocalRequests.map((request) => (
                  <ShiftRequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600">No local shift requests available.</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}