import { Switch, Route, useLocation } from "wouter";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
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
import Nearby from "@/pages/Nearby";
import Notifications from "@/pages/Notifications";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import MyRides from "@/pages/MyRides";
import PaymentHistory from "@/pages/PaymentHistory";
import TripPayment from "@/pages/TripPayment";
import { ChatProvider } from "@/contexts/ChatContext";
import LoadingScreen from "@/components/branding/LoadingScreen";
import { useCurrentUser, loginUrlWithReturn } from "@/lib/auth";

// Personal/account-required pages redirect here (preserving where the user
// was headed via ?next=) instead of the old all-or-nothing routing split
// that hid every page behind a login wall. Server-side requireAuth/
// requireAdmin remain the real, final authorization layer regardless of
// what this wrapper does client-side.
function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useCurrentUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(loginUrlWithReturn(location), { replace: true });
    }
  }, [isLoading, isAuthenticated, location, setLocation]);

  if (isLoading) return <LoadingScreen message="Loading" />;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

// Root route: visitors see the Landing/explore experience immediately (no
// forced login); a signed-in customer sees Home; a signed-in admin sees the
// Admin Dashboard. Auth state is the real server session (via /api/user/me),
// not a client-controlled flag.
function RootRoute() {
  const { isLoading, isAuthenticated, isAdmin } = useCurrentUser();
  if (isLoading) return <LoadingScreen message="Starting Shiftzy Go" />;
  if (!isAuthenticated) return <Landing />;
  return isAdmin ? <AdminDashboard /> : <Home />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/login" component={Login} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Browsable without an account — visitor-first exploration. Any
          action inside these pages that actually needs an account (submit,
          pay, save, message) sends the user to /login?next=<path> itself and
          the server's requireAuth remains the real gate either way. */}
      <Route path="/travel" component={Travel} />
      <Route path="/nearby" component={Nearby} />
      <Route path="/vehicle/:id" component={VehicleDetails} />
      <Route path="/shift-request" component={ShiftRequest} />
      <Route path="/help" component={Help} />
      <Route path="/support" component={SupportChat} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />

      {/* Account-required */}
      <Route path="/profile">{() => <RequireAuth><Profile /></RequireAuth>}</Route>
      <Route path="/my-rides">{() => <RequireAuth><MyRides /></RequireAuth>}</Route>
      <Route path="/payment-history">{() => <RequireAuth><PaymentHistory /></RequireAuth>}</Route>
      <Route path="/plan">{() => <RequireAuth><Plan /></RequireAuth>}</Route>
      <Route path="/track">{() => <RequireAuth><Track /></RequireAuth>}</Route>
      <Route path="/chat">{() => <RequireAuth><Chat /></RequireAuth>}</Route>
      <Route path="/trip-payment/:tripId">{() => <RequireAuth><TripPayment /></RequireAuth>}</Route>
      <Route path="/notifications">{() => <RequireAuth><Notifications /></RequireAuth>}</Route>

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
