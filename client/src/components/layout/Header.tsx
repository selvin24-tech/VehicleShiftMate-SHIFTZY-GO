import { useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, MapPin, ChevronLeft } from "lucide-react";
import { USER_PROFILE } from "@/lib/constants";
import { Button } from "@/components/ui/button";

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
  const [unreadCount] = useState(4);

  return (
    <div className="bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40 shadow-sm">
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="rounded-full w-9 h-9 shrink-0 hover:bg-neutral-100"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-700" />
        </Button>
      )}

      {/* Logo / Title */}
      <div className="flex-1 flex items-center gap-2">
        {title === "Shiftzy Go" || showAnimation ? (
          <div className="flex items-center gap-1">
            {/* Logo mark */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <div className="leading-none">
              <div className="flex items-baseline gap-0">
                <span
                  className="font-black text-blue-600 tracking-tight"
                  style={{ fontSize: "17px", fontFamily: "'Inter', sans-serif" }}
                >
                  Shift
                </span>
                <span
                  className="font-black text-orange-500 tracking-tight"
                  style={{ fontSize: "17px", fontFamily: "'Inter', sans-serif" }}
                >
                  zy
                </span>
                <span
                  className="font-black text-neutral-800 tracking-tight ml-1"
                  style={{ fontSize: "17px", fontFamily: "'Inter', sans-serif" }}
                >
                  Go
                </span>
              </div>
              <p className="text-[9px] text-neutral-400 font-medium -mt-0.5 tracking-wide">
                Vehicle Shifting Platform
              </p>
            </div>
          </div>
        ) : (
          <h1 className="font-bold text-base text-neutral-900">{title}</h1>
        )}
      </div>

      {/* Location pill */}
      <button
        className="hidden sm:flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
      >
        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
        {currentLocation}
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setLocation("/notifications")}
          className="relative w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-neutral-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => setLocation("/profile")} aria-label="Profile">
          <Avatar className="h-9 w-9 border-2 border-orange-200">
            <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
              {USER_PROFILE.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </div>
  );
}
