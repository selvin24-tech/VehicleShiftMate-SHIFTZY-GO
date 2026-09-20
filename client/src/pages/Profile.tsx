import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BottomNav from "@/components/layout/BottomNav";
import DesktopTopNav from "@/components/layout/DesktopTopNav";
import { useIsDesktop } from "@/hooks/use-desktop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft, ChevronRight, Camera, Edit3, Save, X, Star,
  FileText, Car, Bell, Shield, HelpCircle,
  LogOut, Upload, CheckCircle2, Clock, Flag, Phone, Mail, MapPin,
  Package, BookOpen, Receipt, PhoneCall, Lock
} from "lucide-react";
import { getEmergencyContacts, setEmergencyContacts, type EmergencyContact } from "@/lib/appStore";
import { useCurrentUser, performLogout, useInvalidateCurrentUser } from "@/lib/auth";
import type { DocumentMeta } from "@shared/schema";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

export default function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const invalidateUser = useInvalidateCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dlInputRef = useRef<HTMLInputElement>(null);
  const rcInputRef = useRef<HTMLInputElement>(null);

  const { user, isLoading: userLoading } = useCurrentUser();

  const { data: documents = [] } = useQuery<DocumentMeta[]>({
    queryKey: ["/api/documents"],
    enabled: Boolean(user),
  });
  const rcDoc = documents.find((d) => d.type === "rc");
  const dlDoc = documents.find((d) => d.type === "dl");

  const { data: myRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/shift-requests"],
    enabled: Boolean(user),
  });

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", phone: "", address: "" });
  useEffect(() => {
    if (user) {
      const [firstName, ...rest] = user.name.split(" ");
      setEditData({ firstName, lastName: rest.join(" "), phone: user.phone || "", address: user.address || "" });
    }
  }, [user]);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", next: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<"rc" | "dl" | null>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "docs">(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    return (p === "docs" || p === "bookings") ? p : "profile";
  });
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [contactDraft, setContactDraft] = useState<EmergencyContact[]>(() => {
    const base = getEmergencyContacts();
    return [base[0] ?? { name: "", phone: "" }, base[1] ?? { name: "", phone: "" }];
  });

  const handleSaveContacts = () => {
    const cleaned = contactDraft.filter(c => c.phone.trim());
    setEmergencyContacts(cleaned);
    toast({ title: "Emergency contacts saved", description: "These people can be reached from the SOS button." });
  };

  // Real profile update — PATCH /api/user/profile.
  const handleSave = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: `${editData.firstName} ${editData.lastName}`.trim(),
          phone: editData.phone || undefined,
          address: editData.address || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: "Couldn't save", description: body.message || "Try again.", variant: "destructive" });
        return;
      }
      invalidateUser();
      setEditing(false);
      toast({ title: "Profile Updated", description: "Your details have been saved." });
    } catch {
      toast({ title: "Couldn't save", description: "Check your connection and try again.", variant: "destructive" });
    }
  };

  // Real change-password — verifies the current password server-side.
  const handlePasswordChange = async () => {
    if (!passwordData.current) {
      toast({ title: "Enter current password", variant: "destructive" }); return;
    }
    if (passwordData.next.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters.", variant: "destructive" }); return;
    }
    if (passwordData.next !== passwordData.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.next }),
      });
      setSavingPassword(false);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: "Couldn't change password", description: body.message || "Try again.", variant: "destructive" });
        return;
      }
      setPasswordData({ current: "", next: "", confirm: "" });
      setChangingPassword(false);
      toast({ title: "Password Changed", description: "Your new password is active." });
    } catch {
      setSavingPassword(false);
      toast({ title: "Couldn't change password", description: "Check your connection and try again.", variant: "destructive" });
    }
  };

  const handlePhotoUpload = () => fileInputRef.current?.click();
  const handleDLUpload = () => dlInputRef.current?.click();
  const handleRCUpload = () => rcInputRef.current?.click();

  // Real avatar upload: stored in the documents table, then referenced from
  // users.avatarUrl via the same authenticated streaming endpoint.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "avatar");
      const uploadRes = await fetch("/api/documents", { method: "POST", credentials: "include", body: form });
      const doc = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(doc.message || "Upload failed");

      const patchRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ avatarUrl: `/api/documents/${doc.id}/file` }),
      });
      if (!patchRes.ok) throw new Error("Could not set avatar");

      invalidateUser();
      toast({ title: "Photo Updated", description: "Your profile photo has been saved." });
    } catch (err) {
      toast({ title: "Couldn't upload photo", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Real RC/DL document upload — stored server-side, ownership-checked.
  const uploadDoc = async (file: File, type: "rc" | "dl") => {
    setUploadingDoc(type);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      const res = await fetch("/api/documents", { method: "POST", credentials: "include", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Upload failed");
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: type === "rc" ? "Vehicle RC Uploaded" : "Driving Licence Uploaded",
        description: "Saved. An admin reviews documents manually — verification is not automated.",
      });
    } catch (err) {
      toast({ title: "Couldn't upload", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadDoc(file, "dl");
  };

  const handleRCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadDoc(file, "rc");
  };

  const handleLogout = () => performLogout();

  const isDesktop = useIsDesktop();

  const hiddenInputs = (
    <>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
      <input ref={dlInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleDLChange} />
      <input ref={rcInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleRCChange} />
    </>
  );

  const reportModal = showReport && (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-red-600">Report / Flag</h3>
          <button onClick={() => setShowReport(false)}><X className="w-5 h-5 text-neutral-400" /></button>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          Select a reason — this opens MD's Desk with your report so a real person follows up. Reports are handled manually in V1.
        </p>
        <div className="space-y-2 mb-4">
          {["Reckless driving", "Vehicle damage", "Fraud / Fake listing", "Harassment", "No-show", "Other"].map(r => (
            <button key={r} onClick={() => setReportReason(r)}
              className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-all ${reportReason === r ? "bg-red-50 border-red-300 font-semibold text-red-700" : "border-neutral-200 text-neutral-600"}`}>
              {r}
            </button>
          ))}
        </div>
        <Button
          onClick={() => {
            setShowReport(false);
            navigate(`/support?prefill=${encodeURIComponent(`I'd like to report: ${reportReason}`)}`);
            setReportReason("");
          }}
          disabled={!reportReason} className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Continue to MD's Desk
        </Button>
      </div>
    </div>
  );

  const displayName = user?.name || "";
  const initial = displayName.charAt(0) || "?";

  const profileTabContent = (
    <>
      {editing ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Edit Your Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-500 font-medium">First Name</label>
              <Input value={editData.firstName} onChange={e => setEditData(d => ({ ...d, firstName: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 font-medium">Last Name</label>
              <Input value={editData.lastName} onChange={e => setEditData(d => ({ ...d, lastName: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-neutral-500 font-medium">Phone</label>
            <Input value={editData.phone} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-neutral-500 font-medium">Email</label>
            <Input value={user?.email || ""} disabled className="mt-1 opacity-60" />
            <p className="text-[11px] text-neutral-400 mt-1">Email can't be changed here yet.</p>
          </div>
          <div>
            <label className="text-xs text-neutral-500 font-medium">Address</label>
            <Input value={editData.address} onChange={e => setEditData(d => ({ ...d, address: e.target.value }))} className="mt-1" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"><Save className="w-4 h-4" />Save Changes</Button>
            <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-2xl divide-y divide-neutral-100">
          {[
            { icon: Phone, label: "Phone", value: user?.phone || "Not set" },
            { icon: Mail, label: "Email", value: user?.email || "" },
            { icon: MapPin, label: "Address", value: user?.address || "Not set" },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 p-4">
              <row.icon className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400">{row.label}</p>
                <p className="font-semibold text-sm text-neutral-800">{row.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change Password — real, requires the current password server-side */}
      <div className="bg-neutral-50 rounded-2xl overflow-hidden">
        <button
          onClick={() => setChangingPassword(!changingPassword)}
          className="w-full flex items-center gap-3 p-4 hover:bg-neutral-100 transition-colors"
        >
          <Lock className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">Change Password</p>
            <p className="text-xs text-neutral-400">Update your login password</p>
          </div>
          <ChevronRight className={`w-4 h-4 text-neutral-300 transition-transform ${changingPassword ? "rotate-90" : ""}`} />
        </button>
        {changingPassword && (
          <div className="px-4 pb-4 space-y-2.5 border-t border-neutral-100">
            <div className="pt-3">
              <label className="text-xs text-neutral-500 font-medium">Current Password</label>
              <Input type="password" value={passwordData.current} onChange={e => setPasswordData(d => ({ ...d, current: e.target.value }))} placeholder="••••••" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 font-medium">New Password</label>
              <Input type="password" value={passwordData.next} onChange={e => setPasswordData(d => ({ ...d, next: e.target.value }))} placeholder="min. 6 characters" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 font-medium">Confirm New Password</label>
              <Input type="password" value={passwordData.confirm} onChange={e => setPasswordData(d => ({ ...d, confirm: e.target.value }))} placeholder="••••••" className="mt-1" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handlePasswordChange} disabled={savingPassword} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1.5"><Save className="w-3.5 h-3.5" />{savingPassword ? "Updating…" : "Update"}</Button>
              <Button onClick={() => setChangingPassword(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        {[
          { icon: Package, label: "My Rides", sub: "Shift requests & trips", color: "text-blue-600", action: () => navigate("/my-rides") },
          { icon: Receipt, label: "Payment History", sub: "Transactions & invoices", color: "text-blue-600", action: () => navigate("/payment-history") },
          { icon: Bell, label: "Notifications", sub: "Alerts & updates", color: "text-orange-500", action: () => navigate("/notifications") },
          { icon: HelpCircle, label: "Help & Support", sub: "FAQs and emergency", color: "text-blue-600", action: () => navigate("/help") },
          { icon: BookOpen, label: "Terms & Conditions", sub: "Usage policy", color: "text-neutral-500", action: () => navigate("/terms") },
          { icon: Shield, label: "Privacy Policy", sub: "Your data & rights", color: "text-neutral-500", action: () => navigate("/privacy") },
        ].map(item => (
          <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 bg-neutral-50 rounded-xl p-4 hover:bg-neutral-100 transition-colors">
            <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-neutral-400">{item.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </button>
        ))}
      </div>

      {/* Emergency SOS contacts — a per-device convenience, not account data */}
      <div className="bg-neutral-50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-red-500" />
          <p className="font-semibold text-sm">Emergency SOS Contacts</p>
        </div>
        <p className="text-xs text-neutral-400">Add up to 2 people we can alert from the SOS button during a trip (saved on this device).</p>
        {contactDraft.map((c, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <Input
              placeholder={`Contact ${i + 1} name`}
              value={c.name}
              onChange={e => setContactDraft(d => d.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
            />
            <Input
              placeholder="Phone number"
              value={c.phone}
              onChange={e => setContactDraft(d => d.map((x, idx) => idx === i ? { ...x, phone: e.target.value } : x))}
            />
          </div>
        ))}
        <Button onClick={handleSaveContacts} className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
          <Save className="w-4 h-4" /> Save Emergency Contacts
        </Button>
      </div>

      {/* Report & Logout */}
      <div className="space-y-2 pt-1">
        <button onClick={() => setShowReport(true)} className="w-full flex items-center gap-3 bg-red-50 rounded-xl p-4 text-red-600 hover:bg-red-100 transition-colors">
          <Flag className="w-5 h-5 shrink-0" />
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">Report an Issue / Flag User</p>
            <p className="text-xs text-red-400">Report misconduct or suspicious behaviour</p>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 bg-neutral-50 rounded-xl p-4 text-neutral-600 hover:bg-neutral-100 transition-colors">
          <LogOut className="w-5 h-5 shrink-0" />
          <div className="flex-1 text-left"><p className="font-semibold text-sm">Log Out</p></div>
        </button>
      </div>
    </>
  );

  const bookingsTabContent = (
    <div className="space-y-3">
      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Your Shift Requests</p>
      {myRequests.length === 0 && (
        <p className="text-sm text-neutral-400 bg-neutral-50 rounded-2xl p-4">
          No shift requests yet. <button className="text-blue-600 font-semibold underline" onClick={() => navigate("/shift-request")}>Create one</button>
        </p>
      )}
      {myRequests.map((r: any) => (
        <div key={r.id} className="bg-neutral-50 rounded-2xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-bold text-sm">{r.pickupLocation} → {r.dropLocation}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {r.vehicle && (r.vehicle.make === r.vehicle.model ? r.vehicle.make : `${r.vehicle.make} ${r.vehicle.model}`)}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${STATUS_STYLE[r.status] || "bg-neutral-200 text-neutral-600"}`}>
              {r.status}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-neutral-400">Request #{r.id}</p>
            {r.trip && (
              <button onClick={() => navigate(`/trip-payment/${r.trip.id}`)}
                className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Receipt className="w-3 h-3" /> {r.payment?.status === "paid" ? "View Trip" : "View & Pay"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const docsTabContent = (
    <div className="space-y-4">
      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Verification Documents</p>

      <div className="bg-blue-50 rounded-xl p-3">
        <p className="text-xs text-blue-700 font-medium">
          Documents are stored securely and reviewed manually by our team — there is no automated verification in V1.
        </p>
      </div>

      <div className="bg-neutral-50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dlDoc ? "bg-blue-100" : "bg-orange-100"}`}>
              <FileText className={`w-5 h-5 ${dlDoc ? "text-blue-600" : "text-orange-500"}`} />
            </div>
            <div>
              <p className="font-semibold text-sm">Driving Licence</p>
              <p className={`text-xs font-medium flex items-center gap-1 ${dlDoc ? "text-blue-600" : "text-orange-500"}`}>
                {dlDoc ? <><CheckCircle2 className="w-3 h-3" /> Uploaded — Under Review</> : <><Clock className="w-3 h-3" /> Not Uploaded</>}
              </p>
            </div>
          </div>
          {!dlDoc && (
            <button onClick={handleDLUpload} disabled={uploadingDoc === "dl"} className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 disabled:opacity-60">
              <Upload className="w-3 h-3" /> {uploadingDoc === "dl" ? "Uploading…" : "Upload"}
            </button>
          )}
        </div>
        {dlDoc && (
          <a href={`/api/documents/${dlDoc.id}/file`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-semibold underline">
            View uploaded file
          </a>
        )}
      </div>

      <div className="bg-neutral-50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rcDoc ? "bg-blue-100" : "bg-orange-100"}`}>
              <Car className={`w-5 h-5 ${rcDoc ? "text-blue-600" : "text-orange-500"}`} />
            </div>
            <div>
              <p className="font-semibold text-sm">Vehicle RC</p>
              <p className={`text-xs font-medium flex items-center gap-1 ${rcDoc ? "text-blue-600" : "text-orange-500"}`}>
                {rcDoc ? <><CheckCircle2 className="w-3 h-3" /> Uploaded — Under Review</> : <><Clock className="w-3 h-3" /> Not Uploaded</>}
              </p>
            </div>
          </div>
          {!rcDoc && (
            <button onClick={handleRCUpload} disabled={uploadingDoc === "rc"} className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 disabled:opacity-60">
              <Upload className="w-3 h-3" /> {uploadingDoc === "rc" ? "Uploading…" : "Upload"}
            </button>
          )}
        </div>
        {rcDoc && (
          <a href={`/api/documents/${rcDoc.id}/file`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-semibold underline">
            View uploaded file
          </a>
        )}
      </div>
    </div>
  );

  if (isDesktop === undefined || userLoading || !user) return <div className="min-h-screen bg-white dark:bg-neutral-950" />;

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <DesktopTopNav />
        {hiddenInputs}
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-[280px_1fr] gap-8 items-start">
            <aside className="sticky top-24 space-y-4">
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/5 rounded-full" />
                <div className="absolute -bottom-4 -left-6 w-20 h-20 bg-orange-500/20 rounded-full" />
                <div className="relative flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-xl">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="text-blue-600 text-lg font-bold bg-blue-100">{initial}</AvatarFallback>
                    </Avatar>
                    <button onClick={handlePhotoUpload} disabled={uploadingAvatar} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-md border-2 border-white active:scale-95 disabled:opacity-60">
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-white font-extrabold text-base leading-tight truncate">{displayName}</h2>
                    <p className="text-blue-200 text-xs">{user.address || user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-bold">{(user.averageRating ?? 0).toFixed(1)}</span>
                      <span className="text-blue-200 text-xs">· {user.totalRatings ?? 0} ratings</span>
                    </div>
                  </div>
                </div>
                <div className="relative flex flex-wrap gap-1.5 mt-4">
                  {[
                    { label: "Licence", verified: Boolean(dlDoc) },
                    { label: "Vehicle RC", verified: Boolean(rcDoc) },
                  ].map(b => (
                    <div key={b.label} className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold border ${b.verified ? "bg-blue-500/20 border-blue-400/40 text-blue-300" : "bg-white/10 border-white/20 text-white/60"}`}>
                      {b.verified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {b.label}
                    </div>
                  ))}
                </div>
                <button onClick={() => setEditing(!editing)} className="relative w-full mt-4 text-xs font-bold bg-white/15 hover:bg-white/25 text-white rounded-xl py-2 flex items-center justify-center gap-1.5 transition-colors">
                  {editing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  {editing ? "Cancel Editing" : "Edit Profile"}
                </button>
              </div>

              <nav className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-2">
                {(["profile", "bookings", "docs"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
                    {tab === "bookings" ? "My Requests" : tab === "docs" ? "Documents" : "Profile"}
                  </button>
                ))}
              </nav>
            </aside>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
              {activeTab === "profile" && profileTabContent}
              {activeTab === "bookings" && bookingsTabContent}
              {activeTab === "docs" && docsTabContent}
            </div>
          </div>
        </main>
        {reportModal}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {hiddenInputs}

      {/* Hero header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-4 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -bottom-4 -left-6 w-24 h-24 bg-orange-500/20 rounded-full" />
        <div className="flex items-center justify-between mb-5 relative">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="font-bold text-lg text-white">My Profile</h1>
          <button onClick={() => setEditing(!editing)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            {editing ? <X className="w-4 h-4 text-white" /> : <Edit3 className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-white shadow-xl">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-blue-600 text-xl font-bold bg-blue-100">{initial}</AvatarFallback>
            </Avatar>
            <button onClick={handlePhotoUpload} disabled={uploadingAvatar} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-md border-2 border-white active:scale-95 disabled:opacity-60">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-white font-extrabold text-lg leading-tight">{displayName}</h2>
            <p className="text-blue-200 text-sm">{user.address || user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-bold">{(user.averageRating ?? 0).toFixed(1)}</span>
              </div>
              <span className="text-blue-200 text-xs">{user.totalRatings ?? 0} ratings</span>
            </div>
          </div>
        </div>

        {/* Verification badges */}
        <div className="flex gap-2 mt-4 relative">
          {[
            { label: "Driving Licence", verified: Boolean(dlDoc) },
            { label: "Vehicle RC", verified: Boolean(rcDoc) },
          ].map(b => (
            <div key={b.label} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border ${b.verified ? "bg-blue-500/20 border-blue-400/40 text-blue-300" : "bg-white/10 border-white/20 text-white/60"}`}>
              {b.verified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-100 bg-white sticky top-0 z-10">
        {(["profile", "bookings", "docs"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-neutral-400"}`}>
            {tab === "bookings" ? "My Requests" : tab === "docs" ? "Documents" : "Profile"}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-4">
        {activeTab === "profile" && profileTabContent}
        {activeTab === "bookings" && bookingsTabContent}
        {activeTab === "docs" && docsTabContent}
      </div>

      {reportModal}

      <BottomNav />
    </div>
  );
}
