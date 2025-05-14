import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import icons from Lucide
import { Ambulance, ShieldAlert, Flame } from "lucide-react";

// Emergency service type definition
type EmergencyService = {
  name: string;
  number: string;
  icon: React.ReactNode;
  color: string;
  animationDelay: string;
};

// Services data
const emergencyServices: Record<string, EmergencyService> = {
  ambulance: {
    name: "Ambulance",
    number: "108",
    icon: <Ambulance size={24} />,
    color: "bg-red-600 hover:bg-red-700 text-white border-2 border-red-300",
    animationDelay: "delay-0"
  },
  police: {
    name: "Police",
    number: "100",
    icon: <ShieldAlert size={24} />,
    color: "bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-300",
    animationDelay: "delay-100"
  },
  fire: {
    name: "Fire Dept",
    number: "101",
    icon: <Flame size={24} />,
    color: "bg-orange-600 hover:bg-orange-700 text-white border-2 border-orange-300",
    animationDelay: "delay-200"
  }
};

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const { toast } = useToast();
  
  // Create a bouncing animation effect every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get user's location when needed
  const getCurrentLocation = () => {
    setIsLocationSharing(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsLocationSharing(false);
          
          toast({
            title: "Location shared",
            description: `Your current location coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) have been shared with emergency services.`,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocationSharing(false);
          
          toast({
            title: "Location error",
            description: "Unable to share your location. Emergency services may take longer to reach you.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setIsLocationSharing(false);
      toast({
        title: "Location unavailable",
        description: "Geolocation is not supported by your browser. Emergency services will use your last known location.",
        variant: "destructive",
      });
    }
  };
  
  const handleSOSClick = () => {
    setIsOpen(!isOpen);
  };
  
  const handleServiceSelect = (serviceKey: string) => {
    setSelectedService(serviceKey);
    setIsDialogOpen(true);
    setIsOpen(false);
  };
  
  const handleConfirmCall = () => {
    if (!selectedService) return;
    
    const service = emergencyServices[selectedService];
    setIsCallInProgress(true);
    
    // First, get the user's location
    getCurrentLocation();
    
    toast({
      title: `Calling ${service.name} Emergency Services`,
      description: `Dialing emergency number ${service.number}...`,
      variant: "destructive",
    });
    
    // In a real app, this would trigger the phone's call feature
    // For this demo, we just simulate the behavior
    setTimeout(() => {
      setIsCallInProgress(false);
      setIsDialogOpen(false);
      
      toast({
        title: `${service.name} has been notified`,
        description: "Help is on the way. Stay calm and stay on the line.",
        variant: "default",
      });
    }, 2500);
  };
  
  const handleCancelCall = () => {
    setIsDialogOpen(false);
    setSelectedService(null);
  };
  
  return (
    <>
      {/* Main SOS Button */}
      <div className="fixed bottom-20 right-5 z-[50]">
        <button 
          onClick={handleSOSClick}
          className={`w-16 h-16 rounded-full bg-red-600 text-white 
            flex items-center justify-center shadow-lg hover:bg-red-700 
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            ${isBouncing ? 'animate-bounce' : ''}
            relative z-[55] transition-all duration-300 ease-in-out
            border-2 border-red-300`}
          aria-label="Emergency SOS Button"
        >
          <span className="font-bold text-sm">SOS</span>
        </button>
        
        {/* Vertical stack of buttons that appears on top of SOS when clicked */}
        {isOpen && (
          <div className="absolute left-0 bottom-0 w-full">
            {Object.entries(emergencyServices).map(([key, service], index) => {
              // Calculate vertical position above the SOS button
              const offsetY = -((index + 1) * 60 + 8); // Stack them 60px apart, 8px extra for button height
              
              return (
                <button
                  key={key}
                  onClick={() => handleServiceSelect(key)}
                  className={`absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full shadow-lg 
                    flex items-center justify-center
                    transition-all duration-300 ${service.color}
                    hover:scale-110 animate-in slide-in-from-bottom-5 ${service.animationDelay}
                    z-[60]`} // Higher z-index to ensure it appears on top
                  style={{
                    bottom: `${Math.abs(offsetY)}px`,
                  }}
                  disabled={isCallInProgress}
                  aria-label={service.name}
                >
                  {service.icon}
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl text-red-600">
              {selectedService && (
                <div className="flex items-center justify-center gap-2">
                  <i className={`fas ${emergencyServices[selectedService].icon} text-2xl`}></i>
                  <span>Emergency {emergencyServices[selectedService].name} Call</span>
                </div>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {selectedService && (
                <>
                  <p className="text-base font-medium mb-2">
                    You are about to call {emergencyServices[selectedService].name} Emergency Services
                    at {emergencyServices[selectedService].number}
                  </p>
                  <p className="text-sm text-neutral-600 mb-2">
                    Only confirm if this is a genuine emergency.
                    Misuse of emergency services is a punishable offense.
                  </p>
                  
                  <div className="bg-neutral-100 p-3 rounded-lg mt-3 mb-2">
                    <p className="text-xs font-medium text-neutral-700 flex items-center">
                      <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
                      Your location will be automatically shared with emergency responders
                    </p>
                    {userLocation && (
                      <p className="text-xs text-neutral-600 mt-1">
                        Current coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                  
                  {isCallInProgress && (
                    <div className="flex items-center justify-center mt-4">
                      <div className="w-6 h-6 border-t-2 border-red-600 rounded-full animate-spin"></div>
                      <span className="ml-2 text-red-600">
                        {isLocationSharing ? "Sharing your location..." : "Connecting to emergency services..."}
                      </span>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              disabled={isCallInProgress}
              className="mt-0 bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCall}
              disabled={isCallInProgress}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCallInProgress ? "Connecting..." : "Confirm Emergency Call"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}