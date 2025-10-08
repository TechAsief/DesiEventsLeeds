import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Admin credentials
const ADMIN_EMAIL = 'admin@desievents.com';
const ADMIN_PASSWORD = 'adminpassword123!'; // Strong default password
const ADMIN_FIRST_NAME = 'Admin';
const ADMIN_LAST_NAME = 'User';

async function seedAdminUser() {
  try {
    console.log('🌱 Starting admin user seeding process...');

    // Check if admin user already exists
    console.log('🔍 Checking if admin user already exists...');
    const existingAdmin = await db.select().from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists!');
      console.log(`   Email: ${existingAdmin[0].email}`);
      console.log(`   Role: ${existingAdmin[0].role}`);
      console.log(`   Created: ${existingAdmin[0].createdAt}`);
      return;
    }

    // Hash the password
    console.log('🔐 Hashing admin password...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log('✅ Password hashed successfully');

    // Insert admin user into database
    console.log('💾 Inserting admin user into database...');
    const newAdmin = await db.insert(users).values({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      role: 'admin',
    }).returning();

    console.log('🎉 Admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log(`   ID: ${newAdmin[0].id}`);
    console.log(`   Email: ${newAdmin[0].email}`);
    console.log(`   Name: ${newAdmin[0].firstName} ${newAdmin[0].lastName}`);
    console.log(`   Role: ${newAdmin[0].role}`);
    console.log(`   Created: ${newAdmin[0].createdAt}`);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if ((error as any).code === '23505') { // PostgreSQL unique constraint violation
      console.log('ℹ️  Admin user already exists (duplicate email detected)');
    } else {
      console.error('💥 Unexpected error occurred:', (error as any).message);
    }
    
    process.exit(1);
  }
}

// Run the seeding function
seedAdminUser()
  .then(() => {
    console.log('✨ Seeding process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  });

