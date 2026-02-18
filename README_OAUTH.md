# GitHub OAuth (SSO) Implementation

✅ **GitHub OAuth is now implemented!** This is more secure than Personal Access Tokens.

## What Changed

1. **OAuth Flow**: Users can now sign in with GitHub OAuth (one-click login)
2. **Serverless Functions**: Added backend functions for token exchange (Vercel/Netlify)
3. **Fallback Support**: Still supports Personal Access Tokens if OAuth isn't configured

## Quick Setup (5 minutes)

### 1. Create GitHub OAuth App
- Go to: https://github.com/settings/developers
- Click "New OAuth App"
- **Homepage URL**: Your GitHub Pages URL
- **Callback URL**: Your GitHub Pages URL (same as homepage)
- Copy the **Client ID**

### 2. Deploy Serverless Function

**Option A: Vercel (Easiest)**
```bash
npm i -g vercel
cd C:\Users\hyuckin\game_dev\flashcards
vercel
```
Then set environment variables in Vercel dashboard:
- `GITHUB_CLIENT_ID`: Your Client ID
- `GITHUB_CLIENT_SECRET`: Your Client Secret

**Option B: Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod
```
Set environment variables in Netlify dashboard.

### 3. Configure Your App

In `index.html`, add before `</body>`:
```html
<script>
  window.GITHUB_CLIENT_ID = 'YOUR_CLIENT_ID';
  window.API_BASE_URL = 'https://YOUR_SERVERLESS_FUNCTION_URL';
</script>
```

### 4. Deploy and Test

Push to GitHub and test the OAuth flow!

## Files Added

- `api/auth.js` - Vercel serverless function
- `netlify/functions/auth.js` - Netlify serverless function
- `vercel.json` - Vercel configuration
- `OAUTH_SETUP.md` - Detailed setup guide

## How It Works

1. User clicks "Sign in with GitHub"
2. Redirects to GitHub OAuth
3. User authorizes the app
4. GitHub redirects back with authorization code
5. **Serverless function** exchanges code for token (secure!)
6. Token stored in localStorage
7. User is signed in!

## Security Benefits

✅ **No token exposure**: Users never see tokens
✅ **Client secret protected**: Never exposed to browser
✅ **Automatic expiration**: Can implement token refresh
✅ **Better UX**: One-click sign-in

## Fallback

If OAuth isn't configured, users can still use Personal Access Tokens (the old way).

See `OAUTH_SETUP.md` for detailed instructions!

