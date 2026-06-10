import { Vehicle } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarIcon, UserIcon, Fuel, ChevronDown, Calendar, MapPin, Edit } from "lucide-react";
import { useState } from "react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: () => void;
}

export default function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(vehicle.pricePerDay || 0);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'available-tomorrow': return 'bg-orange-100 text-orange-700';
      case 'unavailable': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available': return 'Available Now';
      case 'available-tomorrow': return 'Available Tomorrow';
      case 'unavailable': return 'Unavailable';
      default: return '';
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleEditPrice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  const handlePriceSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <Card className="bg-white border border-neutral-200 rounded-lg mb-4 shadow-sm overflow-hidden transition-all duration-300">
      <div className="p-4 cursor-pointer" onClick={onClick}>
        <div className="flex relative">
          <div className="w-24 h-24 rounded-lg overflow-hidden mr-3">
            <img 
              src={vehicle.image || `https://via.placeholder.com/150?text=${vehicle.make}+${vehicle.model}`} 
              alt={`${vehicle.make} ${vehicle.model}`} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg">{vehicle.make} {vehicle.model}</h3>
              <div className="flex items-center gap-1.5">
                {/* Normal / Premium category badge */}
                {(() => {
                  const premiumMakes = ["BMW","Mercedes","Audi","Jaguar","Lexus","Land Rover","KTM","Royal Enfield"];
                  const isPremium = vehicle.vehicleCategory === "premium" || premiumMakes.includes(vehicle.make);
                  return (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isPremium
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}>
                      {isPremium ? "✦ Premium" : "● Normal"}
                    </span>
                  );
                })()}
              </div>
            </div>
            <div className="flex items-center text-sm text-neutral-500 mb-2">
              {vehicle.type === 'car' && vehicle.seatingCapacity && (
                <>
                  <UserIcon className="w-4 h-4 mr-1" /> {vehicle.seatingCapacity} Seater
                  <span className="mx-2">•</span>
                </>
              )}
              {vehicle.type === 'bike' && (
                <>
                  <i className="fas fa-motorcycle mr-1"></i> {vehicle.make}
                  <span className="mx-2">•</span>
                </>
              )}
              {vehicle.fuelType && (
                <>
                  <Fuel className="w-4 h-4 mr-1" /> {vehicle.fuelType}
                </>
              )}
            </div>
            {vehicle.ownerName && (
              <div className="flex items-center text-sm">
                {vehicle.rating && (
                  <div className="flex items-center text-yellow-400 mr-2">
                    <StarIcon className="w-4 h-4" />
                    <span className="ml-1 text-neutral-700">{vehicle.rating}</span>
                  </div>
                )}
                <div>
                  <span className="text-neutral-600">Owner: {vehicle.ownerName}</span>
                </div>
              </div>
            )}
            {(vehicle.availabilityStatus || vehicle.features) && (
              <div className="flex mt-2 text-xs">
                {vehicle.availabilityStatus && (
                  <Badge className={`${getStatusColor(vehicle.availabilityStatus)} mr-2`} variant="outline">
                    {getStatusText(vehicle.availabilityStatus)}
                  </Badge>
                )}
                {vehicle.features?.map((feature, index) => (
                  feature !== 'Available Now' && feature !== 'Available Tomorrow' && (
                    <Badge key={index} className="bg-neutral-100 text-neutral-700 mr-2" variant="outline">
                      {feature}
                    </Badge>
                  )
                ))}
              </div>
            )}
          </div>
          
          {/* Expand Arrow */}
          <div className="absolute bottom-0 right-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-neutral-100"
              onClick={handleExpandClick}
            >
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`} 
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Section */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pb-4 border-t border-neutral-100 bg-neutral-50">
          <div className="pt-4">
            <h4 className="font-semibold text-sm text-neutral-700 mb-3">Additional Details</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Customer Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-600">Owner Experience</span>
                </div>
                <div className="text-neutral-800 font-medium">3+ years active</div>
              </div>

              {/* Vehicle Purchase Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-600">Purchase Date</span>
                </div>
                <div className="text-neutral-800 font-medium">March 2022</div>
              </div>

              {/* Previous Shifts */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-600">Shifts Completed</span>
                </div>
                <div className="text-neutral-800 font-medium">47 successful shifts</div>
              </div>

              {/* Rating Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-600">Customer Rating</span>
                </div>
                <div className="text-neutral-800 font-medium">
                  {vehicle.rating || 4.8}/5.0 (32 reviews)
                </div>
              </div>
            </div>

            {/* Additional Vehicle Info */}
            <div className="mt-4 pt-3 border-t border-neutral-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Registration: </span>
                  <span className="font-medium">{vehicle.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Last Service: </span>
                  <span className="font-medium">2 months ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
