// Vercel Serverless Function - Auth Status
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

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
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        const db = drizzle(pool, { schema });
        const userResult = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
        
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
        
        await pool.end();
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