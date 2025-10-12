# API Routing Fix - Vercel to Railway

## 🎯 Problems Fixed

### 1. **CORS Issue** 
Railway backend was blocking requests from Vercel frontend

### 2. **API Routing Issue**
Frontend was making requests to Vercel backend instead of Railway backend

### 3. **Login/Auth Redirects**
Auth error redirects were going to Vercel instead of Railway

---

## 🔧 Changes Made

### Backend Changes (`server/index.ts`)
✅ **CORS Configuration Updated:**
- Added regex pattern to allow all Vercel domains: `/https:\/\/.*\.vercel\.app$/`
- This includes your main domain AND all preview deployments
- Added better logging for blocked origins

✅ **Cookie Settings Updated:**
- Set `sameSite: 'none'` in production (required for cross-origin cookies)
- Set `secure: true` in production (required for HTTPS)
- Keeps development settings for local testing

### Frontend Changes (6 Files)
✅ **Updated API calls to use Railway backend:**
- `client/src/pages/home.tsx`
- `client/src/pages/landing.tsx`
- `client/src/pages/event-detail.tsx`
- `client/src/pages/event-form.tsx` (including image upload)
- `client/src/components/ForgotPasswordJS.jsx`
- `client/src/pages/ResetPasswordJS.jsx`

✅ **Fixed login redirects:**
- `client/src/pages/home.tsx`
- `client/src/pages/my-events.tsx`
- `client/src/pages/event-form.tsx`
- `client/src/pages/event-detail.tsx`

All `window.location.href = "/api/login"` now properly redirect to:
`https://desieventsleeds-production.up.railway.app/api/login`

---

## ⏰ Deployment Status

### 🚀 Railway Backend
- **Status:** Deploying now (takes 2-3 minutes)
- **Check:** https://desieventsleeds-production.up.railway.app/health
- Should return: `{"ok": true, "env": "production", "message": "Server is running."}`

### 🌐 Vercel Frontend
- **Status:** Deploying now (takes 2-3 minutes)
- **Check:** Your Vercel dashboard for deployment status

---

## ✅ What to Check After Deployment

### 1. **Verify Railway is Running**
Visit: https://desieventsleeds-production.up.railway.app/health

Should see:
```json
{
  "ok": true,
  "env": "production",
  "message": "Server is running."
}
```

### 2. **Check Railway Environment Variables**
Go to Railway Dashboard → Your Service → Variables

**Required:**
- `NODE_ENV` = `production` ⚠️ **IMPORTANT!**
- `DATABASE_URL` = Your PostgreSQL connection string
- `SESSION_SECRET` = Your secret key

**Optional:**
- `ADMIN_SETUP_KEY` = Your admin setup key

### 3. **Test on Vercel Site**

#### A. **Open DevTools** (F12)
- Go to Network tab
- Refresh page
- Look for API requests
- They should go to `desieventsleeds-production.up.railway.app` ✅
- NOT to your Vercel domain ❌

#### B. **Test Registration**
1. Click "Sign Up"
2. Fill in the form
3. Submit
4. Should create account successfully

#### C. **Test Login**
1. Click "Log In"
2. Use your credentials
3. Should log in successfully
4. Check if you can see your profile

#### D. **Test Admin Login**
1. Use your admin email: `asief1991@gmail.com`
2. Login
3. Click your avatar
4. Should see "Admin Dashboard" option

---

## 🔍 Troubleshooting

### If you still see "unexpected error occurred":

1. **Check Browser Console (F12 → Console tab)**
   - Look for CORS errors
   - Look for 401 Unauthorized errors
   - Screenshot any errors and share them

2. **Check Railway Logs**
   - Go to Railway Dashboard
   - Click on your service
   - Go to "Deployments" → Click latest deployment → "View Logs"
   - Look for error messages
   - Look for the log line: `❌ CORS blocked origin: https://your-vercel-url.vercel.app`

3. **Verify Railway Environment**
   - Make sure `NODE_ENV=production` is set
   - Without this, cookies won't work correctly!

4. **Clear Browser Cache & Cookies**
   - Old cookies might be causing issues
   - Try in Incognito/Private mode

5. **Check Network Requests**
   - F12 → Network tab
   - Try logging in
   - Click on the failed request
   - Check the "Response" tab for error details
   - Check the "Headers" tab to see where it's going

---

## 📝 Common Issues

### Issue: "CORS policy blocked"
**Solution:** Railway needs to redeploy with the new CORS settings (wait 2-3 minutes)

### Issue: Cookies not saving
**Solution:** Make sure `NODE_ENV=production` is set in Railway

### Issue: Still going to Vercel API
**Solution:** Clear browser cache, or Vercel needs to finish redeploying

### Issue: 401 Unauthorized immediately
**Solution:** Try logging out and logging in again, or clear cookies

---

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ You can register a new account
- ✅ You can login successfully
- ✅ You can view events
- ✅ You can create new events
- ✅ Admin users see "Admin Dashboard" in profile menu
- ✅ No CORS errors in browser console
- ✅ All API requests in Network tab go to Railway URL

---

## 📞 Next Steps If Still Not Working

If after waiting for deployments (5 minutes total) you're still having issues:

1. Take a screenshot of:
   - Browser console errors (F12 → Console)
   - Network tab showing failed requests (F12 → Network)
   - Railway logs showing the error

2. Share:
   - What exact error message you see
   - What action you were trying (login/signup/view events)
   - Your Vercel URL
   - Your Railway URL

3. I'll help debug further!

---

**Last Updated:** $(date)
**Railway Backend:** https://desieventsleeds-production.up.railway.app
**Config File:** client/src/lib/config.ts

