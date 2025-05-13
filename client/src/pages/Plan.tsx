import { useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { LOCATIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function Plan() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const { toast } = useToast();

  const handlePlanTrip = () => {
    if (!pickupLocation || !dropLocation || !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to plan your trip.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Trip Planned",
      description: `Your trip from ${pickupLocation} to ${dropLocation} has been planned for ${selectedDate.toLocaleDateString()}.`,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <Header title="Plan Your Trip" variant="primary" />
      
      <div className="px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pickup Location</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              >
                <option value="">Select pickup location</option>
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Drop Location</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
              >
                <option value="">Select drop location</option>
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="mx-auto"
            />
          </CardContent>
        </Card>
        
        <Button 
          className="w-full bg-primary-500 hover:bg-primary-600 text-white"
          onClick={handlePlanTrip}
        >
          Plan Trip
        </Button>
        
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">Planning Tips</h3>
          <ul className="space-y-3 text-neutral-700">
            <li className="flex items-start">
              <i className="fas fa-info-circle text-primary-500 mt-1 mr-2"></i>
              <span>Book your vehicle at least 2-3 days in advance for better availability.</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-info-circle text-primary-500 mt-1 mr-2"></i>
              <span>Check weather conditions before planning long distance trips.</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-info-circle text-primary-500 mt-1 mr-2"></i>
              <span>Weekend trips may have higher demand - plan accordingly.</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-info-circle text-primary-500 mt-1 mr-2"></i>
              <span>Make sure to carry your valid driving license for vehicle pickup.</span>
            </li>
          </ul>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
