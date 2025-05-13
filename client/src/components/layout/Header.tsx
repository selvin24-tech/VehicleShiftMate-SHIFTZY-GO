import { useLocation, useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Car } from "lucide-react";
import { USER_PROFILE } from "@/lib/constants";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  currentLocation?: string;
  variant?: "primary" | "secondary";
}

export default function Header({
  title = "VehicleShift",
  showBackButton = false,
  currentLocation = "Chennai",
  variant = "primary",
}: HeaderProps) {
  const [, setLocation] = useLocation();
  const [isHome] = useRoute("/");
  
  const bgColorClass = variant === "primary" 
    ? "bg-primary-500" 
    : "bg-secondary-500";

  return (
    <>
      {isHome ? (
        <div className="vehicle-shifting-animation bg-no-repeat" style={{backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3')" }}>
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <h1 className="text-white text-2xl font-bold tracking-tight drop-shadow-lg">{title}</h1>
          </div>
          <div className="animated-car">
            <Car className="text-white text-3xl drop-shadow-lg" />
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
              <i className="fas fa-user text-primary-500"></i>
            </button>
          </div>
        </div>
      ) : (
        <div className={`${bgColorClass} text-white p-4 flex items-center`}>
          {showBackButton && (
            <button className="mr-3" aria-label="Back" onClick={() => setLocation("/")}>
              <i className="fas fa-arrow-left"></i>
            </button>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
          {variant === "primary" && !showBackButton && (
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
