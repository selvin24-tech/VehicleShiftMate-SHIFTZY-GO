import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import BottomNav from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft, ChevronRight, Camera, Edit3, Save, X, Star,
  CreditCard, FileText, Car, Bell, Shield, HelpCircle,
  LogOut, Upload, CheckCircle2, Clock, Flag, Phone, Mail, MapPin,
  Package, BookOpen, Receipt, PhoneCall, Lock
} from "lucide-react";
import { getEmergencyContacts, setEmergencyContacts, type EmergencyContact } from "@/lib/appStore";

// ── Per-user profile persistence (supports up to 10 users) ────────────────────
const PROFILES_KEY = "shiftzy_user_profiles";
const MAX_PROFILES = 10;

interface StoredProfile {
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  avatarUrl: string;
  username: string;
  passwordHash: string; // stores hashed/masked password
}

function getStoredProfiles(): Record<string, StoredProfile> {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveStoredProfile(username: string, p: StoredProfile) {
  const all = getStoredProfiles();
  const keys = Object.keys(all);
  if (!all[username] && keys.length >= MAX_PROFILES) {
    const oldest = keys[0];
    delete all[oldest];
  }
  all[username] = p;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(all));
}

function loadProfileForUser(username: string): StoredProfile | null {
  return getStoredProfiles()[username] ?? null;
}

// ── Default profile values ────────────────────────────────────────────────────
const DEFAULT_PROFILE: Omit<StoredProfile, "username" | "passwordHash"> = {
  name: "Selvin Raj",
  firstName: "Selvin",
  lastName: "Raj",
  phone: "+91 98765 43210",
  email: "selvin.raj@gmail.com",
  city: "Chennai",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
};

const MY_BOOKINGS = [
  { id: "BK-20481", route: "Chennai → Bangalore", vehicle: "Honda City", status: "completed", date: "Today", amount: 2352 },
  { id: "BK-19832", route: "Chennai → Madurai", vehicle: "Maruti Swift", status: "in-transit", date: "10 Jun", amount: 1620 },
  { id: "BK-18741", route: "Coimbatore → Chennai", vehicle: "Hyundai i20", status: "cancelled", date: "5 Jun", amount: 0 },
];

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-blue-100 text-blue-700",
  "in-transit": "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-orange-100 text-orange-700",
};

export default function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dlInputRef = useRef<HTMLInputElement>(null);
  const rcInputRef = useRef<HTMLInputElement>(null);

  const username = localStorage.getItem("username") || "guest";

  // Load saved profile or use defaults
  const [profile, setProfile] = useState(() => {
    const saved = loadProfileForUser(username);
    if (saved) return { ...saved, rating: 4.8, totalTrips: 12, aadhaarVerified: true, dlVerified: false, vehicleVerified: true };
    return { ...DEFAULT_PROFILE, username, passwordHash: "", rating: 4.8, totalTrips: 12, aadhaarVerified: true, dlVerified: false, vehicleVerified: true };
  });

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    email: profile.email,
    city: profile.city,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", next: "", confirm: "" });
  const [dlUploaded, setDlUploaded] = useState(false);
  const [rcUploaded, setRcUploaded] = useState(() => {
    const s = localStorage.getItem("rcStatus");
    return s === "pending" || s === "verified";
  });
  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "docs">("profile");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [contactDraft, setContactDraft] = useState<EmergencyContact[]>(() => {
    const base = getEmergencyContacts();
    return [base[0] ?? { name: "", phone: "" }, base[1] ?? { name: "", phone: "" }];
  });

  // Persist profile to localStorage whenever it changes (and save photo too)
  useEffect(() => {
    const toStore: StoredProfile = {
      name: profile.name,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      email: profile.email,
      city: profile.city,
      avatarUrl: profile.avatarUrl,
      username,
      passwordHash: profile.passwordHash,
    };
    saveStoredProfile(username, toStore);
  }, [profile, username]);

  const handleSaveContacts = () => {
    const cleaned = contactDraft.filter(c => c.phone.trim());
    setEmergencyContacts(cleaned);
    toast({ title: "Emergency contacts saved", description: "These people can be reached from the SOS button." });
  };

  const handleSave = () => {
    const newName = `${editData.firstName} ${editData.lastName}`;
    setProfile(p => ({
      ...p,
      firstName: editData.firstName,
      lastName: editData.lastName,
      name: newName,
      phone: editData.phone,
      email: editData.email,
      city: editData.city,
    }));
    setEditing(false);
    toast({ title: "Profile Updated", description: "Your details have been saved." });
  };

  const handlePasswordChange = () => {
    if (!passwordData.current) {
      toast({ title: "Enter current password", variant: "destructive" }); return;
    }
    if (passwordData.next.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters.", variant: "destructive" }); return;
    }
    if (passwordData.next !== passwordData.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    setProfile(p => ({ ...p, passwordHash: "changed" }));
    setPasswordData({ current: "", next: "", confirm: "" });
    setChangingPassword(false);
    toast({ title: "Password Changed", description: "Your new password is active." });
  };

  const handlePhotoUpload = () => fileInputRef.current?.click();
  const handleDLUpload = () => dlInputRef.current?.click();
  const handleRCUpload = () => rcInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setProfile(p => ({ ...p, avatarUrl: dataUrl }));
        toast({ title: "Photo Updated", description: "Your profile photo has been saved." });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setDlUploaded(true);
      setProfile(p => ({ ...p, dlVerified: true }));
      localStorage.setItem("dlStatus", "pending");
      toast({ title: "Driving Licence Uploaded", description: "Under review — verification takes up to 24 hours." });
    }
  };

  const handleRCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setRcUploaded(true);
      localStorage.setItem("rcStatus", "pending");
      toast({ title: "Vehicle RC Uploaded", description: "Under review — verification takes up to 24 hours." });
    }
  };

  const handleLogout = () => {
    ["isAuthenticated", "hasSeenTour", "isFirstLogin", "username", "userType"].forEach(k => localStorage.removeItem(k));
    window.location.href = "/";
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={dlInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleDLChange} />
      <input ref={rcInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleRCChange} />

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
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="text-blue-600 text-xl font-bold bg-blue-100">{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <button onClick={handlePhotoUpload} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-md border-2 border-white active:scale-95">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-white font-extrabold text-lg leading-tight">{profile.name}</h2>
            <p className="text-blue-200 text-sm">{profile.city}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-bold">{profile.rating}</span>
              </div>
              <span className="text-blue-200 text-xs">{profile.totalTrips} trips</span>
            </div>
          </div>
        </div>

        {/* Verification badges */}
        <div className="flex gap-2 mt-4 relative">
          {[
            { label: "Aadhaar", verified: profile.aadhaarVerified },
            { label: "Driving Licence", verified: profile.dlVerified },
            { label: "Vehicle", verified: profile.vehicleVerified },
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
            {tab === "bookings" ? "My Bookings" : tab === "docs" ? "Documents" : "Profile"}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
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
                  <Input value={editData.email} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 font-medium">City</label>
                  <Input value={editData.city} onChange={e => setEditData(d => ({ ...d, city: e.target.value }))} className="mt-1" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"><Save className="w-4 h-4" />Save Changes</Button>
                  <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-2xl divide-y divide-neutral-100">
                {[
                  { icon: Phone, label: "Phone", value: profile.phone },
                  { icon: Mail, label: "Email", value: profile.email },
                  { icon: MapPin, label: "City", value: profile.city },
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

            {/* Change Password */}
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
                    <Button onClick={handlePasswordChange} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1.5"><Save className="w-3.5 h-3.5" />Update</Button>
                    <Button onClick={() => setChangingPassword(false)} variant="outline" className="flex-1">Cancel</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="space-y-2">
              {[
                { icon: Package, label: "My Rides", sub: "Shift & Go requests", color: "text-blue-600", action: () => navigate("/my-rides") },
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

            {/* Emergency SOS contacts */}
            <div className="bg-neutral-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-red-500" />
                <p className="font-semibold text-sm">Emergency SOS Contacts</p>
              </div>
              <p className="text-xs text-neutral-400">Add up to 2 people we can alert from the SOS button during a trip.</p>
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
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === "bookings" && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Your Booking History</p>
            {MY_BOOKINGS.map(bk => (
              <div key={bk.id} className="bg-neutral-50 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">{bk.route}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{bk.vehicle} · {bk.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[bk.status]}`}>
                    {bk.status.replace("-", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-neutral-400">{bk.id}</p>
                  <div className="flex gap-2">
                    {bk.status === "completed" && (
                      <button onClick={() => toast({ title: "Invoice", description: `Invoice for ${bk.id} downloaded.` })}
                        className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Invoice
                      </button>
                    )}
                    {bk.status === "in-transit" && (
                      <button onClick={() => navigate("/track")}
                        className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <Package className="w-3 h-3" /> Track
                      </button>
                    )}
                    {bk.status === "in-transit" && (
                      <button onClick={() => toast({ title: "Cancellation", description: "Cancellation request submitted. Refund in 5–7 days." })}
                        className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {activeTab === "docs" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Verification Documents</p>

            <div className="bg-neutral-50 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Mobile Number</p>
                  <p className="text-xs text-blue-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified via OTP</p>
                </div>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">✓ Done</span>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dlUploaded || profile.dlVerified ? "bg-blue-100" : "bg-orange-100"}`}>
                    <FileText className={`w-5 h-5 ${dlUploaded || profile.dlVerified ? "text-blue-600" : "text-orange-500"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Driving Licence</p>
                    <p className={`text-xs font-medium flex items-center gap-1 ${dlUploaded || profile.dlVerified ? "text-blue-600" : "text-orange-500"}`}>
                      {dlUploaded || profile.dlVerified ? <><CheckCircle2 className="w-3 h-3" /> Uploaded — Under Review</> : <><Clock className="w-3 h-3" /> Not Uploaded</>}
                    </p>
                  </div>
                </div>
                {!(dlUploaded || profile.dlVerified) && (
                  <button onClick={handleDLUpload} className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95">
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                )}
              </div>
              {!(dlUploaded || profile.dlVerified) && (
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-orange-700">Upload a clear photo of both sides of your driving licence to unlock traveler features.</p>
                </div>
              )}
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rcUploaded ? "bg-blue-100" : "bg-orange-100"}`}>
                    <Car className={`w-5 h-5 ${rcUploaded ? "text-blue-600" : "text-orange-500"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Vehicle RC</p>
                    <p className={`text-xs font-medium flex items-center gap-1 ${rcUploaded ? "text-blue-600" : "text-orange-500"}`}>
                      {rcUploaded ? <><CheckCircle2 className="w-3 h-3" /> Uploaded — Under Review</> : <><Clock className="w-3 h-3" /> Not Uploaded</>}
                    </p>
                  </div>
                </div>
                {!rcUploaded && (
                  <button onClick={handleRCUpload} className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95">
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                )}
              </div>
              {!rcUploaded && (
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-orange-700">Upload your vehicle's Registration Certificate (RC) to enable shift booking. Required for all vehicle owners.</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-700 font-medium">All verified documents are encrypted and stored securely in compliance with India's data protection laws.</p>
            </div>
          </div>
        )}

      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-red-600">Report / Flag</h3>
              <button onClick={() => setShowReport(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <p className="text-sm text-neutral-500 mb-4">Select a reason and we'll investigate within 24 hours.</p>
            <div className="space-y-2 mb-4">
              {["Reckless driving", "Vehicle damage", "Fraud / Fake listing", "Harassment", "No-show", "Other"].map(r => (
                <button key={r} onClick={() => setReportReason(r)}
                  className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-all ${reportReason === r ? "bg-red-50 border-red-300 font-semibold text-red-700" : "border-neutral-200 text-neutral-600"}`}>
                  {r}
                </button>
              ))}
            </div>
            <Button onClick={() => { setShowReport(false); setReportReason(""); toast({ title: "Report Submitted", description: "We'll review this and take action within 24 hours." }); }}
              disabled={!reportReason} className="w-full bg-red-600 hover:bg-red-700 text-white">
              Submit Report
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
