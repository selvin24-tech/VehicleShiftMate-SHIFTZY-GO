import { Trip } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface TripCardProps {
  trip: Trip;
  showDetails?: boolean;
}

export default function TripCard({ trip, showDetails = false }: TripCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 font-normal" variant="outline">Completed</Badge>;
      case 'in-transit':
        return <Badge className="bg-orange-100 text-orange-700 font-normal" variant="outline">In Transit</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-700 font-normal" variant="outline">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 font-normal" variant="outline">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const formattedDate = trip.date 
    ? format(new Date(trip.date), "MMM d, yyyy") 
    : "";

  return (
    <Card className="bg-white border border-neutral-200 rounded-lg p-4 mb-3 shadow-sm">
      {showDetails ? (
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-1">
              <i className="fas fa-exchange-alt text-primary-500 mr-2"></i>
              <h4 className="font-semibold">{trip.pickupLocation.name} to {trip.dropLocation.name}</h4>
            </div>
            <p className="text-sm text-neutral-500">
              {trip.vehicle.make} {trip.vehicle.model} • {formattedDate}
            </p>
            <div className="flex items-center mt-2 text-sm">
              {getStatusBadge(trip.status)}
              {trip.distance && (
                <>
                  <span className="mx-2">•</span>
                  <span>{trip.distance} km</span>
                </>
              )}
            </div>
          </div>
          <div className="font-semibold text-primary-600">₹{trip.price}</div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center mb-2">
              <div className="bg-primary-100 rounded-full p-2 mr-3">
                <i className={`fas fa-${trip.vehicle.type === 'bike' ? 'motorcycle' : 'car'} text-primary-500`}></i>
              </div>
              <div>
                <h3 className="font-semibold">{trip.vehicle.make} {trip.vehicle.model}</h3>
                <p className="text-xs text-neutral-500">{trip.vehicle.registrationNumber}</p>
              </div>
            </div>
            <div className="flex items-center text-sm mt-2">
              <div className="flex flex-col items-start">
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                  <span className="text-neutral-700">{trip.pickupLocation.name}</span>
                </div>
                <div className="border-l border-dashed border-neutral-300 h-4 ml-1"></div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></div>
                  <span className="text-neutral-700">{trip.dropLocation.name}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-primary-600">₹{trip.price}</div>
            <div className="text-xs text-neutral-500">{formattedDate}</div>
            <div className="text-xs mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full">
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('-', ' ')}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
