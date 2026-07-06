import { useState, useRef, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ChevronLeft, CheckCircle2, Send, Star, Route as RouteIcon,
  Phone, Lock, ShieldCheck,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NEARBY_SHIFT_REQUESTS } from "@/lib/constants";
import {
  useSentRequest, useDealChat, sendDealMessage,
} from "@/lib/requestsStore";

const OWNER_REPLIES = [
  "Sounds good! I'll keep the vehicle ready.",
  "Perfect. Let's confirm the pickup time.",
  "Great, works for me. See you then!",
];

export default function AcceptedRequest() {
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ id: string }>("/request/:id");
  const id = params?.id ?? "";

  const req = NEARBY_SHIFT_REQUESTS.find((r) => r.id === id);
  const record = useSentRequest(id);
  const messages = useDealChat(id);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const accepted = record?.status === "accepted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      replyTimers.current.forEach((t) => clearTimeout(t));
      replyTimers.current = [];
    };
  }, []);

  if (!req) {
    return (
      <div className="max-w-lg mx-auto min-h-screen flex flex-col items-center justify-center text-center px-6 gap-4">
        <h2 className="text-lg font-extrabold text-neutral-900">Request not found</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl active:scale-95 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const vehicleName = `${req.vehicle.make} ${req.vehicle.model}`;
  const route = `${req.pickupLocation.name} → ${req.dropLocation.name}`;

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    sendDealMessage(id, "me", t);
    setText("");
    // A light canned owner reply so the deal chat feels two-sided.
    const timer = setTimeout(() => {
      sendDealMessage(id, "owner", OWNER_REPLIES[Math.floor(Math.random() * OWNER_REPLIES.length)]);
    }, 1500);
    replyTimers.current.push(timer);
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-24 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-100 shadow-sm flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base leading-tight truncate">{vehicleName}</h1>
          <p className="text-[11px] text-neutral-400 truncate">{route}</p>
        </div>
        <a
          href="tel:"
          className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center active:scale-95 transition-all"
          aria-label="Call owner"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>

      {/* Accepted banner */}
      {accepted && (
        <div className="mx-4 mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-xs font-semibold text-green-800 leading-snug">
            {req.userName} accepted your request. Chat is unlocked — confirm the timing & pickup below.
          </p>
        </div>
      )}

      {/* Vehicle + owner card */}
      <div className="mx-4 mt-4 rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {req.vehicle.image && (
          <img
            src={`${req.vehicle.image}?w=600&h=260&q=70&fit=crop`}
            alt={vehicleName}
            className="w-full h-36 object-cover"
          />
        )}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-extrabold text-neutral-900">{vehicleName}</p>
              <p className="text-xs text-neutral-400">{req.vehicle.registrationNumber}</p>
            </div>
            {req.rating != null && (
              <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-full px-2.5 py-1">
                <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span className="text-xs font-bold text-neutral-700">{req.rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 mt-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <div className="w-0.5 h-6 bg-gradient-to-b from-blue-600 to-orange-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-neutral-800">{req.pickupLocation.name}</p>
              <p className="text-[10px] text-neutral-400 mb-1.5">{req.pickupLocation.address}</p>
              <p className="text-xs font-bold text-neutral-800">{req.dropLocation.name}</p>
              <p className="text-[10px] text-neutral-400">{req.dropLocation.address}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-neutral-400 shrink-0">
              <RouteIcon className="w-3 h-3" /> {req.distance}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
            <Avatar className="h-9 w-9">
              <AvatarImage src={req.userAvatar} />
              <AvatarFallback>{req.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-bold text-neutral-800">{req.userName}</p>
              <p className="text-[10px] text-neutral-400">Vehicle Owner</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="mx-4 mt-4 flex-1 flex flex-col">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">
          Chat with {req.userName}
        </p>

        {!accepted ? (
          <div className="flex flex-col items-center justify-center text-center bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl py-10 px-6">
            <Lock className="w-7 h-7 text-neutral-300 mb-2" />
            <p className="text-sm font-semibold text-neutral-500">Chat is locked</p>
            <p className="text-xs text-neutral-400 mt-1">
              It unlocks once the owner accepts your request.
            </p>
          </div>
        ) : (
          <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-2 min-h-[180px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.from === "me"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      {accepted && (
        <div className="sticky bottom-16 bg-white border-t border-neutral-100 px-4 py-3 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message…"
            className="flex-1 bg-neutral-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
