# Vercel Deployment Setup

## ✅ Configuration Complete!

Your app is now configured to deploy **both frontend and backend** on Vercel!

## 📋 Steps to Deploy:

### 1. Set Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

**Required:**
```
DATABASE_URL = postgresql://neondb_owner:npg_03huswKprzFZ@ep-quiet-meadow-agic1qhk.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

SESSION_SECRET = your-random-secret-key-here
```

**Optional (for admin setup):**
```
ADMIN_SETUP_KEY = your-secret-admin-key
```

💡 **Tip:** Generate a random SESSION_SECRET using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Deploy

Just push to GitHub - Vercel will auto-deploy:
```bash
git push origin main
```

Or manually deploy from Vercel dashboard: **Deployments** → **Deploy**

### 3. Make Yourself Admin

After deployment, visit:
```
https://your-vercel-url.vercel.app/api/setup-admin?email=asief1991@gmail.com&key=your-secret-admin-key
```

(Replace `your-vercel-url` with your actual Vercel URL)

You should see:
```json
{
  "success": true,
  "message": "Successfully updated asief1991@gmail.com to admin role!"
}
```

### 4. Log Out and Log In

- Go back to your site
- Log out
- Log in again
- Click your avatar → See **"Admin Dashboard"** 🛡️

---

## 🔍 Verify Backend is Running

Check: `https://your-vercel-url.vercel.app/api/health`

Should return:
```json
{
  "status": "ok",
  "message": "Backend API is running on Vercel"
}
```

---

## 🎉 Done!

Your full-stack app (frontend + backend) is now deployed on Vercel!

