import { useState, useRef, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Car, 
  Bike, 
  Star, 
  User, 
  Users, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronDown, 
  Fuel, 
  Banknote,
  ShieldCheck,
  CircleCheck,
  CheckCheck,
  Home,
  Building2,
  Navigation,
  Bell,
  AlertTriangle,
  Headphones,
  MessageCircle,
  Loader2,
  Images
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AVAILABLE_VEHICLES, computeFare, FUEL_PRICE_PER_LITRE, HUBS, DEFAULT_HUBS, getVehicleImages, getAvailabilityWindow, getVehicleDetails } from "@/lib/constants";
import VehicleDetailsSheet from "@/components/common/VehicleDetailsSheet";
import VehiclePhotoGallery from "@/components/common/VehiclePhotoGallery"; 
import { addStoredNotif } from "@/lib/notificationsStore";
import { useToast } from "@/hooks/use-toast";

type RequestStage = "form" | "dropped" | "confirmed";

export default function VehicleDetails() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/vehicle/:id");
  const [showReviews, setShowReviews] = useState(false);
  const [showFeatures, setShowFeatures] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const { toast } = useToast();

  // Quick Book request flow state
  const [pickupType, setPickupType] = useState<"hub" | "home">("hub");
  const [selectedHub, setSelectedHub] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [pickupTime, setPickupTime] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [requestStage, setRequestStage] = useState<RequestStage>("form");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);
  
  const vehicleId = params?.id;

  /* Trip params passed from the Travel/booking flow (petrol-price driven fare) */
  const tripSearch = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const tripDistance = parseInt(tripSearch.get("distance") || "", 10);
  const tripPickup = tripSearch.get("pickup") || "";
  const tripDrop = tripSearch.get("drop") || "";
  const tripCategoryParam = tripSearch.get("category") || "";
  
  // For demo purposes, we'll use the vehicle data from constants
  const vehicle = AVAILABLE_VEHICLES.find(v => v.id === vehicleId);
  
  // Hubs available near the pickup city
  const hubOptions = (tripPickup && HUBS[tripPickup]) || DEFAULT_HUBS;

  const pickupPointReady =
    pickupType === "hub" ? selectedHub.trim().length > 0 : homeAddress.trim().length > 0;
  const canSubmitRequest = pickupPointReady && !!pickupDate && termsAccepted;

  const resetRequest = () => {
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setRequestStage("form");
    setSelectedHub("");
    setHomeAddress("");
    setPickupType("hub");
    setPickupDate(undefined);
    setPickupTime("");
    setTermsAccepted(false);
  };

  // Drop the request to the owner, then simulate the owner confirming it.
  const handleDropRequest = () => {
    if (!canSubmitRequest || !vehicle) return;
    const pickupPoint = pickupType === "hub" ? selectedHub : homeAddress;
    const vehicleLabel = `${vehicle.make} ${vehicle.model}`;
    const dateLabel = pickupDate ? format(pickupDate, "PPP") : "";

    setRequestStage("dropped");
    addStoredNotif({
      category: "bookings",
      iconKey: "request",
      color: "blue",
      title: "Request Sent",
      body: `You requested ${vehicleLabel}${tripDrop ? ` to ${tripDrop}` : ""} · Pickup at ${pickupPoint}${dateLabel ? ` on ${dateLabel}` : ""}. Waiting for owner to confirm.`,
    });

    confirmTimer.current = setTimeout(() => {
      setRequestStage("confirmed");
      addStoredNotif({
        category: "bookings",
        iconKey: "accepted",
        color: "blue",
        title: "Owner Confirmed Your Request",
        body: `${vehicle.ownerName || "The owner"} confirmed ${vehicleLabel}. Chat is now open to arrange timing & pickup.`,
      });
      toast({
        title: "Owner confirmed your request",
        description: "You can now chat with the owner about timing and pickup.",
      });
    }, 3000);
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate("/travel");
  };
  
  // Vehicle resolves synchronously from constants, so a missing vehicle means
  // the ID is invalid / not found — show a clear not-found state, not a loader.
  if (!vehicle) {
    return (
      <div className="max-w-lg mx-auto min-h-screen flex flex-col items-center justify-center text-center px-6 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
          <Car className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-neutral-900">Vehicle not found</h2>
          <p className="text-sm text-neutral-500 mt-1">
            This vehicle may no longer be available or the link is incorrect.
          </p>
        </div>
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl active:scale-95 transition-all"
        >
          Browse vehicles
        </button>
      </div>
    );
  }

  const vehicleImages = getVehicleImages(vehicle);
  const availWindow = getAvailabilityWindow(vehicle.id);

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <Header />
      
      <div className="flex items-center justify-between mb-4 mt-2">
        <h1 className="text-xl font-bold">Vehicle Details</h1>
      </div>
      
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="default" 
          size="lg"
          onClick={handleBack}
          className="bg-black text-white shadow-lg hover:bg-gray-800 rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
      </div>
      
      {/* Vehicle Images */}
      <div className="relative rounded-xl overflow-hidden bg-neutral-100 h-64 mb-2">
        {vehicle.image ? (
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="w-full h-full group"
            data-testid="button-open-gallery"
          >
            <img 
              src={vehicle.image} 
              alt={`${vehicle.make} ${vehicle.model}`} 
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
            />
            <span className="absolute bottom-3 left-3 bg-black/65 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Images className="w-3.5 h-3.5" /> {vehicleImages.length} photos
            </span>
          </button>
        ) : (
          <div className="flex items-center justify-center h-full">
            {vehicle.type === 'car' ? 
              <Car className="text-neutral-400 w-24 h-24" /> : 
              <Bike className="text-neutral-400 w-24 h-24" />
            }
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-primary-700 font-semibold">
            {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className={`${
              vehicle.availabilityStatus === 'available' 
              ? 'bg-blue-600/90 text-white' 
              : 'bg-amber-500/90 text-white'
            } font-semibold`}
          >
            {vehicle.availabilityStatus === 'available' 
              ? 'Available Now' 
              : 'Available Tomorrow'}
          </Badge>
        </div>
        
        {vehicle.rating && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-yellow-500 font-semibold flex items-center">
              <Star className="fill-yellow-500 w-4 h-4 mr-1" />
              {vehicle.rating.toFixed(1)}
              {vehicle.totalRatings && (
                <span className="text-neutral-500 text-xs ml-1">
                  ({vehicle.totalRatings})
                </span>
              )}
            </Badge>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {vehicleImages.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="shrink-0 h-14 w-20 rounded-lg overflow-hidden border border-neutral-200 active:scale-95 transition"
            data-testid={`button-thumb-${i}`}
          >
            <img src={img} alt={`view ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Available pickup window */}
      <div className="flex items-center gap-2 mb-3 bg-primary-50 border border-primary-100 rounded-xl px-3 py-2">
        <Clock className="w-4 h-4 text-primary-600" />
        <span className="text-sm text-neutral-600">Available pickup window</span>
        <span className="ml-auto text-sm font-bold text-primary-700">{availWindow.label}</span>
      </div>

      {/* ── Vehicle Details button ── */}
      <button
        type="button"
        onClick={() => setShowVehicleDetails(true)}
        className="w-full flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 active:scale-95 transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-blue-700">Insurance, RC &amp; Full Vehicle Info</p>
            <p className="text-[11px] text-blue-500">Tap to view all vehicle documents</p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-blue-400 -rotate-90" />
      </button>
      
      {/* Vehicle Info */}
      {(() => {
        const PREMIUM_MAKES = ["BMW","Mercedes","Audi","Jaguar","Lexus","Land Rover","KTM","Royal Enfield"];
        const isPremium = vehicle.vehicleCategory === "premium" || PREMIUM_MAKES.includes(vehicle.make);
        const isBike = vehicle.type === "bike";
        const isSuv = vehicle.type === "suv";
        const category = tripCategoryParam || (isPremium ? "premium" : isBike ? "bike" : isSuv ? "suv" : "car");
        const hasRoute = tripDistance > 0;
        const f = computeFare(hasRoute ? tripDistance : 0, category);
        return (
          <div className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-2xl font-bold mb-1">{vehicle.make} {vehicle.model}</h2>
                <p className="text-neutral-600">{vehicle.registrationNumber}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                isPremium ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}>
                {isPremium ? "✦ Premium" : "● Normal"}
              </span>
            </div>

            {/* Petrol-price-driven fare breakdown (matches checkout) */}
            <div className="rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-4 py-2.5 flex items-center justify-between border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Fare Estimate</span>
                <span className="text-[10px] font-semibold text-neutral-400">Petrol ₹{FUEL_PRICE_PER_LITRE}/L</span>
              </div>

              {hasRoute ? (
                <div className="p-4 space-y-2">
                  <p className="text-xs text-neutral-500 mb-1">{tripPickup && tripDrop ? `${tripPickup} → ${tripDrop} · ` : ""}{tripDistance} km</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Trip cost <span className="text-[11px] text-neutral-400">(fuel ₹{f.fuelCost.toLocaleString("en-IN")} + toll ₹{f.tollCost.toLocaleString("en-IN")})</span></span>
                    <span className="font-semibold text-neutral-800">₹{f.tripCost.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">App fee <span className="text-[11px] text-neutral-400">(to Shiftzy)</span></span>
                    <span className="font-semibold text-neutral-800">₹{f.platformFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">GST</span>
                    <span className="font-semibold text-neutral-800">₹{f.gst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-neutral-100">
                    <span className="font-bold text-neutral-900">Total fare</span>
                    <span className="text-lg font-extrabold text-blue-700">₹{f.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-sm text-neutral-600">
                    Choose your route in the <span className="font-semibold text-blue-700">GO</span> tab to see the exact fare. Fares are calculated from the current petrol price, distance, tolls, app fee &amp; GST.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      
      {/* Owner Details */}
      <Card className="p-4 border border-neutral-200 mb-6">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${vehicle.ownerName}&background=3B82F6&color=fff`} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{vehicle.ownerName || "Vehicle Owner"}</div>
            <div className="text-sm text-neutral-500">Vehicle Owner</div>
          </div>
          {vehicle.rating && (
            <div className="ml-auto flex items-center">
              <Star className="text-yellow-500 fill-yellow-500 w-4 h-4 mr-1" />
              <span className="font-medium">{vehicle.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Card>
      
      {/* Vehicle Details Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-3 border border-neutral-200">
          <div className="flex flex-col h-full">
            <div className="text-neutral-500 mb-1 text-sm">Seating</div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-500" />
              <span className="font-medium">{vehicle.seatingCapacity || '4'} Persons</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 border border-neutral-200">
          <div className="flex flex-col h-full">
            <div className="text-neutral-500 mb-1 text-sm">Color</div>
            <div className="flex items-center">
              <div 
                className="w-5 h-5 rounded-full mr-2 border border-neutral-200" 
                style={{ backgroundColor: vehicle.color || "#3B82F6" }}
              ></div>
              <span className="font-medium capitalize">{vehicle.color || "Blue"}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 border border-neutral-200">
          <div className="flex flex-col h-full">
            <div className="text-neutral-500 mb-1 text-sm">Fuel Type</div>
            <div className="flex items-center">
              <Fuel className="h-5 w-5 mr-2 text-primary-500" />
              <span className="font-medium capitalize">{vehicle.fuelType || "Petrol"}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 border border-neutral-200">
          <div className="flex flex-col h-full">
            <div className="text-neutral-500 mb-1 text-sm">Owner Rate</div>
            <div className="flex items-center">
              <Banknote className="h-5 w-5 mr-2 text-orange-500" />
              <span className="font-medium text-orange-700">
                ₹{["BMW","Mercedes","Audi","Jaguar","Lexus","Land Rover"].includes(vehicle.make) ? 20 : vehicle.type === "suv" ? 15 : vehicle.type === "bike" ? (["KTM","Royal Enfield"].includes(vehicle.make) ? 10 : 7) : 13}/km
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Vehicle Features */}
      <div className="mb-6">
        <button 
          className="flex items-center justify-between w-full py-3"
          onClick={() => setShowFeatures(!showFeatures)}
        >
          <div className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary-500" />
            <span className="font-semibold text-lg">Features & Amenities</span>
          </div>
          <ChevronLeft className={`h-5 w-5 transition-transform ${showFeatures ? 'rotate-90' : '-rotate-90'}`} />
        </button>
        
        <Separator className="mb-4" />
        
        {showFeatures && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {vehicle.features ? (
              vehicle.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">Air Conditioning</span>
                </div>
                <div className="flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">Bluetooth</span>
                </div>
                <div className="flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">Power Steering</span>
                </div>
                <div className="flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">Well Maintained</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Reviews Section */}
      <div className="mb-6">
        <button 
          className="flex items-center justify-between w-full py-3"
          onClick={() => setShowReviews(!showReviews)}
        >
          <div className="flex items-center">
            <Star className="mr-2 h-5 w-5 text-primary-500" />
            <span className="font-semibold text-lg">Reviews & Ratings</span>
          </div>
          <ChevronLeft className={`h-5 w-5 transition-transform ${showReviews ? 'rotate-90' : '-rotate-90'}`} />
        </button>
        
        <Separator className="mb-4" />
        
        {showReviews && (
          <ReviewsSection 
            type="vehicle" 
            id={parseInt(vehicle.id)} 
            showForm={true}
          />
        )}
      </div>
      
      {/* Booking Buttons */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-neutral-200">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
            size="lg" 
            onClick={() => { resetRequest(); setIsBookingOpen(true); }}
          >
            Quick Book
          </Button>
          
          <Button 
            className="w-full bg-secondary-500 hover:bg-secondary-600 text-white" 
            size="lg"
            variant="outline"
            onClick={() => {
              const category = tripCategoryParam
                || (vehicle.vehicleCategory === "premium" ? "premium" : vehicle.type || "car");
              const distance = (tripDistance && tripDistance > 0) ? tripDistance : "";
              const q = new URLSearchParams();
              if (distance) q.set("distance", String(distance));
              q.set("category", category);
              if (tripPickup) q.set("pickup", tripPickup);
              if (tripDrop) q.set("drop", tripDrop);
              navigate(`/checkout/${vehicleId}?${q.toString()}`);
            }}
          >
            Pay Now
          </Button>
        </div>
      </div>
      
      {/* Quick Book Dialog */}
      <Dialog
        open={isBookingOpen}
        onOpenChange={(open) => {
          setIsBookingOpen(open);
          // Keep the pending owner-confirmation alive if the user closes the
          // dialog mid-wait; only reset when no request is in flight.
          if (!open && requestStage !== "dropped") resetRequest();
        }}
      >
        <DialogContent className="sm:max-w-[440px] max-h-[88vh] overflow-y-auto">
          {requestStage === "form" && (
            <>
              <DialogHeader>
                <DialogTitle>Quick Book · {vehicle.make} {vehicle.model}</DialogTitle>
                <DialogDescription>
                  No need to re-enter your route — just choose your pickup point and confirm.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2">
                {/* Route summary (carried over from GO) */}
                {(tripPickup || tripDrop) && (
                  <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-neutral-800">{tripPickup || "Pickup"}</span>
                    <span className="text-neutral-400">→</span>
                    <span className="font-semibold text-neutral-800">{tripDrop || "Drop"}</span>
                  </div>
                )}

                {/* Pickup point: hub vs home */}
                <div>
                  <p className="text-sm font-semibold text-neutral-800 mb-2">Where should we pick up the vehicle?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPickupType("hub")}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all",
                        pickupType === "hub"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-neutral-200 text-neutral-600"
                      )}
                    >
                      <Building2 className="h-4 w-4" /> Common Hub
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickupType("home")}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all",
                        pickupType === "home"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-neutral-200 text-neutral-600"
                      )}
                    >
                      <Home className="h-4 w-4" /> House Address
                    </button>
                  </div>

                  {pickupType === "hub" ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between mt-3", !selectedHub && "text-muted-foreground")}
                        >
                          {selectedHub || "Select a common hub"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <div className="max-h-[200px] overflow-y-auto">
                          {hubOptions.map((hub) => (
                            <div
                              key={hub}
                              className="cursor-pointer p-2.5 text-sm hover:bg-neutral-100"
                              onClick={() => setSelectedHub(hub)}
                            >
                              {hub}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Input
                      className="mt-3"
                      placeholder="Enter your house / pickup address"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                    />
                  )}
                </div>

                {/* Pickup date + time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-neutral-800 mb-2">Pickup date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !pickupDate && "text-muted-foreground")}
                        >
                          {pickupDate ? format(pickupDate, "PP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-neutral-800 mb-2">Pickup time</p>
                    <Input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Trust & safety */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2.5">Every shift is protected</p>
                  <div className="space-y-2">
                    {[
                      { icon: Navigation, text: "24/7 live GPS tracking of your vehicle" },
                      { icon: Bell, text: "Instant pickup & drop updates" },
                      { icon: AlertTriangle, text: "Alerts if the vehicle goes off-route" },
                      { icon: ShieldCheck, text: "Insurance cover during the shift" },
                      { icon: Headphones, text: "24/7 on-call support" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5 text-sm text-neutral-700">
                        <Icon className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms acknowledgement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={termsAccepted}
                    onCheckedChange={(c) => setTermsAccepted(c === true)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-neutral-600 leading-relaxed">
                    I agree to drive responsibly and carefully, behave well, keep the vehicle well-maintained,
                    and not misuse it in any way, as per government law. I accept the booking terms & conditions.
                  </span>
                </label>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  disabled={!canSubmitRequest}
                  onClick={handleDropRequest}
                >
                  Book My Request
                </Button>
              </div>
            </>
          )}

          {requestStage === "dropped" && (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-100 rounded-full p-3 mb-4">
                <CircleCheck className="h-8 w-8 text-blue-600" />
              </div>
              <DialogTitle className="mb-2">You've dropped a request!</DialogTitle>
              <DialogDescription className="mb-5">
                Your request for {vehicle.make} {vehicle.model} has been sent to the owner.
                We'll notify you the moment they confirm.
              </DialogDescription>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                Waiting for the owner to confirm…
              </div>
            </div>
          )}

          {requestStage === "confirmed" && (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-100 rounded-full p-3 mb-4">
                <CheckCheck className="h-8 w-8 text-blue-600" />
              </div>
              <DialogTitle className="mb-2">Owner confirmed your request!</DialogTitle>
              <DialogDescription className="mb-6">
                {vehicle.ownerName || "The owner"} has accepted your request for {vehicle.make} {vehicle.model}.
                Chat with them now to fix the timing and whether it's a hub or house pickup.
              </DialogDescription>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                onClick={() => {
                  setIsBookingOpen(false);
                  resetRequest();
                  navigate("/chat");
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Chat with Owner
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <VehiclePhotoGallery
        images={vehicleImages}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        title={`${vehicle.make} ${vehicle.model}`}
      />

      <VehicleDetailsSheet
        open={showVehicleDetails}
        onClose={() => setShowVehicleDetails(false)}
        vehicle={{ id: vehicle.id, make: vehicle.make, model: vehicle.model, registrationNumber: vehicle.registrationNumber, fuelType: vehicle.fuelType, type: vehicle.type }}
        owner={{ name: vehicle.ownerName ?? "Owner", rating: vehicle.rating }}
      />

      <BottomNav />
    </div>
  );
}