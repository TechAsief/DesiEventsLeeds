import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, MapPin, Users, Eye } from "lucide-react";
import Navbar from "@/components/navbar";
import SearchFilters from "@/components/search-filters";
import EventCard from "@/components/event-card";
import Footer from "@/components/footer";
import type { Event } from "@shared/schema";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events", searchQuery, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (dateFilter) params.append("filter", dateFilter);
      
      const response = await fetch(`/api/events?${params}`);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary to-secondary overflow-hidden">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Leeds' Vibrant Indian Community Events
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            From Diwali celebrations to Bhangra workshops, find and share cultural events happening in your city.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-xl shadow-lg p-2 flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground ml-3" />
              <Input
                type="text"
                placeholder="Search for events by title..."
                className="flex-1 border-0 focus-visible:ring-0 bg-transparent"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                data-testid="search-input"
              />
              <Button className="bg-primary hover:bg-primary/90" data-testid="search-button">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Event Listing */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchFilters 
            onDateFilter={handleDateFilter}
            activeFilter={dateFilter}
          />

          {/* Event Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-6 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
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
