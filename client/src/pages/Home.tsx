import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import TestimonialCard from "@/components/common/TestimonialCard";
import TripCard from "@/components/common/TripCard";
import ShiftRequestCard from "@/components/common/ShiftRequestCard";
import { TESTIMONIALS, RECENT_TRIPS, NEARBY_SHIFT_REQUESTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-16">
      <Header />

      {/* Main Tabs - Shifting & Travel */}
      <div className="px-4 py-6 pt-8">
        <div className="space-y-5">
          {/* Shiftzy Option - Styled as a car-like shape */}
          <div 
            className="vehicle-option-card shifting-card"
            onClick={() => navigate("/shift-request")}
          >
            <div className="option-content">
              <div className="option-icon-container">
                <i className="fas fa-car text-2xl"></i>
              </div>
              <div className="option-text">
                <h2 className="option-brand-name">
                  <span className="option-brand-shift">Shift</span>
                  <span className="option-brand-accent">zy</span>
                </h2>
                <p className="text-sm text-neutral-600">Transport your vehicle to another location</p>
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
          >
            <div className="option-content">
              <div className="option-icon-container travel-icon">
                <i className="fas fa-route text-2xl"></i>
              </div>
              <div className="option-text">
                <h2 className="text-xl font-bold bg-gradient-to-r from-secondary-500 to-secondary-300 bg-clip-text text-transparent">Travel Experience</h2>
                <p className="text-sm text-neutral-600">Rent and drive vehicles for your journey</p>
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
            <h2 className="font-bold text-lg">Nearby Ride Opportunities</h2>
            <Button 
              variant="link" 
              className="text-primary-600 text-sm p-0 h-auto"
              onClick={() => navigate("/travel")}
            >
              See All
            </Button>
          </div>
          
          <p className="text-sm text-neutral-600 mb-4">
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
          <h2 className="font-bold text-lg mb-4">Your Recent Trips</h2>
          
          {RECENT_TRIPS.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="mt-8">
          <h2 className="font-bold text-lg mb-4">Customer Stories</h2>
          <div className="overflow-x-auto flex -mx-4 px-4 py-2 gap-4 pb-4">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
