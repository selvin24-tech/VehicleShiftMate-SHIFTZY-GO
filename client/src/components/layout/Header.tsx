import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Car, Bike } from "lucide-react";
import { USER_PROFILE } from "@/lib/constants";

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
  
  // Alternate between car and bike animation
  useEffect(() => {
    const intervalId = setInterval(() => {
      setVehicleType(prev => prev === "car" ? "bike" : "car");
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const bgColorClass = variant === "primary" 
    ? "bg-primary-500" 
    : "bg-secondary-500";
    
  // Using a premium car interior image with luxury styling
  const bgImage = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=85";

  return (
    <>
      {(isHome || showAnimation) ? (
        <div 
          className="vehicle-shifting-animation bg-no-repeat relative" 
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 35%", // Focus more on the dashboard/steering wheel
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center" style={{ paddingBottom: "20px" }}>
            <div>
              <h1 style={{
                fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                fontSize: "clamp(40px, 8vw, 72px)", // Responsive font size
                fontWeight: "bold",
                textAlign: "center",
                lineHeight: "1",
                margin: "0",
                letterSpacing: "1px",
                textTransform: "uppercase",
                WebkitTextStroke: "1px #000",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap" // Allow wrapping on very small screens
              }}>
                <span style={{
                  color: "#3b82f6",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block"
                }}>SHIFT</span>
                <span style={{
                  color: "#ff8c00",
                  background: "linear-gradient(135deg, #ff8c00, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block"
                }}>ZY</span>
                <span style={{
                  color: "#3b82f6",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                  marginLeft: "20px"
                }}>GO</span>
              </h1>
            </div>
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
          
          {showBackButton && (
            <button 
              className="absolute top-4 left-4 z-30 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow-md" 
              aria-label="Back" 
              onClick={() => setLocation("/")}
            >
              <i className="fas fa-arrow-left text-primary-500"></i>
            </button>
          )}
        </div>
      ) : (
        <div className={`${bgColorClass} text-white p-4 flex items-center`}>
          {showBackButton && (
            <button className="mr-3" aria-label="Back" onClick={() => setLocation("/")}>
              <i className="fas fa-arrow-left"></i>
            </button>
          )}
          {title === "Shiftzy Go" ? (
            <div>
              <span style={{
                fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                fontSize: "clamp(24px, 5vw, 36px)", // Responsive font size
                fontWeight: "bold",
                lineHeight: "1",
                letterSpacing: "1px",
                textTransform: "uppercase",
                WebkitTextStroke: "1px #000",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap" // Allow wrapping on small screens
              }}>
                <span style={{
                  color: "#3b82f6",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>SHIFT</span>
                <span style={{
                  color: "#ff8c00",
                  background: "linear-gradient(135deg, #ff8c00, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>ZY</span>
                <span style={{
                  color: "#3b82f6",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginLeft: "10px"
                }}>GO</span>
              </span>
            </div>
          ) : (
            <h1 className="text-xl font-semibold">{title}</h1>
          )}
          {!showBackButton && (
            <div className="ml-auto">
              <Avatar 
                className="h-8 w-8 cursor-pointer" 
                onClick={() => setLocation("/profile")}
              >
                <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
                <AvatarFallback>{USER_PROFILE.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      )}
    </>
  );
}
