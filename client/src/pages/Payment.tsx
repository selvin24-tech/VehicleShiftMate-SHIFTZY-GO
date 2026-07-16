import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ChevronLeft, CheckCircle2, CreditCard, Smartphone, Building2,
  Shield, Lock, ChevronRight, Loader2, IndianRupee, Copy,
} from "lucide-react";
import { NEARBY_SHIFT_REQUESTS, computeFare, vehicleTypeToFareCategory } from "@/lib/constants";
import { useSentRequest, markRequestPaid } from "@/lib/requestsStore";
import { addPayment } from "@/lib/appStore";
import { addStoredNotif } from "@/lib/notificationsStore";
import { useToast } from "@/hooks/use-toast";

const UPI_APPS = [
  { id: "gpay",    label: "Google Pay",   icon: "🔵", color: "bg-blue-50 border-blue-200" },
  { id: "phonepe", label: "PhonePe",       icon: "💜", color: "bg-purple-50 border-purple-200" },
  { id: "paytm",   label: "Paytm",         icon: "🔷", color: "bg-sky-50 border-sky-200" },
  { id: "bhim",    label: "BHIM UPI",      icon: "🇮🇳", color: "bg-orange-50 border-orange-200" },
];

function genTrackingNumber() {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

type Tab = "upi" | "card" | "netbanking";
type Step = "select" | "enter" | "processing" | "success";

export default function Payment() {
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ id: string }>("/payment/:id");
  const id = params?.id ?? "";
  const { toast } = useToast();

  const req = NEARBY_SHIFT_REQUESTS.find((r) => r.id === id);
  const record = useSentRequest(id);

  const [tab, setTab] = useState<Tab>("upi");
  const [step, setStep] = useState<Step>("select");
  const [selectedUpi, setSelectedUpi] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [bank, setBank] = useState("");
  const [processing, setProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [trackId, setTrackId] = useState("");

  if (!req) {
    return (
      <div className="max-w-lg mx-auto min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-neutral-500 text-sm">Booking not found.</p>
        <button onClick={() => navigate("/")} className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          Back to Home
        </button>
      </div>
    );
  }

  const fare = computeFare(
    parseInt(req.distance) || 180,
    vehicleTypeToFareCategory(req.vehicle.type, req.vehicle.make)
  );

  const vehicleName = `${req.vehicle.make} ${req.vehicle.model}`;
  const route = `${req.pickupLocation.name} → ${req.dropLocation.name}`;

  const canProceed =
    tab === "upi"
      ? selectedUpi && (step !== "enter" || upiId.trim().includes("@"))
      : tab === "card"
      ? card.number.replace(/\s/g, "").length === 16 && card.expiry.length === 5 && card.cvv.length === 3 && card.name.trim().length > 2
      : bank.trim().length > 0;

  const handlePay = () => {
    setProcessing(true);
    setStep("processing");

    const trackingNumber = genTrackingNumber();
    const ref = trackingNumber;
    const trk = trackingNumber;

    setTimeout(() => {
      const methodLabel =
        tab === "upi"
          ? selectedUpi === "gpay" ? "Google Pay" : selectedUpi === "phonepe" ? "PhonePe" : selectedUpi === "paytm" ? "Paytm" : "BHIM UPI"
          : tab === "card"
          ? `Card ••${card.number.slice(-4)}`
          : bank;

      addPayment({
        description: `Vehicle shift — ${vehicleName}`,
        route,
        amount: fare.total,
        method: methodLabel,
        status: "paid",
        date: "Just now",
      });

      markRequestPaid(id, ref, trk);

      addStoredNotif({
        category: "payments",
        iconKey: "payment",
        color: "blue",
        title: "Payment Successful",
        body: `₹${fare.total.toLocaleString()} paid via ${methodLabel} for ${vehicleName} · ${route} · Ref: ${ref}`,
        requestId: id,
      });

      setBookingRef(ref);
      setTrackId(trk);
      setProcessing(false);
      setStep("success");
    }, 2200);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() =>
      toast({ title: `${label} copied!`, description: text })
    );
  };

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  /* ── SUCCESS SCREEN ── */
  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto bg-white min-h-screen flex flex-col items-center justify-center px-5 text-center gap-0 pb-8">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-lg">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 mb-1">Payment Successful!</h1>
        <p className="text-neutral-400 text-sm mb-6">Your booking is confirmed. Save these IDs.</p>

        {/* Booking Summary card */}
        <div className="w-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-left text-white mb-4 shadow-xl">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-3">Booking Summary</p>
          <p className="font-extrabold text-lg leading-tight">{vehicleName}</p>
          <p className="text-blue-200 text-sm mt-1">{route}</p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-500/40">
            <span className="text-blue-200 text-sm">Amount Paid</span>
            <span className="font-extrabold text-xl">₹{fare.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Single Reference / Track ID box */}
        <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5 text-left">
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-2">Reference / Track ID</p>
          <p className="font-extrabold text-blue-700 text-3xl tracking-widest mb-3">{bookingRef}</p>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-blue-400">Use this number to track your vehicle live</p>
            <button
              onClick={() => copyText(bookingRef, "Reference / Track ID")}
              className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-semibold transition-colors bg-white border border-blue-200 rounded-lg px-2.5 py-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
        </div>

        <div className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-xs text-neutral-600 mb-5 text-left">
          💡 Save your <strong>Reference / Track ID</strong> to follow your vehicle live from the <strong>Track</strong> tab.
          Find it again in <strong>My Rides → Active</strong>.
        </div>

        <div className="w-full space-y-2">
          <button
            onClick={() => navigate("/track")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            Track My Vehicle Live <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/my-rides")}
            className="w-full bg-neutral-100 text-neutral-700 font-semibold py-3.5 rounded-xl active:scale-95 transition-all"
          >
            View in My Rides
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full text-neutral-400 text-sm py-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  /* ── PROCESSING SCREEN ── */
  if (step === "processing") {
    return (
      <div className="max-w-lg mx-auto bg-white min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-2">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Processing Payment…</h2>
        <p className="text-neutral-400 text-sm">Please wait. Do not press back or refresh.</p>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mt-2">
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-xs font-semibold text-green-700">256-bit SSL Secured · Powered by Stripe</span>
        </div>
      </div>
    );
  }

  /* ── PAYMENT FORM ── */
  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-100 shadow-sm flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate(`/request/${id}`)}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-base">Secure Payment</h1>
          <p className="text-[11px] text-neutral-400">{vehicleName} · {route}</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-green-700 font-semibold bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
          <Lock className="w-3 h-3" /> Secured
        </div>
      </div>

      {/* Amount card */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 text-white shadow-lg">
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">Amount to Pay</p>
        <div className="flex items-end gap-1">
          <IndianRupee className="w-6 h-6 mb-0.5" />
          <span className="text-4xl font-extrabold">{fare.total.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-500/40 text-xs text-blue-200">
          <span>Your 50%: ₹{fare.travelerShare.toLocaleString()}</span>
          <span>Platform: ₹{fare.platformFee}</span>
          <span>GST: ₹{fare.gst}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mt-4 bg-neutral-100 rounded-xl p-1">
        {(["upi", "card", "netbanking"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setStep("select"); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t ? "bg-white text-blue-600 shadow-sm" : "text-neutral-400"
            }`}
          >
            {t === "upi" ? "UPI" : t === "card" ? "Card" : "Net Banking"}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-3">

        {/* UPI */}
        {tab === "upi" && (
          <>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Select UPI App</p>
            <div className="grid grid-cols-2 gap-3">
              {UPI_APPS.map((app) => (
                <button
                  key={app.id}
                  onClick={() => { setSelectedUpi(app.id); setStep("enter"); }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-95 ${
                    selectedUpi === app.id ? "border-blue-500 bg-blue-50" : `${app.color} border-transparent`
                  }`}
                >
                  <span className="text-2xl">{app.icon}</span>
                  <span className="font-bold text-sm text-neutral-800">{app.label}</span>
                  {selectedUpi === app.id && <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
            {selectedUpi && (
              <div className="bg-neutral-50 rounded-2xl p-4 space-y-3 mt-2">
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Enter UPI ID</p>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <p className="text-[11px] text-neutral-400">e.g. mobile@okaxis · name@paytm · 9876543210@upi</p>
              </div>
            )}
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-3">
              <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-700">You'll receive a payment request on your UPI app. Approve it to complete.</p>
            </div>
          </>
        )}

        {/* Card */}
        {tab === "card" && (
          <>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Credit / Debit Card</p>
            <div className="bg-neutral-50 rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-xs text-neutral-500 font-medium">Cardholder Name</label>
                <input value={card.name} onChange={(e) => setCard(c => ({ ...c, name: e.target.value }))} placeholder="Name on card"
                  className="w-full mt-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="text-xs text-neutral-500 font-medium">Card Number</label>
                <div className="relative mt-1">
                  <input value={card.number} onChange={(e) => setCard(c => ({ ...c, number: formatCard(e.target.value) }))} placeholder="0000 0000 0000 0000" maxLength={19}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 pr-10" />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 font-medium">Expiry</label>
                  <input value={card.expiry} onChange={(e) => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))} placeholder="MM/YY" maxLength={5}
                    className="w-full mt-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 font-medium">CVV</label>
                  <input value={card.cvv} onChange={(e) => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))} placeholder="•••" maxLength={3} type="password"
                    className="w-full mt-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3">
              <Shield className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700">Your card details are encrypted and never stored.</p>
            </div>
          </>
        )}

        {/* Net Banking */}
        {tab === "netbanking" && (
          <>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Select Your Bank</p>
            <div className="grid grid-cols-2 gap-2">
              {["State Bank of India","HDFC Bank","ICICI Bank","Axis Bank","Kotak Mahindra","Punjab National Bank","Bank of Baroda","Canara Bank"].map((b) => (
                <button key={b} onClick={() => setBank(b)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold text-left transition-all active:scale-95 ${
                    bank === b ? "border-blue-500 bg-blue-50 text-blue-700" : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  <Building2 className={`w-4 h-4 shrink-0 ${bank === b ? "text-blue-600" : "text-neutral-400"}`} />
                  <span className="truncate">{b}</span>
                  {bank === b && <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pay button */}
      <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-4 py-4 mt-6">
        <button
          onClick={handlePay}
          disabled={!canProceed || processing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 text-base active:scale-95 transition-all shadow-lg shadow-blue-200"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-4 h-4" />Pay ₹{fare.total.toLocaleString()} Securely</>}
        </button>
        <p className="text-center text-[10px] text-neutral-400 mt-2 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" /> Protected by Stripe · 256-bit SSL Encryption
        </p>
      </div>
    </div>
  );
}
