import { useState } from "react";
import { ShiftRequest } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ChatButton from "@/components/common/ChatButton";
import VehiclePhotoGallery from "@/components/common/VehiclePhotoGallery";
import {
  Clock, Fuel, Landmark, BadgePercent, Receipt, Camera, Images,
} from "lucide-react";
import {
  computeFare, vehicleTypeToFareCategory, getVehicleImages, getAvailabilityWindow,
  FARE_CATEGORIES,
} from "@/lib/constants";

interface ShiftRequestCardProps {
  request: ShiftRequest;
  showDetails?: boolean;
}

const PREMIUM_MAKES = ["BMW", "Mercedes", "Audi", "Jaguar", "Lexus", "Land Rover", "KTM", "Royal Enfield"];

export default function ShiftRequestCard({ request, showDetails = false }: ShiftRequestCardProps) {
  const { toast } = useToast();
  const [galleryOpen, setGalleryOpen] = useState(false);

  const km = parseInt(request.distance.replace(/[^0-9]/g, "")) || 0;
  const category = vehicleTypeToFareCategory(request.vehicle.type, request.vehicle.make);
  const fare = computeFare(km, category);
  const isPremium = PREMIUM_MAKES.includes(request.vehicle.make) || request.vehicle.type === "luxury";
  const categoryLabel = isPremium ? "Premium" : (FARE_CATEGORIES[category]?.label ?? "Normal");

  const images = getVehicleImages(request.vehicle);
  const window = getAvailabilityWindow(request.vehicle.id || request.id);

  const handleAccept = () => {
    toast({
      title: "Shift Request Details",
      description: `${request.vehicle.make} ${request.vehicle.model} · ${request.pickupLocation.name} → ${request.dropLocation.name} · ${request.distance}`,
    });
  };

  return (
    <Card className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* Category strip */}
      <div className={`px-4 py-1.5 flex items-center justify-between ${
        isPremium
          ? "bg-gradient-to-r from-purple-600 to-indigo-600"
          : "bg-gradient-to-r from-orange-500 to-orange-600"
      }`}>
        <span className="text-white text-xs font-bold tracking-wider uppercase">
          {categoryLabel} · {request.vehicle.type.toUpperCase()}
        </span>
        <span className="text-white/90 text-xs">{request.distance} · {request.estimatedDuration}</span>
      </div>

      <div className="p-4">
        {/* Owner + tappable vehicle photo row */}
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border border-neutral-200 group"
            data-testid={`button-vehicle-photo-${request.id}`}
          >
            <img
              src={request.vehicle.image || images[0]}
              alt={`${request.vehicle.make} ${request.vehicle.model}`}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            />
            <span className="absolute bottom-0 right-0 bg-black/65 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md flex items-center gap-0.5">
              <Images className="w-2.5 h-2.5" /> {images.length}
            </span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-neutral-800 leading-tight truncate">{request.vehicle.make} {request.vehicle.model}</p>
            <p className="text-xs text-neutral-400">{request.vehicle.registrationNumber}</p>
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-primary-600 font-medium"
              data-testid={`button-view-photos-${request.id}`}
            >
              <Camera className="w-3 h-3" /> View photos
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={request.userAvatar} />
              <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-stretch gap-3 mb-4 bg-neutral-50 rounded-xl p-3">
          <div className="flex flex-col items-center" style={{ width: 18 }}>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow" />
            <div className="flex-1 w-px border-l-2 border-dashed border-neutral-300 my-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white shadow" />
          </div>
          <div className="flex-1 flex flex-col justify-between gap-1">
            <div>
              <p className="text-[10px] text-blue-600 font-bold tracking-wide">FROM</p>
              <p className="text-sm font-semibold text-neutral-800 leading-tight">{request.pickupLocation.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-orange-500 font-bold tracking-wide">TO</p>
              <p className="text-sm font-semibold text-neutral-800 leading-tight">{request.dropLocation.name}</p>
            </div>
          </div>
        </div>

        {/* Available time range */}
        <div className="flex items-center justify-center gap-2 mb-3 text-xs">
          <Clock className="w-3.5 h-3.5 text-primary-600" />
          <span className="text-neutral-500">Available pickup window</span>
          <span className="font-semibold text-neutral-800">{request.pickupTime}</span>
        </div>

        {/* ── TRANSPARENT FARE BREAKDOWN ── */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Receipt className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Cost breakdown</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" /> Fuel</span>
              <span>₹{fare.fuelCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Toll</span>
              <span>₹{fare.tollCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-700 font-medium pt-1 border-t border-neutral-200">
              <span>Trip cost</span>
              <span>₹{fare.tripCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1.5"><BadgePercent className="w-3.5 h-3.5" /> Platform fee (10%)</span>
              <span>₹{fare.platformFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>GST (18% on fee)</span>
              <span>₹{fare.gst.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-neutral-300">
              <span className="text-sm font-bold text-neutral-900">Total payable</span>
              <span className="text-lg font-bold text-primary-600">₹{fare.total.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2 text-center">
            Fully transparent — trip cost goes to fuel & tolls, platform fee + GST keep Shiftzy running.
          </p>
        </div>

        {/* Actions */}
        {showDetails ? (
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white" onClick={handleAccept}>
              Accept Shift
            </Button>
            <ChatButton
              userId={Number(request.userId)}
              shiftRequestId={Number(request.id)}
              variant="outline"
              size="default"
            />
          </div>
        ) : (
          <Button size="sm" className="w-full bg-primary-500 hover:bg-primary-600 text-white" onClick={handleAccept}>
            View Details
          </Button>
        )}
      </div>

      <VehiclePhotoGallery
        images={images}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        title={`${request.vehicle.make} ${request.vehicle.model}`}
      />
    </Card>
  );
}
