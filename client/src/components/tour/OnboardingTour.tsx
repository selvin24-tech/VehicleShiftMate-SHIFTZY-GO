import { useState, useEffect, useLayoutEffect } from "react";
import { X, ArrowRight } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
}

const tourSteps: TourStep[] = [
  {
    id: "shift",
    title: "Shift",
    description: "Send your car or bike to another city.",
    target: "[data-tour='shift-option']",
  },
  {
    id: "go",
    title: "Go",
    description: "Find a vehicle to drive and save on travel.",
    target: "[data-tour='go-option']",
  },
  {
    id: "nearby",
    title: "Nearby Rides",
    description: "See live trips available around you.",
    target: "[data-tour='nearby-trips']",
  },
  {
    id: "profile",
    title: "Profile",
    description: "Manage your account and saved details.",
    target: "[data-tour='profile']",
  },
  {
    id: "assistant",
    title: "AI Assistant",
    description: "Tap here anytime for instant help.",
    target: "[data-tour='ai-assistant']",
  },
  {
    id: "tracking",
    title: "Live Tracking",
    description: "Follow your trip on the map in real time.",
    target: "[data-tour='track-nav']",
  },
];

const TOOLTIP_W = 244;
const TOOLTIP_H = 118; // approximate, used for clamping

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function OnboardingTour({ isVisible, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = tourSteps[currentStep];

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setIsActive(true);
    }
  }, [isVisible]);

  // Scroll target into view, then measure its position.
  useLayoutEffect(() => {
    if (!isActive) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => {
      const found = document.querySelector(step.target) as HTMLElement | null;
      setRect(found ? found.getBoundingClientRect() : null);
    }, 320);
    return () => clearTimeout(t);
  }, [isActive, currentStep, step.target]);

  // Keep the highlight glued to the target while the page moves.
  useEffect(() => {
    if (!isActive) return;
    const sync = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      setRect(el ? el.getBoundingClientRect() : null);
    };
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [isActive, step.target]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) setCurrentStep(currentStep + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem("hasSeenTour", "true");
    onComplete();
  };

  if (!isActive) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Tooltip placement (falls back to screen center if target not found).
  let tooltipStyle: React.CSSProperties;
  let arrowLeft = TOOLTIP_W / 2;
  let placeBelow = true;
  const showArrow = !!rect;

  if (rect) {
    const spaceBelow = vh - rect.bottom;
    placeBelow = spaceBelow > TOOLTIP_H + 24;
    const centerX = rect.left + rect.width / 2;
    let left = centerX - TOOLTIP_W / 2;
    left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));
    arrowLeft = Math.max(18, Math.min(centerX - left, TOOLTIP_W - 18));
    let top = placeBelow ? rect.bottom + 14 : rect.top - 14;
    // vertical clamp so the card never leaves the screen
    if (placeBelow) top = Math.min(top, vh - TOOLTIP_H - 12);
    else top = Math.max(top, TOOLTIP_H + 12);
    tooltipStyle = {
      top,
      left,
      width: TOOLTIP_W,
      transform: placeBelow ? "none" : "translateY(-100%)",
    };
  } else {
    tooltipStyle = {
      top: vh / 2,
      left: Math.max(12, vw / 2 - TOOLTIP_W / 2),
      width: TOOLTIP_W,
      transform: "translateY(-50%)",
    };
  }

  const isLast = currentStep === tourSteps.length - 1;

  return (
    <>
      {/* Full-screen click blocker (dismiss on backdrop tap) */}
      <div className="fixed inset-0 z-[59]" onClick={handleComplete} />

      {/* Spotlight: dims the screen except the target, with an orange ring.
          Drawn as a top-level fixed element so it works regardless of the
          target's own stacking context (header, bottom nav, etc). */}
      {rect && (
        <div
          className="fixed z-[60] pointer-events-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderRadius: 14,
            boxShadow:
              "0 0 0 3px #f97316, 0 0 0 9999px rgba(0,0,0,0.55), 0 0 22px 2px rgba(249,115,22,0.5)",
          }}
        />
      )}

      {/* Compact coach-mark tooltip */}
      <div className="fixed z-[62]" style={tooltipStyle}>
        {showArrow && (
          <div
            className="absolute w-3 h-3 bg-white rotate-45"
            style={{
              left: arrowLeft - 6,
              [placeBelow ? "top" : "bottom"]: -5,
            }}
          />
        )}

        <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-100 px-3.5 py-3">
          <button
            onClick={handleComplete}
            aria-label="Close tour"
            className="absolute top-2 right-2 text-neutral-300 hover:text-neutral-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-baseline gap-1.5 pr-5">
            <span className="text-[10px] font-bold text-blue-600">
              {currentStep + 1}/{tourSteps.length}
            </span>
            <h3 className="text-sm font-extrabold text-neutral-900 leading-tight">
              {step.title}
            </h3>
          </div>
          <p className="text-[12px] text-neutral-500 leading-snug mt-0.5">
            {step.description}
          </p>

          <div className="flex items-center justify-between mt-2.5">
            {/* Progress dots */}
            <div className="flex items-center gap-1">
              {tourSteps.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? "w-4 bg-orange-500" : "w-1.5 bg-neutral-200"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {!isLast && (
                <button
                  onClick={handleComplete}
                  className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-600 px-1"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-full pl-3 pr-2.5 py-1.5 active:scale-95 transition-all"
              >
                {isLast ? "Done" : "Next"}
                {!isLast && <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
