import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ChatFloatingButton from "@/components/common/ChatFloatingButton";

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
