import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema.js';

// --- Database Connection Configuration ---
// This connects Drizzle ORM to your Neon database using the secret URL.

// Debug: Log all environment variables
console.log('Environment variables check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('SESSION') || key.includes('NODE')));

if (!process.env.DATABASE_URL) {
throw new Error("DATABASE_URL is missing in environment variables. Server cannot connect to Neon.");
}

// 1. Create a PostgreSQL Connection Pool
const pool = new Pool({
connectionString: process.env.DATABASE_URL,
// Note: 'ssl: true' ensures secure connection to Neon.
ssl: {
rejectUnauthorized: false
}
});

// 2. Initialize Drizzle ORM with the pool and the schema blueprint
export const db = drizzle(pool, { schema });

// The server can now use 'db' to run queries against Neon.