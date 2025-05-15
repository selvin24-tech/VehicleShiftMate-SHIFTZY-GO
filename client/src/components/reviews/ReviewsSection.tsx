import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageSquarePlus } from "lucide-react";
import { Review, ReviewType } from "@/lib/types";
import { SAMPLE_REVIEWS } from "@/lib/constants";

// When we implement the API, we'll use the following line
// import { apiRequest } from "@/lib/queryClient";

interface ReviewsSectionProps {
  type: ReviewType;
  id: number; // User ID or Vehicle ID
  title?: string;
  showForm?: boolean;
  tripId?: number;
  userType?: string; // For user reviews only
}

export default function ReviewsSection({ 
  type, 
  id, 
  title = "Reviews", 
  showForm = false,
  tripId,
  userType = "driver" 
}: ReviewsSectionProps) {
  const [isWritingReview, setIsWritingReview] = useState(false);
  
  // In a real implementation, this would fetch from the API
  // For now, we'll use sample data
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: [type === 'user' ? 'user-reviews' : 'vehicle-reviews', id],
    queryFn: async () => {
      // In a real implementation, this would be:
      // return await apiRequest(`/api/${type}-reviews?${type}Id=${id}`);
      
      // For now, return sample data
      return SAMPLE_REVIEWS.filter((review) => Math.random() > 0.3);
    },
  });
  
  // Calculate average rating
  const averageRating = reviews?.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  
  const handleReviewSubmitted = () => {
    setIsWritingReview(false);
  };
  
  return (
    <div className="review-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center">
          <Star className="w-5 h-5 text-yellow-500 mr-2" />
          {title}
        </h3>
        
        {showForm && !isWritingReview && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs flex items-center"
            onClick={() => setIsWritingReview(true)}
          >
            <MessageSquarePlus className="w-4 h-4 mr-1" />
            Write Review
          </Button>
        )}
      </div>
      
      {isWritingReview && (
        <div className="mb-6">
          <ReviewForm 
            type={type}
            subjectId={id}
            tripId={tripId || 1} // Default to 1 for demo
            userType={userType}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}
      
      {/* Rating Summary */}
      {reviews?.length ? (
        <Card className="p-4 border border-neutral-200 mb-4">
          <div className="flex items-center">
            <div className="bg-yellow-50 p-3 rounded-full mr-3">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {averageRating.toFixed(1)}/5.0
              </div>
              <div className="text-neutral-500 text-sm">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>
        </Card>
      ) : !isLoading ? (
        <div className="text-center py-6 text-neutral-500">
          No reviews yet.
        </div>
      ) : null}
      
      {/* Reviews List */}
      <div className="reviews-list">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 border border-neutral-200 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-4 mr-1 rounded-full" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-2" />
              <Skeleton className="h-4 w-3/5" />
            </Card>
          ))
        ) : (
          reviews?.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              type={type} 
            />
          ))
        )}
      </div>
      
      {!isWritingReview && showForm && reviews?.length > 0 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2"
            onClick={() => setIsWritingReview(true)}
          >
            <MessageSquarePlus className="w-4 h-4 mr-1" />
            Add Your Review
          </Button>
        </div>
      )}
    </div>
  );
}