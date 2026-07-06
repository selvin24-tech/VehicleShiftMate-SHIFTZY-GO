import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, ChevronLeft, CheckCheck, Package, CreditCard, Car, XCircle, Navigation } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import {
  useStoredNotifs, markNotifRead, markAllNotifsRead, type StoredIconKey,
} from "@/lib/notificationsStore";

const ICON_MAP: Record<StoredIconKey, typeof Package> = {
  request: Package,
  accepted: CheckCheck,
  rejected: XCircle,
  payment: CreditCard,
  "trip-started": Navigation,
  "trip-completed": Car,
};

type NotifCategory = "all" | "bookings" | "payments";

const CATEGORY_TABS: { id: NotifCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bookings", label: "Bookings" },
  { id: "payments", label: "Payments" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  orange: "bg-orange-100 text-orange-600",
};

export default function Notifications() {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<NotifCategory>("all");
  const notifications = useStoredNotifs();

  const filtered = active === "all" ? notifications : notifications.filter(n => n.category === active);
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => markAllNotifsRead();
  const handleTap = (id: number, requestId?: string) => {
    markNotifRead(id);
    if (requestId) navigate(`/request/${requestId}`);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Notifications</h1>
          {unreadCount > 0 ? (
            <button onClick={markAllRead} className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          ) : <div className="w-24" />}
        </div>
        {unreadCount > 0 && (
          <p className="text-blue-100 text-xs text-center mt-1">{unreadCount} unread notification{unreadCount > 1 ? "s" : ""}</p>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-neutral-100">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
              active === tab.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-neutral-500 border-neutral-200"
            }`}
          >
            {tab.label}
            {tab.id === "all" && unreadCount > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full inline-flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-neutral-50">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="font-semibold text-neutral-400">No notifications here</p>
          </div>
        ) : filtered.map(n => {
          const Icon = ICON_MAP[n.iconKey] ?? Package;
          return (
            <div
              key={n.id}
              onClick={() => handleTap(n.id, n.requestId)}
              className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors ${n.unread ? "bg-blue-50/60" : "bg-white"}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorMap[n.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-tight ${n.unread ? "font-bold text-neutral-900" : "font-semibold text-neutral-700"}`}>{n.title}</p>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-neutral-400 mt-1">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
