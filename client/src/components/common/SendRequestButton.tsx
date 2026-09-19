import { useLocation } from "wouter";
import { Info, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import type { ShiftRequest } from "@/lib/types";

interface SendRequestButtonProps {
  request: ShiftRequest;
  className?: string;
}

// This listing is sample/preview data — there is no real owner-matching
// backend behind it yet. Rather than simulate an owner "accepting" a
// request that was never really sent anywhere, this honestly says so and
// points to the real, working flow (Shift a Vehicle).
export default function SendRequestButton({ request, className = "" }: SendRequestButtonProps) {
  const [, navigate] = useLocation();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowInfo(true)}
        className={`${className} bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5`}
      >
        <Info className="w-4 h-4" /> Send Request
      </button>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="sm:max-w-[360px] rounded-2xl text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Info className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900">This is a sample listing</h3>
              <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
                Requesting a specific owner's vehicle isn't live yet — this listing is preview data.
                To move your own vehicle for real, submit a Shift Request and our team will price it and assign a driver.
              </p>
            </div>
            <button
              onClick={() => navigate("/shift-request")}
              className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              Shift a Vehicle <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => setShowInfo(false)} className="w-full text-neutral-500 text-sm font-semibold py-1">
              Not now
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
