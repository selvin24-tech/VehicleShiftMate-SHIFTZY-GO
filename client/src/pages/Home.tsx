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
import { Phone, AlertTriangle, MapPin, Navigation } from "lucide-react";

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
                <p className="font-semibold text-sm text-neutral-700">Need to Shift?</p>
                <p className="text-xs text-neutral-500 mt-0.5">Safe, easy vehicle relocation.</p>
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
                <p className="font-semibold text-sm text-neutral-700">Ready to Go?</p>
                <p className="text-xs text-neutral-500 mt-0.5">Choose a vehicle and start your journey.</p>
              </div>
              <div className="arrow-icon">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
            <div className="road-shape-bottom"></div>
          </div>
        </div>

        {/* Nearby Pickups — 5 km Section */}
        <div className="mt-8">

          {/* Bold section header */}
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl px-4 py-4 mb-4 overflow-hidden shadow-lg">
            {/* Background glow blobs */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Pulsing radar icon */}
                <div className="relative w-11 h-11">
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                  <div className="relative w-11 h-11 rounded-full bg-white/25 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-lg leading-tight">Nearby Pickups</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
                    <span className="text-green-100 text-xs font-semibold">Within 5 km · Live</span>
                  </div>
                </div>
              </div>

              {/* See All — bold pill */}
              <button
                onClick={() => navigate("/nearby")}
                className="flex items-center gap-1.5 bg-white text-green-700 font-bold text-sm px-4 py-2 rounded-full shadow-md active:scale-95 transition-all hover:bg-green-50"
              >
                See All
                <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {NEARBY_SHIFT_REQUESTS.length}
                </span>
              </button>
            </div>

            {/* Info tag inside header card */}
            <div className="mt-3 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <p className="text-xs text-white font-medium">
                Owners nearby need their vehicle moved — share cost, both save!
              </p>
            </div>
          </div>

          {/* Cards — only 2 closest shown on home */}
          <div className="space-y-3">
            {NEARBY_SHIFT_REQUESTS.slice(0, 2).map((request) => (
              <ShiftRequestCard key={request.id} request={request} />
            ))}
          </div>

          {/* View all button */}
          <button
            onClick={() => navigate("/nearby")}
            className="mt-4 w-full py-3.5 rounded-2xl font-bold text-sm text-white active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
            style={{ background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)" }}
          >
            <Navigation className="w-4 h-4" />
            View All {NEARBY_SHIFT_REQUESTS.length} Nearby Vehicles
          </button>
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
