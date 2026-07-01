import { useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell, ChevronLeft, Menu, Home as HomeIcon, Truck, Compass,
  Briefcase, Receipt, MessageCircle, User, HelpCircle, Moon, Sun, LogOut,
} from "lucide-react";
import { USER_PROFILE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import HeaderLogo from "@/components/branding/HeaderLogo";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useTheme } from "@/components/ui/theme-provider";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  currentLocation?: string;
  variant?: "primary" | "secondary";
  showAnimation?: boolean;
}

const DRAWER_LINKS = [
  { icon: HomeIcon, label: "Home", path: "/" },
  { icon: Truck, label: "Shift a Vehicle", path: "/shift-request" },
  { icon: Compass, label: "Go & Travel", path: "/travel" },
  { icon: Briefcase, label: "My Rides", path: "/my-rides" },
  { icon: Receipt, label: "Payment History", path: "/payment-history" },
  { icon: MessageCircle, label: "MD's Desk (Support)", path: "/support" },
  { icon: User, label: "My Profile", path: "/profile" },
  { icon: HelpCircle, label: "Help & FAQs", path: "/help" },
];

export default function Header({
  title = "Shiftzy Go",
  showBackButton = false,
  currentLocation = "Chennai",
  variant = "primary",
  showAnimation = true,
}: HeaderProps) {
  const [, setLocation] = useLocation();
  const [unreadCount] = useState(4);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const isHomeHeader = (title === "Shiftzy Go" || showAnimation) && !showBackButton;

  const go = (path: string) => {
    setDrawerOpen(false);
    setLocation(path);
  };

  const handleLogout = () => {
    ["isAuthenticated", "hasSeenTour", "isFirstLogin", "username", "userType"].forEach(k => localStorage.removeItem(k));
    window.location.href = "/";
  };

  const NavDrawer = (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="left" className="w-72 p-0 dark:bg-neutral-900">
        <SheetHeader className="bg-gradient-to-br from-blue-600 to-blue-700 px-5 pt-6 pb-5 text-left">
          <SheetTitle className="text-white text-lg">
            <span>Shift</span><span className="text-orange-300">zy</span><span> Go</span>
          </SheetTitle>
          <p className="text-blue-100 text-xs">Safe Shift. Joyful Journey.</p>
        </SheetHeader>

        <div className="px-3 py-3 space-y-1">
          {DRAWER_LINKS.map(link => (
            <button
              key={link.path}
              onClick={() => go(link.path)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <link.icon className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="font-medium text-sm">{link.label}</span>
            </button>
          ))}
        </div>

        <div className="px-3 mt-1 border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
          >
            {isDark ? <Sun className="w-5 h-5 text-orange-400 shrink-0" /> : <Moon className="w-5 h-5 text-blue-600 shrink-0" />}
            <span className="font-medium text-sm">{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-neutral-800 transition-colors text-left"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">Log Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );

  if (isHomeHeader) {
    return (
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        {NavDrawer}
        {/* Left: Menu */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        </button>

        {/* Center: Animated Logo */}
        <HeaderLogo />

        {/* Right: Bell + Avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation("/notifications")}
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
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
    <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
      {NavDrawer}
      {showBackButton ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="rounded-full w-9 h-9 shrink-0"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
        </Button>
      ) : (
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        </button>
      )}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-white text-[10px] font-black">S</span>
        </div>
        <h1 className="font-bold text-base text-neutral-900 dark:text-neutral-100">{title}</h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setLocation("/notifications")}
          className="relative w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => setLocation("/profile")} aria-label="Profile">
          <Avatar className="h-8 w-8">
            <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
            <AvatarFallback>{USER_PROFILE.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </div>
  );
}
