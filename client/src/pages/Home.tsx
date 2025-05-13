import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import TestimonialCard from "@/components/common/TestimonialCard";
import TripCard from "@/components/common/TripCard";
import { TESTIMONIALS, RECENT_TRIPS } from "@/lib/constants";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-16">
      <Header />

      {/* Main Tabs - Shifting & Travel */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="bg-white border border-neutral-100 shadow-md rounded-xl p-4 flex flex-col items-center justify-center transition hover:shadow-lg cursor-pointer"
            onClick={() => navigate("/shift-request")}
          >
            <div className="w-16 h-16 rounded-full mb-3 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3" 
                alt="Vehicle shifting service" 
                className="w-full h-full object-cover" 
              />
            </div>
            <h2 className="font-bold text-lg text-primary-600">Shifting</h2>
            <p className="text-sm text-neutral-600 text-center mt-1">Transport your vehicle to another location</p>
          </div>

          <div 
            className="bg-white border border-neutral-100 shadow-md rounded-xl p-4 flex flex-col items-center justify-center transition hover:shadow-lg cursor-pointer"
            onClick={() => navigate("/travel")}
          >
            <div className="w-16 h-16 rounded-full mb-3 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1464038008305-ee8def75f234?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" 
                alt="Vehicle travel experience" 
                className="w-full h-full object-cover" 
              />
            </div>
            <h2 className="font-bold text-lg text-secondary-500">Travel</h2>
            <p className="text-sm text-neutral-600 text-center mt-1">Rent and drive vehicles for your journey</p>
          </div>
        </div>

        {/* Recent Trips Section */}
        <div className="mt-8">
          <h2 className="font-bold text-lg mb-4">Recent Trips</h2>
          
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
