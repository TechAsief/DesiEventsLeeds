import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { insertEventSchema, insertAnalyticsSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Object storage routes for image uploads
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: (req.user as any)?.id,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put("/api/event-images", isAuthenticated, async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = (req.user as any).id;

    try {
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(req.body.imageURL);
      
      if (!normalizedPath.startsWith("/")) {
        return res.status(400).json({ error: "Invalid image URL" });
      }

      const objectFile = await objectStorageService.getObjectEntityFile(normalizedPath);
      const existingAcl = await import("./objectAcl").then(m => m.getObjectAclPolicy(objectFile));
      
      if (existingAcl && existingAcl.owner !== userId) {
        return res.status(403).json({ error: "You are not authorized to modify this image" });
      }

      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting event image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Analytics logging middleware for all requests
  app.use(async (req, res, next) => {
    // Log home page visits
    if (req.path === '/' && req.method === 'GET') {
      try {
        await storage.logAnalytics({
          eventType: 'home_visit',
          userId: (req.user as any)?.id || null,
          eventId: null,
          metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
        });
      } catch (error) {
        console.error('Analytics logging error:', error);
      }
    }
    next();
  });

  // Public event routes
  app.get('/api/events', async (req, res) => {
    try {
      const { search, filter } = req.query;
      
      let events;
      if (search && typeof search === 'string') {
        events = await storage.searchEvents(search);
      } else if (filter && typeof filter === 'string') {
        events = await storage.filterEventsByDate(filter);
      } else {
        events = await storage.getAllEvents();
      }
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Increment view count and log analytics
      await storage.incrementEventViews(id);
      await storage.logAnalytics({
        eventType: 'event_view',
        userId: (req.user as any)?.id || null,
        eventId: id,
        metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
      });
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Protected event routes
  app.get('/api/my-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const events = await storage.getEventsByUser(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const eventData = insertEventSchema.parse(req.body);
      
      const event = await storage.createEvent({ 
        ...eventData, 
        userId,
        approvalStatus: 'pending',
        isActive: true
      } as any);
      
      // Log analytics
      await storage.logAnalytics({
        eventType: 'event_post',
        userId,
        eventId: event.id,
        metadata: { category: event.category }
      });
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const eventData = insertEventSchema.partial().parse(req.body);
      
      const event = await storage.updateEvent(id, userId, {
        ...eventData,
        approvalStatus: 'pending',
      } as any);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found or unauthorized" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const success = await storage.deleteEvent(id, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found or unauthorized" });
      }
      
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Admin routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      const isValid = await storage.validateAdminCredentials(email, password);
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      // Set admin session
      req.session.isAdmin = true;
      res.json({ message: "Admin logged in successfully" });
    } catch (error) {
      console.error("Error in admin login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/admin/analytics', async (req, res) => {
    try {
      if (!req.session.isAdmin) {
        return res.status(401).json({ message: "Admin access required" });
      }
      
      const [
        totalPosters,
        totalEvents,
        uniqueLogins,
        eventCTR,
        recentActivity
      ] = await Promise.all([
        storage.getTotalEventPosters(),
        storage.getTotalEvents(),
        storage.getUniqueLoginsLast7Days(),
        storage.getEventCTR(),
        storage.getRecentActivity()
      ]);
      
      res.json({
        totalPosters,
        totalEvents,
        uniqueLogins,
        eventCTR: Math.round(eventCTR * 100) / 100, // Round to 2 decimal places
        recentActivity
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    req.session.isAdmin = false;
    res.json({ message: "Admin logged out successfully" });
  });

  app.get('/api/admin/pending-events', async (req, res) => {
    try {
      if (!req.session.isAdmin) {
        return res.status(401).json({ message: "Admin access required" });
      }
      
      const events = await storage.getPendingEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching pending events:", error);
      res.status(500).json({ message: "Failed to fetch pending events" });
    }
  });

  app.post('/api/admin/approve-event/:id', async (req, res) => {
    try {
      if (!req.session.isAdmin) {
        return res.status(401).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const event = await storage.approveEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error approving event:", error);
      res.status(500).json({ message: "Failed to approve event" });
    }
  });

  app.post('/api/admin/reject-event/:id', async (req, res) => {
    try {
      if (!req.session.isAdmin) {
        return res.status(401).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const event = await storage.rejectEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error rejecting event:", error);
      res.status(500).json({ message: "Failed to reject event" });
    }
  });

  // Analytics logging route
  app.post('/api/analytics', async (req, res) => {
    try {
      const analyticsData = insertAnalyticsSchema.parse(req.body);
      await storage.logAnalytics(analyticsData);
      res.json({ message: "Analytics logged successfully" });
    } catch (error) {
      console.error("Error logging analytics:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid analytics data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to log analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
