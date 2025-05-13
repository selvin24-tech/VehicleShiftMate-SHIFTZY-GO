import { ShiftRequest } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShiftRequestCardProps {
  request: ShiftRequest;
  showDetails?: boolean;
}

export default function ShiftRequestCard({ request, showDetails = false }: ShiftRequestCardProps) {
  const { toast } = useToast();

  const handleViewDetails = () => {
    toast({
      title: "Details",
      description: `You're viewing details for ${request.vehicle.make} ${request.vehicle.model} from ${request.pickupLocation.name} to ${request.dropLocation.name}`,
    });
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return "car";
      case 'bike':
        return "motorcycle";
      case 'suv':
        return "truck";
      case 'luxury':
        return "gem";
      default:
        return "car";
    }
  };

  return (
    <Card className="bg-white border border-neutral-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={request.userAvatar} alt={request.userName} />
              <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{request.userName}</h3>
              <p className="text-xs text-neutral-500">{request.postedTime}</p>
            </div>
          </div>

          <div className="flex items-center mb-3">
            <div className="bg-primary-100 rounded-full p-2 mr-3">
              <i className={`fas fa-${getVehicleIcon(request.vehicle.type)} text-primary-500`}></i>
            </div>
            <div>
              <h4 className="font-semibold">{request.vehicle.make} {request.vehicle.model}</h4>
              <p className="text-xs text-neutral-500">{request.vehicle.registrationNumber}</p>
            </div>
          </div>

          <div className="flex items-center text-sm mb-3">
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                <span className="text-neutral-700">{request.pickupLocation.name}</span>
              </div>
              <div className="border-l border-dashed border-neutral-300 h-4 ml-1"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></div>
                <span className="text-neutral-700">{request.dropLocation.name}</span>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 mb-3">
              <div>
                <i className="fas fa-clock mr-1"></i> Pickup: {request.pickupTime}
              </div>
              <div>
                <i className="fas fa-road mr-1"></i> Distance: {request.distance}
              </div>
              <div>
                <i className="fas fa-hourglass-half mr-1"></i> Duration: {request.estimatedDuration}
              </div>
              <div>
                <i className="fas fa-rupee-sign mr-1"></i> Reward: ₹{request.reward}
              </div>
            </div>
          )}
        </div>

        {!showDetails && (
          <div className="flex flex-col justify-between items-end">
            <Badge className="bg-green-100 text-green-700 font-normal mb-3" variant="outline">
              {request.distance}
            </Badge>
            <div className="text-right mb-1">
              <div className="font-semibold text-primary-600">₹{request.reward}</div>
              <div className="text-xs text-neutral-500">Reward</div>
            </div>
            <Button 
              size="sm" 
              className="bg-primary-500 text-white hover:bg-primary-600"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </div>
        )}

        {showDetails && (
          <Button 
            className="mt-2 bg-primary-500 text-white hover:bg-primary-600"
            onClick={handleViewDetails}
          >
            Accept Drive
          </Button>
        )}
      </div>
    </Card>
  );
}