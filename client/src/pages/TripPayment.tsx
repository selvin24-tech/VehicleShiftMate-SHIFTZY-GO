import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, CheckCircle2, Clock, ShieldCheck, Lock, Loader2,
  IndianRupee, MapPin, Car, User, AlertTriangle, RefreshCw,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * NEW customer screen (Phase 2) — payment for the real vehicle-shifting
 * journey. This is not a redesign of the existing mobile payment demo
 * (Payment.tsx); it is a separate screen for the ShiftRequest → priced Trip →
 * Cashfree flow and keeps the existing mobile visual language.
 */

type TripRelations = {
  id: number;
  price: string;
  distance: string | null;
  status: string;
  driverName: string | null;
  driverPhone: string | null;
  startDate: string | null;
  shiftRequest: {
    id: number;
    pickupLocation: string;
    dropLocation: string;
    status: string;
  };
  payment: { status: string; amount: string } | null;
};

type CashfreeCheckout = (opts: {
  paymentSessionId: string;
  redirectTarget?: "_self" | "_blank" | "_modal";
}) => Promise<{ error?: { message?: string }; redirect?: boolean; paymentDetails?: unknown }>;
type CashfreeInstance = { checkout: CashfreeCheckout };
type CashfreeFactory = (opts: { mode: "sandbox" | "production" }) => CashfreeInstance;

const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

function loadCashfreeSdk(): Promise<CashfreeFactory> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { Cashfree?: CashfreeFactory };
    if (w.Cashfree) return resolve(w.Cashfree);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => w.Cashfree ? resolve(w.Cashfree) : reject(new Error("SDK load failed")));
      existing.addEventListener("error", () => reject(new Error("SDK load failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => (w.Cashfree ? resolve(w.Cashfree) : reject(new Error("SDK load failed")));
    s.onerror = () => reject(new Error("Could not load the Cashfree checkout"));
    document.body.appendChild(s);
  });
}

type Phase = "idle" | "starting" | "checkout" | "verifying" | "success" | "pending" | "failed";

export default function TripPayment() {
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ tripId: string }>("/trip-payment/:tripId");
  const tripId = params?.tripId ?? "";
  const { toast } = useToast();

  const returnOrderId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("order_id");
  }, []);

  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string>("");
  const [receipt, setReceipt] = useState<{ amount?: string; method?: string; referenceId?: string } | null>(null);

  const { data: trip, isLoading, isError, refetch } = useQuery<TripRelations>({
    queryKey: [`/api/trips/${tripId}`],
    enabled: !!tripId,
  });

  const alreadyPaid = trip?.payment?.status === "paid" || trip?.status === "scheduled";

  async function verify(orderId: string) {
    setPhase("verifying");
    try {
      const res = await apiRequest("GET", `/api/payments/cashfree/verify/${orderId}`);
      const body = await res.json();
      if (body.paymentStatus === "paid") {
        setReceipt({ amount: body.amount, method: body.method, referenceId: body.referenceId });
        setPhase("success");
        refetch();
      } else if (body.paymentStatus === "failed" || body.paymentStatus === "expired") {
        setPhase("failed");
        setMessage("The payment did not go through. You can try again.");
      } else {
        setPhase("pending");
        setMessage("Your payment is still being confirmed. This can take a moment.");
      }
    } catch (e) {
      setPhase("pending");
      setMessage(
        e instanceof Error && e.message.includes("503")
          ? "Payment gateway is not configured on the server yet."
          : "We could not confirm the payment yet. Tap refresh in a moment."
      );
    }
  }

  // If the customer was redirected back with ?order_id=..., verify immediately.
  useEffect(() => {
    if (returnOrderId) verify(returnOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnOrderId]);

  async function startPayment() {
    if (!trip) return;
    setPhase("starting");
    setMessage("");
    try {
      const res = await apiRequest("POST", "/api/payments/cashfree/order", { tripId: trip.id });
      const body = await res.json();
      const factory = await loadCashfreeSdk();
      const cf = factory({ mode: body.mode === "production" ? "production" : "sandbox" });
      setPhase("checkout");
      const result = await cf.checkout({
        paymentSessionId: body.paymentSessionId,
        redirectTarget: "_modal",
      });
      if (result?.error) {
        setPhase("failed");
        setMessage(result.error.message || "Payment was cancelled.");
        return;
      }
      await verify(body.providerOrderId);
    } catch (e) {
      setPhase("failed");
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      if (msg.includes("503")) {
        setMessage("Payment gateway is not configured on the server yet. Add Cashfree sandbox keys and try again.");
      } else if (msg.includes("409")) {
        setMessage("This trip is already paid.");
        setPhase("success");
      } else {
        setMessage("Could not start the payment. Please try again.");
      }
      toast({ title: "Payment error", description: msg.slice(0, 120), variant: "destructive" });
    }
  }

  const busy = phase === "starting" || phase === "checkout" || phase === "verifying";

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-28">
      <Header title="Pay for your shift" showAnimation={false} />

      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate("/my-rides")}
          className="bg-black text-white shadow-lg hover:bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center"
          aria-label="Back"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      </div>

      <div className="px-4 py-6 space-y-5">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-500">
            <Loader2 className="w-7 h-7 animate-spin" />
            <p className="text-sm">Loading your trip…</p>
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
            <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-700">This trip could not be found.</p>
            <button onClick={() => navigate("/my-rides")} className="mt-3 text-sm font-bold text-blue-600">
              Back to My Rides
            </button>
          </div>
        )}

        {trip && phase !== "success" && (
          <>
            {/* Trip summary */}
            <div className="rounded-2xl border-2 border-neutral-200 p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-blue-700 mb-3">
                <span className="bg-blue-50 px-2 py-1 rounded-full">Shift Request #{trip.shiftRequest.id}</span>
                <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full capitalize">
                  {trip.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="font-extrabold text-neutral-900 text-sm">
                  {trip.shiftRequest.pickupLocation} → {trip.shiftRequest.dropLocation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-1.5 text-xs text-neutral-500 mt-3">
                {trip.distance && (
                  <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {trip.distance}</span>
                )}
                {trip.startDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {new Date(trip.startDate).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {trip.driverName ? `Driver: ${trip.driverName}` : "Driver: to be assigned"}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-2xl bg-neutral-900 text-white p-5">
              <p className="text-xs text-neutral-300 font-semibold">Amount payable</p>
              <p className="text-3xl font-extrabold flex items-center gap-1 mt-1">
                <IndianRupee className="w-6 h-6" />
                {Number(trip.price).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-neutral-400 mt-2">
                Price set by the ShiftzyGo team for this vehicle shift.
              </p>
            </div>

            {alreadyPaid && phase === "idle" && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                <p className="text-sm font-semibold text-green-700">
                  This trip is already paid. Nothing more to do here.
                </p>
              </div>
            )}

            {(phase === "pending" || phase === "failed") && message && (
              <div
                className={`rounded-2xl border p-4 flex items-start gap-3 ${
                  phase === "failed" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
                }`}
              >
                <AlertTriangle className={`w-5 h-5 shrink-0 ${phase === "failed" ? "text-red-500" : "text-amber-500"}`} />
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${phase === "failed" ? "text-red-700" : "text-amber-700"}`}>
                    {message}
                  </p>
                  {phase === "pending" && returnOrderId && (
                    <button
                      onClick={() => verify(returnOrderId)}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Check again
                    </button>
                  )}
                </div>
              </div>
            )}

            {!alreadyPaid && (
              <button
                onClick={startPayment}
                disabled={busy || Number(trip.price) <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {phase === "verifying" ? "Confirming payment…" : phase === "checkout" ? "Complete payment…" : "Starting…"}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Pay ₹{Number(trip.price).toLocaleString("en-IN")} with Cashfree
                  </>
                )}
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Payments processed securely by Cashfree
              {" · "}
              <span className="uppercase font-bold tracking-wide">Sandbox / test mode</span>
            </div>
          </>
        )}

        {phase === "success" && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-lg font-extrabold text-green-800">Payment successful</p>
            <p className="text-sm text-green-700 mt-1">Your vehicle shift is now scheduled.</p>
            {receipt && (
              <div className="mt-4 text-left bg-white rounded-xl border border-green-100 p-4 text-xs text-neutral-600 space-y-1">
                {receipt.amount && <p>Amount: <strong className="text-neutral-900">₹{Number(receipt.amount).toLocaleString("en-IN")}</strong></p>}
                {receipt.method && <p>Method: <strong className="text-neutral-900 capitalize">{receipt.method.replace(/_/g, " ")}</strong></p>}
                {receipt.referenceId && <p>Reference: <strong className="text-neutral-900">{receipt.referenceId}</strong></p>}
              </div>
            )}
            <button
              onClick={() => navigate("/my-rides")}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-sm"
            >
              Go to My Rides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
