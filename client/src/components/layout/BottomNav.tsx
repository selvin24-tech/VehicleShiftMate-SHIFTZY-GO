import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEmergencyContacts } from "@/lib/appStore";
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
import { Ambulance, ShieldAlert, Flame, PhoneCall } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

type EmergencyService = {
  name: string;
  number: string;
  icon: React.ReactNode;
  bgClass: string;
};

const BASE_SERVICES: Record<string, EmergencyService> = {
  ambulance: {
    name: "Ambulance",
    number: "108",
    icon: <Ambulance size={28} />,
    bgClass: "bg-red-600 hover:bg-red-700 border-red-300 shadow-red-300",
  },
  police: {
    name: "Police",
    number: "100",
    icon: <ShieldAlert size={28} />,
    bgClass: "bg-blue-600 hover:bg-blue-700 border-blue-300 shadow-blue-300",
  },
  fire: {
    name: "Fire Dept",
    number: "101",
    icon: <Flame size={28} />,
    bgClass: "bg-orange-500 hover:bg-orange-600 border-orange-300 shadow-orange-300",
  },
};

const navItems: NavItem[] = [
  { path: "/",      label: "Home",  icon: "fa-home" },
  { path: "/plan",  label: "Plan",  icon: "fa-map-marked-alt" },
  { path: "/track", label: "Track", icon: "fa-location-arrow" },
  { path: "/help",  label: "Help",  icon: "fa-headset" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen]               = useState(false);
  const [isDialogOpen, setIsDialogOpen]   = useState(false);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [isBouncing, setIsBouncing]       = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [userLocation, setUserLocation]   = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [visible, setVisible]             = useState(false); // drives pop-in animation
  const { toast } = useToast();
  const savedContacts = useEmergencyContacts();

  /* Build full services map (base + personal contacts) */
  const emergencyServices: Record<string, EmergencyService> = {
    ...BASE_SERVICES,
    ...Object.fromEntries(
      savedContacts
        .filter((c) => c.phone)
        .map((c, i) => [
          `contact${i}`,
          {
            name: c.name || `Contact ${i + 1}`,
            number: c.phone,
            icon: <PhoneCall size={22} />,
            bgClass: "bg-orange-500 hover:bg-orange-600 border-orange-200 shadow-orange-200",
          } as EmergencyService,
        ])
    ),
  };

  /* Bounce animation every 30 s */
  useEffect(() => {
    const id = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  /* Stagger pop-in: open → wait 1 frame → mark visible */
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const getCurrentLocation = () => {
    setIsLocationSharing(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setUserLocation({ lat: coords.latitude, lng: coords.longitude });
          setIsLocationSharing(false);
          toast({ title: "Location shared", description: `Coordinates shared with emergency services.` });
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

  const handleSOSClick = () => setIsOpen((o) => !o);

  const handleServiceSelect = (key: string) => {
    setSelectedService(key);
    setIsDialogOpen(true);
    setIsOpen(false);
  };

  const handleConfirmCall = () => {
    if (!selectedService) return;
    const svc = emergencyServices[selectedService];
    setIsCallInProgress(true);
    getCurrentLocation();
    toast({ title: `Calling ${svc.name}`, description: `Dialing ${svc.number}…`, variant: "destructive" });
    setTimeout(() => {
      setIsCallInProgress(false);
      setIsDialogOpen(false);
      toast({ title: `${svc.name} notified`, description: "Help is on the way. Stay calm." });
    }, 2500);
  };

  const handleCancelCall = () => { setIsDialogOpen(false); setSelectedService(null); };

  /* ── Triangle button helper ─────────────────────────────── */
  const TriangleBtn = ({
    svcKey, tx, ty, delay,
  }: { svcKey: string; tx: string; ty: string; delay: number }) => {
    const svc = emergencyServices[svcKey];
    if (!svc) return null;
    return (
      <div
        className="absolute flex flex-col items-center gap-2"
        style={{
          transform: `translate(${tx}, ${ty})`,
          opacity: visible ? 1 : 0,
          scale: visible ? "1" : "0.5",
          transition: `opacity 0.22s ease ${delay}ms, scale 0.22s cubic-bezier(.34,1.56,.64,1) ${delay}ms`,
        }}
      >
        <button
          onClick={() => handleServiceSelect(svcKey)}
          disabled={isCallInProgress}
          aria-label={svc.name}
          className={`w-16 h-16 rounded-full text-white flex items-center justify-center border-2 shadow-lg active:scale-90 transition-transform ${svc.bgClass}`}
        >
          {svc.icon}
        </button>
        <span className="text-[11px] font-bold text-white bg-black/65 px-2.5 py-0.5 rounded-full whitespace-nowrap backdrop-blur-sm">
          {svc.name} · {svc.number}
        </span>
      </div>
    );
  };

  /* ── SOS button + triangle popup ────────────────────────── */
  const renderSosButton = () => (
    <div className="relative">
      {/* SOS trigger button */}
      <button
        onClick={handleSOSClick}
        className={`flex flex-col items-center text-neutral-500 relative z-[55] transition-all duration-300 ${isBouncing ? "animate-bounce" : ""}`}
        aria-label="Emergency SOS"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 mb-1 transition-colors ${
          isOpen ? "bg-red-700 border-red-400" : "bg-red-600 border-red-300 hover:bg-red-700"
        } text-white`}>
          <span className="font-bold text-xs">SOS</span>
        </div>
        <span className="text-xs">SOS</span>
      </button>

      {/* ── Triangle popup ── */}
      {isOpen && (
        <>
          {/* Backdrop — tap anywhere to close */}
          <div
            className="fixed inset-0 z-[58] bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          {/*
            Anchor is fixed at the horizontal center of the viewport,
            just above the bottom nav bar (~72 px tall).
            Each button is positioned via translate() from this anchor.

            Triangle vertices:
              Ambulance  → top center     (0,   -190px)
              Police     → bottom-left    (-100px, -105px)
              Fire       → bottom-right   (+100px, -105px)
          */}
          <div
            className="fixed z-[59]"
            style={{ bottom: "72px", left: "50%", pointerEvents: "none" }}
          >
            {/* pointer-events enabled only on each button */}
            <div style={{ pointerEvents: "auto" }}>
              {/* TOP — Ambulance */}
              <TriangleBtn svcKey="ambulance" tx="-50%" ty="-190px" delay={0} />

              {/* BOTTOM LEFT — Police */}
              <TriangleBtn svcKey="police" tx="calc(-50% - 100px)" ty="-105px" delay={60} />

              {/* BOTTOM RIGHT — Fire */}
              <TriangleBtn svcKey="fire" tx="calc(-50% + 100px)" ty="-105px" delay={120} />

              {/* Personal emergency contacts below the triangle */}
              {savedContacts.filter((c) => c.phone).map((c, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-center gap-1"
                  style={{
                    transform: `translate(calc(-50% + ${(i - 0.5) * 80}px), -28px)`,
                    opacity: visible ? 1 : 0,
                    scale: visible ? "1" : "0.5",
                    transition: `opacity 0.22s ease ${180 + i * 60}ms, scale 0.22s cubic-bezier(.34,1.56,.64,1) ${180 + i * 60}ms`,
                  }}
                >
                  <button
                    onClick={() => handleServiceSelect(`contact${i}`)}
                    disabled={isCallInProgress}
                    className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center border-2 border-orange-200 shadow-lg active:scale-90 transition-transform"
                  >
                    <PhoneCall size={18} />
                  </button>
                  <span className="text-[10px] font-bold text-white bg-black/65 px-2 py-0.5 rounded-full whitespace-nowrap max-w-[80px] truncate backdrop-blur-sm">
                    {c.name || `Contact ${i + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Confirmation dialog ── */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">
              {selectedService && `Call ${emergencyServices[selectedService]?.name}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-2">
              {selectedService && (
                <>
                  <p className="text-base font-medium">
                    You are about to call <strong>{emergencyServices[selectedService]?.name}</strong> at{" "}
                    <strong>{emergencyServices[selectedService]?.number}</strong>.
                  </p>
                  <p className="text-sm text-neutral-500">
                    Please confirm only if you genuinely need emergency help.
                  </p>
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
            <AlertDialogCancel disabled={isCallInProgress} className="mt-0">
              Cancel
            </AlertDialogCancel>
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
    </div>
  );

  const leftNavItems  = navItems.slice(0, 2);
  const rightNavItems = navItems.slice(2);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-3 max-w-md mx-auto z-10">
      <div className="flex justify-between items-center px-4">
        {leftNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn("flex flex-col items-center", location === item.path ? "text-primary-500" : "text-neutral-500")}
          >
            <i className={`fas ${item.icon} text-lg`} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}

        {renderSosButton()}

        {rightNavItems.map((item) => (
          <button
            key={item.path}
            data-tour={item.path === "/track" ? "track-nav" : undefined}
            onClick={() => navigate(item.path)}
            className={cn("flex flex-col items-center", location === item.path ? "text-primary-500" : "text-neutral-500")}
          >
            <i className={`fas ${item.icon} text-lg`} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
