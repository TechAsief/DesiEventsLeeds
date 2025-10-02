import { useLocation } from "wouter";
import { Calendar, User, LogOut, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Navbar() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
  });

  const handleLogin = () => {
    setLocation("/login");
  };

  const handleSignup = () => {
    setLocation("/signup");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handlePostEvent = () => {
    if (isAuthenticated) {
      setLocation("/events/new");
    } else {
      setLocation("/signup");
    }
  };

  const handleMyEvents = () => {
    setLocation("/my-events");
  };

  const handleHome = () => {
    setLocation("/");
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={handleHome}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            data-testid="button-home"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Desi Events Leeds</h1>
              <p className="text-xs text-muted-foreground">Community • Culture • Connection</p>
            </div>
          </button>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={handleHome}
              className="text-foreground hover:text-primary transition-colors font-medium"
              data-testid="link-events"
            >
              Events
            </button>
            <a 
              href="#about" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </a>
            <a 
              href="#contact" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
            ) : isAuthenticated && user ? (
              <>
                <Button
                  onClick={handlePostEvent}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-post-event"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Event
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
                        <AvatarFallback>
                          {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
                        <AvatarFallback>
                          {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleMyEvents} data-testid="menu-my-events">
                      <User className="mr-2 h-4 w-4" />
                      My Events
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={handleLogin}
                  data-testid="button-login"
                >
                  Log In
                </Button>
                <Button
                  onClick={handleSignup}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-signup"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
