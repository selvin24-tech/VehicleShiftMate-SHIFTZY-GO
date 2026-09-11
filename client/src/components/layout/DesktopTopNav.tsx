import { useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell, Home as HomeIcon, Truck, Compass, Briefcase, Receipt,
  MessageCircle, User, HelpCircle, Moon, Sun, LogOut, ChevronDown,
  MapPinned,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BrandName from "@/components/branding/BrandName";
import DesktopSOS from "@/components/layout/DesktopSOS";
import { useTheme } from "@/components/ui/theme-provider";
import { useUnreadNotifCount } from "@/lib/notificationsStore";
import { USER_PROFILE } from "@/lib/constants";

const PRIMARY_LINKS = [
  { icon: HomeIcon, label: "Home", path: "/" },
  { icon: Truck, label: "Shift a Vehicle", path: "/shift-request" },
  { icon: Compass, label: "Go & Travel", path: "/travel" },
  { icon: MapPinned, label: "Nearby", path: "/nearby" },
  { icon: Briefcase, label: "My Rides", path: "/my-rides" },
];

/**
 * Persistent top navigation for the desktop/laptop experience — replaces
 * the mobile Header + bottom tab bar entirely above the lg breakpoint.
 * Mounted once by ResponsiveShell, not per-page.
 */
export default function DesktopTopNav() {
  const [location, setLocation] = useLocation();
  const unreadCount = useUnreadNotifCount();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [accountOpen, setAccountOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/user/logout", { method: "POST", credentials: "include" });
    } catch {
      // Best-effort: still clear local session state below even if this fails.
    }
    ["isAuthenticated", "hasSeenTour", "isFirstLogin", "username", "userType"].forEach(k => localStorage.removeItem(k));
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 shrink-0" aria-label="Shiftzy Go home">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-black">S</span>
          </div>
          <span className="text-lg font-extrabold"><BrandName go /></span>
        </button>

        <nav className="flex items-center gap-1 flex-1">
          {PRIMARY_LINKS.map(link => {
            const active = link.path === "/" ? location === "/" : location.startsWith(link.path);
            return (
              <button
                key={link.path}
                onClick={() => setLocation(link.path)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <DesktopSOS />

          <button
            onClick={() => setLocation("/notifications")}
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px] text-neutral-600 dark:text-neutral-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-neutral-950">
                {unreadCount}
              </span>
            )}
          </button>

          <DropdownMenu open={accountOpen} onOpenChange={setAccountOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors" aria-label="Account menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
                    {USER_PROFILE.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="px-2 py-1.5">
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{USER_PROFILE.name}</p>
                <p className="text-xs text-neutral-400">{USER_PROFILE.address}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/profile")}>
                <User className="w-4 h-4 mr-2" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/payment-history")}>
                <Receipt className="w-4 h-4 mr-2" /> Payment History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/support")}>
                <MessageCircle className="w-4 h-4 mr-2" /> MD's Desk (Support)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/help")}>
                <HelpCircle className="w-4 h-4 mr-2" /> Help &amp; FAQs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
