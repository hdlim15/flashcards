# Quick Fix: OAuth Not Working

If you're seeing "OAuth not configured" or being asked for a Personal Access Token, here's how to fix it:

## The Problem

OAuth requires two things:
1. **GitHub OAuth App** (to get Client ID)
2. **Serverless Function** (to exchange code for token)

Both need to be set up before OAuth will work.

## Quick Solution: Use Personal Access Token (For Now)

**Easiest option**: Just use a Personal Access Token for now. It works fine and is secure for personal use.

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic) with `gist` scope
3. Paste it in the app
4. You're done!

## To Enable OAuth (Optional - More Secure)

### Step 1: Create GitHub OAuth App (2 minutes)

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: "Flashcards App"
   - **Homepage URL**: `https://YOUR_USERNAME.github.io/flashcards`
   - **Authorization callback URL**: `https://YOUR_USERNAME.github.io/flashcards`
4. Click **"Register application"**
5. **Copy the Client ID**
6. **Generate a new client secret** and copy it

### Step 2: Deploy Serverless Function (5 minutes)

**Option A: Vercel (Easiest)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd C:\Users\hyuckin\game_dev\flashcards
vercel
```

Then in Vercel dashboard:
- Go to your project → Settings → Environment Variables
- Add:
  - `GITHUB_CLIENT_ID`: (your Client ID)
  - `GITHUB_CLIENT_SECRET`: (your Client Secret)

**Option B: Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

Then in Netlify dashboard:
- Site settings → Environment variables
- Add the same variables

### Step 3: Update index.html

Open `index.html` and find this section (near the end, before `</body>`):

```html
<script>
    // Uncomment and fill these in:
    // window.GITHUB_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
    // window.API_BASE_URL = 'https://YOUR_SERVERLESS_FUNCTION_URL';
</script>
```

**Change it to:**

```html
<script>
    window.GITHUB_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID';
    window.API_BASE_URL = 'https://YOUR_VERCEL_APP.vercel.app'; // or your Netlify URL
</script>
```

### Step 4: Deploy and Test

1. Commit and push the updated `index.html`
2. Wait 1-2 minutes for GitHub Pages to update
3. Try the OAuth button again!

## Troubleshooting

### "OAuth not configured" error
- Make sure you uncommented the script in `index.html`
- Check that `window.GITHUB_CLIENT_ID` is set (open browser console, type `window.GITHUB_CLIENT_ID`)

### "Failed to exchange authorization code"
- Check that your serverless function is deployed
- Verify environment variables are set correctly
- Check serverless function logs for errors
- Make sure `API_BASE_URL` matches your serverless function URL

### Still not working?
- Use Personal Access Token for now (it's perfectly fine!)
- OAuth is optional - the app works great with tokens too

## Recommendation

**For MVP/Personal Use**: Personal Access Token is fine and simpler.  
**For Production/Sharing**: Set up OAuth for better UX.

