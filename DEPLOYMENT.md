# Deployment Guide - Desi Events Leeds

This guide will help you deploy your application to production using various platforms.

## Table of Contents
1. [Vercel Deployment (Recommended)](#vercel-deployment)
2. [Railway Deployment](#railway-deployment)
3. [DigitalOcean Deployment](#digitalocean-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Environment Variables](#environment-variables)

---

## Vercel Deployment (Recommended)

Vercel is ideal for this full-stack application with automatic CI/CD from GitHub.

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Neon PostgreSQL database (already using it!)

### Step 1: Push Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - ready for production"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/DesiEventsLeeds.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import your `DesiEventsLeeds` repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables (click "Environment Variables"):
   ```
   DATABASE_URL=your_neon_database_url
   ADMIN_EMAIL=asief1991@gmail.com
   ADMIN_PASSWORD=DesiEvents@123
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=noreply@desieventsleeds.com
   SESSION_SECRET=generate_random_string_here
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

6. Click "Deploy"

### Step 3: Get Your Neon Database URL

1. Go to https://neon.tech
2. Navigate to your project
3. Go to "Connection Details"
4. Copy the connection string (it looks like: `postgresql://user:pass@host/dbname`)
5. Add it to Vercel environment variables as `DATABASE_URL`

### Step 4: Setup CI/CD with GitHub Actions

1. Go to Vercel Dashboard → Settings → Tokens
2. Create a new token and copy it
3. Go to your GitHub repository → Settings → Secrets and variables → Actions
4. Add these secrets:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Found in Vercel → Settings → General
   - `VERCEL_PROJECT_ID`: Found in Vercel → Settings → General

Now, every push to `main` will automatically deploy!

---

## Railway Deployment

Railway is great for full-stack apps with built-in PostgreSQL.

### Step 1: Setup Railway

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `DesiEventsLeeds` repository
4. Add PostgreSQL service: Click "New" → "Database" → "PostgreSQL"

### Step 2: Configure Environment Variables

In Railway dashboard, add these variables:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
ADMIN_EMAIL=asief1991@gmail.com
ADMIN_PASSWORD=DesiEvents@123
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@desieventsleeds.com
SESSION_SECRET=generate_random_string_here
NODE_ENV=production
PORT=3000
```

### Step 3: Configure Build Settings

In Railway, set:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

Deploy! Railway will automatically redeploy on every git push.

---

## DigitalOcean Deployment

### Using DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com
2. Click "Apps" → "Create App"
3. Connect your GitHub repository
4. Configure:
   - **Type**: Web Service
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`
   - **HTTP Port**: 3000

5. Add a PostgreSQL database:
   - Click "Add Component" → "Database" → "PostgreSQL"

6. Add environment variables (same as above)

7. Click "Create Resources"

---

## Docker Deployment

For custom hosting (VPS, AWS, etc.)

### Build Docker Image

```bash
# Build the image
docker build -t desi-events-leeds .

# Run locally to test
docker run -p 3000:3000 \
  -e DATABASE_URL=your_db_url \
  -e ADMIN_EMAIL=asief1991@gmail.com \
  -e ADMIN_PASSWORD=DesiEvents@123 \
  -e EMAIL_USER=your_gmail@gmail.com \
  -e EMAIL_PASS=your_app_password \
  -e SESSION_SECRET=your_secret \
  desi-events-leeds
```

### Deploy to Cloud

#### AWS ECS / Fargate
1. Push image to ECR
2. Create ECS cluster
3. Define task with environment variables
4. Create service

#### Google Cloud Run
```bash
gcloud run deploy desi-events-leeds \
  --image gcr.io/YOUR_PROJECT/desi-events-leeds \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `ADMIN_EMAIL` | Admin login email | `asief1991@gmail.com` |
| `ADMIN_PASSWORD` | Admin login password | `DesiEvents@123` |
| `EMAIL_USER` | Gmail for sending emails | `your@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | Email "from" address | `noreply@yourapp.com` |
| `SESSION_SECRET` | Random string for sessions | `openssl rand -hex 32` |
| `NODE_ENV` | Environment | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `FRONTEND_URL` | Frontend URL for CORS | Auto-detected |

### Generate Session Secret

```bash
# On macOS/Linux
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Migration

After deploying, run migrations:

```bash
# If using Vercel, use Vercel CLI
vercel env pull
npm run db:push

# Or connect directly
DATABASE_URL=your_production_db_url npm run db:push
```

---

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Admin login works
- [ ] Email sending works (create a test event)
- [ ] Custom domain configured (if needed)
- [ ] SSL/HTTPS enabled
- [ ] Monitoring setup (optional)

---

## Troubleshooting

### Build Fails
- Check Node.js version (should be 20+)
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows external connections
- Ensure IP is whitelisted (for Neon, all IPs allowed by default)

### Email Not Sending
- Verify Gmail app password (not regular password)
- Check Gmail security settings
- Review server logs for detailed error messages

### Session Issues
- Ensure `SESSION_SECRET` is set
- Check cookie settings for production domain
- Verify CORS configuration

---

## Monitoring & Logs

### Vercel
- View logs in Vercel Dashboard → Deployments → Logs
- Real-time logs: `vercel logs --follow`

### Railway
- Built-in logs in dashboard
- `railway logs` CLI command

### Docker
```bash
docker logs -f container_name
```

---

## Scaling

### Vercel
- Automatic scaling included
- Upgrade plan for higher limits

### Railway
- Auto-scaling based on load
- Adjust resources in dashboard

### DigitalOcean
- Manual scaling through dashboard
- Add more containers as needed

---

## Support

For issues or questions:
- Check logs first
- Review environment variables
- Ensure database is accessible
- Check GitHub Issues for similar problems

**Good luck with your deployment! 🚀**

