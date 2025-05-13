import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: "fa-home" },
  { path: "/plan", label: "Plan", icon: "fa-map-marked-alt" },
  { path: "/track", label: "Track", icon: "fa-location-arrow" },
  { path: "/help", label: "Help", icon: "fa-headset" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center py-3 max-w-md mx-auto z-10">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={cn(
            "flex flex-col items-center",
            location === item.path ? "text-primary-500" : "text-neutral-500"
          )}
          onClick={() => navigate(item.path)}
        >
          <i className={`fas ${item.icon} text-lg`}></i>
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
