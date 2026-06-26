import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Calendar as CalendarIcon } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
  Map,
  ArrowRight,
  CircleCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AVAILABLE_VEHICLES, LOCATIONS } from "@/lib/constants"; 
import { useToast } from "@/hooks/use-toast";

// Form schema for booking
const bookingFormSchema = z.object({
  pickupLocation: z.string().min(1, { message: "Please select a pickup location" }),
  dropLocation: z.string().min(1, { message: "Please select a drop location" }),
  pickupDate: z.date({ required_error: "Please select a date" }),
});

export default function VehicleDetails() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/vehicle/:id");
  const [showReviews, setShowReviews] = useState(false);
  const [showFeatures, setShowFeatures] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { toast } = useToast();
  
  const vehicleId = params?.id;
  
  // For demo purposes, we'll use the vehicle data from constants
  const vehicle = AVAILABLE_VEHICLES.find(v => v.id === vehicleId);
  
  // Booking form
  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupLocation: "",
      dropLocation: "",
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof bookingFormSchema>) => {
    console.log(values);
    // In a real app, this would be an API call
    setTimeout(() => {
      setBookingSuccess(true);
    }, 1000);
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
      <div className="relative rounded-xl overflow-hidden bg-neutral-100 h-64 mb-4">
        {vehicle.image ? (
          <img 
            src={vehicle.image} 
            alt={`${vehicle.make} ${vehicle.model}`} 
            className="w-full h-full object-cover"
          />
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
              ? 'bg-green-500/90 text-white' 
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
      
      {/* Vehicle Info */}
      {(() => {
        const PREMIUM_MAKES = ["BMW","Mercedes","Audi","Jaguar","Lexus","Land Rover","KTM","Royal Enfield"];
        const isPremium = vehicle.vehicleCategory === "premium" || PREMIUM_MAKES.includes(vehicle.make);
        const isBike = vehicle.type === "bike";
        const isSuv = vehicle.type === "suv";
        let ownerPerKm: number, fuelPerKm: number, appFeePerKm: number;
        if (isBike) { ownerPerKm = isPremium ? 10 : 7; fuelPerKm = isPremium ? 4 : 3; appFeePerKm = isPremium ? 3 : 2; }
        else if (isSuv) { ownerPerKm = 15; fuelPerKm = 10; appFeePerKm = 4; }
        else if (isPremium) { ownerPerKm = 20; fuelPerKm = 8; appFeePerKm = 6; }
        else { ownerPerKm = 13; fuelPerKm = 8; appFeePerKm = 3; }
        return (
          <div className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-2xl font-bold mb-1">{vehicle.make} {vehicle.model}</h2>
                <p className="text-neutral-600">{vehicle.registrationNumber}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                isPremium ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-green-100 text-green-700 border border-green-200"
              }`}>
                {isPremium ? "✦ Premium" : "● Normal"}
              </span>
            </div>
            {/* Shared-cost pricing breakdown */}
            <div className="space-y-2">
              {/* Total trip cost reference */}
              <div className="bg-neutral-100 rounded-xl px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-medium">Trip cost per km</span>
                <span className="font-bold text-neutral-800">₹{ownerPerKm + (fuelPerKm - ownerPerKm) + appFeePerKm}/km total</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">🏠 Owner Shares</p>
                  <p className="text-xl font-bold text-green-700">₹{ownerPerKm}<span className="text-sm font-normal">/km</span></p>
                  <p className="text-xs text-green-600 mt-1">~50% of trip cost</p>
                  <p className="text-[10px] text-green-500 mt-0.5">Saves vs transport company</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">🚗 You Share</p>
                  <p className="text-xl font-bold text-blue-700">₹{fuelPerKm}<span className="text-sm font-normal">/km</span></p>
                  <p className="text-xs text-blue-600 mt-1">~50% of trip cost</p>
                  <p className="text-[10px] text-blue-500 mt-0.5">Saves vs own travel</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-amber-800 font-medium">
                  ✅ Both save because both get value from the same trip
                </p>
              </div>
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
              <Banknote className="h-5 w-5 mr-2 text-green-500" />
              <span className="font-medium text-green-700">
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
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm">Air Conditioning</span>
                </div>
                <div className="flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm">Bluetooth</span>
                </div>
                <div className="flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm">Power Steering</span>
                </div>
                <div className="flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500" />
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
            className="w-full" 
            size="lg" 
            variant="outline"
            onClick={() => setIsBookingOpen(true)}
          >
            Quick Book
          </Button>
          
          <Button 
            className="w-full bg-secondary-500 hover:bg-secondary-600 text-white" 
            size="lg"
            onClick={() => {
              // Create URL with today and tomorrow as default dates
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const pickupDate = today.toISOString().split('T')[0];
              const returnDate = tomorrow.toISOString().split('T')[0];
              
              navigate(`/checkout/${vehicleId}?pickupDate=${pickupDate}&returnDate=${returnDate}&insurance=true`);
            }}
          >
            Pay Now
          </Button>
        </div>
      </div>
      
      {/* Quick Book Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {!bookingSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Book {vehicle.make} {vehicle.model}</DialogTitle>
                <DialogDescription>
                  Enter your trip details to book this vehicle.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  {/* Pickup Location */}
                  <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Pickup Location</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? LOCATIONS.find(
                                      (location) => location === field.value
                                    )
                                  : "Select pickup location"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <div className="max-h-[200px] overflow-y-auto">
                              {LOCATIONS.map((location) => (
                                <div
                                  key={location}
                                  className="cursor-pointer p-2 hover:bg-neutral-100"
                                  onClick={() => {
                                    form.setValue("pickupLocation", location);
                                    form.clearErrors("pickupLocation");
                                  }}
                                >
                                  {location}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Drop Location */}
                  <FormField
                    control={form.control}
                    name="dropLocation"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Drop Location</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? LOCATIONS.find(
                                      (location) => location === field.value
                                    )
                                  : "Select drop location"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <div className="max-h-[200px] overflow-y-auto">
                              {LOCATIONS.map((location) => (
                                <div
                                  key={location}
                                  className="cursor-pointer p-2 hover:bg-neutral-100"
                                  onClick={() => {
                                    form.setValue("dropLocation", location);
                                    form.clearErrors("dropLocation");
                                  }}
                                >
                                  {location}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Pickup Date */}
                  <FormField
                    control={form.control}
                    name="pickupDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Pickup Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date > new Date(2025, 12, 31)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? "Processing..." : "Confirm Booking"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <CircleCheck className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="mb-2">Booking Confirmed!</DialogTitle>
              <DialogDescription className="mb-6">
                Your booking for {vehicle.make} {vehicle.model} has been confirmed. 
                You'll receive a confirmation message shortly.
              </DialogDescription>
              <Button 
                onClick={() => {
                  setIsBookingOpen(false);
                  setBookingSuccess(false);
                  toast({
                    title: "Booking Confirmed",
                    description: `You've successfully booked ${vehicle.make} ${vehicle.model}.`,
                  });
                }}
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}