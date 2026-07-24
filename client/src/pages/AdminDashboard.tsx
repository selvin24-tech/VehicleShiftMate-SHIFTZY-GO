import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminHeader from "@/components/layout/AdminHeader";
import {
  CheckCircle2, XCircle, AlertTriangle, Users, Car, FileText,
  Flag, CreditCard, Bell, Settings, Search, Ban, Eye, RefreshCw,
  ShieldCheck, Star, Trash2, Send, MessageSquare, IndianRupee,
  ChevronRight, BarChart3, Activity, Phone, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Enquiry, EnquiryMessage } from "@shared/schema";

type EnquiryWithMeta = Enquiry & { messageCount: number; lastMessage?: EnquiryMessage };

/* ─────────────────────────── TYPES ─────────────────────────── */
type Status = "pending" | "approved" | "rejected";
type UserStatus = "active" | "suspended" | "banned";
type DocStatus = "pending" | "verified" | "rejected";
type RefundStatus = "pending" | "approved" | "rejected";
type DisputeStatus = "open" | "resolved" | "escalated";

/* ─────────────────────────── DATA ──────────────────────────── */
const PENDING_REQUESTS = [
  { id: 1, owner: "Ramesh V.", vehicle: "Honda City", regNo: "TN09AB1234", route: "Chennai → Bangalore", requestedOn: "Today, 09:12 AM", insurance: "Valid till Dec 2026", status: "pending" as Status },
  { id: 2, owner: "Kavitha S.", vehicle: "Maruti Swift", regNo: "TN22CD5678", route: "Coimbatore → Chennai", requestedOn: "Today, 08:45 AM", insurance: "Valid till Mar 2027", status: "pending" as Status },
  { id: 3, owner: "Prakash N.", vehicle: "Hyundai Creta", regNo: "TN45EF9012", route: "Madurai → Trichy", requestedOn: "Yesterday, 11:30 PM", insurance: "Valid till Jun 2027", status: "pending" as Status },
  { id: 4, owner: "Divya M.", vehicle: "Toyota Innova", regNo: "TN01GH3456", route: "Delhi → Gurgaon", requestedOn: "Yesterday, 07:00 PM", insurance: "Valid till Aug 2026", status: "pending" as Status },
  { id: 5, owner: "Suresh K.", vehicle: "Bajaj Pulsar", regNo: "TN56IJ7890", route: "Puducherry → Chennai", requestedOn: "2 days ago", insurance: "Expired — flagged", status: "pending" as Status },
];

const ALL_USERS = [
  { id: 1, name: "Selvin Raj", username: "selvin_raj", phone: "+91 98765 43210", city: "Chennai", role: "owner", trips: 12, rating: 4.8, joinedOn: "Jan 2026", status: "active" as UserStatus, verified: true },
  { id: 2, name: "Karthik Rajan", username: "karthik_r", phone: "+91 87654 32109", city: "Bangalore", role: "traveler", trips: 28, rating: 4.9, joinedOn: "Feb 2026", status: "active" as UserStatus, verified: true },
  { id: 3, name: "Priya Sharma", username: "priya_s", phone: "+91 76543 21098", city: "Mumbai", role: "both", trips: 5, rating: 4.6, joinedOn: "Mar 2026", status: "active" as UserStatus, verified: false },
  { id: 4, name: "Arjun Reddy", username: "arjun_r", phone: "+91 65432 10987", city: "Madurai", role: "owner", trips: 3, rating: 3.2, joinedOn: "Apr 2026", status: "suspended" as UserStatus, verified: true },
  { id: 5, name: "Deepika M.", username: "deepika_m", phone: "+91 54321 09876", city: "Chennai", role: "traveler", trips: 41, rating: 4.7, joinedOn: "Jan 2026", status: "active" as UserStatus, verified: true },
  { id: 6, name: "Vikram Patel", username: "vikram_p", phone: "+91 43210 98765", city: "Pune", role: "owner", trips: 0, rating: 0, joinedOn: "Jun 2026", status: "banned" as UserStatus, verified: false },
  { id: 7, name: "Neha Gupta", username: "neha_g", phone: "+91 32109 87654", city: "Delhi", role: "both", trips: 8, rating: 4.5, joinedOn: "May 2026", status: "active" as UserStatus, verified: true },
  { id: 8, name: "Ramu Selvam", username: "ramu_s", phone: "+91 21098 76543", city: "Coimbatore", role: "traveler", trips: 19, rating: 4.8, joinedOn: "Mar 2026", status: "active" as UserStatus, verified: true },
];

const DOCUMENTS = [
  { id: 1, user: "Priya Sharma", type: "Driving Licence", submittedOn: "Today, 10:15 AM", docRef: "DL-TN-2024-012345", status: "pending" as DocStatus, notes: "" },
  { id: 2, user: "Arjun Reddy", type: "Vehicle RC", submittedOn: "Today, 09:00 AM", docRef: "TN67MN2345", status: "pending" as DocStatus, notes: "" },
  { id: 3, user: "Meera S.", type: "Vehicle RC", submittedOn: "Yesterday, 04:30 PM", docRef: "TN22CD5678", status: "pending" as DocStatus, notes: "" },
  { id: 4, user: "Karthik Rajan", type: "Driving Licence", submittedOn: "2 days ago", docRef: "DL-KA-2023-098765", status: "verified" as DocStatus, notes: "Verified - Valid" },
  { id: 5, user: "Suresh K.", type: "Vehicle RC", submittedOn: "3 days ago", docRef: "TN56IJ7890", status: "rejected" as DocStatus, notes: "RC expired — cannot verify" },
];

const REPORTS = [
  { id: 1, reporter: "Selvin Raj", against: "Arjun Reddy", reason: "Reckless driving", details: "Driver was speeding and ignored traffic signals near Guindy.", date: "Today, 11:00 AM", status: "open" as DisputeStatus },
  { id: 2, reporter: "Deepika M.", against: "Vikram Patel", reason: "Fraud / Fake listing", details: "Vehicle described was not what arrived. Registration number was different.", date: "Yesterday", status: "open" as DisputeStatus },
  { id: 3, reporter: "Neha Gupta", against: "Ramu Selvam", reason: "No-show", details: "Driver confirmed pickup but never arrived. No response to calls.", date: "2 days ago", status: "escalated" as DisputeStatus },
  { id: 4, reporter: "Priya Sharma", against: "Karthik Rajan", reason: "Harassment", details: "Inappropriate messages sent through chat after trip completion.", date: "3 days ago", status: "resolved" as DisputeStatus },
];

const REFUNDS = [
  { id: 1, user: "Selvin Raj", bookingId: "BK-20481", amount: 2352, reason: "Cancelled — driver no-show", requestedOn: "Today, 09:45 AM", status: "pending" as RefundStatus },
  { id: 2, user: "Priya Sharma", bookingId: "BK-19100", amount: 499, reason: "Cancelled 48h before trip", requestedOn: "Yesterday, 03:00 PM", status: "pending" as RefundStatus },
  { id: 3, user: "Meera S.", bookingId: "BK-18500", amount: 1820, reason: "Vehicle damage — dispute resolved", requestedOn: "2 days ago", status: "approved" as RefundStatus },
  { id: 4, user: "Arjun Reddy", bookingId: "BK-17300", amount: 3200, reason: "Duplicate payment", requestedOn: "4 days ago", status: "approved" as RefundStatus },
  { id: 5, user: "Vikram Patel", bookingId: "BK-16200", amount: 2100, reason: "Cancelled within 2h — penalty applicable", requestedOn: "5 days ago", status: "rejected" as RefundStatus },
];

const VEHICLES = [
  { id: 1, owner: "Selvin Raj", vehicle: "Honda City", regNo: "TN09AB1234", type: "Car", insurance: "Valid Dec 2026", listed: "Jan 2026", trips: 12, status: "active", verified: true },
  { id: 2, owner: "Kavitha S.", vehicle: "Maruti Swift", regNo: "TN22CD5678", type: "Car", insurance: "Valid Mar 2027", listed: "Feb 2026", trips: 8, status: "active", verified: true },
  { id: 3, owner: "Prakash N.", vehicle: "Hyundai Creta", regNo: "TN45EF9012", type: "SUV", insurance: "Valid Jun 2027", listed: "Mar 2026", trips: 5, status: "active", verified: false },
  { id: 4, owner: "Suresh K.", vehicle: "Bajaj Pulsar", regNo: "TN56IJ7890", type: "Bike", insurance: "Expired", listed: "Apr 2026", trips: 0, status: "suspended", verified: false },
  { id: 5, owner: "Ramu Selvam", vehicle: "Toyota Innova", regNo: "TN01GH3456", type: "SUV", insurance: "Valid Aug 2026", listed: "Jan 2026", trips: 19, status: "active", verified: true },
];

const REVIEWS = [
  { id: 1, reviewer: "Selvin Raj", about: "Karthik Rajan", rating: 5, text: "Excellent driver, very professional!", trip: "Chennai → Bangalore", date: "Today", flagged: false },
  { id: 2, reviewer: "Arjun Reddy", about: "Priya Sharma", rating: 1, text: "Scammer! Fake profile! DO NOT USE! @@@@", trip: "Coimbatore → Chennai", date: "Yesterday", flagged: true },
  { id: 3, reviewer: "Vikram Patel", about: "Deepika M.", rating: 2, text: "She cancelled last minute and wasted my whole day. Very bad.", trip: "Pune → Mumbai", date: "2 days ago", flagged: true },
  { id: 4, reviewer: "Neha Gupta", about: "Ramu Selvam", rating: 4, text: "Good driver, arrived on time. Slightly fast on highway.", trip: "Delhi → Gurgaon", date: "3 days ago", flagged: false },
];

/* ─────────────────────────── HELPERS ───────────────────────── */
const userStatusStyle: Record<UserStatus, string> = {
  active: "bg-blue-100 text-blue-700",
  suspended: "bg-yellow-100 text-yellow-700",
  banned: "bg-red-100 text-red-700",
};
const docStatusStyle: Record<DocStatus, string> = {
  pending: "bg-orange-100 text-orange-700",
  verified: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};
const refundStatusStyle: Record<RefundStatus, string> = {
  pending: "bg-orange-100 text-orange-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};
const disputeStatusStyle: Record<DisputeStatus, string> = {
  open: "bg-orange-100 text-orange-700",
  escalated: "bg-red-100 text-red-700",
  resolved: "bg-blue-100 text-blue-700",
};

/* ─────────────────────────── COMPONENT ─────────────────────── */
export default function AdminDashboard() {
  const { toast } = useToast();

  /* State */
  const [requests, setRequests] = useState(PENDING_REQUESTS);
  const [users, setUsers] = useState(ALL_USERS);
  const [docs, setDocs] = useState(DOCUMENTS);
  const [reports, setReports] = useState(REPORTS);
  const [refunds, setRefunds] = useState(REFUNDS);
  const [vehicles, setVehicles] = useState(VEHICLES);
  const [reviews, setReviews] = useState(REVIEWS);
  const [userSearch, setUserSearch] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [commissionPct, setCommissionPct] = useState(12);
  const [activeEnquiryId, setActiveEnquiryId] = useState<number | null>(null);
  const [mdReply, setMdReply] = useState("");

  /* Enquiries (live data) */
  const { data: enquiries = [] } = useQuery<EnquiryWithMeta[]>({
    queryKey: ["/api/enquiries"],
    refetchInterval: 8000,
  });
  const { data: activeThread } = useQuery<{ enquiry: Enquiry; messages: EnquiryMessage[] }>({
    queryKey: ["/api/enquiries", activeEnquiryId, "messages"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/enquiries/${activeEnquiryId}/messages`);
      return await res.json();
    },
    enabled: activeEnquiryId !== null,
    refetchInterval: 5000,
  });
  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", `/api/enquiries/${activeEnquiryId}/messages`, { sender: "md", message });
      return await res.json();
    },
    onSuccess: () => {
      setMdReply("");
      queryClient.invalidateQueries({ queryKey: ["/api/enquiries", activeEnquiryId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enquiries"] });
    },
  });
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/enquiries/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enquiries"] });
      if (activeEnquiryId) queryClient.invalidateQueries({ queryKey: ["/api/enquiries", activeEnquiryId, "messages"] });
    },
  });
  const newEnquiryCount = enquiries.filter(e => e.status === "new").length;

  /* Derived */
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const docPending = docs.filter(d => d.status === "pending").length;
  const reportOpen = reports.filter(r => r.status === "open" || r.status === "escalated").length;
  const refundPending = refunds.filter(r => r.status === "pending").length;
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.city.toLowerCase().includes(userSearch.toLowerCase())
  );

  /* Actions */
  const approveRequest = (id: number) => { setRequests(p => p.map(r => r.id === id ? { ...r, status: "approved" } : r)); toast({ title: "Approved ✅", description: "Shift request approved." }); };
  const rejectRequest = (id: number) => { setRequests(p => p.map(r => r.id === id ? { ...r, status: "rejected" } : r)); toast({ title: "Rejected", description: "Shift request rejected.", variant: "destructive" }); };
  const updateUserStatus = (id: number, status: UserStatus) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, status } : u));
    toast({ title: `User ${status}`, description: `User has been ${status}.` });
  };
  const verifyDoc = (id: number, approved: boolean) => {
    setDocs(p => p.map(d => d.id === id ? { ...d, status: approved ? "verified" : "rejected" } : d));
    toast({ title: approved ? "Document Verified ✅" : "Document Rejected", description: approved ? "User will be notified." : "User has been notified of rejection." });
  };
  const resolveReport = (id: number) => { setReports(p => p.map(r => r.id === id ? { ...r, status: "resolved" } : r)); toast({ title: "Report Resolved", description: "Marked as resolved." }); };
  const approveRefund = (id: number) => { setRefunds(p => p.map(r => r.id === id ? { ...r, status: "approved" } : r)); toast({ title: "Refund Approved ✅", description: "Refund will be processed in 5–7 days." }); };
  const rejectRefund = (id: number) => { setRefunds(p => p.map(r => r.id === id ? { ...r, status: "rejected" } : r)); toast({ title: "Refund Rejected", variant: "destructive" }); };
  const removeVehicle = (id: number) => { setVehicles(p => p.filter(v => v.id !== id)); toast({ title: "Vehicle Removed", description: "Listing removed from platform.", variant: "destructive" }); };
  const removeReview = (id: number) => { setReviews(p => p.filter(r => r.id !== id)); toast({ title: "Review Removed", description: "The review has been deleted." }); };
  const sendBroadcast = () => { if (!broadcastMsg.trim()) return; toast({ title: "Notification Sent 📢", description: `Sent to all ${users.length} active users.` }); setBroadcastMsg(""); };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    ongoingShifts: 234,
    revenue: { today: 45600, thisWeek: 189300, thisMonth: 756200 },
    shiftTypes: { local: { active: 156, completed: 89, pending: 12 }, interstate: { active: 89, completed: 45, pending: 11 } },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminHeader />

      <div className="container max-w-7xl mx-auto px-4 md:px-6 pb-10">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {[
            { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Today", value: stats.activeUsers.toLocaleString(), icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Ongoing Shifts", value: stats.ongoingShifts, icon: Car, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Revenue Today", value: "₹" + (stats.revenue.today / 1000).toFixed(0) + "k", icon: IndianRupee, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Approvals", value: pendingCount, icon: CheckCircle2, color: pendingCount > 0 ? "text-orange-600" : "text-blue-600", bg: pendingCount > 0 ? "bg-orange-50" : "bg-blue-50" },
            { label: "Doc Reviews", value: docPending, icon: FileText, color: docPending > 0 ? "text-orange-600" : "text-blue-600", bg: docPending > 0 ? "bg-orange-50" : "bg-blue-50" },
            { label: "Open Reports", value: reportOpen, icon: Flag, color: reportOpen > 0 ? "text-red-600" : "text-blue-600", bg: reportOpen > 0 ? "bg-red-50" : "bg-blue-50" },
            { label: "Refund Req.", value: refundPending, icon: CreditCard, color: refundPending > 0 ? "text-orange-600" : "text-blue-600", bg: refundPending > 0 ? "bg-orange-50" : "bg-blue-50" },
          ].map(kpi => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <div className={`text-xl font-extrabold ${kpi.color}`}>{kpi.value}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 font-medium">{kpi.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="focus">
          {/* Scrollable tab bar */}
          <div className="overflow-x-auto pb-1 mb-4">
            <TabsList className="flex w-max gap-1 bg-white border border-neutral-200 p-1 rounded-xl shadow-sm h-auto">
              {[
                { val: "focus", label: "🎯 Focus", badge: 0 },
                { val: "approvals", label: "Approvals", badge: pendingCount },
                { val: "enquiries", label: "Enquiries", badge: newEnquiryCount },
                { val: "users", label: "Users", badge: 0 },
                { val: "documents", label: "Documents", badge: docPending },
                { val: "reports", label: "Reports", badge: reportOpen },
                { val: "refunds", label: "Refunds", badge: refundPending },
                { val: "vehicles", label: "Vehicles", badge: 0 },
                { val: "reviews", label: "Reviews", badge: reviews.filter(r => r.flagged).length },
                { val: "broadcast", label: "Broadcast", badge: 0 },
                { val: "settings", label: "Settings", badge: 0 },
                { val: "overview", label: "Overview", badge: 0 },
              ].map(tab => (
                <TabsTrigger key={tab.val} value={tab.val}
                  className="relative whitespace-nowrap text-xs font-semibold px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{tab.badge}</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── 0. FOCUS & INSIGHTS ── */}
          <TabsContent value="focus" className="space-y-5">
            <div>
              <h2 className="text-xl font-bold">Your Focus Dashboard</h2>
              <p className="text-sm text-gray-500 mt-0.5">A clear picture of what needs attention, where the money is, and how to grow Shiftzy Go</p>
            </div>

            {/* Urgent Action Items */}
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">🔴 Urgent — Act Today</p>
              <div className="grid gap-2">
                {[
                  { icon: "📄", title: `${docPending} Document${docPending !== 1 ? "s" : ""} Awaiting Verification`, desc: "Pending DL & RC checks are blocking users from booking. Each delay = lost revenue.", action: "Review Documents", tab: "documents" },
                  { icon: "⚠️", title: `${reportOpen} Open Report${reportOpen !== 1 ? "s" : ""}`, desc: "Unresolved disputes hurt trust. Resolve within 24h to maintain platform credibility.", action: "View Reports", tab: "reports" },
                  { icon: "💸", title: `₹${refunds.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0).toLocaleString()} in Pending Refunds`, desc: "Fast refunds = happy customers who come back. Delayed refunds cause chargebacks.", action: "Process Refunds", tab: "refunds" },
                  ...(pendingCount > 0 ? [{ icon: "🚗", title: `${pendingCount} Shift Request${pendingCount !== 1 ? "s" : ""} Pending Approval`, desc: "Owners are waiting. Approve or reject promptly so they can plan.", action: "Review Requests", tab: "approvals" }] : []),
                ].map((item, i) => (
                  <div key={i} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-red-800">{item.title}</p>
                      <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">💰 Revenue — Where the Money Comes From</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Today", value: "₹45,600", growth: "+8%", sub: "18 trips completed" },
                  { label: "This Week", value: "₹1,89,300", growth: "+12%", sub: "72 trips" },
                  { label: "This Month", value: "₹7,56,200", growth: "+15%", sub: "Est. 280 trips" },
                  { label: "Platform Fee", value: `₹${(756200 * commissionPct / 100).toLocaleString()}`, growth: `${commissionPct}%`, sub: "this month" },
                ].map((r, i) => (
                  <div key={i} className="bg-white border border-blue-100 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 font-medium">{r.label}</p>
                    <p className="text-xl font-extrabold text-blue-700 mt-0.5">{r.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-blue-500">{r.growth}</span>
                      <span className="text-[10px] text-gray-400">{r.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">Trip Type Split</p>
                  {[
                    { label: "Local (City)", count: 156, pct: 64, color: "bg-blue-500" },
                    { label: "Outstation", count: 89, pct: 36, color: "bg-orange-500" },
                  ].map(t => (
                    <div key={t.label} className="mb-2">
                      <div className="flex justify-between text-xs mb-0.5"><span>{t.label}</span><span className="font-bold">{t.count} active</span></div>
                      <div className="h-1.5 bg-neutral-100 rounded-full"><div className={`h-1.5 ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">Vehicle Type Demand</p>
                  {[
                    { label: "Car", pct: 42, color: "bg-sky-500" },
                    { label: "SUV", pct: 31, color: "bg-emerald-500" },
                    { label: "Bike", pct: 19, color: "bg-blue-500" },
                    { label: "Premium", pct: 8, color: "bg-purple-500" },
                  ].map(t => (
                    <div key={t.label} className="mb-1.5">
                      <div className="flex justify-between text-xs mb-0.5"><span>{t.label}</span><span className="font-bold">{t.pct}%</span></div>
                      <div className="h-1.5 bg-neutral-100 rounded-full"><div className={`h-1.5 ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Satisfaction */}
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">😊 Customer Satisfaction</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { emoji: "⭐", label: "Avg Platform Rating", value: "4.7 / 5", note: "Based on 1,200+ reviews" },
                  { emoji: "🔄", label: "Repeat Bookings", value: "68%", note: "Users who booked 2+ times" },
                  { emoji: "⏱️", label: "Avg Response Time", value: "4.2 min", note: "Owner to booking confirm" },
                  { emoji: "🚩", label: "Complaint Rate", value: "1.8%", note: "Of all completed trips" },
                ].map((s, i) => (
                  <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <span className="text-2xl">{s.emoji}</span>
                    <p className="font-extrabold text-lg text-emerald-700 mt-1">{s.value}</p>
                    <p className="text-xs font-semibold text-emerald-600">{s.label}</p>
                    <p className="text-[10px] text-emerald-500 mt-0.5">{s.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Opportunities */}
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">📈 Growth Opportunities — Where to Focus Next</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: "🏙️", title: "Expand to Trichy & Salem", desc: "High search volume from these cities with zero supply. Low cost to onboard 5–10 vehicles each. Potential: ₹80k/month additional.", priority: "High" },
                  { icon: "🏍️", title: "Push Bike Category in Chennai", desc: "Bikes are fastest-growing (19% demand). Only 3 bikes listed. Each bike = ₹8,000–15,000/month revenue. Recruit actively.", priority: "High" },
                  { icon: "👑", title: "Premium Tier — Underserved", desc: "Only 8% demand but highest margin. Onboarding 2–3 premium vehicles (BMW/Audi) for Chennai–Bangalore route could generate ₹50k/month.", priority: "Medium" },
                  { icon: "📱", title: "Reduce Doc Verification Time", desc: "Current avg: 18 hours. Target: 2 hours. Faster verification = faster activation = more bookings. Consider a part-time verifier.", priority: "Medium" },
                  { icon: "🤝", title: "Referral Program", desc: "68% repeat users means word-of-mouth works. A ₹200 referral bonus could 2x new user growth with low spend.", priority: "Quick Win" },
                  { icon: "⭐", title: "Drive Reviews for Low-rated Drivers", desc: `${users.filter(u => u.rating > 0 && u.rating < 4).length} drivers have rating below 4.0. Alert them + offer coaching. Poor ratings kill repeat business.`, priority: "Quick Win" },
                ].map((opp, i) => (
                  <div key={i} className="bg-white border border-purple-100 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{opp.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm">{opp.title}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${opp.priority === "High" ? "bg-red-100 text-red-700" : opp.priority === "Medium" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{opp.priority}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{opp.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">⚡ Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Send Promo Notification", emoji: "📢" },
                  { label: "Export User List", emoji: "📊" },
                  { label: "Add New City", emoji: "🗺️" },
                  { label: "Review Commission Rate", emoji: "💰" },
                  { label: "Verify All Pending Docs", emoji: "✅" },
                ].map((a, i) => (
                  <button key={i} onClick={() => toast({ title: `${a.emoji} ${a.label}`, description: "Feature coming soon!" })}
                    className="flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-full transition-all active:scale-95">
                    <span>{a.emoji}</span> {a.label}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── 1. APPROVALS ── */}
          <TabsContent value="approvals" className="space-y-3">
            <div className="flex items-center justify-between">
              <div><h2 className="text-lg font-bold">Shift Request Approvals</h2><p className="text-sm text-gray-500">Review and approve or reject incoming shift requests</p></div>
              <div className="flex gap-2 text-xs">
                <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full">{requests.filter(r => r.status === "pending").length} Pending</span>
                <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">{requests.filter(r => r.status === "approved").length} Approved</span>
                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full">{requests.filter(r => r.status === "rejected").length} Rejected</span>
              </div>
            </div>
            {requests.map(req => (
              <Card key={req.id} className={req.status === "approved" ? "border-blue-200 bg-blue-50/40" : req.status === "rejected" ? "border-red-200 bg-red-50/40 opacity-70" : "border-orange-200"}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm">{req.owner} — {req.vehicle}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${req.status === "pending" ? "bg-orange-100 text-orange-700" : req.status === "approved" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                          {req.status === "pending" ? "⏳ Pending" : req.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                        </span>
                        {req.insurance.includes("Expired") && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">⚠ Insurance Expired</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        <span>Reg: <strong className="text-gray-700">{req.regNo}</strong></span>
                        <span>Route: <strong className="text-gray-700">{req.route}</strong></span>
                        <span>Insurance: <strong className={req.insurance.includes("Expired") ? "text-red-600" : "text-gray-700"}>{req.insurance}</strong></span>
                        <span>Submitted: <strong className="text-gray-700">{req.requestedOn}</strong></span>
                      </div>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" onClick={() => approveRequest(req.id)} className="bg-blue-600 hover:bg-blue-700 text-white gap-1 h-8 px-3"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => rejectRequest(req.id)} className="border-red-300 text-red-600 hover:bg-red-50 gap-1 h-8 px-3"><XCircle className="w-3.5 h-3.5" /> Reject</Button>
                      </div>
                    )}
                    {req.status === "approved" && <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />}
                    {req.status === "rejected" && <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── CUSTOMER ENQUIRIES (MD desk) ── */}
          <TabsContent value="enquiries" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Customer Enquiries</h2>
                <p className="text-sm text-gray-500">Questions routed directly to the MD's desk</p>
              </div>
              <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-xs">{newEnquiryCount} New</span>
            </div>

            {enquiries.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-gray-400">No enquiries yet.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Inbox list */}
                <div className="space-y-2">
                  {enquiries.map(e => (
                    <button
                      key={e.id}
                      onClick={() => setActiveEnquiryId(e.id)}
                      className={`w-full text-left rounded-xl border p-3 transition-colors ${activeEnquiryId === e.id ? "border-blue-500 bg-blue-50/60" : "border-neutral-200 bg-white hover:border-blue-300"}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-sm truncate">{e.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${e.status === "new" ? "bg-orange-100 text-orange-700" : e.status === "resolved" ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-600"}`}>
                          {(e.status || "new").replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                        <MapPin className="w-3 h-3" /> {e.pickup} → {e.drop} · {e.vehicleType}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {e.phone}
                      </p>
                      {e.lastMessage && (
                        <p className="text-xs text-gray-500 mt-1 truncate italic">"{e.lastMessage.message}"</p>
                      )}
                    </button>
                  ))}
                </div>

                {/* Thread + reply */}
                <Card className="lg:sticky lg:top-4 h-fit">
                  {!activeThread ? (
                    <CardContent className="p-8 text-center text-sm text-gray-400">
                      Select an enquiry to view the conversation.
                    </CardContent>
                  ) : (
                    <CardContent className="p-4">
                      <div className="border-b pb-3 mb-3">
                        <p className="font-bold text-sm">{activeThread.enquiry.name}</p>
                        <p className="text-xs text-gray-500">{activeThread.enquiry.pickup} → {activeThread.enquiry.drop} · {activeThread.enquiry.vehicleType}</p>
                        {activeThread.enquiry.preferredDate && <p className="text-xs text-gray-500">Preferred: {activeThread.enquiry.preferredDate}</p>}
                        <div className="flex gap-1.5 mt-2">
                          {["new", "in_progress", "resolved"].map(s => (
                            <button
                              key={s}
                              onClick={() => statusMutation.mutate({ id: activeThread.enquiry.id, status: s })}
                              className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${activeThread.enquiry.status === s ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-600"}`}
                            >
                              {s.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto mb-3">
                        {activeThread.messages.map(m => {
                          const isMd = m.sender === "md";
                          return (
                            <div key={m.id} className={`flex ${isMd ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${isMd ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-800"}`}>
                                <p className="text-[10px] font-bold mb-0.5 opacity-70">{isMd ? "MD Desk" : activeThread.enquiry.name}</p>
                                {m.message}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={mdReply}
                          onChange={(e) => setMdReply(e.target.value)}
                          placeholder="Reply to customer…"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && mdReply.trim()) replyMutation.mutate(mdReply);
                          }}
                        />
                        <Button size="icon" disabled={!mdReply.trim() || replyMutation.isPending} onClick={() => replyMutation.mutate(mdReply)}>
                          <Send size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ── 2. USERS ── */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="text-lg font-bold">User Management</h2><p className="text-sm text-gray-500">{users.length} total users · {users.filter(u => u.status === "active").length} active</p></div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name, city..." className="pl-9 h-9" />
              </div>
            </div>
            <div className="grid gap-3">
              {filteredUsers.map(u => (
                <Card key={u.id} className={u.status === "banned" ? "opacity-60 border-red-200" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{u.name}</p>
                            {u.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${userStatusStyle[u.status]}`}>{u.status}</span>
                          </div>
                          <p className="text-xs text-gray-500">@{u.username} · {u.city} · {u.role} · {u.trips} trips · ⭐{u.rating > 0 ? u.rating : "—"}</p>
                          <p className="text-[10px] text-gray-400">{u.phone} · Joined {u.joinedOn}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap shrink-0">
                        {u.status === "active" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateUserStatus(u.id, "suspended")} className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 h-8 text-xs gap-1"><AlertTriangle className="w-3 h-3" /> Suspend</Button>
                            <Button size="sm" variant="outline" onClick={() => updateUserStatus(u.id, "banned")} className="text-red-600 border-red-300 hover:bg-red-50 h-8 text-xs gap-1"><Ban className="w-3 h-3" /> Ban</Button>
                          </>
                        )}
                        {u.status === "suspended" && (
                          <Button size="sm" onClick={() => updateUserStatus(u.id, "active")} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1"><RefreshCw className="w-3 h-3" /> Reinstate</Button>
                        )}
                        {u.status === "banned" && (
                          <Button size="sm" onClick={() => updateUserStatus(u.id, "active")} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1"><RefreshCw className="w-3 h-3" /> Unban</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── 3. DOCUMENTS ── */}
          <TabsContent value="documents" className="space-y-4">
            <div><h2 className="text-lg font-bold">Document Verification</h2><p className="text-sm text-gray-500">Review uploaded DL, Aadhaar, and RC documents before approving users</p></div>
            <div className="grid gap-3">
              {docs.map(d => (
                <Card key={d.id} className={d.status === "verified" ? "border-blue-200 bg-blue-50/30" : d.status === "rejected" ? "border-red-200 bg-red-50/30 opacity-70" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <p className="font-bold text-sm">{d.user} — {d.type}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${docStatusStyle[d.status]}`}>{d.status.charAt(0).toUpperCase() + d.status.slice(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500">Doc Ref: <strong>{d.docRef}</strong> · Submitted: {d.submittedOn}</p>
                        {d.notes && <p className="text-xs text-gray-400 mt-1 italic">{d.notes}</p>}
                      </div>
                      {d.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" onClick={() => verifyDoc(d.id, true)} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verify</Button>
                          <Button size="sm" variant="outline" onClick={() => verifyDoc(d.id, false)} className="text-red-600 border-red-300 hover:bg-red-50 h-8 text-xs gap-1"><XCircle className="w-3.5 h-3.5" /> Reject</Button>
                        </div>
                      )}
                      {d.status === "verified" && <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />}
                      {d.status === "rejected" && <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── 4. REPORTS / DISPUTES ── */}
          <TabsContent value="reports" className="space-y-4">
            <div><h2 className="text-lg font-bold">Reports & Disputes</h2><p className="text-sm text-gray-500">Handle complaints between users and take necessary action</p></div>
            <div className="grid gap-3">
              {reports.map(r => (
                <Card key={r.id} className={r.status === "resolved" ? "border-blue-200 bg-blue-50/30 opacity-80" : r.status === "escalated" ? "border-red-200" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Flag className="w-4 h-4 text-red-500" />
                          <p className="font-bold text-sm">{r.reporter} reported {r.against}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${disputeStatusStyle[r.status]}`}>{r.status}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Reason: {r.reason}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">"{r.details}"</p>
                        <p className="text-[10px] text-gray-400 mt-1">{r.date}</p>
                      </div>
                      {r.status !== "resolved" && (
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" onClick={() => resolveReport(r.id)} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Resolve</Button>
                          <Button size="sm" variant="outline" onClick={() => { updateUserStatus(users.find(u => u.name.startsWith(r.against.split(" ")[0]))?.id || 0, "suspended"); resolveReport(r.id); }}
                            className="text-orange-600 border-orange-300 hover:bg-orange-50 h-8 text-xs gap-1"><AlertTriangle className="w-3 h-3" /> Suspend User</Button>
                        </div>
                      )}
                      {r.status === "resolved" && <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── 5. REFUNDS ── */}
          <TabsContent value="refunds" className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h2 className="text-lg font-bold">Refund Requests</h2><p className="text-sm text-gray-500">Review and process user refund requests</p></div>
              <div className="text-xs text-gray-500 bg-white border rounded-lg px-3 py-1.5">
                Total pending: <strong className="text-orange-600">₹{refunds.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0).toLocaleString()}</strong>
              </div>
            </div>
            <div className="grid gap-3">
              {refunds.map(r => (
                <Card key={r.id} className={r.status === "approved" ? "border-blue-200 bg-blue-50/30" : r.status === "rejected" ? "border-red-200 bg-red-50/30 opacity-70" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-4 h-4 text-blue-500" />
                          <p className="font-bold text-sm">{r.user} — {r.bookingId}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${refundStatusStyle[r.status]}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500">Reason: {r.reason}</p>
                        <p className="text-xs text-gray-400">{r.requestedOn}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="font-extrabold text-lg text-blue-700">₹{r.amount.toLocaleString()}</p>
                        {r.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => approveRefund(r.id)} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => rejectRefund(r.id)} className="text-red-600 border-red-300 hover:bg-red-50 h-8 text-xs gap-1"><XCircle className="w-3.5 h-3.5" /> Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── 6. VEHICLES ── */}
          <TabsContent value="vehicles" className="space-y-4">
            <div><h2 className="text-lg font-bold">Vehicle Listings</h2><p className="text-sm text-gray-500">Manage all listed vehicles — verify, suspend, or remove listings</p></div>
            <div className="grid gap-3">
              {vehicles.map(v => (
                <Card key={v.id} className={v.status === "suspended" ? "border-yellow-200 bg-yellow-50/30 opacity-80" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{v.vehicle}</p>
                            {v.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                            {!v.verified && <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">Unverified</span>}
                            {v.insurance.includes("Expired") && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">⚠ Insurance</span>}
                          </div>
                          <p className="text-xs text-gray-500">{v.regNo} · {v.type} · Owner: {v.owner} · {v.trips} trips</p>
                          <p className="text-[10px] text-gray-400">Insurance: {v.insurance} · Listed: {v.listed}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!v.verified && (
                          <Button size="sm" onClick={() => { setVehicles(p => p.map(veh => veh.id === v.id ? { ...veh, verified: true } : veh)); toast({ title: "Vehicle Verified ✅" }); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Verify</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => removeVehicle(v.id)} className="text-red-600 border-red-300 hover:bg-red-50 h-8 text-xs gap-1"><Trash2 className="w-3 h-3" /> Remove</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── 7. REVIEWS MODERATION ── */}
          <TabsContent value="reviews" className="space-y-4">
            <div><h2 className="text-lg font-bold">Review Moderation</h2><p className="text-sm text-gray-500">Review flagged or abusive content and remove if necessary</p></div>
            <div className="grid gap-3">
              {reviews.map(r => (
                <Card key={r.id} className={r.flagged ? "border-orange-300 bg-orange-50/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <p className="font-bold text-sm">{r.reviewer} → {r.about}</p>
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">⭐ {r.rating}/5</span>
                          {r.flagged && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">🚩 Flagged</span>}
                        </div>
                        <p className="text-sm text-gray-700 italic">"{r.text}"</p>
                        <p className="text-[10px] text-gray-400 mt-1">{r.trip} · {r.date}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => removeReview(r.id)} className="text-red-600 border-red-300 hover:bg-red-50 h-8 text-xs gap-1 shrink-0"><Trash2 className="w-3 h-3" /> Remove</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── 8. BROADCAST ── */}
          <TabsContent value="broadcast" className="space-y-4">
            <div><h2 className="text-lg font-bold">Broadcast Notifications</h2><p className="text-sm text-gray-500">Send in-app notifications to all users or specific groups</p></div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Target Audience</label>
                  <div className="flex flex-wrap gap-2">
                    {["All Users", "Vehicle Owners", "Travelers", "Unverified Users", "Inactive (30d+)"].map(seg => (
                      <button key={seg} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                        {seg}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Notification Type</label>
                  <div className="flex gap-2">
                    {["In-App Alert", "SMS", "Email"].map(t => (
                      <button key={t} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Message</label>
                  <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} rows={4} placeholder="Type your message to users here..." className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 resize-none" />
                  <p className="text-xs text-gray-400 mt-1">{broadcastMsg.length}/300 characters</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={sendBroadcast} disabled={!broadcastMsg.trim()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Send className="w-4 h-4" /> Send to All Users ({users.filter(u => u.status === "active").length})
                  </Button>
                  <Button variant="outline" onClick={() => toast({ title: "Scheduled", description: "Notification saved as draft." })} className="gap-2 border-neutral-200">
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent broadcasts */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Broadcasts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { msg: "🔧 Maintenance at 2AM tonight. App may be unavailable for 30 min.", sent: "Yesterday, 6PM", reach: 4210 },
                  { msg: "🚗 Drive safe! Always verify pickup & drop details before starting a trip.", sent: "3 days ago", reach: 4305 },
                  { msg: "📢 Now serving Chennai, Bangalore, Coimbatore, Madurai & Pondicherry!", sent: "1 week ago", reach: 3980 },
                ].map((b, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                    <div><p className="text-sm font-medium">{b.msg}</p><p className="text-xs text-gray-400 mt-0.5">{b.sent} · {b.reach.toLocaleString()} users reached</p></div>
                    <Bell className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── 9. SETTINGS ── */}
          <TabsContent value="settings" className="space-y-4">
            <div><h2 className="text-lg font-bold">Platform Settings</h2><p className="text-sm text-gray-500">Configure commission, cancellation policy, and platform rules</p></div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Commission */}
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><IndianRupee className="w-4 h-4 text-blue-600" />Commission & Fees</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-semibold text-gray-700">Platform Commission</label>
                      <span className="text-sm font-extrabold text-blue-600">{commissionPct}%</span>
                    </div>
                    <input type="range" min={5} max={25} step={1} value={commissionPct} onChange={e => setCommissionPct(Number(e.target.value))} className="w-full accent-blue-600" />
                    <div className="flex justify-between text-[10px] text-gray-400"><span>5%</span><span>25%</span></div>
                    <p className="text-xs text-gray-500 mt-2">Currently: {commissionPct}% of trip value · e.g. ₹3,000 trip → ₹{(3000 * commissionPct / 100).toFixed(0)} platform fee</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Insurance Add-on</span><strong>₹499 flat</strong></div>
                    <div className="flex justify-between text-sm"><span>Cancellation Fee (&lt;24h)</span><strong>₹500</strong></div>
                  </div>
                  <Button onClick={() => toast({ title: "Settings Saved ✅", description: `Commission set to ${commissionPct}%.` })} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Commission Settings</Button>
                </CardContent>
              </Card>

              {/* Cancellation Policy */}
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Settings className="w-4 h-4 text-orange-500" />Cancellation Policy</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { window: ">72 hours before", refund: "100% refund", editable: false },
                    { window: "24–72 hours before", refund: "75% refund", editable: false },
                    { window: "<24 hours before", refund: "50% refund (₹500 penalty)", editable: false },
                    { window: "Same day / no-show", refund: "No refund", editable: false },
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                      <span className="text-sm text-gray-600">{p.window}</span>
                      <span className="text-sm font-bold text-blue-700">{p.refund}</span>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => toast({ title: "Policy editor coming soon!" })} className="w-full border-orange-300 text-orange-600 hover:bg-orange-50">Edit Policy</Button>
                </CardContent>
              </Card>

              {/* Allowed cities */}
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600" />Service Area</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500 mb-3">Currently active cities</p>
                  <div className="flex flex-wrap gap-2">
                    {["Chennai", "Bangalore", "Coimbatore", "Madurai", "Pondicherry"].map(city => (
                      <span key={city} className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">{city}</span>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => toast({ title: "City Manager coming soon!" })} className="w-full mt-4 border-blue-200 text-blue-600 hover:bg-blue-50">+ Add City</Button>
                </CardContent>
              </Card>

              {/* Feature flags */}
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-600" />Feature Toggles</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Trip Insurance Add-on", enabled: true },
                    { label: "Live GPS Tracking", enabled: false },
                    { label: "New User Registrations", enabled: true },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{f.label}</span>
                      <button onClick={() => toast({ title: `${f.label} toggled` })}
                        className={`w-10 h-5 rounded-full transition-colors ${f.enabled ? "bg-blue-600" : "bg-neutral-300"} relative`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${f.enabled ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── 10. OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Recent Activities</CardTitle><CardDescription>Latest platform activities and transactions</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Rajesh Kumar completed shift", sub: "Honda City · Chennai → Bangalore", time: "2 min ago", color: "bg-blue-500" },
                      { label: "Priya Sharma registered", sub: "Mumbai · New owner", time: "5 min ago", color: "bg-blue-500" },
                      { label: "Payment received ₹2,800", sub: "Amit Singh · BK-19400", time: "8 min ago", color: "bg-yellow-500" },
                      { label: "Shift started", sub: "Neha Gupta · Maruti Swift", time: "12 min ago", color: "bg-purple-500" },
                      { label: "Support ticket opened", sub: "Vikram Patel · Payment issue", time: "15 min ago", color: "bg-red-500" },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${a.color}`} />
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{a.label}</p><p className="text-xs text-gray-400 truncate">{a.sub} · {a.time}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Revenue Overview</CardTitle><CardDescription>Platform earnings at a glance</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[{ label: "Today", value: "₹45,600", pct: "+8%", color: "text-blue-600" }, { label: "This Week", value: "₹1,89,300", pct: "+12%", color: "text-blue-600" }, { label: "This Month", value: "₹7,56,200", pct: "+15%", color: "text-blue-600" }].map(r => (
                      <div key={r.label} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-600">{r.label}</span>
                        <div className="text-right"><span className="font-bold text-base">{r.value}</span><span className={`text-xs ml-2 font-semibold ${r.color}`}>{r.pct}</span></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-xs text-blue-500 font-semibold">Local Shifts</p><p className="font-bold text-blue-700 text-lg">156</p><p className="text-[10px] text-blue-400">active</p></div>
                    <div className="bg-orange-50 rounded-xl p-3 text-center"><p className="text-xs text-orange-500 font-semibold">Interstate</p><p className="font-bold text-orange-700 text-lg">89</p><p className="text-[10px] text-orange-400">active</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
