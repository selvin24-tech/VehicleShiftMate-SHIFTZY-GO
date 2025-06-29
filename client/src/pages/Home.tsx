import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import TestimonialCard from "@/components/common/TestimonialCard";
import TripCard from "@/components/common/TripCard";
import ShiftRequestCard from "@/components/common/ShiftRequestCard";
import OnboardingTour from "@/components/tour/OnboardingTour";
import { TESTIMONIALS, RECENT_TRIPS, NEARBY_SHIFT_REQUESTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Phone, AlertTriangle } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user is first-time login
    const isFirstLogin = localStorage.getItem("isFirstLogin");
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    const username = localStorage.getItem("username");
    
    // Show tour only for new users (not existing users like selvin_1991)
    if (isFirstLogin && !hasSeenTour && username !== "selvin_1991") {
      setShowTour(true);
      localStorage.removeItem("isFirstLogin");
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
  };

  return (
    <div className="container max-w-lg mx-auto bg-white min-h-screen relative pb-16">
      <Header />

      {/* Onboarding Tour */}
      <OnboardingTour isVisible={showTour} onComplete={handleTourComplete} />

      {/* Trust Indicator */}
      <div className="px-resp pt-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">4,370+</div>
            <div className="text-sm text-green-700">People have trusted Shiftzy Go for vehicle shifting</div>
            <div className="flex items-center justify-center mt-2">
              <div className="flex -space-x-1">
                <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-xs text-green-600 ml-2 font-medium">Safe & Trusted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Options - Shift & Go */}
      <div className="px-resp pb-resp">
        <div className="space-y-5">
          {/* Shiftzy Option - Styled as a car-like shape */}
          <div 
            className="vehicle-option-card shifting-card"
            onClick={() => navigate("/shift-request")}
            data-tour="shift-option"
          >
            <div className="option-content">
              <div className="option-icon-container">
                <i className="fas fa-car text-2xl"></i>
              </div>
              <div className="option-text">
                <h2 className="option-brand-name">
                  <span className="option-brand-shift">Shift</span>
                </h2>
                <p className="body-text text-neutral-600">Transport your vehicle to another location</p>
              </div>
              <div className="arrow-icon">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
            <div className="car-shape-bottom"></div>
          </div>

          {/* Travel Option - Styled with road-like design */}
          <div 
            className="vehicle-option-card travel-card"
            onClick={() => navigate("/travel")}
            data-tour="go-option"
          >
            <div className="option-content">
              <div className="option-icon-container travel-icon">
                <i className="fas fa-route text-2xl"></i>
              </div>
              <div className="option-text">
                <h2 className="option-brand-name">
                  <span className="option-brand-go">Go</span>
                </h2>
                <p className="body-text text-neutral-600">Find vehicles to drive and earn while traveling</p>
              </div>
              <div className="arrow-icon">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
            <div className="road-shape-bottom"></div>
          </div>
        </div>

        {/* Nearby Ride Opportunities Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold h2">Nearby Ride Opportunities</h2>
            <Button 
              variant="link" 
              className="text-primary-600 text-sm p-0 h-auto"
              onClick={() => navigate("/travel")}
            >
              See All
            </Button>
          </div>
          
          <p className="body-text text-neutral-600 mb-resp">
            Available rides within 15 km of your location that need to be picked up in the next 6 hours.
          </p>
          
          <div className="space-y-4">
            {NEARBY_SHIFT_REQUESTS.slice(0, 3).map((request) => (
              <ShiftRequestCard key={request.id} request={request} />
            ))}
            
            <Button 
              className="w-full bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50"
              onClick={() => navigate("/travel")}
            >
              View All Ride Opportunities
            </Button>
          </div>
        </div>
        
        {/* Recent Trips Section */}
        <div className="mt-8">
          <h2 className="font-bold h2 mb-resp">Your Recent Trips</h2>
          
          {RECENT_TRIPS.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="mt-8" data-tour="reviews">
          <h2 className="font-bold h2 mb-resp">Customer Stories</h2>
          <div className="overflow-x-auto flex -mx-4 px-4 py-2 gap-4 pb-4">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Plan Your Journey Section */}
        <div className="mt-8" data-tour="plan">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h2 className="font-bold h2 mb-2 text-blue-900">Plan Your Journey</h2>
            <p className="body-text text-blue-700 mb-4">
              Get personalized route suggestions and cost estimates for your vehicle transportation needs.
            </p>
            <Button 
              onClick={() => navigate("/plan")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              Start Planning
            </Button>
          </div>
        </div>

        {/* Emergency Support Section */}
        <div className="mt-6 mb-8" data-tour="emergency">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="font-bold h2 text-red-900">24/7 Emergency Support</h2>
            </div>
            <p className="body-text text-red-700 mb-4">
              Need immediate assistance during your trip? Our support team is available round the clock.
            </p>
            <div className="flex gap-3">
              <Button 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Call Emergency
              </Button>
              <Button 
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => navigate("/help")}
              >
                Get Help
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
