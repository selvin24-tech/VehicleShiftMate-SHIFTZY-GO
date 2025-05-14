import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
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

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

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
    animationDelay: "delay-[200ms]"
  },
  police: {
    name: "Police",
    number: "100",
    icon: <ShieldAlert size={24} />,
    color: "bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-300",
    animationDelay: "delay-[400ms]"
  },
  fire: {
    name: "Fire Dept",
    number: "101",
    icon: <Flame size={24} />,
    color: "bg-orange-600 hover:bg-orange-700 text-white border-2 border-orange-300",
    animationDelay: "delay-[600ms]"
  }
};

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: "fa-home" },
  { path: "/plan", label: "Plan", icon: "fa-map-marked-alt" },
  // SOS button will be added in the center instead of Chat
  { path: "/track", label: "Track", icon: "fa-location-arrow" },
  { path: "/help", label: "Help", icon: "fa-headset" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();
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

  const renderSosButton = () => (
    <div className="relative">
      <button 
        onClick={handleSOSClick}
        className={`flex flex-col items-center text-neutral-500
          ${isBouncing ? 'animate-bounce' : ''}
          relative z-[55] transition-all duration-300 ease-in-out`}
        aria-label="Emergency SOS Button"
      >
        <div className="w-8 h-8 rounded-full bg-red-600 text-white 
          flex items-center justify-center shadow-lg hover:bg-red-700 
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          border-2 border-red-300 mb-1">
          <span className="font-bold text-xs">SOS</span>
        </div>
        <span className="text-xs">SOS</span>
      </button>
      
      {/* Rectangular pattern of buttons that appear above the navigation bar */}
      {isOpen && (
        <div className="fixed left-0 right-0 bottom-16 mx-auto max-w-md z-[60]">
          <div className="relative flex justify-center items-center h-24">
            {/* Ambulance - Top */}
            <button
              onClick={() => handleServiceSelect('ambulance')}
              className={`absolute w-10 h-10 rounded-full shadow-lg 
                flex items-center justify-center
                transition-all duration-700 ${emergencyServices.ambulance.color}
                hover:scale-110 sos-button-animation ${emergencyServices.ambulance.animationDelay}
                z-[60]`}
              style={{
                bottom: '60px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
              disabled={isCallInProgress}
              aria-label={emergencyServices.ambulance.name}
            >
              {emergencyServices.ambulance.icon}
            </button>
            
            {/* Police - Left */}
            <button
              onClick={() => handleServiceSelect('police')}
              className={`absolute w-10 h-10 rounded-full shadow-lg 
                flex items-center justify-center
                transition-all duration-700 ${emergencyServices.police.color}
                hover:scale-110 sos-button-animation ${emergencyServices.police.animationDelay}
                z-[60]`}
              style={{
                bottom: '30px',
                left: 'calc(50% - 60px)'
              }}
              disabled={isCallInProgress}
              aria-label={emergencyServices.police.name}
            >
              {emergencyServices.police.icon}
            </button>
            
            {/* Fire - Right */}
            <button
              onClick={() => handleServiceSelect('fire')}
              className={`absolute w-10 h-10 rounded-full shadow-lg 
                flex items-center justify-center
                transition-all duration-700 ${emergencyServices.fire.color}
                hover:scale-110 sos-button-animation ${emergencyServices.fire.animationDelay}
                z-[60]`}
              style={{
                bottom: '30px',
                left: 'calc(50% + 60px)'
              }}
              disabled={isCallInProgress}
              aria-label={emergencyServices.fire.name}
            >
              {emergencyServices.fire.icon}
            </button>
          </div>
        </div>
      )}

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
    </div>
  );

  // Create two arrays for the left and right sides of the navigation
  const leftNavItems = navItems.slice(0, 2); // Home and Plan
  const rightNavItems = navItems.slice(2); // Track and Help

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 py-3 max-w-md mx-auto z-10">
      <div className="flex justify-between items-center px-4">
        {/* All navigation items evenly spaced in a row */}
        {leftNavItems.map((item) => (
          <button
            key={item.path}
            className={cn(
              "flex flex-col items-center",
              location === item.path ? "text-primary-500" : "text-neutral-500"
            )}
            onClick={() => navigate(item.path)}
          >
            <i className={`fas ${item.icon} text-lg`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}

        {/* Center SOS Button */}
        {renderSosButton()}
        
        {/* Right Side Navigation Items */}
        {rightNavItems.map((item) => (
          <button
            key={item.path}
            className={cn(
              "flex flex-col items-center",
              location === item.path ? "text-primary-500" : "text-neutral-500"
            )}
            onClick={() => navigate(item.path)}
          >
            <i className={`fas ${item.icon} text-lg`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
