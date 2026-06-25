import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, ChevronLeft, CheckCheck, Package, MessageCircle, CreditCard, AlertTriangle, Star, Car } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

type NotifCategory = "all" | "bookings" | "messages" | "payments" | "alerts";

const NOTIFICATIONS = [
  { id: 1, category: "bookings", icon: Car, color: "blue", title: "Shift Request Accepted", body: "Karthik R. accepted your shift request for Honda City · Chennai → Bangalore", time: "2 min ago", unread: true },
  { id: 2, category: "payments", icon: CreditCard, color: "green", title: "Payment Received", body: "₹3,780 received for trip TRK-2048. Amount credited to your wallet.", time: "15 min ago", unread: true },
  { id: 3, category: "messages", icon: MessageCircle, color: "orange", title: "New Message", body: "Ramu S.: 'Hi, I am ready to pick up the vehicle tomorrow morning at 9 AM.'", time: "32 min ago", unread: true },
  { id: 4, category: "alerts", icon: AlertTriangle, color: "red", title: "Vehicle Inspection Required", body: "Please complete the pre-trip inspection for your shift starting tomorrow.", time: "1 hr ago", unread: true },
  { id: 5, category: "bookings", icon: Package, color: "blue", title: "Trip Completed", body: "Your vehicle (TN09AB1234) has been successfully delivered to Bangalore.", time: "2 hr ago", unread: false },
  { id: 6, category: "payments", icon: CreditCard, color: "green", title: "Refund Processed", body: "₹499 refund for cancelled booking #BK-1023 has been initiated.", time: "Yesterday", unread: false },
  { id: 7, category: "alerts", icon: Star, color: "orange", title: "Rate Your Experience", body: "How was your recent trip with Arjun V.? Tap to leave a review.", time: "Yesterday", unread: false },
  { id: 8, category: "messages", icon: MessageCircle, color: "orange", title: "New Message", body: "Janu K.: 'Can we reschedule the pickup to 11 AM instead?'", time: "2 days ago", unread: false },
  { id: 9, category: "bookings", icon: Car, color: "blue", title: "New Shift Near You", body: "A vehicle owner in your area needs a driver · Perambur → Tambaram · ₹2,100", time: "2 days ago", unread: false },
];

const CATEGORY_TABS: { id: NotifCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bookings", label: "Bookings" },
  { id: "messages", label: "Messages" },
  { id: "payments", label: "Payments" },
  { id: "alerts", label: "Alerts" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600",
};

export default function Notifications() {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<NotifCategory>("all");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const filtered = active === "all" ? notifications : notifications.filter(n => n.category === active);
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

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
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
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
