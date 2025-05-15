import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Star, X } from "lucide-react";
import { ReviewType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Review form schema
const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(500, "Comment must be less than 500 characters"),
  // Only for vehicle reviews
  comfortRating: z.number().min(1).max(5).optional(),
  cleanlinessRating: z.number().min(1).max(5).optional(),
  performanceRating: z.number().min(1).max(5).optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  type: ReviewType;
  subjectId: number;
  tripId: number;
  userType?: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ 
  type, 
  subjectId, 
  tripId,
  userType = "driver",
  onReviewSubmitted 
}: ReviewFormProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form with validation
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      comfortRating: type === 'vehicle' ? 3 : undefined,
      cleanlinessRating: type === 'vehicle' ? 3 : undefined,
      performanceRating: type === 'vehicle' ? 3 : undefined,
    },
  });
  
  // Submit mutation
  const mutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      // In a real implementation, this would be:
      // return await apiRequest(`/api/${type}-reviews`, {
      //   method: "POST",
      //   body: JSON.stringify({
      //     ...values,
      //     [`${type}Id`]: subjectId,
      //     tripId,
      //   }),
      // });
      
      // For now, return a fake success response
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate queries to refetch reviews
      const queryKey = type === 'user' ? 'user-reviews' : 'vehicle-reviews';
      queryClient.invalidateQueries({ queryKey: [queryKey, subjectId] });
      
      // Show success toast
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      
      // Call the callback
      onReviewSubmitted();
    },
    onError: () => {
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: ReviewFormValues) => {
    mutation.mutate(values);
  };
  
  // Star rating component
  const StarRating = ({ field }: { field: any }) => {
    return (
      <div className="flex mb-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => field.onChange(rating)}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(null)}
            className="p-1"
          >
            <Star
              className={`w-8 h-8 ${
                (hoveredRating !== null 
                  ? rating <= hoveredRating 
                  : rating <= field.value)
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-neutral-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="p-5 border border-neutral-200 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">
          {type === 'user' 
            ? `Rate this ${userType}` 
            : "Rate this vehicle"}
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onReviewSubmitted}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Overall Rating */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overall Rating</FormLabel>
                <FormControl>
                  <StarRating field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Comment */}
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Review</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Tell us about your experience with this ${
                      type === 'user' ? userType : 'vehicle'
                    }`}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Additional metrics for vehicle reviews */}
          {type === 'vehicle' && (
            <div className="space-y-4 pt-2">
              <h4 className="font-medium text-sm text-neutral-700">Additional Ratings</h4>
              
              {/* Comfort Rating */}
              <FormField
                control={form.control}
                name="comfortRating"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel className="text-sm font-normal">Comfort</FormLabel>
                      <span className="text-sm font-medium">{field.value}/5</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value || 3]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Cleanliness Rating */}
              <FormField
                control={form.control}
                name="cleanlinessRating"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel className="text-sm font-normal">Cleanliness</FormLabel>
                      <span className="text-sm font-medium">{field.value}/5</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value || 3]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Performance Rating */}
              <FormField
                control={form.control}
                name="performanceRating"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel className="text-sm font-normal">Performance</FormLabel>
                      <span className="text-sm font-medium">{field.value}/5</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value || 3]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}