import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Shiftzy Go!",
    description: "Let's take a quick tour to show you how our platform works.",
    target: "body",
    position: "bottom"
  },
  {
    id: "shift-option",
    title: "Shift Your Vehicle",
    description: "Need to move your vehicle? Post a shift request here. Vehicle owners can list their cars or bikes for transportation to different locations.",
    target: "[data-tour='shift-option']",
    position: "bottom"
  },
  {
    id: "go-option",
    title: "Find Vehicles to Drive",
    description: "Want to travel and drive different vehicles? Browse available vehicles and shift requests from other users.",
    target: "[data-tour='go-option']",
    position: "bottom"
  },
  {
    id: "reviews",
    title: "User Reviews",
    description: "Check out what other users are saying about their experiences. Reviews help build trust in our community.",
    target: "[data-tour='reviews']",
    position: "top"
  },
  {
    id: "plan",
    title: "Plan Your Journey",
    description: "Need help planning your trip? Use our planning tools to organize your vehicle transportation needs.",
    target: "[data-tour='plan']",
    position: "top"
  },
  {
    id: "emergency",
    title: "Emergency Support",
    description: "In case of emergencies during your trip, our 24/7 support team is here to help you immediately.",
    target: "[data-tour='emergency']",
    position: "top"
  }
];

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function OnboardingTour({ isVisible, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsActive(true);
    }
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem("hasSeenTour", "true");
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isActive) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" />
      
      {/* Tour Card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
        <Card className="p-6 shadow-2xl border-2 border-primary-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentStep + 1}
              </div>
              <span className="text-sm text-neutral-500">
                {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-neutral-800">
              {currentTourStep.title}
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              {currentTourStep.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-neutral-500"
              >
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center gap-2"
              >
                {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Highlight overlay for specific elements */}
      {currentTourStep.target !== "body" && (
        <style>{`
          ${currentTourStep.target} {
            position: relative;
            z-index: 51;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
            border-radius: 8px;
          }
        `}</style>
      )}
    </>
  );
}