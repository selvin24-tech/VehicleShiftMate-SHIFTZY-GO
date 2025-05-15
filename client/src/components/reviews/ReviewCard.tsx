import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Car, User } from "lucide-react";
import { Review, ReviewType } from "@/lib/types";

interface ReviewCardProps {
  review: Review;
  type: ReviewType;
}

export default function ReviewCard({ review, type }: ReviewCardProps) {
  // Format date
  const formattedDate = new Date(review.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  
  // Generate stars array based on rating
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);
  
  return (
    <Card className="p-4 border border-neutral-200 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {review.userAvatar ? (
              <AvatarImage src={review.userAvatar} alt={review.userName} />
            ) : (
              <AvatarFallback>
                <User className="h-5 w-5 text-neutral-500" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-semibold">{review.userName}</div>
            <div className="text-xs text-neutral-500">{formattedDate}</div>
          </div>
        </div>
        
        <div className="flex">
          {stars.map((filled, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                filled ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Vehicle details for user reviews */}
      {type === 'user' && review.vehicleDetails && (
        <div className="mb-4 text-sm bg-neutral-50 p-2 rounded-md flex items-center">
          <Car className="w-4 h-4 mr-2 text-neutral-600" />
          <span className="text-neutral-700">
            Traveled with {review.vehicleDetails.make} {review.vehicleDetails.model}
          </span>
        </div>
      )}
      
      {/* Review comment */}
      <p className="text-neutral-700 mb-4 text-sm">{review.comment}</p>
      
      {/* Metrics (only for vehicle reviews) */}
      {type === 'vehicle' && review.metrics && (
        <>
          <Separator className="my-3" />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col items-center">
              <div className="text-neutral-500 mb-1">Comfort</div>
              <div className="flex items-center">
                <Star className={`w-3 h-3 mr-1 ${review.metrics.comfort >= 3 ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"}`} />
                <span className="font-medium">{review.metrics.comfort}/5</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-neutral-500 mb-1">Cleanliness</div>
              <div className="flex items-center">
                <Star className={`w-3 h-3 mr-1 ${review.metrics.cleanliness >= 3 ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"}`} />
                <span className="font-medium">{review.metrics.cleanliness}/5</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-neutral-500 mb-1">Performance</div>
              <div className="flex items-center">
                <Star className={`w-3 h-3 mr-1 ${review.metrics.performance >= 3 ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"}`} />
                <span className="font-medium">{review.metrics.performance}/5</span>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}