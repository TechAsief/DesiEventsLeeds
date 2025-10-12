import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Send, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { getApiUrl, API_BASE_URL } from "@/lib/config";
import { insertEventSchema, type InsertEvent, type Event } from "@shared/schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { z } from "zod";

const formSchema = insertEventSchema.extend({
  contactPhone: z.string().optional(),
  bookingLink: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export default function EventForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  // Fetch existing event if editing
  const { data: existingEvent, isLoading: eventLoading } = useQuery({
    queryKey: ["/api/events", id],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/events/${id}`), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch event");
      return response.json() as Promise<Event>;
    },
    enabled: isEditing && !!id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      time: "",
      locationText: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      bookingLink: "",
      category: "",
      isActive: true,
    },
  });

  // Update form when existing event is loaded
  useEffect(() => {
    if (existingEvent && isEditing) {
      form.reset({
        title: existingEvent.title,
        date: existingEvent.date,
        time: existingEvent.time,
        locationText: existingEvent.locationText,
        description: existingEvent.description,
        contactEmail: existingEvent.contactEmail,
        contactPhone: existingEvent.contactPhone || "",
        bookingLink: existingEvent.bookingLink || "",
        category: existingEvent.category,
        isActive: existingEvent.isActive,
      });
      if (existingEvent.imageUrl) {
        setImageUrl(existingEvent.imageUrl);
      }
    }
  }, [existingEvent, isEditing, form]);

  const createEventMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const method = isEditing ? "PATCH" : "POST";
      const url = isEditing ? `/api/events/${id}` : "/api/events";
      
      // Clean up empty optional fields
      const cleanData = {
        ...data,
        contactPhone: data.contactPhone || undefined,
        bookingLink: data.bookingLink || undefined,
        imageUrl: imageUrl || undefined,
      };
      
      await apiRequest(method, url, cleanData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: isEditing 
          ? "Event updated successfully!" 
          : "Thank you for submitting your event! Your event has been sent for approval and will be reviewed by our team. You can expect a decision within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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
        description: `Failed to ${isEditing ? "update" : "create"} event`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createEventMutation.mutate(data);
  };

  const handleCancel = () => {
    setLocation("/my-events");
  };

  if (isLoading || (isEditing && eventLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Events
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update your event details" : "Share your event with the Leeds community"}
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Event Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Diwali Night Festival 2024" 
                          {...field} 
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Venue/Location */}
                <FormField
                  control={form.control}
                  name="locationText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue/Location in Leeds *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Leeds Town Hall, The Headrow, Leeds" 
                          {...field} 
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormDescription>
                        All events must be located in Leeds
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Festival">Festival</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Networking">Networking</SelectItem>
                          <SelectItem value="Sport">Sport</SelectItem>
                          <SelectItem value="Food">Food & Dining</SelectItem>
                          <SelectItem value="Music">Music & Performance</SelectItem>
                          <SelectItem value="Cultural">Cultural Event</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Event Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Image (Optional)</label>
                  {imageUrl ? (
                    <div className="relative">
                      <img 
                        src={imageUrl} 
                        alt="Event preview" 
                        className="w-full h-48 object-cover rounded-lg"
                        data-testid="img-preview"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setImageUrl(null)}
                        data-testid="button-remove-image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5242880}
                      onGetUploadParameters={async () => {
                        const response = await fetch(getApiUrl('/api/objects/upload'), {
                          method: 'POST',
                          credentials: 'include',
                        });
                        const data = await response.json();
                        return {
                          method: 'PUT' as const,
                          url: data.uploadURL,
                        };
                      }}
                      onComplete={async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                        if (result.successful && result.successful[0]) {
                          const uploadedUrl = result.successful[0].uploadURL;
                          const response = await fetch(getApiUrl('/api/event-images'), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ imageURL: uploadedUrl }),
                          });
                          const data = await response.json();
                          setImageUrl(data.objectPath);
                          toast({
                            title: "Success",
                            description: "Image uploaded successfully",
                          });
                        }
                      }}
                      buttonClassName="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Event Image
                    </ObjectUploader>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload an image for your event (max 5MB, JPG/PNG)
                  </p>
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={8}
                          placeholder="Provide a detailed description of your event, including highlights, activities, and what attendees can expect..." 
                          {...field} 
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 100 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Information */}
                <Card className="bg-muted">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your.email@example.com" 
                              {...field} 
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+44 113 123 4567" 
                              {...field} 
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bookingLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booking/Registration Link (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="url" 
                              placeholder="https://eventbrite.com/your-event" 
                              {...field} 
                              data-testid="input-booking"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormDescription>
                      Attendees will use this information to contact you for bookings and inquiries
                    </FormDescription>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleCancel}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createEventMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-submit"
                  >
                    {createEventMutation.isPending ? (
                      <>
                        <Save className="h-4 w-4 mr-2 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {isEditing ? "Update Event" : "Publish Event"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
