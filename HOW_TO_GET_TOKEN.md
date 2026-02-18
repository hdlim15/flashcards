# How to Get Your GitHub Personal Access Token

## Step-by-Step Instructions

### Step 1: Go to GitHub Token Settings
Visit: **https://github.com/settings/tokens**

Or navigate manually:
1. Go to GitHub.com and sign in
2. Click your profile picture (top right)
3. Click **Settings**
4. Scroll down to **Developer settings** (left sidebar)
5. Click **Personal access tokens**
6. Click **Tokens (classic)**

### Step 2: Generate New Token
1. Click the **"Generate new token"** button
2. Select **"Generate new token (classic)"** (not fine-grained)

### Step 3: Configure Token
Fill in the form:

- **Note**: Give it a name like "Flashcards App" or "My Flashcards"
- **Expiration**: 
  - Choose **90 days** (recommended for security)
  - Or **No expiration** if you want it to last forever
- **Scopes**: 
  - ✅ Check **`gist`** (this is the only one you need!)
  - ❌ Don't check anything else

### Step 4: Generate and Copy
1. Scroll down and click **"Generate token"** (green button)
2. **IMPORTANT**: Copy the token immediately! 
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again after you leave this page!
   - If you lose it, you'll need to generate a new one

### Step 5: Use in App
1. Open your flashcards app
2. Paste the token in the "GitHub Personal Access Token" field
3. Click "Use Token"
4. You're signed in! 🎉

## Token Format
Your token will look like this:
```
ghp_1234567890abcdefghijklmnopqrstuvwxyz123456
```

It always starts with `ghp_` followed by a long string of letters and numbers.

## Security Tips

✅ **Do:**
- Keep your token secret (don't share it)
- Use it only on trusted devices
- Set an expiration date
- Revoke it if you suspect it's compromised

❌ **Don't:**
- Commit it to GitHub (it's in `.gitignore` already)
- Share it publicly
- Use it on public/shared computers without logging out

## If You Lose Your Token

1. Go back to: https://github.com/settings/tokens
2. Find your token in the list
3. Click the **trash icon** to revoke it
4. Generate a new one following the steps above

## Troubleshooting

### "Invalid token" error
- Make sure you copied the entire token (starts with `ghp_`)
- Check that you selected the `gist` scope
- Verify the token hasn't expired
- Try generating a new token

### Token not working
- Make sure you selected **`gist`** scope (not `repo` or others)
- Check that the token hasn't been revoked
- Generate a fresh token and try again

## Quick Link
🔗 **Direct link to create token**: https://github.com/settings/tokens/new

