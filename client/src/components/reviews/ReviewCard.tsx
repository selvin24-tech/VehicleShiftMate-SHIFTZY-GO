import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ReviewCardProps {
  review: {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    date: string;
    vehicleDetails?: {
      make: string;
      model: string;
    };
    metrics?: {
      comfort: number;
      cleanliness: number;
      performance: number;
    };
  };
  type: 'user' | 'vehicle';
}

export default function ReviewCard({ review, type }: ReviewCardProps) {
  // Generate stars based on rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'}`} 
      />
    ));
  };

  // Generate metric bars for vehicle reviews
  const renderMetricBar = (value: number, label: string) => {
    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span>{label}</span>
          <span>{value}/5</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full" 
            style={{ width: `${(value / 5) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 mb-3 border border-neutral-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={review.userAvatar} alt={review.userName} />
            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold">{review.userName}</h4>
            <div className="flex items-center">
              {renderStars(review.rating)}
            </div>
          </div>
        </div>
        <span className="text-xs text-neutral-500">{review.date}</span>
      </div>
      
      {type === 'vehicle' && review.vehicleDetails && (
        <div className="text-sm text-neutral-600 mb-2">
          <span>Review for: </span>
          <span className="font-medium">{review.vehicleDetails.make} {review.vehicleDetails.model}</span>
        </div>
      )}
      
      <p className="text-neutral-700 text-sm mb-3">{review.comment}</p>
      
      {type === 'vehicle' && review.metrics && (
        <div className="mt-4">
          {renderMetricBar(review.metrics.comfort, 'Comfort')}
          {renderMetricBar(review.metrics.cleanliness, 'Cleanliness')}
          {renderMetricBar(review.metrics.performance, 'Performance')}
        </div>
      )}
    </Card>
  );
}