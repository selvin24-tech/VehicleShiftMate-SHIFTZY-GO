import { ShiftRequest } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ChatButton from "@/components/common/ChatButton";
import { MapPin, Clock, IndianRupee } from "lucide-react";

interface ShiftRequestCardProps {
  request: ShiftRequest;
  showDetails?: boolean;
}

const PREMIUM_MAKES = ["BMW", "Mercedes", "Audi", "Jaguar", "Lexus", "Land Rover", "KTM", "Royal Enfield"];

function getPricingBreakdown(vehicleType: string, vehicleMake: string, distanceStr: string) {
  const km = parseInt(distanceStr.replace(/[^0-9]/g, "")) || 0;
  const isPremium = PREMIUM_MAKES.includes(vehicleMake);
  const isBike = vehicleType === "bike";
  const isSuv = vehicleType === "suv";

  let ownerPerKm: number, fuelPerKm: number, appFeePerKm: number;

  if (isBike) {
    ownerPerKm = isPremium ? 10 : 7;
    fuelPerKm = isPremium ? 4 : 3;
    appFeePerKm = isPremium ? 3 : 2;
  } else if (isSuv) {
    ownerPerKm = 15; fuelPerKm = 10; appFeePerKm = 4;
  } else if (isPremium) {
    ownerPerKm = 20; fuelPerKm = 8; appFeePerKm = 6;
  } else {
    ownerPerKm = 13; fuelPerKm = 8; appFeePerKm = 3;
  }

  return {
    category: isPremium ? "Premium" : "Normal",
    ownerFee: km * ownerPerKm,
    fuelCost: km * fuelPerKm,
    appFee: km * appFeePerKm,
    travelerTotal: km * (fuelPerKm + appFeePerKm),
    km,
  };
}

export default function ShiftRequestCard({ request, showDetails = false }: ShiftRequestCardProps) {
  const { toast } = useToast();
  const pricing = getPricingBreakdown(request.vehicle.type, request.vehicle.make, request.distance);

  const handleViewDetails = () => {
    toast({
      title: "Shift Details",
      description: `${request.vehicle.make} ${request.vehicle.model} · ${request.pickupLocation.name} → ${request.dropLocation.name} · ${request.distance}`,
    });
  };

  return (
    <Card className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Category header strip */}
      <div className={`px-4 py-1.5 flex items-center justify-between ${
        pricing.category === "Premium"
          ? "bg-gradient-to-r from-purple-600 to-indigo-600"
          : "bg-gradient-to-r from-green-600 to-emerald-500"
      }`}>
        <span className="text-white text-xs font-bold tracking-wider uppercase">
          {pricing.category} · {request.vehicle.type.toUpperCase()}
        </span>
        <span className="text-white text-xs opacity-90">{request.distance} · {request.estimatedDuration}</span>
      </div>

      <div className="p-4">
        {/* Owner info row */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={request.userAvatar} alt={request.userName} />
            <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm leading-tight">{request.userName}</p>
            <p className="text-xs text-neutral-400">{request.postedTime}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm text-neutral-800">{request.vehicle.make} {request.vehicle.model}</p>
            <p className="text-xs text-neutral-400">{request.vehicle.registrationNumber}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-stretch gap-3 mb-4 bg-neutral-50 rounded-xl p-3">
          <div className="flex flex-col items-center" style={{ width: 20 }}>
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow" />
            <div className="flex-1 w-px border-l-2 border-dashed border-neutral-300 my-1" />
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow" />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xs text-green-600 font-bold">FROM</p>
              <p className="text-sm font-semibold text-neutral-800 leading-tight">{request.pickupLocation.name}</p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-red-500 font-bold">TO</p>
              <p className="text-sm font-semibold text-neutral-800 leading-tight">{request.dropLocation.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-center gap-1">
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Clock className="w-3 h-3" />
              {request.pickupTime}
            </div>
          </div>
        </div>

        {/* Pricing breakdown — the heart of the new model */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Owner's side */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-xs font-bold text-green-700 mb-1">🏠 Owner Pays</p>
            <p className="text-lg font-bold text-green-700">₹{pricing.ownerFee.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-0.5">Relocation fee</p>
            <p className="text-xs text-neutral-400 mt-1">₹{pricing.ownerFee > 0 ? Math.round(pricing.ownerFee / pricing.km) : 0}/km</p>
          </div>

          {/* Traveler's side */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-700 mb-1">🚗 You Pay</p>
            <p className="text-lg font-bold text-blue-700">₹{pricing.travelerTotal.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-0.5">Fuel + App fee</p>
            <div className="text-xs text-neutral-400 mt-1">
              <span>₹{pricing.fuelCost.toLocaleString()} fuel</span>
              <span className="mx-1">+</span>
              <span>₹{pricing.appFee.toLocaleString()} fee</span>
            </div>
          </div>
        </div>

        {/* Win-win tag */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mb-3 flex items-center gap-2">
          <span className="text-sm">✅</span>
          <p className="text-xs text-amber-800 font-medium">
            Owner saves vs ₹{Math.round(pricing.ownerFee * 2.2).toLocaleString()} transport co. · You drive free!
          </p>
        </div>

        {/* Action buttons */}
        {showDetails ? (
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary-500 text-white hover:bg-primary-600" onClick={handleViewDetails}>
              Accept Drive
            </Button>
            <ChatButton
              userId={Number(request.userId)}
              shiftRequestId={Number(request.id)}
              variant="outline"
              size="default"
            />
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full bg-primary-500 text-white hover:bg-primary-600"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
}
