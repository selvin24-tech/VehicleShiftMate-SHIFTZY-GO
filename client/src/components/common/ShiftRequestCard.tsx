import { ShiftRequest } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ChatButton from "@/components/common/ChatButton";
import { Clock, Fuel, Landmark, BadgePercent } from "lucide-react";

interface ShiftRequestCardProps {
  request: ShiftRequest;
  showDetails?: boolean;
}

// Premium makes — determines category
const PREMIUM_MAKES = ["BMW", "Mercedes", "Audi", "Jaguar", "Lexus", "Land Rover", "KTM", "Royal Enfield"];

// Cost-sharing model: both owner & traveler split the trip cost equally
// Trip cost = fuel + tolls + platform fee
// Each party contributes ~50% → both save vs their alternative
function getTripCostModel(vehicleType: string, vehicleMake: string, distanceStr: string) {
  const km = parseInt(distanceStr.replace(/[^0-9]/g, "")) || 0;
  const isPremium = PREMIUM_MAKES.includes(vehicleMake);
  const isBike = vehicleType === "bike";
  const isSuv = vehicleType === "suv";

  // Total cost per km (fuel + toll + platform fee)
  // Owner & traveler each pay half → total ÷ 2
  let totalPerKm: number, transportCoPerKm: number, travelerAltPerKm: number;

  if (isBike) {
    totalPerKm = isPremium ? 10 : 8;
    transportCoPerKm = isPremium ? 22 : 15;
    travelerAltPerKm = 8; // bike taxi / bus equivalent
  } else if (isSuv) {
    totalPerKm = 14;
    transportCoPerKm = 40;
    travelerAltPerKm = 10;
  } else if (isPremium) {
    totalPerKm = 16;
    transportCoPerKm = 50;
    travelerAltPerKm = 10;
  } else {
    totalPerKm = 12;
    transportCoPerKm = 32;
    travelerAltPerKm = 8;
  }

  const tripCost = Math.max(km * totalPerKm, 200);
  const ownerShare = Math.round(tripCost / 2);
  const travelerShare = tripCost - ownerShare;
  const ownerWouldPay = km * transportCoPerKm;
  const travelerWouldPay = km * travelerAltPerKm;
  const ownerSaves = ownerWouldPay - ownerShare;
  const travelerSaves = Math.max(travelerWouldPay - travelerShare, 0);

  return {
    category: isPremium ? "Premium" : "Normal",
    tripCost,
    ownerShare,
    travelerShare,
    ownerWouldPay,
    travelerWouldPay,
    ownerSaves,
    travelerSaves,
    km,
    fuelCost: Math.round(km * (isBike ? (isPremium ? 4 : 3) : (isSuv ? 10 : 8))),
    tollCost: Math.round(km * 1.5),
    platformFee: Math.round(tripCost * 0.12),
  };
}

export default function ShiftRequestCard({ request, showDetails = false }: ShiftRequestCardProps) {
  const { toast } = useToast();
  const c = getTripCostModel(request.vehicle.type, request.vehicle.make, request.distance);

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
        c.category === "Premium"
          ? "bg-gradient-to-r from-purple-600 to-indigo-600"
          : "bg-gradient-to-r from-green-600 to-emerald-500"
      }`}>
        <span className="text-white text-xs font-bold tracking-wider uppercase">
          {c.category} · {request.vehicle.type.toUpperCase()}
        </span>
        <span className="text-white/90 text-xs">{request.distance} · {request.estimatedDuration}</span>
      </div>

      <div className="p-4">
        {/* Owner + vehicle row */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={request.userAvatar} />
            <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{request.userName}</p>
            <p className="text-xs text-neutral-400">{request.postedTime}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-sm text-neutral-800">{request.vehicle.make} {request.vehicle.model}</p>
            <p className="text-xs text-neutral-400">{request.vehicle.registrationNumber}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-stretch gap-3 mb-4 bg-neutral-50 rounded-xl p-3">
          <div className="flex flex-col items-center" style={{ width: 18 }}>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow" />
            <div className="flex-1 w-px border-l-2 border-dashed border-neutral-300 my-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white shadow" />
          </div>
          <div className="flex-1 flex flex-col justify-between gap-1">
            <div>
              <p className="text-[10px] text-green-600 font-bold tracking-wide">FROM</p>
              <p className="text-sm font-semibold text-neutral-800 leading-tight">{request.pickupLocation.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-red-500 font-bold tracking-wide">TO</p>
              <p className="text-sm font-semibold text-neutral-800 leading-tight">{request.dropLocation.name}</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-neutral-400 gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            <span>{request.pickupTime}</span>
          </div>
        </div>

        {/* ── SHARED COST MODEL ── */}
        {/* Total trip cost pill */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-1.5">
            <span className="text-xs text-neutral-500 font-medium">Total Trip Cost</span>
            <span className="text-base font-bold text-neutral-800">₹{c.tripCost.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-1.5 text-xs text-neutral-400">
            <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> ₹{c.fuelCost.toLocaleString()} fuel</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Landmark className="w-3 h-3" /> ₹{c.tollCost.toLocaleString()} toll</span>
            <span>·</span>
            <span className="flex items-center gap-1"><BadgePercent className="w-3 h-3" /> ₹{c.platformFee.toLocaleString()} fee</span>
          </div>
        </div>

        {/* Split boxes */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Owner's share */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">🏠 Owner Shares</p>
            <p className="text-xl font-bold text-green-700">₹{c.ownerShare.toLocaleString()}</p>
            <div className="mt-1.5 space-y-0.5">
              <p className="text-[10px] text-green-600">Saves ₹{c.ownerSaves.toLocaleString()} vs</p>
              <p className="text-[10px] text-green-500">transport company (₹{c.ownerWouldPay.toLocaleString()})</p>
            </div>
          </div>

          {/* Traveler's share */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">🚗 You Share</p>
            <p className="text-xl font-bold text-blue-700">₹{c.travelerShare.toLocaleString()}</p>
            <div className="mt-1.5 space-y-0.5">
              <p className="text-[10px] text-blue-600">Saves ₹{c.travelerSaves.toLocaleString()} vs</p>
              <p className="text-[10px] text-blue-500">your own travel (₹{c.travelerWouldPay.toLocaleString()})</p>
            </div>
          </div>
        </div>

        {/* Insight tag */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-amber-800 font-medium text-center">
            ✅ Both pay less than going alone — because both receive value from one trip
          </p>
        </div>

        {/* Actions */}
        {showDetails ? (
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white" onClick={handleAccept}>
              Accept & Share Cost
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
    </Card>
  );
}
