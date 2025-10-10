import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import helmet from 'helmet';
import cors from 'cors';
import authRouter from './routes/auth.js';
import eventsRouter from './routes/events.js';
import adminRouter from './routes/admin.js';

// --- STANDARD SETUP & CONFIGURATION ---

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Security Middleware (Helmet sets secure HTTP headers)
app.use(helmet());

// CORS Configuration (Allows frontend to talk to this server)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

// Body Parsing (Allows reading JSON data from the frontend)
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`, {
    body: req.body,
    headers: req.headers['content-type'],
    origin: req.headers.origin,
    cookie: req.headers.cookie ? 'present' : 'missing'
  });
  next();
});

// Session Middleware
const sessionStore = new (MemoryStore(session))({
  checkPeriod: 86400000, // prune expired entries every 24h
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'a9f2e8d1c7b4a6f3e9d2c8b5a7f4e0d3c9b6a8f5e2d4c0b7a9f6e3d5c1b8a4f7e0d3c6a9b2e5f8c1d4a7e0b3f6c9d2a5e8b1c4f7',
    resave: false,
    saveUninitialized: true,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    },
  }),
);

// Register auth routes
app.use('/api/auth', authRouter);

// Register events routes
app.use('/api/events', eventsRouter);

// Register admin routes
app.use('/api/admin', adminRouter);

// --- TEMPORARY ROUTES FOR TESTING ---

// Healthcheck: Confirms the API server is alive
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: NODE_ENV, message: "Server is running." });
});

app.get('/', (_req, res) => {
  res.send('Desi Events Leeds API is operational.');
});

// --- SERVER STARTUP ---

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`\n🎉 Server successfully listening on http://localhost:${PORT}`);
  console.log(`   (Environment: ${NODE_ENV})`);
});