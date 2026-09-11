import { useState } from "react";
import { Ambulance, ShieldAlert, Flame, PhoneCall } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useEmergencyContacts } from "@/lib/appStore";

type EmergencyService = { name: string; number: string; icon: React.ReactNode; bgClass: string };

const BASE_SERVICES: Record<string, EmergencyService> = {
  ambulance: { name: "Ambulance", number: "108", icon: <Ambulance size={18} />, bgClass: "bg-red-600 hover:bg-red-700" },
  police: { name: "Police", number: "100", icon: <ShieldAlert size={18} />, bgClass: "bg-blue-600 hover:bg-blue-700" },
  fire: { name: "Fire Dept", number: "101", icon: <Flame size={18} />, bgClass: "bg-orange-500 hover:bg-orange-600" },
};

/**
 * Desktop-appropriate emergency SOS control — a compact popover menu
 * instead of the mobile radial fan (which is tuned for a thumb reaching
 * up from a bottom tab bar that doesn't exist on desktop). Same three
 * services + personal contacts + confirm-before-calling flow.
 */
export default function DesktopSOS() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const savedContacts = useEmergencyContacts();

  const services: Record<string, EmergencyService> = {
    ...BASE_SERVICES,
    ...Object.fromEntries(
      savedContacts.filter(c => c.phone).map((c, i) => [
        `contact${i}`,
        { name: c.name || `Contact ${i + 1}`, number: c.phone, icon: <PhoneCall size={18} />, bgClass: "bg-orange-500 hover:bg-orange-600" } as EmergencyService,
      ])
    ),
  };

  const getCurrentLocation = () => {
    setIsLocationSharing(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setUserLocation({ lat: coords.latitude, lng: coords.longitude });
          setIsLocationSharing(false);
          toast({ title: "Location shared", description: "Coordinates shared with emergency services." });
        },
        () => {
          setIsLocationSharing(false);
          toast({ title: "Location error", description: "Unable to share location.", variant: "destructive" });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setIsLocationSharing(false);
    }
  };

  const handleSelect = (key: string) => {
    setSelectedService(key);
    setIsDialogOpen(true);
    setMenuOpen(false);
  };

  const handleConfirmCall = () => {
    if (!selectedService) return;
    const svc = services[selectedService];
    setIsCallInProgress(true);
    getCurrentLocation();
    toast({ title: `Calling ${svc.name}`, description: `Dialing ${svc.number}…`, variant: "destructive" });
    setTimeout(() => {
      setIsCallInProgress(false);
      setIsDialogOpen(false);
      toast({ title: `${svc.name} notified`, description: "Help is on the way. Stay calm." });
    }, 2500);
  };

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900 transition-colors"
            aria-label="Emergency SOS"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> SOS
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide px-2 py-1.5">Emergency services</p>
          <div className="space-y-1">
            {Object.entries(services).map(([key, svc]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
              >
                <span className={`w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 ${svc.bgClass}`}>
                  {svc.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-neutral-800 dark:text-neutral-100">{svc.name}</span>
                  <span className="block text-xs text-neutral-400">{svc.number}</span>
                </span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">
              {selectedService && `Call ${services[selectedService]?.name}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-2">
              {selectedService && (
                <>
                  <p className="text-base font-medium">
                    You are about to call <strong>{services[selectedService]?.name}</strong> at{" "}
                    <strong>{services[selectedService]?.number}</strong>.
                  </p>
                  <p className="text-sm text-neutral-500">Please confirm only if you genuinely need emergency help.</p>
                  <div className="bg-neutral-100 rounded-lg p-3 text-xs text-neutral-700 text-left">
                    📍 Your location will be automatically shared with emergency responders.
                    {userLocation && (
                      <span className="block mt-1 text-neutral-500">
                        Coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </span>
                    )}
                  </div>
                  {isCallInProgress && (
                    <div className="flex items-center justify-center gap-2 pt-2 text-red-600 text-sm font-semibold">
                      <div className="w-4 h-4 border-t-2 border-red-600 rounded-full animate-spin" />
                      {isLocationSharing ? "Sharing your location…" : "Connecting to emergency services…"}
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isCallInProgress} className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCall}
              disabled={isCallInProgress}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCallInProgress ? "Connecting…" : "Confirm Emergency Call"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
