import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated } from "./localAuth.js";
import { insertEventSchema, insertAnalyticsSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage.js";
import { ObjectPermission } from "./objectAcl.js";
import "./types.js";

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
          userId: (req as any).user?.id || null,
          eventId: null,
          metadata: { ip: req.ip || '', userAgent: req.get('User-Agent') || '' }
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
        userId: (req as any).user?.id || null,
        eventId: id,
        metadata: { ip: req.ip || '', userAgent: req.get('User-Agent') || '' }
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
      console.log('🎯 NEW CODE: Event creation endpoint hit!');
      const userId = req.user.id;
      const eventData = insertEventSchema.parse(req.body);
      
      console.log('🎯 Creating event in database...');
      const event = await storage.createEvent({ 
        ...eventData, 
        userId,
        approvalStatus: 'pending',
        isActive: true
      } as any);
      console.log('🎯 Event created with ID:', event.id);
      
      // Log analytics
      await storage.logAnalytics({
        eventType: 'event_post',
        userId,
        eventId: event.id,
        metadata: { category: event.category }
      });

      // Create approval tokens and send notification email
      try {
        console.log('📧 Creating approval tokens for event:', event.id);
        const { approveToken, rejectToken } = await storage.createEventApprovalTokens(event.id);
        console.log('📧 Approval tokens created:', { approveToken: approveToken.substring(0, 10) + '...', rejectToken: rejectToken.substring(0, 10) + '...' });
        
        // Generate approval links
        const approveLink = `${req.protocol}://${req.get('host')}/api/events/approve-email/${approveToken}`;
        const rejectLink = `${req.protocol}://${req.get('host')}/api/events/reject-email/${rejectToken}`;
        console.log('📧 Approval links generated:', { approveLink, rejectLink });

        // Send notification email to admin
        console.log('📧 Importing email service...');
        const { emailService } = await import('./emailService.js');
        console.log('📧 Email service imported successfully');
        
        console.log('📧 Generating email HTML...');
        const emailHtml = emailService.generateEventApprovalEmail(event, approveLink, rejectLink);
        console.log('📧 Email HTML generated, length:', emailHtml.length);

        console.log('📧 Sending email to asief1991@gmail.com...');
        const emailSent = await emailService.sendEmail({
          to: 'asief1991@gmail.com',
          subject: `New Event Pending Approval: ${event.title}`,
          html: emailHtml,
        });

        if (emailSent) {
          console.log('✅ Event approval email sent successfully!');
        } else {
          console.error('❌ Failed to send event approval email for event:', event.id);
        }
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
        // Don't fail the event creation if email fails
      }
      
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

  // Admin routes are now handled by the admin router

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

  // Password reset routes
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security, don't reveal if email exists or not
        return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
      }

      // Create password reset token
      const { token, expiresAt } = await storage.createPasswordResetToken(user.id);

      // Generate reset link
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;

      // Send email
      const { emailService } = await import('./emailService');
      const emailHtml = emailService.generatePasswordResetEmail(
        user.firstName || 'User',
        resetLink
      );

      const emailSent = await emailService.sendEmail({
        to: user.email,
        subject: 'Password Reset - Desi Events Leeds',
        html: emailHtml,
      });

      if (!emailSent) {
        console.error('Failed to send password reset email to:', user.email);
        return res.status(500).json({ message: "Failed to send reset email. Please try again." });
      }

      res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Get and validate token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Update user password
      await storage.updateUserPassword(resetToken.userId, password);

      // Mark token as used
      await storage.markPasswordResetTokenUsed(token);

      // Get user for email notification
      const user = await storage.getUser(resetToken.userId);
      if (user) {
        // Send success email
        const { emailService } = await import('./emailService.js');
        const emailHtml = emailService.generatePasswordResetSuccessEmail(
          user.firstName || 'User'
        );

        await emailService.sendEmail({
          to: user.email,
          subject: 'Password Reset Successful - Desi Events Leeds',
          html: emailHtml,
        });
      }

      res.json({ message: "Password has been reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Error in reset password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Email-based event approval routes
  app.post('/api/events/approve-email/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Approval token is required" });
      }

      // Get and validate token
      const approvalToken = await storage.getEventApprovalToken(token);
      if (!approvalToken) {
        return res.status(400).json({ message: "Invalid or expired approval token" });
      }

      if (approvalToken.action !== 'approve') {
        return res.status(400).json({ message: "Invalid token action" });
      }

      // Approve the event
      const event = await storage.approveEvent(approvalToken.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Mark token as used
      await storage.markEventApprovalTokenUsed(token);

      // Send success email to event creator
      const user = await storage.getUser(event.userId);
      if (user) {
        const { emailService } = await import('./emailService.js');
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Event Approved - Desi Events Leeds</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Desi Events Leeds</h1>
                <p>Community • Culture • Connection</p>
              </div>
              <div class="content">
                <h2>🎉 Your Event Has Been Approved!</h2>
                <p>Hello ${user.firstName || 'Valued Member'},</p>
                <p>Great news! Your event "<strong>${event.title}</strong>" has been approved and is now live on our platform.</p>
                <p>Your event will be visible to the community and they can now view the details and contact you for more information.</p>
                <p>Thank you for contributing to the Desi Events Leeds community!</p>
                <p>Best regards,<br>The Desi Events Leeds Team</p>
              </div>
              <div class="footer">
                <p>© 2024 Desi Events Leeds. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await emailService.sendEmail({
          to: user.email,
          subject: 'Event Approved - Desi Events Leeds',
          html: emailHtml,
        });
      }

      res.json({ message: "Event approved successfully via email" });
    } catch (error) {
      console.error("Error in email approval:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/events/reject-email/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Rejection token is required" });
      }

      // Get and validate token
      const approvalToken = await storage.getEventApprovalToken(token);
      if (!approvalToken) {
        return res.status(400).json({ message: "Invalid or expired rejection token" });
      }

      if (approvalToken.action !== 'reject') {
        return res.status(400).json({ message: "Invalid token action" });
      }

      // Reject the event
      const event = await storage.rejectEvent(approvalToken.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Mark token as used
      await storage.markEventApprovalTokenUsed(token);

      // Send rejection email to event creator
      const user = await storage.getUser(event.userId);
      if (user) {
        const { emailService } = await import('./emailService.js');
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Event Not Approved - Desi Events Leeds</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Desi Events Leeds</h1>
                <p>Community • Culture • Connection</p>
              </div>
              <div class="content">
                <h2>Event Not Approved</h2>
                <p>Hello ${user.firstName || 'Valued Member'},</p>
                <p>We're sorry to inform you that your event "<strong>${event.title}</strong>" was not approved for publication on our platform.</p>
                <p>This could be due to various reasons such as content policy, incomplete information, or not meeting our community guidelines.</p>
                <p>You're welcome to submit a new event that better aligns with our platform standards. If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>The Desi Events Leeds Team</p>
              </div>
              <div class="footer">
                <p>© 2024 Desi Events Leeds. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await emailService.sendEmail({
          to: user.email,
          subject: 'Event Not Approved - Desi Events Leeds',
          html: emailHtml,
        });
      }

      res.json({ message: "Event rejected successfully via email" });
    } catch (error) {
      console.error("Error in email rejection:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
