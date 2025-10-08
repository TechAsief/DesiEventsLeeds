import express from 'express';
import { db } from '../db.js';
import { events, insertEventSchema } from '../../shared/schema.js';

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
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event data',
        errors: error.errors,
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;

