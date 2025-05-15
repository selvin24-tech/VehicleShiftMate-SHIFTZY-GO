import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define form schemas based on review type
const userReviewSchema = z.object({
  reviewedUserId: z.number(),
  tripId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Please provide a comment with at least 10 characters").max(500),
  userType: z.string()
});

const vehicleReviewSchema = z.object({
  vehicleId: z.number(),
  tripId: z.number(),
  rating: z.number().min(1).max(5),
  comfort: z.number().min(1).max(5),
  cleanliness: z.number().min(1).max(5),
  performance: z.number().min(1).max(5),
  comment: z.string().min(10, "Please provide a comment with at least 10 characters").max(500)
});

type UserReviewValues = z.infer<typeof userReviewSchema>;
type VehicleReviewValues = z.infer<typeof vehicleReviewSchema>;

interface ReviewFormProps {
  type: 'user' | 'vehicle';
  subjectId: number; // either user ID or vehicle ID
  tripId: number;
  userType?: string; // "driver" or "owner", only needed for user reviews
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ type, subjectId, tripId, userType = "driver", onReviewSubmitted }: ReviewFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  
  // Create form based on review type
  const userForm = useForm<UserReviewValues>({
    resolver: zodResolver(userReviewSchema),
    defaultValues: {
      reviewedUserId: subjectId,
      tripId: tripId,
      rating: 0,
      comment: "",
      userType: userType
    }
  });
  
  const vehicleForm = useForm<VehicleReviewValues>({
    resolver: zodResolver(vehicleReviewSchema),
    defaultValues: {
      vehicleId: subjectId,
      tripId: tripId,
      rating: 0,
      comfort: 3,
      cleanliness: 3,
      performance: 3,
      comment: ""
    }
  });
  
  // Handle rating star click
  const handleRatingClick = (rating: number) => {
    setRatingValue(rating);
    if (type === 'user') {
      userForm.setValue('rating', rating);
    } else {
      vehicleForm.setValue('rating', rating);
    }
  };
  
  // Render rating stars
  const renderRatingStars = () => {
    return Array(5).fill(0).map((_, index) => {
      const ratingNumber = index + 1;
      return (
        <button
          type="button"
          key={index}
          onClick={() => handleRatingClick(ratingNumber)}
          className="focus:outline-none"
        >
          <Star
            className={`w-8 h-8 cursor-pointer ${
              ratingNumber <= ratingValue ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'
            }`}
          />
        </button>
      );
    });
  };
  
  // Handle form submission
  const onSubmitUserReview = async (data: UserReviewValues) => {
    if (data.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating from 1 to 5 stars",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      await apiRequest('/api/user-reviews', 'POST', data);
      
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully",
      });
      
      userForm.reset();
      setRatingValue(0);
      onReviewSubmitted();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const onSubmitVehicleReview = async (data: VehicleReviewValues) => {
    if (data.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating from 1 to 5 stars",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      await apiRequest('/api/vehicle-reviews', 'POST', data);
      
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully",
      });
      
      vehicleForm.reset();
      setRatingValue(0);
      onReviewSubmitted();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render the specific form based on type
  if (type === 'user') {
    return (
      <Card className="p-5 border border-neutral-200">
        <h3 className="text-lg font-semibold mb-4">Rate Your Experience</h3>
        <Form {...userForm}>
          <form onSubmit={userForm.handleSubmit(onSubmitUserReview)} className="space-y-4">
            <FormField
              control={userForm.control}
              name="rating"
              render={() => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <div className="flex space-x-1 mb-2">
                    {renderRatingStars()}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={userForm.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your experience with this driver" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </Card>
    );
  }
  
  // Vehicle review form
  return (
    <Card className="p-5 border border-neutral-200">
      <h3 className="text-lg font-semibold mb-4">Rate This Vehicle</h3>
      <Form {...vehicleForm}>
        <form onSubmit={vehicleForm.handleSubmit(onSubmitVehicleReview)} className="space-y-4">
          <FormField
            control={vehicleForm.control}
            name="rating"
            render={() => (
              <FormItem>
                <FormLabel>Overall Rating</FormLabel>
                <div className="flex space-x-1 mb-2">
                  {renderRatingStars()}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={vehicleForm.control}
            name="comfort"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Comfort</FormLabel>
                  <span className="text-sm font-medium">{field.value}/5</span>
                </div>
                <FormControl>
                  <Slider
                    defaultValue={[field.value]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(vals) => field.onChange(vals[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={vehicleForm.control}
            name="cleanliness"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Cleanliness</FormLabel>
                  <span className="text-sm font-medium">{field.value}/5</span>
                </div>
                <FormControl>
                  <Slider
                    defaultValue={[field.value]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(vals) => field.onChange(vals[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={vehicleForm.control}
            name="performance"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Performance</FormLabel>
                  <span className="text-sm font-medium">{field.value}/5</span>
                </div>
                <FormControl>
                  <Slider
                    defaultValue={[field.value]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(vals) => field.onChange(vals[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={vehicleForm.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Review</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Share your experience with this vehicle" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}