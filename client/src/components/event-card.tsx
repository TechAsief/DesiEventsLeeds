import { useLocation } from "wouter";
import { Calendar, Clock, MapPin, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/events/${event.id}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'festival':
        return 'bg-primary/20 text-primary';
      case 'workshop':
        return 'bg-secondary/20 text-secondary';
      case 'networking':
        return 'bg-accent/20 text-accent';
      case 'sport':
        return 'bg-green-100 text-green-800';
      case 'food':
        return 'bg-orange-100 text-orange-800';
      case 'music':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border border-border overflow-hidden"
      onClick={handleClick}
      data-testid={`card-event-${event.id}`}
    >
      {/* Event Image */}
      <div className="h-48 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 right-4 bg-white/95 px-3 py-1 rounded-full text-xs font-semibold text-foreground flex items-center space-x-1">
          <Eye className="h-3 w-3 text-primary" />
          <span data-testid={`text-views-${event.id}`}>{event.viewsCount || 0}</span>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Category and Date */}
        <div className="flex items-start justify-between mb-3">
          <Badge 
            variant="secondary" 
            className={getCategoryColor(event.category)}
            data-testid={`badge-category-${event.id}`}
          >
            {event.category}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span data-testid={`text-date-${event.id}`}>{formatDate(event.date)}</span>
          </span>
        </div>

        {/* Event Title */}
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2" data-testid={`text-title-${event.id}`}>
          {event.title}
        </h3>

        {/* Event Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid={`text-description-${event.id}`}>
          {event.description}
        </p>

        {/* Location and Time */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate" data-testid={`text-location-${event.id}`}>
              {event.locationText}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
            <span data-testid={`text-time-${event.id}`}>{formatTime(event.time)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
