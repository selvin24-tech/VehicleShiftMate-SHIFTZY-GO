import { useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronLeft, Menu } from "lucide-react";
import { USER_PROFILE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import HeaderLogo from "@/components/branding/HeaderLogo";

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

  const isHomeHeader = (title === "Shiftzy Go" || showAnimation) && !showBackButton;

  if (isHomeHeader) {
    return (
      <div className="bg-white border-b border-neutral-100 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Menu */}
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors" aria-label="Menu">
          <Menu className="w-5 h-5 text-neutral-600" />
        </button>

        {/* Center: Animated Logo */}
        <HeaderLogo />

        {/* Right: Bell + Avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation("/notifications")}
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-neutral-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => setLocation("/profile")} aria-label="Profile">
            <Avatar className="h-8 w-8 border-2 border-orange-200">
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

  return (
    <div className="bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="rounded-full w-9 h-9 shrink-0"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-700" />
        </Button>
      )}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-white text-[10px] font-black">S</span>
        </div>
        <h1 className="font-bold text-base text-neutral-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setLocation("/notifications")}
          className="relative w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-neutral-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        {!showBackButton && (
          <button onClick={() => setLocation("/profile")} aria-label="Profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
              <AvatarFallback>{USER_PROFILE.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </div>
  );
}
