import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Profile from "@/pages/profile";
import Inbox from "@/pages/inbox";
import Admin from "@/pages/admin";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        // Show loading state
        <Route path="*" component={() => <div>Loading...</div>} />
      ) : isAuthenticated ? (
        // Authenticated routes
        <>
          <Route path="/" component={Home} />
          <Route path="/search" component={Search} />
          <Route path="/profile" component={Profile} />
          <Route path="/inbox" component={Inbox} />
          <Route path="/admin" component={Admin} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      ) : (
        // Public routes
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      )}
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
