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
  const bgImage = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=85";

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
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ paddingBottom: "20px" }}>
            <div style={{
              background: "#000000",
              padding: "15px 35px",
              borderRadius: "16px",
              border: "3px solid #3b82f6",
            }}>
              <h1 style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "36px",
                fontWeight: "bold",
                textAlign: "center",
                lineHeight: "1",
                margin: "0",
              }}>
                <span style={{
                  color: "#3b82f6",
                }}>Shift</span>
                <span style={{
                  color: "#ff8c00",
                }}>zy</span>
                <span style={{
                  color: "#3b82f6",
                  marginLeft: "10px"
                }}>Go</span>
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
            <div style={{
              background: "#000000",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "2px solid #3b82f6",
            }}>
              <span style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "20px",
                fontWeight: "bold",
                lineHeight: "1",
              }}>
                <span style={{ color: "#3b82f6" }}>Shift</span>
                <span style={{ color: "#ff8c00" }}>zy</span>
                <span style={{ color: "#3b82f6", marginLeft: "5px" }}>Go</span>
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
