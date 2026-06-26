import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import {
  ChevronLeft, MapPin, Fuel, Landmark, BadgePercent, ShieldCheck,
  CreditCard, CheckCircle, Clock, ReceiptText, Navigation
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  computeFare, FUEL_PRICE_PER_LITRE, PLATFORM_FEE_PERCENT, GST_PERCENT,
  FARE_CATEGORIES, type FareBreakdown
} from "@/lib/constants";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing Stripe public key");
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const normalizeCategory = (cat: string) =>
  cat in FARE_CATEGORIES ? cat : (cat === "luxury" ? "premium" : "car");

interface Booking {
  pickup: string;
  drop: string;
  category: string;
  distanceKm: number;
  fare: FareBreakdown;
}

/* ─── Fare breakdown (petrol-price driven) ─── */
const FareBreakdownCard = ({ booking, paid }: { booking: Booking; paid: boolean }) => {
  const f = booking.fare;
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold">Fare Breakdown</h3>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
          paid ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
        }`}>
          {paid ? "Payment Successful" : "Payment Pending"}
        </span>
      </div>

      {/* Trip cost (running cost, shared) */}
      <div className="flex justify-between items-center py-1.5">
        <span className="text-sm font-semibold text-neutral-800">Trip Cost</span>
        <span className="text-sm font-bold text-neutral-900">{inr(f.tripCost)}</span>
      </div>
      <div className="pl-3 space-y-1 mb-1">
        <div className="flex justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-blue-500" /> Fuel ({booking.distanceKm} km @ ₹{FUEL_PRICE_PER_LITRE}/L)</span>
          <span>{inr(f.fuelCost)}</span>
        </div>
        <div className="flex justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-blue-500" /> Tolls & road charges</span>
          <span>{inr(f.tollCost)}</span>
        </div>
      </div>

      <Separator className="my-2" />

      {/* App fee → admin (SEPARATE line, on top of other charges) */}
      <div className="flex justify-between items-center py-1.5">
        <span className="text-sm text-neutral-700 flex items-center gap-1.5">
          <BadgePercent className="w-4 h-4 text-orange-500" />
          App Fee ({PLATFORM_FEE_PERCENT}%)
        </span>
        <span className="text-sm font-semibold text-neutral-900">{inr(f.platformFee)}</span>
      </div>
      <p className="pl-6 text-[10px] text-neutral-400 -mt-1 mb-1">Shiftzy platform fee — collected by Shiftzy</p>

      {/* GST */}
      <div className="flex justify-between items-center py-1.5">
        <span className="text-sm text-neutral-700">GST ({GST_PERCENT}% on app fee)</span>
        <span className="text-sm font-semibold text-neutral-900">{inr(f.gst)}</span>
      </div>

      <Separator className="my-2" />

      {/* Total */}
      <div className="flex justify-between items-center py-1">
        <span className="text-base font-bold text-neutral-900">Total Payable</span>
        <span className="text-lg font-extrabold text-blue-700">{inr(f.total)}</span>
      </div>

      <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
        <Fuel className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 leading-relaxed">
          Fares are calculated from the current petrol price (₹{FUEL_PRICE_PER_LITRE}/L) and your route distance.
        </p>
      </div>
    </div>
  );
};

/* ─── Trip summary ─── */
const TripSummary = ({ booking }: { booking: Booking }) => (
  <div className="bg-white rounded-2xl border border-neutral-200 p-4">
    <h3 className="text-base font-bold mb-3">Trip Summary</h3>
    <div className="flex items-center gap-2 text-sm">
      <div className="flex flex-col items-center pt-1">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
        <span className="w-0.5 h-6 bg-neutral-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
      </div>
      <div className="flex-1 space-y-3">
        <p className="font-semibold text-neutral-800">{booking.pickup}</p>
        <p className="font-semibold text-neutral-800">{booking.drop}</p>
      </div>
    </div>
    <Separator className="my-3" />
    <div className="flex justify-between text-xs text-neutral-500">
      <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> {booking.distanceKm} km</span>
      <span className="flex items-center gap-1.5 capitalize">
        <MapPin className="w-3.5 h-3.5" /> {FARE_CATEGORIES[normalizeCategory(booking.category)].label}
      </span>
    </div>
  </div>
);

const PaymentForm = ({ onPaymentSuccess }: { onPaymentSuccess: (paymentId: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/payment-success" },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed. Please try again.");
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong with your payment",
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast({ title: "Payment Successful", description: "Your booking has been confirmed" });
      onPaymentSuccess(paymentIntent.id);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-2xl border border-neutral-200 p-4">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Payment Details
        </h3>
        <PaymentElement />
        {errorMessage && <div className="mt-4 text-red-500 text-sm">{errorMessage}</div>}
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-bold rounded-xl"
        disabled={!stripe || isLoading}
      >
        {isLoading ? "Processing..." : "Pay Securely"}
      </Button>
    </form>
  );
};

/* ─── Invoice (after successful payment) ─── */
const Invoice = ({ booking, invoiceNo, paymentId, onClose }: {
  booking: Booking; invoiceNo: string; paymentId: string; onClose: () => void;
}) => {
  const f = booking.fare;
  const rows = [
    { label: "Trip Cost (fuel + tolls)", value: f.tripCost },
    { label: `App Fee (${PLATFORM_FEE_PERCENT}%) — to Shiftzy`, value: f.platformFee },
    { label: `GST (${GST_PERCENT}% on app fee)`, value: f.gst },
  ];
  return (
    <div className="space-y-4">
      <div className="text-center bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex justify-center mb-3">
          <CheckCircle className="h-14 w-14 text-blue-600" />
        </div>
        <h2 className="text-xl font-extrabold">Booking Confirmed!</h2>
        <p className="text-neutral-500 text-sm mt-1">Your payment was successful.</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold">Invoice</h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">PAID</span>
        </div>

        <div className="grid grid-cols-2 gap-y-1.5 text-xs mb-4">
          <span className="text-neutral-400">Invoice No.</span>
          <span className="text-right font-semibold text-neutral-700">{invoiceNo}</span>
          <span className="text-neutral-400">Date</span>
          <span className="text-right font-semibold text-neutral-700">{format(new Date(), "dd MMM yyyy")}</span>
          <span className="text-neutral-400">Route</span>
          <span className="text-right font-semibold text-neutral-700">{booking.pickup} → {booking.drop}</span>
          <span className="text-neutral-400">Payment ID</span>
          <span className="text-right font-semibold text-neutral-700 truncate">{paymentId.slice(0, 18)}…</span>
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-neutral-600">{r.label}</span>
              <span className="font-medium text-neutral-800">{inr(r.value)}</span>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between font-bold text-base">
          <span>Total Paid</span>
          <span className="text-blue-700">{inr(f.total)}</span>
        </div>
      </div>

      <Button onClick={onClose} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
        Go to My Trips
      </Button>
    </div>
  );
};

export default function Checkout() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/checkout/:vehicleId");
  const vehicleId = params?.vehicleId;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!vehicleId) {
      navigate("/travel");
      return;
    }

    const search = new URLSearchParams(window.location.search);
    const category = normalizeCategory(search.get("category") || "car");
    const pickup = search.get("pickup") || "Pickup location";
    const drop = search.get("drop") || "Drop location";
    let distanceKm = parseInt(search.get("distance") || "", 10);
    if (!distanceKm || distanceKm < 1) distanceKm = 100; // sensible fallback

    const fare = computeFare(distanceKm, category);
    const bookingData: Booking = { pickup, drop, category, distanceKm, fare };
    setBooking(bookingData);

    const setup = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          vehicleId,
          totalDays: 1,
          totalAmount: fare.total,
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      } catch (error) {
        console.error("Error setting up checkout:", error);
        toast({
          title: "Checkout Error",
          description: "There was a problem setting up your checkout. Please try again.",
          variant: "destructive",
        });
        navigate("/travel");
      }
    };

    setup();
  }, [vehicleId, navigate, toast]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!booking) return;
    setPaymentId(paymentIntentId);
    setInvoiceNo(`SZ-${Date.now().toString().slice(-8)}`);
    try {
      const today = new Date().toISOString();
      await apiRequest("POST", "/api/confirm-booking", {
        paymentIntentId,
        vehicleId,
        pickupDate: today,
        returnDate: today,
        totalDays: 1,
        totalAmount: booking.fare.total,
      });
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        title: "Booking Note",
        description: "Payment succeeded. Your booking is being confirmed.",
      });
    } finally {
      setPaymentCompleted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-neutral-50 min-h-screen pb-20">
      <Header title="Checkout" showBackButton variant="secondary" />

      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="default"
          size="lg"
          onClick={() => navigate(`/vehicle/${vehicleId}`)}
          className="bg-black text-white shadow-lg hover:bg-gray-800 rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
      </div>

      <div className="p-4 space-y-4 pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : paymentCompleted && booking ? (
          <Invoice
            booking={booking}
            invoiceNo={invoiceNo}
            paymentId={paymentId}
            onClose={() => navigate("/profile")}
          />
        ) : (
          <>
            {booking && (
              <>
                <TripSummary booking={booking} />
                <FareBreakdownCard booking={booking} paid={false} />
              </>
            )}

            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
              </Elements>
            )}
          </>
        )}
      </div>
    </div>
  );
}
