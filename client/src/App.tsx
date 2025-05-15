import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ShiftRequest from "@/pages/ShiftRequest";
import Travel from "@/pages/Travel";
import Profile from "@/pages/Profile";
import Plan from "@/pages/Plan";
import Track from "@/pages/Track";
import Help from "@/pages/Help";
import Chat from "@/pages/Chat";
import VehicleDetails from "@/pages/VehicleDetails";
import { ChatProvider } from "@/contexts/ChatContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shift-request" component={ShiftRequest} />
      <Route path="/travel" component={Travel} />
      <Route path="/profile" component={Profile} />
      <Route path="/plan" component={Plan} />
      <Route path="/track" component={Track} />
      <Route path="/help" component={Help} />
      <Route path="/chat" component={Chat} />
      <Route path="/vehicle/:id" component={VehicleDetails} />
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
