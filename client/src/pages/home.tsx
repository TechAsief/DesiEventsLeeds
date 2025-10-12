import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl, API_BASE_URL } from "@/lib/config";
import Navbar from "@/components/navbar";
import SearchFilters from "@/components/search-filters";
import EventCard from "@/components/event-card";
import Footer from "@/components/footer";
import type { Event } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = `${API_BASE_URL}/api/login`;
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events", searchQuery, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (dateFilter) params.append("filter", dateFilter);
      
      const response = await fetch(getApiUrl(`/api/events?${params}`), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json() as Promise<Event[]>;
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDateFilter = (filter: string) => {
    setDateFilter(filter);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Welcome Section */}
      <section className="py-8 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back to Desi Events Leeds!
          </h1>
          <p className="text-muted-foreground">
            Discover upcoming events in your community
          </p>
        </div>
      </section>

      {/* Filters & Event Listing */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchFilters 
            onDateFilter={handleDateFilter}
            onSearch={handleSearch}
            activeFilter={dateFilter}
            searchQuery={searchQuery}
          />

          {/* Event Grid */}
          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-card rounded-xl border border-border">
                  <div className="h-48 bg-muted rounded-t-xl" />
                  <div className="p-6">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-6 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {searchQuery || dateFilter
                  ? "Try adjusting your search or filter criteria"
                  : "Be the first to post an event in the community!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
