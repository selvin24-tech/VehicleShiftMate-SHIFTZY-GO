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
    title: "Welcome to Shiftzy Go! 👋",
    description: "Safe Shift. Joyful Journey. Here's a quick 60-second tour of everything you can do. You can skip anytime.",
    target: "body",
    position: "bottom"
  },
  {
    id: "shift-option",
    title: "🚛 Shift Your Vehicle",
    description: "Tap the blue SHIFT card to send your car or bike to another place. Choose a professional driver or a verified traveler going your way.",
    target: "[data-tour='shift-option']",
    position: "bottom"
  },
  {
    id: "go-option",
    title: "🛞 Go & Travel",
    description: "Tap the orange GO card to find a vehicle to drive on your route — travel and save by sharing the trip cost.",
    target: "[data-tour='go-option']",
    position: "bottom"
  },
  {
    id: "my-rides",
    title: "🧳 My Rides",
    description: "All your Shift and Go requests live here with live status — pending, driver assigned, in transit and completed.",
    target: "body",
    position: "bottom"
  },
  {
    id: "payments",
    title: "🧾 Payment History",
    description: "Every payment, refund and invoice is saved in Payment History, which you can open from your Profile.",
    target: "body",
    position: "bottom"
  },
  {
    id: "assistant",
    title: "🤖 AI Help Assistant",
    description: "Have a doubt? The in-app assistant answers common questions about shifting, fares, safety and bookings instantly.",
    target: "[data-tour='support-option']",
    position: "top"
  },
  {
    id: "support",
    title: "💬 Talk to the MD's Desk",
    description: "Need a custom route or special help? Message our team directly and share your exact pickup and drop.",
    target: "[data-tour='support-option']",
    position: "top"
  },
  {
    id: "safety",
    title: "🚨 Safety & SOS",
    description: "The red SOS button reaches Ambulance, Police, Fire and your saved emergency contacts. Add them in your Profile.",
    target: "body",
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
            position: relative !important;
            z-index: 51 !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5) !important;
            border-radius: 12px !important;
            animation: tourPulse 2s infinite;
          }
          
          @keyframes tourPulse {
            0% {
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
            }
            50% {
              box-shadow: 0 0 0 6px rgba(59, 130, 246, 1), 0 0 0 12px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.7);
            }
            100% {
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
            }
          }
        `}</style>
      )}
    </>
  );
}