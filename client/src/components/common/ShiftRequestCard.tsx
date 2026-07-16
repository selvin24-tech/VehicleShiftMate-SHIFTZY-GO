import { useState } from "react";
import { ShiftRequest } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SendRequestButton from "@/components/common/SendRequestButton";
import VehiclePhotoGallery from "@/components/common/VehiclePhotoGallery";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Fuel, Landmark, BadgePercent, Receipt, Camera, Images,
  Info, ShieldCheck, X, ChevronRight, Palette, Calendar, Car,
} from "lucide-react";
import {
  computeFare, vehicleTypeToFareCategory, getVehicleImages, getAvailabilityWindow,
  FARE_CATEGORIES, getVehicleDetails,
} from "@/lib/constants";

interface ShiftRequestCardProps {
  request: ShiftRequest;
  showDetails?: boolean;
}

const PREMIUM_MAKES = ["BMW", "Mercedes", "Audi", "Jaguar", "Lexus", "Land Rover", "KTM", "Royal Enfield"];

export default function ShiftRequestCard({ request, showDetails = false }: ShiftRequestCardProps) {
  const { toast } = useToast();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  const km = parseInt(request.distance.replace(/[^0-9]/g, "")) || 0;
  const category = vehicleTypeToFareCategory(request.vehicle.type, request.vehicle.make);
  const fare = computeFare(km, category);
  const isPremium = PREMIUM_MAKES.includes(request.vehicle.make) || request.vehicle.type === "luxury";
  const categoryLabel = isPremium ? "Premium" : (FARE_CATEGORIES[category]?.label ?? "Normal");

  const images = getVehicleImages(request.vehicle);
  const window = getAvailabilityWindow(request.vehicle.id || request.id);
  const vDetails = getVehicleDetails(request.vehicle);
  const fuelType = request.vehicle.fuelType ?? vDetails.fuelType;

  const handleAccept = () => {
    toast({
      title: "Shift Request Details",
      description: `${request.vehicle.make} ${request.vehicle.model} · ${request.pickupLocation.name} → ${request.dropLocation.name} · ${request.distance}`,
    });
  };

  return (
    <>
      <Card className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

        {/* Category strip */}
        <div className={`px-4 py-1.5 flex items-center justify-between ${
          isPremium
            ? "bg-gradient-to-r from-purple-600 to-indigo-600"
            : "bg-gradient-to-r from-orange-500 to-orange-600"
        }`}>
          <span className="text-white text-xs font-bold tracking-wider uppercase flex items-center gap-2">
            {categoryLabel} · {request.vehicle.type.toUpperCase()}
            {fuelType && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fuelType === "Diesel" ? "bg-amber-200 text-amber-900" : "bg-green-200 text-green-900"}`}>
                ⛽ {fuelType}
              </span>
            )}
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
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-neutral-200 text-sm text-neutral-500">
                <span>Total payable</span>
                <span className="font-semibold text-neutral-700">₹{fare.total.toLocaleString()}</span>
              </div>
            </div>

            {/* ── SAVINGS HIGHLIGHT ── */}
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 mt-3 mb-1 text-center">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">
                🎉 You save on this trip
              </p>
              <p className="text-4xl font-extrabold text-green-600 leading-none">
                ₹{fare.savings.toLocaleString()}
              </p>
              <p className="text-[11px] text-green-500 mt-1.5">
                vs. travelling alone by bus / train / own fuel
              </p>
            </div>
          </div>

          {/* ── Vehicle details button ── */}
          <button
            type="button"
            onClick={() => setShowVehicleDetails(true)}
            className="w-full flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-3 active:scale-95 transition-all"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-blue-700">
              <Info className="w-4 h-4" />
              Tap to see full vehicle details
            </span>
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </button>

          {/* Actions */}
          {showDetails ? (
            <div className="flex gap-2">
              <SendRequestButton request={request} className="flex-1" />
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

      {/* ── Vehicle Details Slide-up Sheet ── */}
      <AnimatePresence>
        {showVehicleDetails && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setShowVehicleDetails(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-neutral-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
                <div>
                  <p className="font-extrabold text-neutral-900 text-base">{request.vehicle.make} {request.vehicle.model}</p>
                  <p className="text-xs text-neutral-400">{request.vehicle.registrationNumber}</p>
                </div>
                <button
                  onClick={() => setShowVehicleDetails(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-neutral-600" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4 pb-8">
                {/* Basic info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Fuel className="w-3 h-3" /> Fuel Type
                    </p>
                    <p className={`font-extrabold text-sm ${fuelType === "Diesel" ? "text-amber-700" : "text-green-700"}`}>{fuelType}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Vehicle Colour
                    </p>
                    <p className="font-extrabold text-sm text-neutral-800">{vDetails.color}</p>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Purchase Year
                    </p>
                    <p className="font-extrabold text-sm text-neutral-800">{vDetails.purchaseYear}</p>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Car className="w-3 h-3" /> Vehicle Type
                    </p>
                    <p className="font-extrabold text-sm text-neutral-800 capitalize">{request.vehicle.type === "luxury" ? "Premium/Luxury" : request.vehicle.type}</p>
                  </div>
                </div>

                {/* Insurance section */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Insurance Details
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Insurance Type</span>
                      <span className="font-bold text-sm text-neutral-800">{vDetails.insuranceType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Valid Until</span>
                      <span className="font-bold text-sm text-green-700">{vDetails.insuranceValidTill}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Third Party Cover</span>
                      <span className={`font-bold text-sm ${vDetails.thirdParty ? "text-green-600" : "text-red-500"}`}>
                        {vDetails.thirdParty ? "✓ Covered" : "✗ Not covered"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Own Damage Cover</span>
                      <span className={`font-bold text-sm ${vDetails.ownDamage ? "text-green-600" : "text-orange-500"}`}>
                        {vDetails.ownDamage ? "✓ Covered" : "✗ Not included"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner details */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Owner Details</p>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={request.userAvatar}
                      alt={request.userName}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                    />
                    <div>
                      <p className="font-bold text-sm text-neutral-900">{request.userName}</p>
                      <p className="text-[11px] text-neutral-400">Verified vehicle owner</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
                      <span className="text-orange-400">★</span>
                      <span className="text-xs font-bold text-neutral-700">{request.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Model Number</span>
                      <span className="font-bold text-neutral-800">{request.vehicle.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Engine No.</span>
                      <span className="font-mono text-xs font-bold text-neutral-700">{vDetails.engineNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Registration</span>
                      <span className="font-bold text-neutral-800">{request.vehicle.registrationNumber}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-center text-neutral-400">
                  All vehicle details are verified by Shiftzy Go before listing. Insurance copy available at pickup.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
