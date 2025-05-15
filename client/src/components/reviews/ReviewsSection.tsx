import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Review, ReviewType } from "@/lib/types";
import ReviewCard from "./ReviewCard";
import { Button } from "@/components/ui/button";
import ReviewForm from "./ReviewForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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
  title = type === 'user' ? 'Driver Reviews' : 'Vehicle Reviews',
  showForm = true,
  tripId = 1, // default for demo
  userType = "driver" 
}: ReviewsSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Get the appropriate API endpoint based on type
  const endpoint = type === 'user' 
    ? `/api/user-reviews/${id}` 
    : `/api/vehicle-reviews/${id}`;
  
  // Fetch reviews data
  const { 
    data: reviews, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: [endpoint],
    enabled: !!id
  });
  
  // Handle new review submission
  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    refetch();
  };
  
  // Calculate average ratings and metrics
  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
  };
  
  const getAverageMetrics = () => {
    if (!reviews || reviews.length === 0 || type !== 'vehicle') {
      return { comfort: 0, cleanliness: 0, performance: 0 };
    }
    
    const metrics = reviews.reduce((acc, review) => {
      return {
        comfort: acc.comfort + review.comfort,
        cleanliness: acc.cleanliness + review.cleanliness,
        performance: acc.performance + review.performance
      };
    }, { comfort: 0, cleanliness: 0, performance: 0 });
    
    return {
      comfort: Math.round((metrics.comfort / reviews.length) * 10) / 10,
      cleanliness: Math.round((metrics.cleanliness / reviews.length) * 10) / 10,
      performance: Math.round((metrics.performance / reviews.length) * 10) / 10
    };
  };
  
  const renderMetricBar = (value: number, label: string) => {
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{label}</span>
          <span>{value.toFixed(1)}/5</span>
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
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-start mb-2">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="w-full">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
        Failed to load reviews. Please try again later.
      </div>
    );
  }
  
  const averageRating = getAverageRating();
  const metrics = getAverageMetrics();
  
  // For demo purposes, creating sample reviews if none exist
  const demoReviews: Review[] = [
    {
      id: "1",
      userName: "Ravi Kumar",
      userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
      rating: 5,
      comment: "Excellent driver! Very professional and punctual. The vehicle was in great condition and the journey was comfortable.",
      date: "2023-05-10",
      vehicleDetails: type === 'vehicle' ? { make: "Honda", model: "City" } : undefined,
      metrics: type === 'vehicle' ? { comfort: 5, cleanliness: 5, performance: 4 } : undefined
    },
    {
      id: "2",
      userName: "Priya Sharma",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      rating: 4,
      comment: "Good experience overall. Driver was courteous and the ride was smooth. Would recommend.",
      date: "2023-04-22",
      vehicleDetails: type === 'vehicle' ? { make: "Honda", model: "City" } : undefined,
      metrics: type === 'vehicle' ? { comfort: 4, cleanliness: 4, performance: 4 } : undefined
    }
  ];
  
  const reviewsToDisplay = reviews?.length > 0 ? reviews : demoReviews;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {showForm && !showReviewForm && (
          <Button 
            variant="outline" 
            onClick={() => setShowReviewForm(true)}
            className="text-sm"
          >
            Write a Review
          </Button>
        )}
      </div>
      
      {showReviewForm && (
        <div className="mb-6">
          <ReviewForm 
            type={type}
            subjectId={id}
            tripId={tripId}
            userType={userType}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="text-3xl font-bold text-primary-600 mr-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-neutral-500">
            based on {reviewsToDisplay.length} {reviewsToDisplay.length === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        
        {type === 'vehicle' && (
          <div className="mb-4">
            {renderMetricBar(metrics.comfort, 'Comfort')}
            {renderMetricBar(metrics.cleanliness, 'Cleanliness')}
            {renderMetricBar(metrics.performance, 'Performance')}
          </div>
        )}
      </div>
      
      <div>
        {reviewsToDisplay.map((review) => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            type={type}
          />
        ))}
        
        {reviewsToDisplay.length === 0 && (
          <div className="text-center p-6 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-neutral-500">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
}