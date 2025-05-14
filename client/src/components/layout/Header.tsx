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
              background: "rgba(0, 0, 0, 0.9)",
              padding: "15px 35px",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.9), 0 0 80px rgba(245, 158, 11, 0.6)",
              border: "3px solid rgba(59, 130, 246, 0.8)",
              transform: "perspective(900px) rotateX(8deg)",
              position: "relative",
              overflow: "hidden"
            }}>
              <h1 className="brand-logo-text">
                <span className="brand-name-shift" style={{
                  color: "#0066ff",
                  fontSize: "36px",
                  fontWeight: "900",
                  textShadow: "0 0 20px rgba(0, 102, 255, 0.9)"
                }}>
                  <span className="brand-letter">S</span>
                  <span className="brand-letter">h</span>
                  <span className="brand-letter">i</span>
                  <span className="brand-letter">f</span>
                  <span className="brand-letter">t</span>
                  <span className="brand-name-accent" style={{
                    color: "#ff8c00",
                    fontSize: "20px",
                    fontWeight: "900",
                    textShadow: "0 0 15px #ff8c00"
                  }}>
                    <span className="brand-letter">z</span>
                    <span className="brand-letter">y</span>
                  </span>
                </span>
                <span className="brand-name-go" style={{
                  color: "#0066ff",
                  fontSize: "30px",
                  fontWeight: "900",
                  marginLeft: "15px",
                  textShadow: "0 0 20px rgba(0, 102, 255, 0.9)"
                }}>
                  <span className="brand-letter">G</span>
                  <span className="brand-letter">o</span>
                </span>
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
              background: "rgba(0, 0, 0, 0.9)",
              padding: "6px 12px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.7), 0 0 40px rgba(245, 158, 11, 0.5)",
              border: "2px solid rgba(59, 130, 246, 0.7)",
              position: "relative",
              overflow: "hidden"
            }}>
              <span style={{
                color: "#0066ff", 
                fontWeight: "bold",
                fontSize: "18px",
                textShadow: "0 0 10px rgba(0, 102, 255, 0.9)"
              }}>
                <span>S</span>
                <span>h</span>
                <span>i</span>
                <span>f</span>
                <span>t</span>
              </span>
              <span style={{
                color: "#ff8c00",
                fontWeight: "bold", 
                fontSize: "16px",
                textShadow: "0 0 10px rgba(255, 140, 0, 0.9)"
              }}>
                <span>z</span>
                <span>y</span>
              </span>
              <span style={{
                color: "#0066ff",
                fontWeight: "bold",
                fontSize: "18px",
                marginLeft: "5px",
                textShadow: "0 0 10px rgba(0, 102, 255, 0.9)"
              }}>
                <span>G</span>
                <span>o</span>
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
