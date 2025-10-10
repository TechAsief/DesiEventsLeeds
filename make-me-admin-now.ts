import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.js';
import { users } from './shared/schema.js';
import 'dotenv/config';

// This script connects to your PRODUCTION database and makes you admin
const USER_EMAIL = 'asief1991@gmail.com';

async function makeAdminNow() {
  console.log('🚀 Making you admin in PRODUCTION database...');
  console.log('📧 Email:', USER_EMAIL);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables!');
    process.exit(1);
  }

  console.log('✅ Connected to database');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    // Find the user
    const userResult = await db.select().from(users)
      .where(eq(users.email, USER_EMAIL))
      .limit(1);

    if (userResult.length === 0) {
      console.log('❌ User not found:', USER_EMAIL);
      console.log('💡 Make sure you have registered on your live site first!');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('   Current role:', userResult[0].role);

    if (userResult[0].role === 'admin') {
      console.log('✅ You already have admin role!');
      await pool.end();
      process.exit(0);
    }

    // Update to admin
    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, USER_EMAIL));

    console.log('🎉 SUCCESS! You are now an admin!');
    console.log('📝 Next steps:');
    console.log('   1. Go to your live website');
    console.log('   2. Log out if you\'re logged in');
    console.log('   3. Clear browser cache (Cmd+Shift+R)');
    console.log('   4. Log in again');
    console.log('   5. Click your avatar → see "Admin Dashboard" 🛡️');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

makeAdminNow();

