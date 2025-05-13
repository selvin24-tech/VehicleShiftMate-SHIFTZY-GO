import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const handleSOSClick = () => {
    setIsOpen(!isOpen);
  };
  
  const handleEmergencyCall = (service: 'ambulance' | 'police') => {
    const serviceNumber = service === 'ambulance' ? '108' : '100';
    
    toast({
      title: `Calling ${service.charAt(0).toUpperCase() + service.slice(1)}`,
      description: `Dialing emergency number ${serviceNumber}...`,
      variant: "destructive",
    });
    
    // In a real app, this would trigger the phone's call feature
    // For this demo, we just simulate the behavior
    setTimeout(() => {
      setIsOpen(false);
    }, 1500);
  };
  
  return (
    <>
      <button 
        onClick={handleSOSClick}
        className="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="Emergency SOS Button"
      >
        <span className="font-bold text-sm">SOS</span>
      </button>
      
      {isOpen && (
        <div className="fixed bottom-36 right-5 z-50 flex flex-col gap-2 items-end">
          <button
            onClick={() => handleEmergencyCall('ambulance')}
            className="flex items-center gap-2 bg-white text-red-600 border border-red-600 px-4 py-2 rounded-full shadow-md hover:bg-red-50"
          >
            <i className="fas fa-ambulance"></i>
            <span>Ambulance</span>
          </button>
          <button
            onClick={() => handleEmergencyCall('police')}
            className="flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-full shadow-md hover:bg-blue-50"
          >
            <i className="fas fa-shield-alt"></i>
            <span>Police</span>
          </button>
        </div>
      )}
    </>
  );
}