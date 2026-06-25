import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import ShiftRequest from "@/pages/ShiftRequest";
import Travel from "@/pages/Travel";
import Profile from "@/pages/Profile";
import Plan from "@/pages/Plan";
import Track from "@/pages/Track";
import Help from "@/pages/Help";
import Chat from "@/pages/Chat";
import VehicleDetails from "@/pages/VehicleDetails";
import Checkout from "@/pages/Checkout";
import Nearby from "@/pages/Nearby";
import Notifications from "@/pages/Notifications";
import BookingConfirmation from "@/pages/BookingConfirmation";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Wallet from "@/pages/Wallet";
import { ChatProvider } from "@/contexts/ChatContext";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated");
      const storedUserType = localStorage.getItem("userType");
      setIsAuthenticated(authStatus === "true");
      setUserType(storedUserType);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-neutral-600 font-medium">Loading Shiftzy Go...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={() => userType === "admin" ? <AdminDashboard /> : <Home />} />
      <Route path="/shift-request" component={ShiftRequest} />
      <Route path="/travel" component={Travel} />
      <Route path="/profile" component={Profile} />
      <Route path="/plan" component={Plan} />
      <Route path="/track" component={Track} />
      <Route path="/help" component={Help} />
      <Route path="/chat" component={Chat} />
      <Route path="/vehicle/:id" component={VehicleDetails} />
      <Route path="/checkout/:vehicleId" component={Checkout} />
      <Route path="/nearby" component={Nearby} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/payment-success" component={BookingConfirmation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <ChatProvider>
        <Toaster />
        <Router />
      </ChatProvider>
    </TooltipProvider>
  );
}

export default App;
