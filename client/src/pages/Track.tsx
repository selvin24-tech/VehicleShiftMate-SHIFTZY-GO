import { useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RECENT_TRIPS } from "@/lib/constants";

export default function Track() {
  const [trackingId, setTrackingId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const { toast } = useToast();

  const handleTrack = () => {
    if (!trackingId) {
      toast({
        title: "Tracking ID Required",
        description: "Please enter a tracking ID to track your vehicle.",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    
    // Simulate tracking after a short delay
    setTimeout(() => {
      setIsTracking(false);
      
      // Show a toast with tracking info
      toast({
        title: "Vehicle Tracked",
        description: "Your vehicle is currently in transit and expected to arrive on schedule.",
      });
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <Header title="Live Tracking" variant="primary" />
      
      <div className="px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Track Your Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking ID</label>
              <Input 
                placeholder="Enter tracking ID or booking reference"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
              onClick={handleTrack}
              disabled={isTracking}
            >
              {isTracking ? "Tracking..." : "Track Now"}
            </Button>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4">Recent Bookings</h3>
          {RECENT_TRIPS.map((trip) => (
            <Card key={trip.id} className="mb-3 hover:shadow-md cursor-pointer transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">{trip.pickupLocation.name} to {trip.dropLocation.name}</h4>
                    <p className="text-xs text-neutral-500">
                      {trip.vehicle.make} {trip.vehicle.model} • {new Date(trip.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary-500 border-primary-500"
                    onClick={() => {
                      setTrackingId(`TRK-${trip.id}`);
                    }}
                  >
                    Track
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <h3 className="font-semibold mb-2">Not seeing your booking?</h3>
          <p className="text-sm text-neutral-600 mb-3">
            If you can't find your booking in the list above, you can contact our support team for assistance.
          </p>
          <Button variant="link" className="text-primary-500 p-0 h-auto">
            Contact Support
          </Button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
