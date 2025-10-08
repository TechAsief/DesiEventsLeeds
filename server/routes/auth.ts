import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db.js';
import { users, events, signupSchema, loginSchema } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

// Extend Express Session interface to include user data
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    userEmail?: string;
    userName?: string;
  }
}

const router = express.Router();

// POST /auth - User sign-up endpoint
router.post('/', async (req, res) => {
  try {
    // Validate the request body using the signupSchema
    const validatedData = signupSchema.parse(req.body);

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Insert the new user into the users table via Drizzle
    const newUser = await db.insert(users).values({
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    }).returning();

    // Return 201 status code on success
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        createdAt: newUser[0].createdAt,
      },
    });

  } catch (error) {
    console.error('Sign-up error:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors,
      });
    }

    // Handle database errors (e.g., duplicate email)
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// POST /auth/login - User login endpoint
router.post('/login', async (req, res) => {
  try {
    // Validate the request body using the loginSchema
    const validatedData = loginSchema.parse(req.body);

    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1);

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const foundUser = user[0];

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(validatedData.password, foundUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Establish user session
    req.session.userId = foundUser.id;
    req.session.userEmail = foundUser.email;
    req.session.userName = `${foundUser.firstName || ''} ${foundUser.lastName || ''}`.trim();

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: `${foundUser.firstName || ''} ${foundUser.lastName || ''}`.trim(),
        createdAt: foundUser.createdAt,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
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

// GET /auth/status - Check if user is authenticated
router.get('/status', (req, res) => {
  if (req.session && req.session.userId) {
    res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
        name: req.session.userName || 'Admin User',
        role: 'admin',
      },
    });
  } else {
    res.status(200).json({
      success: true,
      authenticated: false,
      user: null,
    });
  }
});

// POST /auth/logout - User logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
    
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
});

// GET /auth/public-events - Get all approved and active events (public endpoint)
router.get('/public-events', async (req, res) => {
  try {
    // Query the events table with filters
    const publicEvents = await db.select().from(events)
      .where(
        and(
          eq(events.approvalStatus, 'approved'),
          eq(events.isActive, true)
        )
      )
      .orderBy(events.date);

    // Return the list of events with 200 status code
    res.status(200).json({
      success: true,
      message: 'Public events retrieved successfully',
      events: publicEvents,
      count: publicEvents.length,
    });

  } catch (error) {
    console.error('Public events retrieval error:', error);
    
    // Handle errors
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;