import { useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ThumbsUp, Clock, MessageCircle, Send } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import type { ShiftRequest } from "@/lib/types";
import {
  sendRequest,
  acceptRequest,
  useSentRequest,
} from "@/lib/requestsStore";
import { addStoredNotif } from "@/lib/notificationsStore";

interface SendRequestButtonProps {
  request: ShiftRequest;
  className?: string;
}

// How long we pretend the owner takes to accept (demo only).
const OWNER_ACCEPT_DELAY = 4000;

export default function SendRequestButton({ request, className = "" }: SendRequestButtonProps) {
  const [, navigate] = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const record = useSentRequest(request.id);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const vehicleName = `${request.vehicle.make} ${request.vehicle.model}`;
  const route = `${request.pickupLocation.name} → ${request.dropLocation.name}`;

  const handleSend = () => {
    // Guard against double-taps / re-sends: only schedule acceptance once.
    if (record) {
      setShowPopup(true);
      return;
    }
    sendRequest({
      id: request.id,
      vehicleName,
      vehicleImage: request.vehicle.image,
      registrationNumber: request.vehicle.registrationNumber,
      ownerName: request.userName,
      ownerAvatar: request.userAvatar,
      route,
    });
    setShowPopup(true);

    // Simulate the owner accepting a little later, then notify the customer.
    timer.current = setTimeout(() => {
      acceptRequest(request.id);
      addStoredNotif({
        category: "bookings",
        iconKey: "accepted",
        color: "blue",
        title: "Request Accepted",
        body: `${request.userName} accepted your request for ${vehicleName} · ${route}. Tap to open the chat and confirm the deal.`,
        requestId: request.id,
      });
    }, OWNER_ACCEPT_DELAY);
  };

  const status = record?.status;

  return (
    <>
      {status === "accepted" ? (
        <button
          onClick={() => navigate(`/request/${request.id}`)}
          className={`${className} bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5`}
        >
          <MessageCircle className="w-4 h-4" /> Open Chat
        </button>
      ) : status === "sent" ? (
        <button
          disabled
          className={`${className} bg-neutral-100 text-neutral-500 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-default`}
        >
          <Clock className="w-4 h-4" /> Request Sent
        </button>
      ) : (
        <button
          onClick={handleSend}
          className={`${className} bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5`}
        >
          <Send className="w-4 h-4" /> Send Request
        </button>
      )}

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-[340px] rounded-2xl text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900">Request Sent!</h3>
              <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
                We've notified <span className="font-semibold text-neutral-700">{request.userName}</span> about your
                request for the {vehicleName}. You'll get a notification in the bell once they accept — then you can
                chat and confirm the deal.
              </p>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl active:scale-95 transition-all"
            >
              Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
