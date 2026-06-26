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
import { ChevronLeft, Calendar, Car, Clock, CreditCard, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing Stripe public key");
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingSummary = ({ vehicle, booking }: any) => {
  return (
    <div className="p-4 bg-white rounded-lg border border-neutral-200">
      <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
      
      <div className="flex items-center gap-3 mt-4">
        <div className="h-16 w-16 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center">
          {vehicle.image ? (
            <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
          ) : (
            <Car className="h-8 w-8 text-neutral-400" />
          )}
        </div>
        <div>
          <h4 className="font-medium">{vehicle.make} {vehicle.model}</h4>
          <p className="text-sm text-neutral-600">{vehicle.registrationNumber}</p>
          {vehicle.type && (
            <span className="inline-block px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded text-xs mt-1">
              {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
            </span>
          )}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <span>Pickup date</span>
          </div>
          <span className="font-medium">{format(new Date(booking.pickupDate), "dd MMM yyyy")}</span>
        </div>
        
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <span>Return date</span>
          </div>
          <span className="font-medium">{format(new Date(booking.returnDate), "dd MMM yyyy")}</span>
        </div>
        
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span>Duration</span>
          </div>
          <span className="font-medium">{booking.totalDays} days</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Price per day</span>
          <span className="font-medium">₹{Number(vehicle.pricePerDay).toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm">Duration</span>
          <span className="font-medium">× {booking.totalDays} days</span>
        </div>
        
        {booking.insuranceFee > 0 && (
          <div className="flex justify-between">
            <span className="text-sm">Insurance fee</span>
            <span className="font-medium">+ ₹{booking.insuranceFee.toLocaleString()}</span>
          </div>
        )}
        
        {booking.discount > 0 && (
          <div className="flex justify-between text-blue-600">
            <span className="text-sm">Discount</span>
            <span className="font-medium">- ₹{booking.discount.toLocaleString()}</span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>₹{booking.totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const PaymentForm = ({ clientSecret, onPaymentSuccess }: { clientSecret: string, onPaymentSuccess: (paymentId: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-success",
      },
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
      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed",
      });
      onPaymentSuccess(paymentIntent.id);
    }
    
    setIsLoading(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-secondary-500" />
          Payment Details
        </h3>
        
        <PaymentElement />
        
        {errorMessage && (
          <div className="mt-4 text-red-500 text-sm">{errorMessage}</div>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-secondary-500 hover:bg-secondary-600 text-white"
        disabled={!stripe || isLoading}
      >
        {isLoading ? "Processing..." : "Complete Payment"}
      </Button>
    </form>
  );
};

const PaymentSuccess = ({ bookingDetails, onClose }: { bookingDetails: any, onClose: () => void }) => {
  return (
    <div className="text-center bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-blue-500" />
      </div>
      
      <h2 className="text-xl font-bold">Booking Confirmed!</h2>
      <p className="text-neutral-600">
        Your payment was successful and your booking has been confirmed.
      </p>
      
      <div className="bg-neutral-50 p-4 rounded-lg text-left">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm text-neutral-500">Booking ID:</div>
          <div className="text-sm font-medium">{bookingDetails.id}</div>
          
          <div className="text-sm text-neutral-500">Vehicle:</div>
          <div className="text-sm font-medium">{bookingDetails.vehicleName}</div>
          
          <div className="text-sm text-neutral-500">Pickup Date:</div>
          <div className="text-sm font-medium">{format(new Date(bookingDetails.pickupDate), "dd MMM yyyy")}</div>
          
          <div className="text-sm text-neutral-500">Return Date:</div>
          <div className="text-sm font-medium">{format(new Date(bookingDetails.returnDate), "dd MMM yyyy")}</div>
          
          <div className="text-sm text-neutral-500">Total Amount:</div>
          <div className="text-sm font-medium">₹{bookingDetails.totalAmount.toLocaleString()}</div>
        </div>
      </div>
      
      <Button 
        onClick={onClose}
        className="w-full"
      >
        Go to Bookings
      </Button>
    </div>
  );
};

export default function Checkout() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/checkout/:vehicleId");
  const vehicleId = params?.vehicleId;
  
  const [vehicle, setVehicle] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Retrieve URL parameters for booking details
  useEffect(() => {
    if (!vehicleId) {
      navigate("/travel");
      return;
    }
    
    const params = new URLSearchParams(window.location.search);
    const pickupDate = params.get("pickupDate");
    const returnDate = params.get("returnDate");
    const insuranceFee = params.get("insurance") === "true" ? 499 : 0;
    
    // Fetch vehicle details
    const fetchVehicleAndCreatePayment = async () => {
      try {
        // For demo purposes, using mock data since we don't have a real endpoint
        // In a real app, we would fetch vehicle details from API
        const mockVehicle = {
          id: vehicleId,
          make: "Toyota",
          model: "Innova",
          type: "car",
          registrationNumber: "TN 05 XY 7890",
          pricePerDay: "3500",
          image: "https://images.unsplash.com/photo-1550355291-bbee04a92027"
        };
        
        setVehicle(mockVehicle);
        
        if (!pickupDate || !returnDate) {
          throw new Error("Missing booking dates");
        }
        
        const pickup = new Date(pickupDate);
        const returnD = new Date(returnDate);
        const diffTime = Math.abs(returnD.getTime() - pickup.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalDays = diffDays > 0 ? diffDays : 1;
        
        const baseAmount = Number(mockVehicle.pricePerDay) * totalDays;
        const discount = totalDays >= 7 ? baseAmount * 0.1 : 0; // 10% discount for bookings 7+ days
        const totalAmount = baseAmount + insuranceFee - discount;
        
        const booking = {
          vehicleId,
          pickupDate,
          returnDate,
          totalDays,
          insuranceFee,
          discount,
          totalAmount
        };
        
        setBookingData(booking);
        
        // Create payment intent
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          vehicleId,
          totalDays,
          totalAmount
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
    
    fetchVehicleAndCreatePayment();
  }, [vehicleId, navigate, toast]);
  
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Confirm booking
      const response = await apiRequest("POST", "/api/confirm-booking", {
        paymentIntentId,
        vehicleId,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        totalDays: bookingData.totalDays,
        totalAmount: bookingData.totalAmount
      });
      
      const bookingConfirmation = await response.json();
      
      setConfirmedBooking({
        ...bookingConfirmation,
        vehicleName: `${vehicle.make} ${vehicle.model}`
      });
      setPaymentCompleted(true);
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        title: "Booking Error",
        description: "Your payment was successful, but there was an issue confirming your booking. Please contact support.",
        variant: "destructive",
      });
    }
  };
  
  const handleClose = () => {
    navigate("/profile"); // Navigate to bookings/profile
  };
  
  return (
    <div className="max-w-xl mx-auto bg-neutral-50 min-h-screen pb-20">
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
      
      <div className="p-4 space-y-6 pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
          </div>
        ) : paymentCompleted ? (
          <PaymentSuccess bookingDetails={confirmedBooking} onClose={handleClose} />
        ) : (
          <>
            {vehicle && bookingData && (
              <BookingSummary vehicle={vehicle} booking={bookingData} />
            )}
            
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm 
                  clientSecret={clientSecret} 
                  onPaymentSuccess={handlePaymentSuccess} 
                />
              </Elements>
            )}
          </>
        )}
      </div>
    </div>
  );
}