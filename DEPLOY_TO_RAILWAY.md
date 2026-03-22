# SimpletonApp — Railway Deployment Guide

## Step 1: Create a Railway Account
Go to https://railway.app and sign up with your GitHub account.

## Step 2: Push Code to GitHub
If you don't already have a GitHub repo for SimpletonApp:

```bash
cd your-project-folder
git init
git add .
git commit -m "Initial commit - SimpletonApp cleaned for Railway"
git remote add origin https://github.com/YOUR_USERNAME/simpletonapp.git
git branch -M main
git push -u origin main
```

## Step 3: Create Railway Project
1. Click **"New Project"** on your Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Select your `simpletonapp` repository
4. Railway will auto-detect Node.js and start building

## Step 4: Add PostgreSQL Database
1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates the database and auto-injects `DATABASE_URL` into your app

## Step 5: Set Environment Variables
In your Railway project, go to your web service → **Variables** tab.
Add these one at a time (copy/paste from your current Replit secrets):

### REQUIRED (app won't start without these):
```
NODE_ENV=production
SESSION_SECRET=<your-secret-min-32-chars>
JWT_SECRET=<your-secret-min-32-chars>
APP_DOMAIN=https://your-railway-domain.up.railway.app
ALLOWED_ORIGINS=https://your-railway-domain.up.railway.app
```

### REQUIRED for core features:
```
OPENAI_API_KEY=<from Replit secrets>
ANTHROPIC_API_KEY=<from Replit secrets>
STRIPE_SECRET_KEY=<from Replit secrets>
STRIPE_PUBLISHABLE_KEY=<from Replit secrets>
STRIPE_WEBHOOK_SECRET=<from Replit secrets>
SENDGRID_API_KEY=<from Replit secrets>
```

### REQUIRED for social login:
```
GOOGLE_CLIENT_ID=<from Replit secrets>
GOOGLE_CLIENT_SECRET=<from Replit secrets>
FACEBOOK_APP_ID=<from Replit secrets>
FACEBOOK_APP_SECRET=<from Replit secrets>
GITHUB_CLIENT_ID=<from Replit secrets>
GITHUB_CLIENT_SECRET=<from Replit secrets>
TWITTER_CONSUMER_KEY=<from Replit secrets>
TWITTER_CONSUMER_SECRET=<from Replit secrets>
```

### REQUIRED for Gmail integration:
```
GMAIL_REFRESH_TOKEN=<from Replit secrets>
GMAIL_REDIRECT_URI=https://your-domain/api/gmail/callback
```

### REQUIRED for admin panel:
```
GHOST_ADMIN_KEY=<choose-a-strong-secret>
```

### OPTIONAL (features degrade gracefully without these):
```
NEWS_API_KEY=<if you have one>
GOOGLE_PLACES_API_KEY=<if you have one>
ALPHA_VANTAGE_API_KEY=<if you have one>
FRED_API_KEY=<if you have one>
SMTP_USER=<your email for SMTP>
SMTP_PASS=<your email app password>
OWNER_SECRET_KEY=<for admin security>
ADMIN_SESSION_SECRET=<for admin sessions>
```

## Step 6: Deploy
Railway will automatically build and deploy when you push to main.
The build command is: `npm install && npm run build`
The start command is: `npm run start`

## Step 7: Add Custom Domain
1. In Railway, go to your service → **Settings** → **Networking**
2. Click **"Generate Domain"** to get a `.up.railway.app` URL
3. Or click **"Custom Domain"** and add `simpletonapp.com`
4. Update your DNS records as Railway instructs
5. After domain is live, update these env vars:
   - `APP_DOMAIN=https://simpletonapp.com`
   - `ALLOWED_ORIGINS=https://simpletonapp.com`
   - `GMAIL_REDIRECT_URI=https://simpletonapp.com/api/gmail/callback`

## Step 8: Update OAuth Redirect URIs
In each OAuth provider's console, update the redirect URIs:
- **Google**: https://simpletonapp.com/api/auth/google/callback
- **Facebook**: https://simpletonapp.com/api/auth/facebook/callback
- **GitHub**: https://simpletonapp.com/api/auth/github/callback
- **Twitter**: https://simpletonapp.com/api/auth/twitter/callback
- **Stripe Webhook**: Update webhook endpoint URL in Stripe dashboard

## Notes
- Railway auto-assigns the PORT env variable — do NOT set it manually
- The health check endpoint is at `/api/health`
- Railway will auto-restart on failure (configured in railway.toml)
- Logs are viewable in the Railway dashboard in real-time
