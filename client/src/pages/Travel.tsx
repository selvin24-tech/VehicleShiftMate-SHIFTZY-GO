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
import { AVAILABLE_VEHICLES, LOCATIONS, NEARBY_SHIFT_REQUESTS, LOCAL_SHIFT_REQUESTS, CHENNAI_LOCALITIES } from "@/lib/constants";
import { TravelSearchFilters, Vehicle, ShiftRequest } from "@/lib/types";
import { Search, Filter, Calendar, MapPin, Clock, IndianRupee, Navigation } from "lucide-react";

export default function Travel() {
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<string | null>("car");
  const [searchResults, setSearchResults] = useState<Vehicle[]>(AVAILABLE_VEHICLES);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"vehicles" | "requests" | "local">("vehicles");
  const [distance, setDistance] = useState([0, 500]);
  const [reward, setReward] = useState([500, 5000]);
  const [filteredLocalRequests, setFilteredLocalRequests] = useState<ShiftRequest[]>(LOCAL_SHIFT_REQUESTS);
  const [selectedPickupLocality, setSelectedPickupLocality] = useState<string>("");
  const [selectedDropLocality, setSelectedDropLocality] = useState<string>("");
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

  const handleFilterClick = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
    
    // Apply filters
    let filtered = AVAILABLE_VEHICLES;
    if (filter !== null && filter !== activeFilter) {
      if (filter === "car" || filter === "bike") {
        filtered = AVAILABLE_VEHICLES.filter(vehicle => vehicle.type === filter);
      } else if (filter === "luxury") {
        filtered = AVAILABLE_VEHICLES.filter(vehicle => 
          (vehicle.pricePerDay && vehicle.pricePerDay > 2500) || 
          (vehicle.features && vehicle.features.includes("Premium"))
        );
      }
    }
    
    setSearchResults(filtered);
  };

  const handleSearch = (data: TravelSearchFilters) => {
    let filtered = AVAILABLE_VEHICLES;
    
    // Apply search query
    if (data.searchQuery) {
      const query = data.searchQuery.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.make.toLowerCase().includes(query) || 
        vehicle.model.toLowerCase().includes(query)
      );
    }
    
    // Apply location filters
    if (data.pickupLocation) {
      // In a real app, this would filter based on actual location data
      // For now, just simulate filtering
      filtered = filtered.filter(() => Math.random() > 0.3);
    }
    
    if (data.destination) {
      // Simulate destination filtering
      filtered = filtered.filter(() => Math.random() > 0.3);
    }
    
    // Apply vehicle type filter if active
    if (activeFilter) {
      if (activeFilter === "car" || activeFilter === "bike" || activeFilter === "suv") {
        filtered = filtered.filter(vehicle => vehicle.type === activeFilter);
      } else if (activeFilter === "luxury") {
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
    // Navigate to the vehicle details page
    navigate(`/vehicle/${vehicleId}`);
  };

  const filterLocalRequests = () => {
    let filtered = [...LOCAL_SHIFT_REQUESTS];
    
    // Filter by vehicle type if active
    if (activeFilter) {
      filtered = filtered.filter(request => request.vehicle.type === activeFilter);
    }
    
    // Filter by pickup locality if selected
    if (selectedPickupLocality) {
      filtered = filtered.filter(request => 
        request.pickupLocation.name.toLowerCase() === selectedPickupLocality.toLowerCase());
    }
    
    // Filter by drop locality if selected
    if (selectedDropLocality) {
      filtered = filtered.filter(request => 
        request.dropLocation.name.toLowerCase() === selectedDropLocality.toLowerCase());
    }
    
    setFilteredLocalRequests(filtered);
  };
  
  // Handle locality selection
  const handlePickupLocalityChange = (value: string) => {
    setSelectedPickupLocality(value);
    filterLocalRequests();
  };
  
  const handleDropLocalityChange = (value: string) => {
    setSelectedDropLocality(value);
    filterLocalRequests();
  };
  
  // Apply local filtering when any filter changes
  useEffect(() => {
    filterLocalRequests();
  }, [activeFilter, selectedPickupLocality, selectedDropLocality]);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <Header title="Find a Vehicle to Drive" showBackButton variant="secondary" showAnimation={true} />
      
      {/* Search Section */}
      <div className="p-4 bg-white shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
            <FormField
              control={form.control}
              name="searchQuery"
              render={({ field }) => (
                <FormItem className="relative mb-4">
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                        <Input
                          {...field}
                          placeholder="Search for car, bike models..."
                          className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
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
                            {/* Date Range Filter */}
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
                            
                            {/* Distance Filter */}
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
                            
                            {/* Reward Filter */}
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
                            
                            {/* Apply Button */}
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
            
            {/* View Type Toggle */}
            <div className="flex justify-center items-center mb-4">
              <div className="bg-neutral-100 rounded-lg p-1 flex w-full text-xs sm:text-sm">
                <button
                  className={`flex-1 px-2 py-1 rounded-md font-medium transition-colors ${viewMode === 'vehicles' ? 'bg-white shadow-sm' : 'text-neutral-600'}`}
                  onClick={() => setViewMode('vehicles')}
                >
                  Available Vehicles
                </button>
                <button
                  className={`flex-1 px-2 py-1 rounded-md font-medium transition-colors ${viewMode === 'requests' ? 'bg-white shadow-sm' : 'text-neutral-600'}`}
                  onClick={() => setViewMode('requests')}
                >
                  Shift Requests
                </button>
                <button
                  className={`flex-1 px-2 py-1 rounded-md font-medium transition-colors ${viewMode === 'local' ? 'bg-white shadow-sm' : 'text-neutral-600'}`}
                  onClick={() => setViewMode('local')}
                >
                  Local
                </button>
              </div>
            </div>
            
            {/* Vehicle Type Selection */}
            <div className="mb-4">
              
              <div className="vehicle-type-options grid grid-cols-2 gap-3 pt-2">
                <div 
                  className={`vehicle-option rounded-xl overflow-hidden shadow transition-all ${activeFilter === 'car' ? 'selected-vehicle-option' : 'bg-white'}`}
                  onClick={() => handleFilterClick('car')}
                >
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-3xl mb-2">🚗</span>
                    <h3 className="font-semibold text-base mb-1">Car</h3>
                    <p className="text-xs text-neutral-600">Sedans, Hatchbacks – Daily ride, easy to shift</p>
                    {activeFilter === 'car' && <div className="option-tick">✓</div>}
                  </div>
                </div>
                
                <div 
                  className={`vehicle-option rounded-xl overflow-hidden shadow transition-all ${activeFilter === 'bike' ? 'selected-vehicle-option' : 'bg-white'}`}
                  onClick={() => handleFilterClick('bike')}
                >
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-3xl mb-2">🏍️</span>
                    <h3 className="font-semibold text-base mb-1">Bike</h3>
                    <p className="text-xs text-neutral-600">Scooters, Motorbikes – Lightweight and quick move</p>
                    {activeFilter === 'bike' && <div className="option-tick">✓</div>}
                  </div>
                </div>
                
                <div 
                  className={`vehicle-option rounded-xl overflow-hidden shadow transition-all ${activeFilter === 'suv' ? 'selected-vehicle-option' : 'bg-white'}`}
                  onClick={() => handleFilterClick('suv')}
                >
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-3xl mb-2">🚙</span>
                    <h3 className="font-semibold text-base mb-1">SUV</h3>
                    <p className="text-xs text-neutral-600">Big, Bold & Spacious – Great for road trips & families</p>
                    {activeFilter === 'suv' && <div className="option-tick">✓</div>}
                  </div>
                </div>
                
                <div 
                  className={`vehicle-option rounded-xl overflow-hidden shadow transition-all ${activeFilter === 'luxury' ? 'selected-vehicle-option' : 'bg-white'}`}
                  onClick={() => handleFilterClick('luxury')}
                >
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-3xl mb-2">✨</span>
                    <h3 className="font-semibold text-base mb-1">Premium</h3>
                    <p className="text-xs text-neutral-600">Top-end vehicles for a signature travel experience</p>
                    {activeFilter === 'luxury' && <div className="option-tick">✓</div>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Location Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <FormField
                control={form.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormControl>
                      <div>
                        <label htmlFor="travel-pickup" className="block text-xs text-neutral-500 mb-1">Pickup</label>
                        <select
                          id="travel-pickup"
                          {...field}
                          className="w-full p-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
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
                        <label htmlFor="travel-destination" className="block text-xs text-neutral-500 mb-1">Destination</label>
                        <select
                          id="travel-destination"
                          {...field}
                          className="w-full p-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
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
            
            <Button 
              type="submit" 
              className="w-full bg-secondary-500 text-white"
            >
              Search Vehicles
            </Button>
          </form>
        </Form>
      </div>
      
      {/* Search Results */}
      <div className="px-4 py-5">
        {viewMode === "vehicles" ? (
          <>
            <h2 className="font-bold text-lg mb-4">Available Vehicles</h2>
            
            {searchResults.length > 0 ? (
              searchResults.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  onClick={() => handleVehicleClick(vehicle.id)}
                />
              ))
            ) : (
              <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
                <div className="text-neutral-500 mb-2">
                  <i className="fas fa-search text-3xl"></i>
                </div>
                <h3 className="font-semibold text-lg mb-1">No vehicles found</h3>
                <p className="text-neutral-600">Try adjusting your search filters or try a different location.</p>
              </div>
            )}
          </>
        ) : viewMode === "requests" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Shift Requests</h2>
              <div className="text-sm text-neutral-500">
                {NEARBY_SHIFT_REQUESTS.length} requests found
              </div>
            </div>
            
            {NEARBY_SHIFT_REQUESTS.length > 0 ? (
              NEARBY_SHIFT_REQUESTS.map((request) => (
                <ShiftRequestCard 
                  key={request.id} 
                  request={request} 
                  showDetails
                />
              ))
            ) : (
              <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
                <div className="text-neutral-500 mb-2">
                  <i className="fas fa-exclamation-circle text-3xl"></i>
                </div>
                <h3 className="font-semibold text-lg mb-1">No shift requests found</h3>
                <p className="text-neutral-600">There are currently no shift requests matching your criteria. Try different filters or check back later.</p>
              </div>
            )}
          </>
        ) : (
          // Local tab content
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Local Shifts</h2>
              <div className="text-sm text-neutral-500">
                {filteredLocalRequests.length} local shifts
              </div>
            </div>
            
            {/* Local Filter Options */}
            <div className="mb-4 space-y-3 bg-neutral-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-neutral-700 mb-2 flex items-center">
                <Navigation className="w-4 h-4 mr-1" />
                <span>Filter by area</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pickup-locality" className="block text-xs text-neutral-500 mb-1">From</label>
                  <select
                    id="pickup-locality"
                    value={selectedPickupLocality}
                    onChange={(e) => handlePickupLocalityChange(e.target.value)}
                    className="w-full p-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="">Any area</option>
                    {CHENNAI_LOCALITIES.map((locality) => (
                      <option key={locality} value={locality}>{locality}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="drop-locality" className="block text-xs text-neutral-500 mb-1">To</label>
                  <select
                    id="drop-locality"
                    value={selectedDropLocality}
                    onChange={(e) => handleDropLocalityChange(e.target.value)}
                    className="w-full p-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="">Any area</option>
                    {CHENNAI_LOCALITIES.map((locality) => (
                      <option key={locality} value={locality}>{locality}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="text-sm font-medium text-neutral-700 mb-2 flex items-center">
                <span>Vehicle Type</span>
              </div>
              
              <div className="vehicle-type-options-compact grid grid-cols-4 gap-2">
                <div 
                  className={`vehicle-option-compact rounded-lg overflow-hidden shadow-sm transition-all ${activeFilter === 'car' ? 'selected-vehicle-option-compact' : 'bg-white'}`}
                  onClick={() => handleFilterClick('car')}
                >
                  <div className="p-2 flex flex-col items-center text-center">
                    <span className="text-xl mb-1">🚗</span>
                    <p className="text-xs font-medium">Car</p>
                    {activeFilter === 'car' && <div className="option-tick-compact">✓</div>}
                  </div>
                </div>
                
                <div 
                  className={`vehicle-option-compact rounded-lg overflow-hidden shadow-sm transition-all ${activeFilter === 'bike' ? 'selected-vehicle-option-compact' : 'bg-white'}`}
                  onClick={() => handleFilterClick('bike')}
                >
                  <div className="p-2 flex flex-col items-center text-center">
                    <span className="text-xl mb-1">🏍️</span>
                    <p className="text-xs font-medium">Bike</p>
                    {activeFilter === 'bike' && <div className="option-tick-compact">✓</div>}
                  </div>
                </div>
                
                <div 
                  className={`vehicle-option-compact rounded-lg overflow-hidden shadow-sm transition-all ${activeFilter === 'suv' ? 'selected-vehicle-option-compact' : 'bg-white'}`}
                  onClick={() => handleFilterClick('suv')}
                >
                  <div className="p-2 flex flex-col items-center text-center">
                    <span className="text-xl mb-1">🚙</span>
                    <p className="text-xs font-medium">SUV</p>
                    {activeFilter === 'suv' && <div className="option-tick-compact">✓</div>}
                  </div>
                </div>
                
                <div 
                  className={`vehicle-option-compact rounded-lg overflow-hidden shadow-sm transition-all ${activeFilter === 'luxury' ? 'selected-vehicle-option-compact' : 'bg-white'}`}
                  onClick={() => handleFilterClick('luxury')}
                >
                  <div className="p-2 flex flex-col items-center text-center">
                    <span className="text-xl mb-1">✨</span>
                    <p className="text-xs font-medium">Premium</p>
                    {activeFilter === 'luxury' && <div className="option-tick-compact">✓</div>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Local Shift Requests */}
            {filteredLocalRequests.length > 0 ? (
              filteredLocalRequests.map((request) => (
                <ShiftRequestCard 
                  key={request.id} 
                  request={request} 
                  showDetails
                />
              ))
            ) : (
              <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
                <div className="text-neutral-500 mb-2">
                  <i className="fas fa-map-marker-alt text-3xl"></i>
                </div>
                <h3 className="font-semibold text-lg mb-1">No local shifts found</h3>
                <p className="text-neutral-600">There are currently no local shift requests matching your criteria. Try different areas or vehicle types.</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
