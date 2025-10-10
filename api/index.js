// Vercel Serverless Function - Main API Handler
// This wraps your Express app to work with Vercel's serverless architecture

import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import cors from 'cors';
import authRouter from '../server/routes/auth.js';
import eventsRouter from '../server/routes/events.js';
import adminRouter from '../server/routes/admin.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for Vercel
app.use(cors({
  origin: true,
  credentials: true
}));

// Session configuration for Vercel (using MemoryStore)
const SessionStore = MemoryStore(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000, // 24 hours
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend API is running on Vercel',
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
export default app;

