import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminHeader from "@/components/layout/AdminHeader";
import {
  CheckCircle2, XCircle, AlertTriangle, Users, Car, FileText,
  Send, IndianRupee, Activity, Phone, MapPin, Compass, LayoutDashboard,
  ClipboardList, Receipt, MessageSquare, MapIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useIsDesktop } from "@/hooks/use-desktop";
import type { Enquiry, EnquiryMessage } from "@shared/schema";

type EnquiryWithMeta = Enquiry & { messageCount: number; lastMessage?: EnquiryMessage };

/* ── Real ShiftRequest → Trip → Payment data ── */
type AdminCustomer = { id: number; name: string; email: string; phone: string | null } | null;
type AdminTrip = {
  id: number; price: string; status: string; distance: string | null;
  driverName: string | null; driverPhone: string | null;
  startDate: string | null; endDate: string | null; notes: string | null; createdAt: string | null;
} | null;
type AdminPayment = {
  id: number; status: string; amount: string; method: string | null;
  referenceId: string | null; providerOrderId: string; paidAt: string | null;
} | null;
type AdminShiftRequest = {
  id: number; userId: number | null; pickupLocation: string; dropLocation: string;
  insuranceExpiryDate: string; status: string; createdAt: string | null;
  rejectionReason: string | null;
  customer: AdminCustomer;
  vehicle: { id: number; make: string; model: string; registrationNumber: string; type: string } | null;
  trip: AdminTrip;
  payment: AdminPayment;
};
type AdminBooking = AdminTrip & {
  shiftRequest: { id: number; pickupLocation: string; dropLocation: string; status: string };
  customer: AdminCustomer;
  payment: AdminPayment;
};
type AdminSummary = {
  pendingRequests: number;
  activeTrips: number;
  completedTrips: number;
  totalUsers: number;
  totalCustomers: number;
  paymentsPaidToday: number;
  revenueToday: number;
  revenueAllTime: number;
  openEnquiries: number;
};

const TRIP_STATUS_STYLE: Record<string, string> = {
  awaiting_payment: "bg-orange-100 text-orange-700",
  scheduled: "bg-blue-100 text-blue-700",
  in_transit: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
const PAYMENT_STATUS_STYLE: Record<string, string> = {
  created: "bg-neutral-100 text-neutral-600",
  pending: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
};
const MANUAL_TRIP_STATUSES = ["scheduled", "in_transit", "completed", "cancelled"] as const;

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// Planned, but not built — shown honestly rather than as fake working tabs.
// Every one of these previously existed as a tab full of hardcoded sample
// data with buttons that only changed local state and reset on refresh.
const ROADMAP_ITEMS = [
  { title: "User management (suspend/ban)", note: "Needs real moderation actions + audit trail on the users table." },
  { title: "Document verification workflow", note: "Document upload/storage is real (Profile → Documents); a dedicated admin review queue and status change on the documents table isn't built yet." },
  { title: "Reports & disputes", note: "No reports table or submission flow exists yet." },
  { title: "Refund processing", note: "No refund flow exists yet — payments are Cashfree pay-in only in V1." },
  { title: "Vehicle listing moderation", note: "Vehicles are created implicitly from shift requests; a standalone listings/marketplace moderation view isn't built." },
  { title: "Review moderation", note: "The review tables exist but have no submission UI or moderation queue yet." },
  { title: "Broadcast notifications", note: "The real notifications table exists (triggered by real events); a manual admin broadcast tool isn't built yet." },
  { title: "Commission / policy settings", note: "Pricing is set manually per trip by an admin; no platform-wide configurable settings exist yet." },
];

/* ─────────────────────────── COMPONENT ─────────────────────── */
export default function AdminDashboard() {
  const { toast } = useToast();
  const isDesktop = useIsDesktop();

  const [activeEnquiryId, setActiveEnquiryId] = useState<number | null>(null);
  const [mdReply, setMdReply] = useState("");

  /* Real aggregate summary — Control Center overview */
  const { data: summary } = useQuery<AdminSummary>({
    queryKey: ["/api/admin/summary"],
    refetchInterval: 15000,
  });

  /* Enquiries (real) */
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

  /* Real shift requests + bookings */
  const { data: adminRequests = [] } = useQuery<AdminShiftRequest[]>({
    queryKey: ["/api/admin/shift-requests"],
    refetchInterval: 10000,
  });
  const { data: adminBookings = [] } = useQuery<AdminBooking[]>({
    queryKey: ["/api/admin/bookings"],
    refetchInterval: 10000,
  });

  const [reviewForm, setReviewForm] = useState<Record<number, { price: string; driverName: string; driverPhone: string; distance: string; notes: string; startDate: string }>>({});
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const emptyForm = { price: "", driverName: "", driverPhone: "", distance: "", notes: "", startDate: "" };
  const setForm = (id: number, patch: Partial<typeof emptyForm>) =>
    setReviewForm(p => ({ ...p, [id]: { ...emptyForm, ...p[id], ...patch } }));

  const invalidateFlow = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/shift-requests"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/summary"] });
  };

  const approveMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, string> }) => {
      const res = await apiRequest("POST", `/api/admin/shift-requests/${id}/approve`, body);
      return res.json();
    },
    onSuccess: () => { invalidateFlow(); toast({ title: "Trip created ✅", description: "Price set and driver assigned. Customer can now pay." }); },
    onError: (e: Error) => toast({ title: "Could not approve", description: e.message.slice(0, 140), variant: "destructive" }),
  });
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await apiRequest("POST", `/api/admin/shift-requests/${id}/reject`, { reason });
      return res.json();
    },
    onSuccess: () => { invalidateFlow(); setRejectingId(null); setRejectReason(""); toast({ title: "Request rejected", variant: "destructive" }); },
    onError: (e: Error) => toast({ title: "Could not reject", description: e.message.slice(0, 140), variant: "destructive" }),
  });
  const tripStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("POST", `/api/admin/trips/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => { invalidateFlow(); toast({ title: "Trip status updated" }); },
    onError: (e: Error) => toast({ title: "Could not update", description: e.message.slice(0, 140), variant: "destructive" }),
  });

  const pendingCount = adminRequests.filter(r => r.status === "pending").length;
  const bookingsUnpaid = adminBookings.filter(b => (b?.payment?.status ?? "created") !== "paid" && b?.status !== "cancelled").length;

  const kpis = [
    { label: "Pending Approvals", value: summary?.pendingRequests ?? pendingCount, icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Active Trips", value: summary?.activeTrips ?? 0, icon: Car, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Completed Trips", value: summary?.completedTrips ?? 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Revenue Today", value: inr(summary?.revenueToday ?? 0), icon: IndianRupee, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Payments Today", value: summary?.paymentsPaidToday ?? 0, icon: Receipt, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Customers", value: summary?.totalCustomers ?? 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Open Enquiries", value: summary?.openEnquiries ?? newEnquiryCount, icon: MessageSquare, color: newEnquiryCount > 0 ? "text-red-600" : "text-blue-600", bg: newEnquiryCount > 0 ? "bg-red-50" : "bg-blue-50" },
  ];

  const TABS = [
    { val: "overview", label: "Overview", icon: LayoutDashboard, badge: 0 },
    { val: "approvals", label: "Approvals", icon: ClipboardList, badge: pendingCount },
    { val: "bookings", label: "Bookings", icon: Car, badge: bookingsUnpaid },
    { val: "enquiries", label: "Enquiries", icon: MessageSquare, badge: newEnquiryCount },
    { val: "roadmap", label: "Roadmap", icon: MapIcon, badge: 0 },
  ];

  /* ── Shared tab content (identical for mobile & desktop) ── */
  const overviewTab = (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Control Center</h2>
        <p className="text-sm text-gray-500 mt-0.5">Real, live figures from the database — nothing on this page is sample data.</p>
      </div>

      {(pendingCount > 0 || newEnquiryCount > 0) && (
        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Needs your attention</p>
          <div className="grid gap-2">
            {pendingCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <ClipboardList className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-red-800">{pendingCount} shift request{pendingCount !== 1 ? "s" : ""} awaiting review</p>
                  <p className="text-xs text-red-600 mt-0.5">Price it and assign a driver in the Approvals tab.</p>
                </div>
              </div>
            )}
            {newEnquiryCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-red-800">{newEnquiryCount} new customer enquir{newEnquiryCount !== 1 ? "ies" : "y"}</p>
                  <p className="text-xs text-red-600 mt-0.5">Reply from the Enquiries tab.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Revenue (real, from paid Cashfree payments)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white border border-blue-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 font-medium">Today</p>
            <p className="text-xl font-extrabold text-blue-700 mt-0.5">{inr(summary?.revenueToday ?? 0)}</p>
            <p className="text-[10px] text-gray-400 mt-1">{summary?.paymentsPaidToday ?? 0} payment{(summary?.paymentsPaidToday ?? 0) !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 font-medium">All time</p>
            <p className="text-xl font-extrabold text-blue-700 mt-0.5">{inr(summary?.revenueAllTime ?? 0)}</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 font-medium">Trips</p>
            <p className="text-xl font-extrabold text-blue-700 mt-0.5">{summary?.activeTrips ?? 0} active</p>
            <p className="text-[10px] text-gray-400 mt-1">{summary?.completedTrips ?? 0} completed</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Platform</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white border border-purple-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 font-medium">Total users</p>
            <p className="text-xl font-extrabold text-purple-700 mt-0.5">{summary?.totalUsers ?? 0}</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 font-medium">Customers</p>
            <p className="text-xl font-extrabold text-purple-700 mt-0.5">{summary?.totalCustomers ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const approvalsTab = (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h2 className="text-lg font-bold">Shift Request Approvals</h2><p className="text-sm text-gray-500">Review each request, set the agreed price, and assign a driver manually. Approving creates the customer's Trip.</p></div>
        <div className="flex gap-2 text-xs">
          <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full">{adminRequests.filter(r => r.status === "pending").length} Pending</span>
          <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">{adminRequests.filter(r => r.status === "approved").length} Approved</span>
          <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full">{adminRequests.filter(r => r.status === "rejected").length} Rejected</span>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        V1 honest pilot — pricing and driver assignment here are done manually by the ShiftzyGo team. There is no automated matching engine.
      </p>

      {adminRequests.length === 0 && (
        <Card><CardContent className="p-6 text-center text-sm text-gray-400">No shift requests yet.</CardContent></Card>
      )}

      {adminRequests.map(req => {
        const f = reviewForm[req.id] ?? emptyForm;
        const t = req.trip;
        return (
          <Card key={req.id} className={req.status === "approved" ? "border-blue-200 bg-blue-50/40" : req.status === "rejected" ? "border-red-200 bg-red-50/40" : "border-orange-200"}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-sm">#{req.id} · {req.customer?.name ?? `User ${req.userId ?? "?"}`}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${req.status === "pending" ? "bg-orange-100 text-orange-700" : req.status === "approved" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                      {req.status === "pending" ? "⏳ Pending" : req.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-500">
                    <span className="col-span-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> <strong className="text-gray-700">{req.pickupLocation} → {req.dropLocation}</strong></span>
                    {req.customer?.email && <span className="truncate">Email: <strong className="text-gray-700">{req.customer.email}</strong></span>}
                    {req.customer?.phone && <span>Phone: <strong className="text-gray-700">{req.customer.phone}</strong></span>}
                    {req.vehicle && <span>Vehicle: <strong className="text-gray-700">{req.vehicle.make} {req.vehicle.model}</strong></span>}
                    {req.vehicle && <span>Reg: <strong className="text-gray-700">{req.vehicle.registrationNumber}</strong></span>}
                    <span>Insurance exp: <strong className="text-gray-700">{req.insuranceExpiryDate}</strong></span>
                    {req.createdAt && <span>Submitted: <strong className="text-gray-700">{new Date(req.createdAt).toLocaleString()}</strong></span>}
                  </div>
                </div>
              </div>

              {req.status === "pending" && (
                <div className="border-t pt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Agreed price (₹) *</label>
                      <Input value={f.price} onChange={e => setForm(req.id, { price: e.target.value })} inputMode="numeric" placeholder="e.g. 2400" className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Distance (optional)</label>
                      <Input value={f.distance} onChange={e => setForm(req.id, { distance: e.target.value })} placeholder="e.g. 340 km" className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Driver name</label>
                      <Input value={f.driverName} onChange={e => setForm(req.id, { driverName: e.target.value })} placeholder="Assigned driver" className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Driver phone</label>
                      <Input value={f.driverPhone} onChange={e => setForm(req.id, { driverPhone: e.target.value })} inputMode="tel" placeholder="10-digit mobile" className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Pickup date (optional)</label>
                      <Input type="date" value={f.startDate} onChange={e => setForm(req.id, { startDate: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Notes (optional)</label>
                      <Input value={f.notes} onChange={e => setForm(req.id, { notes: e.target.value })} placeholder="Internal note" className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" disabled={approveMutation.isPending || !(Number(f.price) > 0)}
                      onClick={() => approveMutation.mutate({
                        id: req.id,
                        body: {
                          price: f.price,
                          ...(f.driverName ? { driverName: f.driverName } : {}),
                          ...(f.driverPhone ? { driverPhone: f.driverPhone } : {}),
                          ...(f.distance ? { distance: f.distance } : {}),
                          ...(f.notes ? { notes: f.notes } : {}),
                          ...(f.startDate ? { startDate: f.startDate } : {}),
                        },
                      })}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1 h-8 px-3"><CheckCircle2 className="w-3.5 h-3.5" /> Set price & create Trip</Button>
                    <Button size="sm" variant="outline" onClick={() => { setRejectingId(rejectingId === req.id ? null : req.id); setRejectReason(""); }} className="border-red-300 text-red-600 hover:bg-red-50 gap-1 h-8 px-3"><XCircle className="w-3.5 h-3.5" /> Reject</Button>
                  </div>
                  {rejectingId === req.id && (
                    <div className="flex gap-2 items-center">
                      <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" className="h-8 text-sm" />
                      <Button size="sm" disabled={rejectMutation.isPending || !rejectReason.trim()} onClick={() => rejectMutation.mutate({ id: req.id, reason: rejectReason.trim() })} className="bg-red-600 hover:bg-red-700 text-white h-8 px-3">Confirm</Button>
                    </div>
                  )}
                </div>
              )}

              {req.status === "approved" && t && (
                <div className="border-t pt-3 text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">Trip #{t.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TRIP_STATUS_STYLE[t.status] ?? "bg-gray-100 text-gray-600"}`}>{t.status.replace(/_/g, " ")}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_STYLE[req.payment?.status ?? "created"]}`}>Payment: {req.payment?.status ?? "not started"}</span>
                  </div>
                  <p>Price: <strong className="text-gray-900">₹{Number(t.price).toLocaleString("en-IN")}</strong>{t.distance ? ` · ${t.distance}` : ""}</p>
                  <p>Driver: <strong className="text-gray-900">{t.driverName || "—"}</strong>{t.driverPhone ? ` · ${t.driverPhone}` : ""}</p>
                  <p className="text-gray-400">Manage this booking in the Bookings tab.</p>
                </div>
              )}

              {req.status === "rejected" && (
                <p className="border-t pt-3 text-xs text-red-600">Rejected{req.rejectionReason ? `: ${req.rejectionReason}` : ""}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const bookingsTab = (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h2 className="text-lg font-bold">Bookings</h2><p className="text-sm text-gray-500">Every priced trip created from an approved shift request, with live payment status. Trip status is updated manually.</p></div>
        <div className="flex gap-2 text-xs">
          <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full">{adminBookings.length} Total</span>
          <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">{adminBookings.filter(b => b?.payment?.status === "paid").length} Paid</span>
          <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full">{bookingsUnpaid} Awaiting payment</span>
        </div>
      </div>

      {adminBookings.length === 0 && (
        <Card><CardContent className="p-6 text-center text-sm text-gray-400">No bookings yet. Approve a shift request to create one.</CardContent></Card>
      )}

      {adminBookings.map(b => b && (
        <Card key={b.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-sm">Trip #{b.id}</span>
                  <span className="text-[10px] text-gray-400">from Request #{b.shiftRequest.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TRIP_STATUS_STYLE[b.status] ?? "bg-gray-100 text-gray-600"}`}>{b.status.replace(/_/g, " ")}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_STYLE[b.payment?.status ?? "created"]}`}>Payment: {b.payment?.status ?? "not started"}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-500">
                  <span className="col-span-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> <strong className="text-gray-700">{b.shiftRequest.pickupLocation} → {b.shiftRequest.dropLocation}</strong></span>
                  <span>Customer: <strong className="text-gray-700">{b.customer?.name ?? "—"}</strong></span>
                  <span>Price: <strong className="text-gray-700">₹{Number(b.price).toLocaleString("en-IN")}</strong></span>
                  <span>Driver: <strong className="text-gray-700">{b.driverName || "—"}</strong></span>
                  {b.driverPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {b.driverPhone}</span>}
                  {b.payment?.method && <span>Method: <strong className="text-gray-700">{b.payment.method}</strong></span>}
                  {b.payment?.referenceId && <span>Ref: <strong className="text-gray-700">{b.payment.referenceId}</strong></span>}
                  {b.payment?.paidAt && <span>Paid: <strong className="text-gray-700">{new Date(b.payment.paidAt).toLocaleString()}</strong></span>}
                </div>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Update trip status</p>
              <div className="flex gap-1.5 flex-wrap">
                {MANUAL_TRIP_STATUSES.map(s => (
                  <Button key={s} size="sm" variant={b.status === s ? "default" : "outline"}
                    disabled={tripStatusMutation.isPending || b.status === s}
                    onClick={() => tripStatusMutation.mutate({ id: b.id, status: s })}
                    className={`h-7 px-2.5 text-[11px] ${b.status === s ? "bg-blue-600 text-white" : ""}`}>
                    {s.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Changing trip status never changes payment status — they are tracked separately.</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const enquiriesTab = (
    <div className="space-y-3">
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
    </div>
  );

  const roadmapTab = (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Roadmap</h2>
        <p className="text-sm text-gray-500">
          What's genuinely live above, and what's intentionally not built yet — the Honest Pilot principle means we'd rather show you this list than fake the features.
        </p>
      </div>
      <div className="grid gap-2">
        {ROADMAP_ITEMS.map((item) => (
          <div key={item.title} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-neutral-800">{item.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabContent: Record<string, React.ReactNode> = {
    overview: overviewTab,
    approvals: approvalsTab,
    bookings: bookingsTab,
    enquiries: enquiriesTab,
    roadmap: roadmapTab,
  };

  const kpiRow = (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {kpis.map(kpi => {
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
  );

  if (isDesktop === undefined) return <div className="min-h-screen bg-gray-50" />;

  // ── Desktop: real sidebar "control center" layout ───────────────────────
  if (isDesktop) {
    return <DesktopAdminLayout kpiRow={kpiRow} tabs={TABS} tabContent={tabContent} />;
  }

  // ── Mobile: existing hand-tuned horizontal-tab layout, unchanged ────────
  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminHeader />
      <div className="container max-w-7xl mx-auto px-4 pb-10">
        {kpiRow}
        <Tabs defaultValue="overview">
          <div className="overflow-x-auto pb-1 mb-4">
            <TabsList className="flex w-max gap-1 bg-white border border-neutral-200 p-1 rounded-xl shadow-sm h-auto">
              {TABS.map(tab => (
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
          {TABS.map(tab => (
            <TabsContent key={tab.val} value={tab.val}>{tabContent[tab.val]}</TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

/* ── Desktop-only: sidebar navigation + wide content area ── */
function DesktopAdminLayout({
  kpiRow,
  tabs,
  tabContent,
}: {
  kpiRow: React.ReactNode;
  tabs: { val: string; label: string; icon: any; badge: number }[];
  tabContent: Record<string, React.ReactNode>;
}) {
  const [active, setActive] = useState(tabs[0].val);
  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminHeader />
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {kpiRow}
        <div className="grid grid-cols-[240px_1fr] gap-6 items-start">
          <aside className="sticky top-6 bg-white border border-neutral-200 rounded-2xl p-2 shadow-sm">
            <div className="px-3 py-2 flex items-center gap-2 text-neutral-400 text-[11px] font-bold uppercase tracking-wide">
              <Compass className="w-3.5 h-3.5" /> Control Center
            </div>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.val}
                  onClick={() => setActive(tab.val)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors relative ${
                    active === tab.val ? "bg-blue-600 text-white" : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active === tab.val ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700"}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm min-h-[60vh]">
            {tabContent[active]}
          </div>
        </div>
      </div>
    </div>
  );
}
