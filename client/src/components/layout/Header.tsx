import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Car, Bike, ChevronLeft, Bell } from "lucide-react";
import { USER_PROFILE } from "@/lib/constants";
import AnimatedLogo from "@/components/branding/AnimatedLogo";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  currentLocation?: string;
  variant?: "primary" | "secondary";
  showAnimation?: boolean;
}

export default function Header({
  title = "Shiftzy Go",
  showBackButton = false,
  currentLocation = "Chennai",
  variant = "primary",
  showAnimation = true,
}: HeaderProps) {
  const [, setLocation] = useLocation();
  const [isHome] = useRoute("/");
  const [vehicleType, setVehicleType] = useState<"car" | "bike">("car");
  const [unreadCount] = useState(4);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVehicleType(prev => prev === "car" ? "bike" : "car");
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const bgColorClass = variant === "primary"
    ? "bg-primary-500"
    : "bg-secondary-500";

  const bgImage = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=85";

  return (
    <>
      {(isHome || showAnimation) ? (
        <div
          className="vehicle-shifting-animation bg-no-repeat relative"
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center" style={{ paddingBottom: "20px" }}>
            <AnimatedLogo />
          </div>

          <div className="animated-car">
            {vehicleType === "car" ? (
              <Car className="text-white drop-shadow-lg" strokeWidth={1.5} size={32} />
            ) : (
              <Bike className="text-white drop-shadow-lg" strokeWidth={1.5} size={32} />
            )}
          </div>

          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
            <div className="text-white font-semibold text-lg drop-shadow-md">
              <i className="fas fa-location-dot mr-1"></i> {currentLocation}
            </div>
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button
                onClick={() => setLocation("/notifications")}
                className="relative bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-black/20">
                    {unreadCount}
                  </span>
                )}
              </button>
              {/* Avatar */}
              <button
                className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                aria-label="Profile"
                onClick={() => setLocation("/profile")}
              >
                {USER_PROFILE.avatarUrl ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
                    <AvatarFallback className="text-primary-500">{USER_PROFILE.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <i className="fas fa-user text-primary-500"></i>
                )}
              </button>
            </div>
          </div>

          {showBackButton && (
            <div className="absolute top-4 left-4 z-30">
              <Button
                variant="default"
                size="lg"
                onClick={() => setLocation("/")}
                className="bg-black text-white shadow-lg hover:bg-gray-800 rounded-full w-12 h-12 p-0 flex items-center justify-center"
              >
                <ChevronLeft className="h-7 w-7" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center">
          {showBackButton && (
            <Button
              variant="default"
              size="lg"
              onClick={() => setLocation("/")}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10 p-0 mr-3 flex items-center justify-center border-0"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          {title === "Shiftzy Go" ? (
            <div>
              <span style={{
                fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                fontSize: "clamp(24px, 5vw, 36px)",
                fontWeight: "bold",
                lineHeight: "1",
                letterSpacing: "1px",
                textTransform: "uppercase",
                WebkitTextStroke: "1px #000",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap"
              }}>
                <span style={{ color: "#3b82f6", background: "linear-gradient(135deg, #3b82f6, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SHIFT</span>
                <span style={{ color: "#ff8c00", background: "linear-gradient(135deg, #ff8c00, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ZY</span>
                <span style={{ color: "#3b82f6", background: "linear-gradient(135deg, #3b82f6, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginLeft: "10px" }}>GO</span>
              </span>
            </div>
          ) : (
            <h1 className="text-xl font-semibold">{title}</h1>
          )}
          <div className="ml-auto flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => setLocation("/notifications")}
              className="relative w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {!showBackButton && (
              <Avatar
                className="h-8 w-8 cursor-pointer"
                onClick={() => setLocation("/profile")}
              >
                <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
                <AvatarFallback>{USER_PROFILE.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      )}
    </>
  );
}
