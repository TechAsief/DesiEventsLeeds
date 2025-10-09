import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Security: Only allow this in development or with a secret key
  const setupKey = req.query.key || req.body?.key;
  const expectedKey = process.env.ADMIN_SETUP_KEY || 'CHANGE_ME_IN_PRODUCTION';
  
  if (setupKey !== expectedKey) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid setup key' 
    });
  }

  const email = req.query.email || req.body?.email || 'asief1991@gmail.com';

  try {
    console.log('🔍 Looking for user:', email);

    // Find the user
    const existingUser = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `User not found: ${email}. Please register first.` 
      });
    }

    const currentRole = existingUser[0].role;
    
    if (currentRole === 'admin') {
      return res.status(200).json({ 
        success: true, 
        message: `User ${email} already has admin role!`,
        user: {
          email: existingUser[0].email,
          role: existingUser[0].role
        }
      });
    }

    // Update the user's role to admin
    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email));

    console.log('✅ User role updated to admin');

    return res.status(200).json({ 
      success: true, 
      message: `Successfully updated ${email} to admin role!`,
      user: {
        email: email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update user role',
      error: error.message 
    });
  }
}

