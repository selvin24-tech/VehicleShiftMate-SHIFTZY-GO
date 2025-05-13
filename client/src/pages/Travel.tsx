import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VehicleCard from "@/components/common/VehicleCard";
import { AVAILABLE_VEHICLES, LOCATIONS } from "@/lib/constants";
import { TravelSearchFilters, Vehicle } from "@/lib/types";
import { Search, Filter } from "lucide-react";

export default function Travel() {
  const [activeFilter, setActiveFilter] = useState<string | null>("car");
  const [searchResults, setSearchResults] = useState<Vehicle[]>(AVAILABLE_VEHICLES);
  const { toast } = useToast();

  const form = useForm<TravelSearchFilters>({
    defaultValues: {
      searchQuery: "",
      pickupLocation: "",
      destination: "",
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
      if (activeFilter === "car" || activeFilter === "bike") {
        filtered = filtered.filter(vehicle => vehicle.type === activeFilter);
      } else if (activeFilter === "luxury") {
        filtered = filtered.filter(vehicle => 
          (vehicle.pricePerDay && vehicle.pricePerDay > 2500) || 
          (vehicle.features && vehicle.features.includes("Premium"))
        );
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
    toast({
      title: "Vehicle Selected",
      description: "You've selected this vehicle. Booking feature coming soon!",
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <Header title="Find a Vehicle to Drive" showBackButton variant="secondary" />
      
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
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                      <Input
                        {...field}
                        placeholder="Search for car, bike models..."
                        className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center mb-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center text-neutral-700"
                onClick={() => {
                  // Show a toast for now
                  toast({
                    title: "Filters",
                    description: "Advanced filtering options coming soon!",
                  });
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span>Filter</span>
              </Button>
              <div className="flex gap-2">
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 cursor-pointer ${activeFilter === 'car' ? 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                  onClick={() => handleFilterClick('car')}
                >
                  Car
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 cursor-pointer ${activeFilter === 'bike' ? 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                  onClick={() => handleFilterClick('bike')}
                >
                  Bike
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 cursor-pointer ${activeFilter === 'luxury' ? 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                  onClick={() => handleFilterClick('luxury')}
                >
                  Luxury
                </Badge>
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
      </div>
      
      <BottomNav />
    </div>
  );
}
