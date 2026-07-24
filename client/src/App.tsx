import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import AdminDashboard from "@/pages/AdminDashboard";
import ShiftRequest from "@/pages/ShiftRequest";
import Travel from "@/pages/Travel";
import Profile from "@/pages/Profile";
import Plan from "@/pages/Plan";
import Track from "@/pages/Track";
import Help from "@/pages/Help";
import Chat from "@/pages/Chat";
import SupportChat from "@/pages/SupportChat";
import VehicleDetails from "@/pages/VehicleDetails";
import Checkout from "@/pages/Checkout";
import Nearby from "@/pages/Nearby";
import Notifications from "@/pages/Notifications";
import BookingConfirmation from "@/pages/BookingConfirmation";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import MyRides from "@/pages/MyRides";
import PaymentHistory from "@/pages/PaymentHistory";
import AcceptedRequest from "@/pages/AcceptedRequest";
import Payment from "@/pages/Payment";
import { ChatProvider } from "@/contexts/ChatContext";
import LoadingScreen from "@/components/branding/LoadingScreen";
import { ensureSeed } from "@/lib/appStore";
import { ensureNotifSeed } from "@/lib/notificationsStore";

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
    ensureSeed();
    ensureNotifSeed();
    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Starting Shiftzy Go" />;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={() => userType === "admin" ? <AdminDashboard /> : <Home />} />
      <Route path="/shift-request" component={ShiftRequest} />
      <Route path="/travel" component={Travel} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-rides" component={MyRides} />
      <Route path="/payment-history" component={PaymentHistory} />
      <Route path="/plan" component={Plan} />
      <Route path="/track" component={Track} />
      <Route path="/help" component={Help} />
      <Route path="/chat" component={Chat} />
      <Route path="/support" component={SupportChat} />
      <Route path="/vehicle/:id" component={VehicleDetails} />
      <Route path="/checkout/:vehicleId" component={Checkout} />
      <Route path="/nearby" component={Nearby} />
      <Route path="/request/:id" component={AcceptedRequest} />
      <Route path="/payment/:id" component={Payment} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
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
