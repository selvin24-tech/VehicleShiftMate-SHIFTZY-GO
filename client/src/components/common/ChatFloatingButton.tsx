import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";

interface BotMessage {
  from: "bot" | "me";
  text: string;
}

interface Faq {
  q: string;
  keywords: string[];
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "What is Shiftzy Go?",
    keywords: ["what", "about", "shiftzy", "purpose", "app"],
    a: "Shiftzy Go is India's smart vehicle shifting platform. It connects vehicle owners who need to move their vehicle between cities with verified travellers heading the same way — so your vehicle reaches safely and the traveller shares the journey.",
  },
  {
    q: "How do I shift my vehicle?",
    keywords: ["shift", "send", "move", "owner", "post", "drop"],
    a: "Tap the blue SHIFT option on the home screen, add your vehicle details, pickup & drop locations, and post it. Nearby travellers will send you requests — accept one and confirm the deal in chat.",
  },
  {
    q: "How do I travel using a vehicle?",
    keywords: ["travel", "go", "drive", "ride", "traveller", "book"],
    a: "Tap the orange GO option, browse nearby vehicles that need shifting on your route, and hit 'Send Request'. Once the owner accepts, chat unlocks so you can arrange the pickup.",
  },
  {
    q: "How do payments work?",
    keywords: ["pay", "payment", "cost", "price", "fee", "money", "charge"],
    a: "Every trip shows a fully transparent cost breakdown — fuel, tolls, a 10% platform fee and GST. Payments are handled securely, and chat unlocks once your request is accepted.",
  },
  {
    q: "Is it safe?",
    keywords: ["safe", "secure", "trust", "verify", "verified", "track"],
    a: "Yes. Owners and travellers have profiles, ratings and verification badges, and you can track the vehicle live during the whole trip.",
  },
  {
    q: "How do I contact support?",
    keywords: ["support", "help", "contact", "team", "human", "md"],
    a: "You can reach our MD's desk anytime from the 'Have a question? Chat with us' banner on the home screen — or just ask me here and I'll do my best to help!",
  },
];

const WELCOME =
  "Hi! 👋 I'm the Shiftzy assistant. Ask me anything about how Shiftzy Go works — here are a few things people usually ask:";

function findAnswer(text: string): string {
  const t = text.toLowerCase();
  let best: { faq: Faq; score: number } | null = null;
  for (const faq of FAQS) {
    const score = faq.keywords.reduce((s, k) => (t.includes(k) ? s + 1 : s), 0);
    if (score > 0 && (!best || score > best.score)) best = { faq, score };
  }
  if (best) return best.faq.a;
  return "I'm still learning! For anything specific, tap the 'Chat with us' banner on the home screen to reach our team. Meanwhile, you can tap one of the questions below.";
}

export default function ChatFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([{ from: "bot", text: WELCOME }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isOpen]);

  const ask = (question: string, answer?: string) => {
    const reply = answer ?? findAnswer(question);
    setMessages((prev) => [...prev, { from: "me", text: question }, { from: "bot", text: reply }]);
  };

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    setInput("");
    ask(t);
  };

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-[85vw] max-w-[22rem] rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3 text-white"
            style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#f97316 100%)" }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm leading-tight">Shiftzy Assistant</p>
              <p className="text-[10px] text-white/85 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" /> Online · replies instantly
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[45vh] bg-neutral-50 dark:bg-neutral-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.from === "me"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          <div className="px-3 pt-2 pb-1 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick questions
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {FAQS.map((f) => (
                <button
                  key={f.q}
                  onClick={() => ask(f.q, f.a)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 dark:bg-neutral-800 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-neutral-700 hover:bg-blue-100 dark:hover:bg-neutral-700 active:scale-95 transition-all"
                >
                  {f.q}
                </button>
              ))}
            </div>
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 p-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question…"
              className="flex-1 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        data-tour="ai-assistant"
        aria-label="Open AI chat assistant"
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full text-white font-bold text-sm shadow-2xl ring-2 ring-white/70 dark:ring-neutral-900 active:scale-95 transition-all"
        style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#f97316 100%)" }}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </span>
            AI Chat
          </>
        )}
      </button>
    </>
  );
}
