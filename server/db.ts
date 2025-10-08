import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema.js';
import 'dotenv/config';

// --- Database Connection Configuration ---
// This connects Drizzle ORM to your Neon database using the secret URL.

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