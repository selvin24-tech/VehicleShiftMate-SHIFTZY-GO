import { Vehicle } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StarIcon, UserIcon, Fuel } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: () => void;
}

export default function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
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

  return (
    <Card className="bg-white border border-neutral-200 rounded-lg p-4 mb-4 shadow-sm" onClick={onClick}>
      <div className="flex">
        <div className="w-24 h-24 rounded-lg overflow-hidden mr-3">
          <img 
            src={vehicle.image || `https://via.placeholder.com/150?text=${vehicle.make}+${vehicle.model}`} 
            alt={`${vehicle.make} ${vehicle.model}`} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg">{vehicle.make} {vehicle.model}</h3>
            {vehicle.pricePerDay && (
              <div className="font-semibold text-secondary-600">₹{vehicle.pricePerDay}/day</div>
            )}
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
      </div>
    </Card>
  );
}
