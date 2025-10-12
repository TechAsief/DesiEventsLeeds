import express from 'express';
import { db } from '../db.js';
import { events, insertEventSchema } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const router = express.Router();

// Authentication middleware to check if user is logged in
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }
  next();
};

// POST /events - Create a new event (requires authentication)
router.post('/', requireAuth, async (req, res) => {
  try {
    console.log('🎯 NEW CODE: Event creation endpoint hit!');
    
    // Validate the request body using the insertEventSchema
    const validatedData = insertEventSchema.parse(req.body);

    console.log('🎯 Creating event in database...');
    
    // Insert the new event into the events table with the authenticated user's ID
    const newEvent = await db.insert(events).values({
      ...validatedData,
      userId: req.session.userId!, // User ID from session (guaranteed to exist due to requireAuth middleware)
      approvalStatus: 'pending', // Set approval status to pending
      isActive: true,
    }).returning();

    console.log('🎯 Event created with ID:', newEvent[0].id);

    // Send approval email to admin
    try {
      console.log('📧 Sending approval email...');
      const { emailService } = await import('../emailService.js');
      
      const approveLink = `${req.protocol}://${req.get('host')}/api/events/approve/${newEvent[0].id}`;
      const rejectLink = `${req.protocol}://${req.get('host')}/api/events/reject/${newEvent[0].id}`;
      
      const emailHtml = emailService.generateEventApprovalEmail(newEvent[0], approveLink, rejectLink);
      
      console.log('📧 Sending email to asief1991@gmail.com...');
      const emailSent = await emailService.sendEmail({
        to: 'asief1991@gmail.com',
        subject: `New Event Pending Approval: ${newEvent[0].title}`,
        html: emailHtml,
      });

      if (emailSent) {
        console.log('✅ Event approval email sent successfully!');
      } else {
        console.error('❌ Failed to send event approval email');
      }
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the event creation if email fails
    }

    // Return 201 status code on success
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent[0],
    });

  } catch (error) {
    console.error('Event creation error:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event data',
        errors: (error as any).errors,
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /events/my - Get current user's events (requires authentication)
router.get('/my', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    // Get all events created by the current user
    const userEvents = await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.createdAt));

    res.status(200).json(userEvents);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /events/:id - Get a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json(event[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /events - Get all approved events (public)
router.get('/', async (req, res) => {
  try {
    const { search, filter } = req.query;
    
    let query = db.select().from(events).where(
      and(
        eq(events.approvalStatus, 'approved'),
        eq(events.isActive, true)
      )
    );

    // Add search filter if provided
    // Add date filter if provided
    // This is simplified - you can add more complex filtering

    const allEvents = await query.orderBy(events.date);

    res.status(200).json(allEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// PATCH /events/:id - Update an event (requires authentication)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId!;
    
    // Validate the request body
    const validatedData = insertEventSchema.partial().parse(req.body);

    // Check if event exists and belongs to user
    const existingEvent = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized',
      });
    }

    // Update the event
    const updatedEvent = await db
      .update(events)
      .set({
        ...validatedData,
        approvalStatus: 'pending', // Reset to pending after edit
      })
      .where(eq(events.id, id))
      .returning();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent[0],
    });
  } catch (error) {
    console.error('Error updating event:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event data',
        errors: (error as any).errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// DELETE /events/:id - Delete an event (requires authentication)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId!;
    
    // Check if event exists and belongs to user
    const existingEvent = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized',
      });
    }

    // Delete the event
    await db.delete(events).where(eq(events.id, id));

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;

