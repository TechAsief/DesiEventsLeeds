import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, MapPin, Eye, Mail, Phone, ExternalLink, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { getApiUrl, API_BASE_URL } from "@/lib/config";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { Event } from "@shared/schema";

export default function EventDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["/api/events", id],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/events/${id}`), {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Event not found");
        }
        throw new Error("Failed to fetch event");
      }
      return response.json() as Promise<Event>;
    },
    enabled: !!id,
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-events"] });
      setLocation("/my-events");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setLocation(`/events/${id}/edit`);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-xl mb-8" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
              <p className="text-muted-foreground">
                The event you're looking for doesn't exist or may have been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === event.userId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <Card className="overflow-hidden shadow-lg">
          {/* Event Image */}
          <div className="h-96 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
            {event.imageUrl ? (
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover"
                data-testid="img-event"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            )}
            <div className="absolute top-6 right-6 bg-white/95 px-4 py-2 rounded-full text-sm font-semibold text-foreground flex items-center space-x-2">
              <Eye className="h-4 w-4 text-primary" />
              <span data-testid="text-views">{event.viewsCount || 0} views</span>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Event Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                {event.category}
              </Badge>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span data-testid="text-date">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span data-testid="text-time">{formatTime(event.time)}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span data-testid="text-location">{event.locationText}</span>
              </div>
            </div>

            {/* Event Title */}
            <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-title">
              {event.title}
            </h1>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex space-x-3 mb-6">
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  data-testid="button-edit"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  disabled={deleteEventMutation.isPending}
                  data-testid="button-delete"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
                </Button>
              </div>
            )}

            {/* Event Description */}
            <div className="prose max-w-none mb-8">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-description">
                {event.description}
              </p>
            </div>

            {/* Contact Information */}
            <Card className="bg-muted">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                  <Mail className="h-5 w-5 text-primary mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                    <span data-testid="text-email">{event.contactEmail}</span>
                  </div>
                  {event.contactPhone && (
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Phone className="h-5 w-5" />
                      <span data-testid="text-phone">{event.contactPhone}</span>
                    </div>
                  )}
                  {event.bookingLink && (
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <ExternalLink className="h-5 w-5" />
                      <a 
                        href={event.bookingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                        data-testid="link-booking"
                      >
                        Booking Link
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    To book your spot or get more information, please contact the organizer using the details above.
                  </p>
                  <div className="flex gap-3">
                    <a 
                      href={`mailto:${event.contactEmail}`} 
                      className="flex-1"
                      data-testid="link-email"
                    >
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Organizer
                      </Button>
                    </a>
                    {event.contactPhone && (
                      <a 
                        href={`tel:${event.contactPhone}`} 
                        className="flex-1"
                        data-testid="link-phone"
                      >
                        <Button className="w-full bg-secondary hover:bg-secondary/90">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Now
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
