import { Testimonial } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="flex-shrink-0 w-64 bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center mb-3">
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage src={testimonial.userAvatar} alt={testimonial.userName} />
          <AvatarFallback>{testimonial.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-sm">{testimonial.userName}</h3>
          <div className="flex text-yellow-400 text-xs">
            {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
              <StarIcon key={i} className="w-3 h-3 fill-current" />
            ))}
            {testimonial.rating % 1 !== 0 && (
              <div className="relative w-3 h-3">
                <StarIcon className="w-3 h-3 fill-current absolute" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white"></div>
              </div>
            )}
            {[...Array(5 - Math.ceil(testimonial.rating))].map((_, i) => (
              <StarIcon key={i} className="w-3 h-3 text-gray-300" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-neutral-600">{testimonial.comment}</p>
    </Card>
  );
}
