# GitHub OAuth (SSO) Setup Guide

This guide will help you set up GitHub OAuth for your flashcard app, which is more secure than Personal Access Tokens.

## Why OAuth is Better

- ✅ **No token exposure**: Users never see or manually enter tokens
- ✅ **Automatic expiration**: Tokens can be refreshed automatically
- ✅ **Better UX**: One-click sign-in with GitHub
- ✅ **Revocable**: Users can revoke access from GitHub settings

## Prerequisites

You'll need to deploy a serverless function to handle the OAuth token exchange. Choose one:

- **Vercel** (Recommended - easiest, free tier)
- **Netlify** (Free tier, similar to Vercel)
- **Cloudflare Workers** (Free tier, very fast)

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: "Flashcards App" (or any name)
   - **Homepage URL**: `https://YOUR_USERNAME.github.io/flashcards` (your GitHub Pages URL)
   - **Authorization callback URL**: 
     - For Vercel: `https://YOUR_VERCEL_APP.vercel.app/api/auth`
     - For Netlify: `https://YOUR_APP.netlify.app/.netlify/functions/auth`
     - Or use your GitHub Pages URL: `https://YOUR_USERNAME.github.io/flashcards`
   - **Enable Device Flow**: Leave unchecked
4. Click **"Register application"**
5. **Copy the Client ID** (you'll need this)
6. **Generate a new client secret** and copy it (you won't see it again!)

## Step 2: Deploy Serverless Function

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd C:\Users\hyuckin\game_dev\flashcards
   vercel
   ```

3. **Set Environment Variables**:
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add:
     - `GITHUB_CLIENT_ID`: Your OAuth App Client ID
     - `GITHUB_CLIENT_SECRET`: Your OAuth App Client Secret

4. **Update Callback URL** in GitHub OAuth App to: `https://YOUR_VERCEL_APP.vercel.app/api/auth`

5. **Update your app**:
   - In `index.html`, add before `</body>`:
     ```html
     <script>
       window.GITHUB_CLIENT_ID = 'YOUR_CLIENT_ID';
       window.API_BASE_URL = 'https://YOUR_VERCEL_APP.vercel.app';
     </script>
     ```

### Option B: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Create `netlify.toml`**:
   ```toml
   [build]
     functions = "netlify/functions"
     publish = "."
   
   [[redirects]]
     from = "/api/auth"
     to = "/.netlify/functions/auth"
     status = 200
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variables**:
   - Netlify Dashboard → Site settings → Environment variables
   - Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

5. **Update your app**:
   ```html
   <script>
     window.GITHUB_CLIENT_ID = 'YOUR_CLIENT_ID';
     window.API_BASE_URL = 'https://YOUR_APP.netlify.app';
   </script>
   ```

## Step 3: Update Your App

1. **Add OAuth configuration** to `index.html` (before closing `</body>` tag):

   ```html
   <script>
     // Set your OAuth App Client ID
     window.GITHUB_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
     
     // Set your serverless function URL
     window.API_BASE_URL = 'https://YOUR_SERVERLESS_FUNCTION_URL';
   </script>
   ```

2. **Deploy updated code** to GitHub Pages

## Step 4: Test

1. Visit your GitHub Pages site
2. Click "Sign in with GitHub (OAuth)"
3. You should be redirected to GitHub
4. Authorize the app
5. You should be redirected back and signed in!

## Troubleshooting

### "OAuth not configured" error
- Make sure `window.GITHUB_CLIENT_ID` is set in `index.html`
- Check that the script tag is before the closing `</body>` tag

### "Failed to exchange authorization code"
- Check that environment variables are set in your serverless function
- Verify the callback URL matches in GitHub OAuth App settings
- Check serverless function logs for errors

### CORS errors
- Make sure your serverless function allows requests from your GitHub Pages domain
- Vercel/Netlify should handle this automatically

### Callback URL mismatch
- The callback URL in GitHub OAuth App must exactly match your redirect URI
- For GitHub Pages: `https://YOUR_USERNAME.github.io/flashcards`
- The serverless function handles the token exchange, not the callback

## Security Notes

- ✅ Client secret is **never** exposed to the browser
- ✅ Token exchange happens server-side only
- ✅ OAuth state parameter prevents CSRF attacks
- ✅ Tokens are stored in localStorage (same as before)

## Fallback to Token Input

If OAuth is not configured, users can still use Personal Access Tokens as a fallback. The app will automatically detect if OAuth is available.

## Cost

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Netlify**: Free tier includes 100GB bandwidth/month
- **Cloudflare Workers**: Free tier includes 100,000 requests/day

For a personal flashcard app, the free tier is more than enough!

