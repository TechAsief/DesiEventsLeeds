// Vercel Serverless Function - Reset Password
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as schema from '../shared/schema.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { email, newPassword, resetKey } = req.query;

  // Simple security check
  if (resetKey !== 'RESET_ME_NOW_2024') {
    return res.status(403).json({
      success: false,
      message: 'Invalid reset key'
    });
  }

  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email and newPassword are required'
    });
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const db = drizzle(pool, { schema });

    // Find user
    const userResult = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

    if (userResult.length === 0) {
      await pool.end();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.email, email));

    await pool.end();

    res.status(200).json({
      success: true,
      message: `Password updated successfully for ${email}`,
      newPassword: newPassword
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
}
