import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Car, Bike, Star, User, Users, Calendar, Clock, MapPin, ChevronLeft } from "lucide-react";
import { AVAILABLE_VEHICLES } from "@/lib/constants"; 

export default function VehicleDetails() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/vehicle/:id");
  const [showReviews, setShowReviews] = useState(false);
  
  const vehicleId = params?.id;
  
  // For demo purposes, we'll use the vehicle data from constants
  // In a real app, this would be a fetch from the API
  const vehicle = AVAILABLE_VEHICLES.find(v => v.id === vehicleId);
  
  // Handle back navigation
  const handleBack = () => {
    navigate("/travel");
  };
  
  // Show loading state if we're fetching data
  if (!vehicle) {
    return (
      <div className="max-w-lg mx-auto px-4 pb-24">
        <Header />
        
        <div className="flex items-center mb-4 mt-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-6 w-40" />
        </div>
        
        <Skeleton className="w-full h-52 rounded-lg mb-4" />
        
        <Skeleton className="w-3/4 h-6 mb-2" />
        <Skeleton className="w-1/2 h-4 mb-4" />
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        
        <Skeleton className="w-full h-40 rounded-lg mb-4" />
        
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <Header />
      
      <div className="flex items-center mb-4 mt-2">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Vehicle Details</h1>
      </div>
      
      {/* Vehicle Images */}
      <div className="relative rounded-lg overflow-hidden bg-neutral-100 h-52 mb-4">
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
        
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-primary-700 font-semibold">
            {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
          </Badge>
        </div>
        
        {vehicle.averageRating && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-yellow-500 font-semibold flex items-center">
              <Star className="fill-yellow-500 w-4 h-4 mr-1" />
              {vehicle.averageRating.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Vehicle Info */}
      <h2 className="text-2xl font-bold mb-1">{vehicle.make} {vehicle.model}</h2>
      <p className="text-neutral-600 mb-4">{vehicle.registrationNumber}</p>
      
      {/* Vehicle Details Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-3 border border-neutral-200">
          <div className="flex flex-col h-full">
            <div className="text-neutral-500 mb-1 text-sm">Owner</div>
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{vehicle.ownerName || "Vehicle Owner"}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 border border-neutral-200">
          <div className="flex flex-col h-full">
            <div className="text-neutral-500 mb-1 text-sm">Capacity</div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-neutral-500" />
              <span className="font-medium">{vehicle.seatingCapacity || '4'} Persons</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 border border-neutral-200">
          <div className="flex flex-col h-full">
            <div className="text-neutral-500 mb-1 text-sm">Color</div>
            <div className="flex items-center">
              <div 
                className="w-5 h-5 rounded-full mr-2" 
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
              <span className="font-medium capitalize">{vehicle.fuelType || "Petrol"}</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Reviews Section */}
      <div>
        <button 
          className="flex items-center justify-between w-full py-3"
          onClick={() => setShowReviews(!showReviews)}
        >
          <div className="flex items-center">
            <Star className="mr-2 h-5 w-5 text-neutral-500" />
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
      
      <BottomNav />
    </div>
  );
}