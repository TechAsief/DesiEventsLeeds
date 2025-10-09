import 'dotenv/config';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Email of the user to make admin
const USER_EMAIL = process.env.ADMIN_EMAIL || 'asief1991@gmail.com';

async function makeUserAdmin() {
  try {
    console.log('🔍 Looking for user:', USER_EMAIL);
    console.log('📡 Database URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌');

    // Find the user
    const existingUser = await db.select().from(users)
      .where(eq(users.email, USER_EMAIL))
      .limit(1);

    if (existingUser.length === 0) {
      console.log('❌ User not found:', USER_EMAIL);
      console.log('ℹ️  Make sure you have already registered with this email.');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log(`   Current role: ${existingUser[0].role}`);

    if (existingUser[0].role === 'admin') {
      console.log('✅ User already has admin role!');
      process.exit(0);
    }

    // Update the user's role to admin
    console.log('🔄 Updating user role to admin...');
    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, USER_EMAIL));

    console.log('🎉 User role updated successfully!');
    console.log(`   Email: ${USER_EMAIL}`);
    console.log(`   Role: admin`);

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    process.exit(1);
  }
}

// Run the update function
makeUserAdmin()
  .then(() => {
    console.log('✨ Update process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Update process failed:', error);
    process.exit(1);
  });

