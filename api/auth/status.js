// Vercel Serverless Function - Auth Status
import { db } from '../../server/db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Decode token (in production, verify JWT)
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [email] = decoded.split(':');
        
        // Get user from database
        const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (userResult.length === 0) {
          return res.status(200).json({
            success: true,
            isAuthenticated: false,
            user: null
          });
        }

        const user = userResult[0];
        
        res.status(200).json({
          success: true,
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || 'poster',
            createdAt: user.createdAt
          }
        });
      } catch (e) {
        res.status(200).json({
          success: true,
          isAuthenticated: false,
          user: null
        });
      }
    } else {
      res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null
      });
    }
  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}