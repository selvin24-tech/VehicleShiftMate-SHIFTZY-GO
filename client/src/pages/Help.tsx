import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import ChatFloatingButton from "@/components/common/ChatFloatingButton";
import BrandName from "@/components/branding/BrandName";

// ── Simple in-app assistant knowledge base (keyword matched, no external API) ──
const ASSISTANT_KB: { keywords: string[]; answer: string }[] = [
  { keywords: ["shift", "transport", "move my", "send vehicle", "send my car"], answer: "To shift a vehicle, tap the blue SHIFT card on Home, enter your pickup & drop, choose a professional driver or a verified traveler, and submit. You can watch it live under My Rides." },
  { keywords: ["go", "travel", "drive", "earn"], answer: "Tap the orange GO card to find a vehicle to drive on your route. Enter your route, see the estimated fare, and send a request to the owner." },
  { keywords: ["track", "where is", "status", "my ride", "my rides"], answer: "Open My Rides to see the live status of every request — pending, driver assigned, in transit, and completed." },
  { keywords: ["fare", "price", "cost", "charge", "rate", "how much"], answer: "Fares depend on distance, vehicle type, and any extra services. You always see a full breakdown before you confirm a booking." },
  { keywords: ["cancel", "refund"], answer: "You can cancel an active booking from My Rides. Approved refunds go back to your original payment method within 5–7 days." },
  { keywords: ["payment", "pay ", "invoice", "upi", "card", "history"], answer: "Every payment, refund, and invoice is saved in Payment History, which you can open from your Profile." },
  { keywords: ["document", "rc", "licence", "license", "kyc"], answer: "You'll need your vehicle RC, insurance, and a valid ID. Upload them in Profile → Documents; verification takes up to 24 hours." },
  { keywords: ["aadhaar", "otp", "verify", "verification", "sign up", "register"], answer: "New accounts verify with Aadhaar plus a 6-digit OTP. For this demo, the OTP is 123456." },
  { keywords: ["safe", "safety", "sos", "emergency", "accident"], answer: "Tap the red SOS button anytime to reach Ambulance, Police, Fire, and your saved emergency contacts. Add your contacts in your Profile." },
  { keywords: ["driver", "become", "partner"], answer: "To drive with us, choose GO / Travel and apply as a driver partner with your licence and address proof after a quick verification." },
  { keywords: ["insurance", "damage", "claim"], answer: "All shifts are covered by transit insurance. Report any damage in the app with photos and our team will guide you through the claim." },
];

function answerFor(query: string): string {
  const q = query.toLowerCase();
  const hit = ASSISTANT_KB.find(entry => entry.keywords.some(k => q.includes(k)));
  if (hit) return hit.answer;
  return "I'm not fully sure about that one. You can check the FAQs below, or send us a message using the Contact Support form — our team replies fast.";
}

const QUICK_QUESTIONS = [
  "How do I shift my vehicle?",
  "How are fares calculated?",
  "How do I track my ride?",
  "Cancellation & refunds",
  "Is my trip safe?",
];

interface AssistantMsg { role: "user" | "bot"; text: string; }

function HelpAssistant() {
  const [messages, setMessages] = useState<AssistantMsg[]>([
    { role: "bot", text: "Hi! I'm the Shiftzy Assistant 🤖 Ask me anything about shifting, fares, tracking, payments, or safety." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const reply = answerFor(q);
    setMessages(m => [...m, { role: "user", text: q }, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div className="mb-6 rounded-2xl border border-blue-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm flex items-center gap-1"><BrandName onDark /> Assistant <Sparkles className="w-3.5 h-3.5 text-yellow-300" /></p>
          <p className="text-blue-100 text-[11px]">Instant answers, 24/7</p>
        </div>
      </div>

      <div className="bg-neutral-50 max-h-72 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-neutral-200 text-neutral-700"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="bg-white px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-neutral-100">
        {QUICK_QUESTIONS.map(q => (
          <button key={q} onClick={() => ask(q)}
            className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors">
            {q}
          </button>
        ))}
      </div>

      <div className="bg-white p-2 border-t border-neutral-100">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question…"
            className="flex-1"
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && input.trim()) { e.preventDefault(); ask(input); } }}
          />
          <Button size="icon" disabled={!input.trim()} onClick={() => ask(input)} className="bg-blue-600 hover:bg-blue-700">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}

const faqItems = [
  {
    question: "How do I shift my vehicle?",
    answer: "To shift your vehicle, start by selecting the 'Shifting' option on the home page. Fill in your vehicle details, pick-up and drop locations, and submit the request. Our team will match you with a driver and confirm your booking."
  },
  {
    question: "Can I track my vehicle during transit?",
    answer: "Yes, you can track your vehicle in real-time through our 'Track' feature. Simply enter your booking ID or visit the tracking section to see the current location and estimated arrival time of your vehicle."
  },
  {
    question: "What documents are required for vehicle shifting?",
    answer: "You'll need to provide your vehicle registration certificate (RC), insurance documents, and a valid ID proof. These can be uploaded directly through the app during the booking process."
  },
  {
    question: "How do I become a traveler driver?",
    answer: "To become a driver partner, select the 'Travel' option and apply through the 'Become a Driver' section. You'll need to provide your driving license, address proof, and complete a verification process before you can start accepting trips."
  },
  {
    question: "What happens if my vehicle gets damaged during transit?",
    answer: "All vehicles shifted through our platform are covered by transit insurance. In case of any damage, report it immediately through the app with photographs, and our support team will guide you through the claim process."
  },
  {
    question: "How are the charges calculated?",
    answer: "Charges are calculated based on the distance between pickup and drop locations, type of vehicle, and additional services requested. You'll see a transparent breakdown of all charges before confirming your booking."
  }
];

export default function Help() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactName || !contactEmail || !contactMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to submit your query.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      
      toast({
        title: "Message Sent",
        description: "We have received your message and will get back to you soon.",
      });
    }, 1500);
  };
  
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <Header title="Help & Support" variant="primary" />
      
      <div className="px-4 py-6">
        <HelpAssistant />

        <div className="mb-6">
          <h2 className="font-bold text-xl mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-medium text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  placeholder="Enter your name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email"
                  placeholder="Enter your email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Message</label>
                <Textarea 
                  placeholder="How can we help you?"
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <h3 className="font-semibold mb-2">Need Immediate Assistance?</h3>
          <p className="text-sm text-neutral-600 mb-3">
            Our support team is available 24/7 to help you with any issues or questions.
          </p>
          <div className="flex flex-col space-y-2">
            <Button variant="outline" className="justify-start">
              <i className="fas fa-phone-alt mr-2 text-primary-500"></i>
              Call Support: +91 98765 43210
            </Button>
            <Button variant="outline" className="justify-start">
              <i className="fas fa-envelope mr-2 text-primary-500"></i>
              Email: support@vehicleshift.com
            </Button>
            <Button variant="outline" className="justify-start">
              <i className="fab fa-whatsapp mr-2 text-blue-500"></i>
              WhatsApp Support
            </Button>
          </div>
        </div>
      </div>
      
      <ChatFloatingButton />
      <BottomNav />
    </div>
  );
}
