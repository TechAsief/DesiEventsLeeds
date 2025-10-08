# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment Tasks

### 1. Code Preparation
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] `.env` file configured correctly
- [ ] Database migrations tested
- [ ] Email functionality tested

### 2. GitHub Setup
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Production ready - initial deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/DesiEventsLeeds.git
git branch -M main
git push -u origin main
```

## Vercel Deployment (Recommended)

### Step 1: Create Neon Database
- [ ] Go to https://neon.tech
- [ ] Create new project (or use existing)
- [ ] Copy connection string
- [ ] Save as `DATABASE_URL`

### Step 2: Setup Gmail App Password
- [ ] Go to https://myaccount.google.com/security
- [ ] Enable 2-Factor Authentication
- [ ] Go to "App passwords"
- [ ] Create new app password
- [ ] Save as `EMAIL_PASS`

### Step 3: Generate Session Secret
```bash
# Run this command and copy the output
openssl rand -hex 32
```
- [ ] Save as `SESSION_SECRET`

### Step 4: Deploy to Vercel
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New Project"
- [ ] Import your repository
- [ ] Configure build settings:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`

### Step 5: Add Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:pass@host/db
ADMIN_EMAIL=asief1991@gmail.com
ADMIN_PASSWORD=DesiEvents@123
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=noreply@desieventsleeds.com
SESSION_SECRET=your-random-32-char-hex-string
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

- [ ] `DATABASE_URL` added
- [ ] `ADMIN_EMAIL` added
- [ ] `ADMIN_PASSWORD` added
- [ ] `EMAIL_USER` added
- [ ] `EMAIL_PASS` added
- [ ] `EMAIL_FROM` added
- [ ] `SESSION_SECRET` added
- [ ] `NODE_ENV` set to `production`
- [ ] `FRONTEND_URL` added (use your Vercel URL)

### Step 6: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Visit your production URL

### Step 7: Setup CI/CD (Optional)

To enable automatic deployments on every push:

1. Get Vercel tokens:
   - [ ] Vercel Dashboard → Settings → Tokens → Create Token
   - [ ] Copy token
   - [ ] Vercel Dashboard → Settings → General → Copy "Project ID"
   - [ ] Copy "Organization ID"

2. Add to GitHub Secrets:
   - [ ] Go to GitHub repo → Settings → Secrets and variables → Actions
   - [ ] Add `VERCEL_TOKEN`
   - [ ] Add `VERCEL_ORG_ID`
   - [ ] Add `VERCEL_PROJECT_ID`

Now every push to `main` will auto-deploy! ✨

## Post-Deployment Testing

### Test Basic Functionality
- [ ] Homepage loads correctly
- [ ] Events are displayed
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works (`/admin`)
- [ ] Event creation works
- [ ] Admin receives approval email
- [ ] Admin dashboard shows pending events
- [ ] Event approval works
- [ ] Event rejection works
- [ ] Event deletion works
- [ ] Mobile responsive design works

### Test Email Workflow
- [ ] Create a test event as a user
- [ ] Check admin email inbox
- [ ] Click "Approve" from email
- [ ] Verify event appears on homepage
- [ ] Try "Reject" with another test event

### Performance Check
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Images load properly
- [ ] Navigation is smooth

## Custom Domain (Optional)

### Add Custom Domain in Vercel
- [ ] Vercel Dashboard → Settings → Domains
- [ ] Add your domain (e.g., `desieventsleeds.com`)
- [ ] Update DNS records (shown by Vercel)
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Update `FRONTEND_URL` in environment variables

## Monitoring & Maintenance

### Setup Monitoring
- [ ] Enable Vercel Analytics (free)
- [ ] Setup error tracking (Sentry - optional)
- [ ] Setup uptime monitoring (UptimeRobot - optional)

### Regular Maintenance
- [ ] Check logs weekly
- [ ] Review pending events daily
- [ ] Update dependencies monthly
- [ ] Backup database weekly
- [ ] Monitor email delivery

## Troubleshooting

### Build Fails
1. Check build logs in Vercel
2. Ensure all dependencies in `package.json`
3. Verify Node.js version (20+)

### Database Connection Error
1. Verify `DATABASE_URL` is correct
2. Check Neon dashboard for status
3. Ensure IP whitelisting allows Vercel

### Email Not Sending
1. Verify Gmail app password (16 chars, no spaces)
2. Check `EMAIL_USER` and `EMAIL_PASS` in Vercel
3. Review server logs in Vercel

### Session Issues
1. Ensure `SESSION_SECRET` is set
2. Check cookie settings
3. Verify `FRONTEND_URL` matches actual URL

## Rollback Plan

If something goes wrong:

### Quick Rollback
- [ ] Vercel Dashboard → Deployments
- [ ] Find last working deployment
- [ ] Click "..." → "Promote to Production"

### Code Rollback
```bash
git revert HEAD
git push
```

## Success Criteria

Deployment is successful when:
- ✅ App is accessible at production URL
- ✅ All features work as in development
- ✅ No console errors
- ✅ Admin can approve events
- ✅ Emails are being sent
- ✅ Database is connected
- ✅ SSL/HTTPS is enabled

---

## 🎉 Congratulations!

Your app is now live! Share the link with your community:

**Production URL**: https://your-app.vercel.app

---

## Next Steps

1. **Share with community**: Post on social media
2. **Gather feedback**: Ask users for improvements
3. **Monitor usage**: Check analytics regularly
4. **Plan updates**: Add new features based on feedback
5. **Scale**: Upgrade plan if needed

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

