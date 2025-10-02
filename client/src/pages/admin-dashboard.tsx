import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Users, Calendar, TrendingUp, MousePointer, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { AnalyticsData } from "@/types";

interface AdminLoginForm {
  email: string;
  password: string;
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdminLoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginForm) => {
      await apiRequest("POST", "/api/admin/login", data);
    },
    onSuccess: () => {
      setIsLoggedIn(true);
      toast({
        title: "Success",
        description: "Admin logged in successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      setIsLoggedIn(false);
      toast({
        title: "Success",
        description: "Admin logged out successfully",
      });
    },
  });

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
    enabled: isLoggedIn,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const onSubmit = (data: AdminLoginForm) => {
    loginMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "event_post":
        return "bg-primary/20 text-primary";
      case "login":
        return "bg-secondary/20 text-secondary";
      case "event_view":
        return "bg-accent/20 text-accent";
      case "registration":
        return "bg-secondary/20 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="max-w-md mx-auto px-4 py-24">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="admin@example.com" 
                            {...field} 
                            data-testid="input-admin-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            data-testid="input-admin-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                    data-testid="button-admin-login"
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform analytics and insights</p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline"
            data-testid="button-admin-logout"
          >
            Logout
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-12 bg-muted rounded mb-4" />
                  <div className="h-8 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="transition-transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">All Time</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1" data-testid="text-total-posters">
                    {analytics?.totalPosters || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Event Posters</p>
                  <div className="mt-4 flex items-center text-sm text-secondary">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>Growing community</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-secondary" />
                    </div>
                    <span className="text-xs text-muted-foreground">All Time</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1" data-testid="text-total-events">
                    {analytics?.totalEvents || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Events Posted</p>
                  <div className="mt-4 flex items-center text-sm text-secondary">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>Active platform</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <span className="text-xs text-muted-foreground">Past 7 Days</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1" data-testid="text-unique-logins">
                    {analytics?.uniqueLogins || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Unique Daily Logins</p>
                  <div className="mt-4 flex items-center text-sm text-secondary">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>User engagement</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MousePointer className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Average</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1" data-testid="text-event-ctr">
                    {analytics?.eventCTR?.toFixed(1) || 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Event Click-Through Rate</p>
                  <div className="mt-4 flex items-center text-sm text-secondary">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>Good engagement</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.recentActivity?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Timestamp</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Event Type</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">User</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {analytics?.recentActivity?.map((activity) => (
                          <tr key={activity.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={getEventTypeColor(activity.eventType)}>
                                {activity.eventType.replace("_", " ").toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {activity.userEmail || "Anonymous"}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {activity.eventTitle ? `"${activity.eventTitle}"` : "General activity"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
