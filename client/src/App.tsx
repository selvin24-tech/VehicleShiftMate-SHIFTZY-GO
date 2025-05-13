import { Switch, Route } from "wouter";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
