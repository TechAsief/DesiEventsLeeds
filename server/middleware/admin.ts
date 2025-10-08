import express from 'express';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

// Middleware to check if the authenticated user is an admin
export const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    console.log('🔐 Admin middleware check:', {
      sessionId: req.sessionID,
      userId: req.session.userId,
      isAdmin: req.session.isAdmin,
      sessionData: req.session
    });

    // Check if user has admin session (from admin login)
    if (req.session.isAdmin === true) {
      console.log('✅ Admin session found, proceeding...');
      return next();
    }

    // Fallback: Check if user is authenticated as regular user with admin role
    if (!req.session.userId) {
      console.log('❌ No authentication found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    // Fetch user details from database to check admin status
    const user = await db.select().from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (user.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if user is admin (role should be 'admin')
    if (user[0].role !== 'admin') {
      console.log('❌ User is not admin role:', user[0].role);
      return res.status(403).json({
        success: false,
        message: 'Admin access required. Insufficient permissions.',
      });
    }

    console.log('✅ Regular user with admin role found, proceeding...');
    // User is authenticated and is admin, proceed to next middleware/route
    next();

  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
