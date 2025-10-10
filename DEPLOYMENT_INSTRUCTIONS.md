# Deployment Instructions

## Current Setup Issue

Your app has:
- ✅ **Frontend**: Static React app (can be on Vercel)
- ❌ **Backend**: Express server (needs Railway or similar)

Currently, only the frontend is deployed. The backend API needs to be deployed separately.

## Recommended Deployment: Railway

### Step 1: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app/)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `DesiEventsLeeds` repository
5. Railway will auto-detect the configuration from `railway.json`

### Step 2: Set Environment Variables on Railway

In Railway dashboard → Variables, add:
```
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_random_secret_key
NODE_ENV=production
ADMIN_SETUP_KEY=your_secret_key_for_admin_setup
```

### Step 3: Deploy

Railway will automatically deploy. You'll get a URL like:
```
https://desieventsleeds.up.railway.app
```

### Step 4: Make Yourself Admin

1. Register on your Railway backend URL
2. Visit: `https://your-railway-url.railway.app/api/setup-admin?email=asief1991@gmail.com&key=your_secret_key`
3. You should see success message

### Step 5: Update Frontend to Point to Backend

Update your frontend (on Vercel) to use the Railway backend URL for API calls.

---

## Alternative: Use Railway for Everything

You can deploy BOTH frontend and backend on Railway:
- Railway will serve the built frontend from `dist/public`
- AND run the Express backend
- Simpler setup, everything in one place

