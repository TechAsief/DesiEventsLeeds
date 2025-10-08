import express from 'express';
import { db } from '../db.js';
import { events, users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '../middleware/admin.js';
import { count } from 'drizzle-orm';
import { storage } from '../storage';

const router = express.Router();

// Test route to verify admin router is working
router.get('/test', (req, res) => {
  console.log('🔧 Admin test route hit!');
  res.json({ message: 'Admin router is working!', timestamp: new Date().toISOString() });
});

// Admin login route - should be accessible without authentication
router.post('/login', async (req, res) => {
  console.log('🔐 Admin login route hit!', req.body);
  console.log('🔐 Full request details:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  console.log('🔐 About to call validateAdminCredentials...');
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: "Email and password required" });
    }
    
    console.log('✅ Calling validateAdminCredentials...');
    const isValid = await storage.validateAdminCredentials(email, password);
    
    if (!isValid) {
      console.log('❌ Invalid credentials');
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
    
    // Set admin session
    req.session.isAdmin = true;
    
    // Save the session
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.status(500).json({ message: "Failed to save session" });
      }
      console.log('✅ Admin login successful! Session saved.');
      res.json({ message: "Admin logged in successfully" });
    });
  } catch (error) {
    console.error("💥 Error in admin login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin logout route - should be accessible without authentication
router.post('/logout', (req, res) => {
  console.log('🚪 Admin logout called!');
  req.session.isAdmin = false;
  res.json({ message: "Admin logged out successfully" });
});

// Admin status route - should be accessible without authentication
router.get('/status', (req, res) => {
  console.log('🔍 Admin status check:', {
    sessionId: req.sessionID,
    isAdmin: req.session.isAdmin,
    sessionData: req.session
  });
  res.json({ isAdmin: !!req.session.isAdmin });
});

// Apply admin middleware to all other routes in this router
router.use(requireAdmin);

// GET /admin/events - List all events (admin only)
router.get('/events', async (req, res) => {
  try {
    console.log('📋 Fetching all events...');
    // Query events table for all events
    const allEvents = await db.select().from(events)
      .orderBy(events.createdAt);

    console.log('📊 Found events:', allEvents.length, allEvents);

    res.status(200).json({
      success: true,
      message: 'All events retrieved successfully',
      events: allEvents,
      count: allEvents.length,
    });

  } catch (error) {
    console.error('All events retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /admin/pending - List all events where approvalStatus is 'pending'
router.get('/pending', async (req, res) => {
  try {
    // Query events table for pending events
    const pendingEvents = await db.select().from(events)
      .where(eq(events.approvalStatus, 'pending'))
      .orderBy(events.createdAt);

    res.status(200).json({
      success: true,
      message: 'Pending events retrieved successfully',
      events: pendingEvents,
      count: pendingEvents.length,
    });

  } catch (error) {
    console.error('Pending events retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /admin/approve/:id - Change event status from 'pending' to 'approved'
router.post('/approve/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    // Validate event ID format (basic UUID check)
    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    // Check if event exists and is pending
    const existingEvent = await db.select().from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (existingEvent[0].approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Event is not in pending status',
      });
    }

    // Update event status to approved
    const updatedEvent = await db.update(events)
      .set({ 
        approvalStatus: 'approved',
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId))
      .returning();

    res.status(200).json({
      success: true,
      message: 'Event approved successfully',
      event: updatedEvent[0],
    });

  } catch (error) {
    console.error('Event approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /admin/analytics/summary - Fetch summary metrics from database
router.get('/analytics/summary', async (req, res) => {
  try {
    // Get total users count
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get total events count
    const totalEventsResult = await db.select({ count: count() }).from(events);
    const totalEvents = totalEventsResult[0]?.count || 0;

    // Get approved events count
    const approvedEventsResult = await db.select({ count: count() })
      .from(events)
      .where(eq(events.approvalStatus, 'approved'));
    const approvedEvents = approvedEventsResult[0]?.count || 0;

    // Get pending events count
    const pendingEventsResult = await db.select({ count: count() })
      .from(events)
      .where(eq(events.approvalStatus, 'pending'));
    const pendingEvents = pendingEventsResult[0]?.count || 0;

    // Get active events count
    const activeEventsResult = await db.select({ count: count() })
      .from(events)
      .where(eq(events.isActive, true));
    const activeEvents = activeEventsResult[0]?.count || 0;

    res.status(200).json({
      success: true,
      message: 'Analytics summary retrieved successfully',
      analytics: {
        totalUsers,
        totalEvents,
        approvedEvents,
        pendingEvents,
        activeEvents,
        approvalRate: totalEvents > 0 ? ((approvedEvents / totalEvents) * 100).toFixed(2) : '0.00',
      },
    });

  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// DELETE /admin/events/:id - Delete an event (admin only)
router.delete('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    // Validate event ID format (basic UUID check)
    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    // Check if event exists
    const existingEvent = await db.select().from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Delete the event
    await db.delete(events).where(eq(events.id, eventId));

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });

  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;

