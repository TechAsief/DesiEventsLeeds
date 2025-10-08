import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import EventDetail from "@/pages/event-detail";
import MyEvents from "@/pages/my-events";
import EventForm from "@/pages/event-form";
import AdminDashboard from "@/pages/admin-dashboard";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import ResetPassword from "@/pages/reset-password";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Conditional routes based on auth */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/my-events" component={MyEvents} />
          <Route path="/events/new" component={EventForm} />
          <Route path="/events/:id/edit" component={EventForm} />
        </>
      )}
      
      {/* Event detail route - must come after /events/new to avoid matching "new" as an ID */}
      <Route path="/events/:id" component={EventDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
