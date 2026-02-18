# Deployment Guide - Step by Step

Follow these steps to deploy your flashcard app to GitHub Pages.

## Step 1: Initialize Git Repository

```bash
# Navigate to your project directory
cd C:\Users\hyuckin\game_dev\flashcards

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Flashcard app MVP"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Repository name: `flashcards` (or any name you prefer)
4. Description: "A responsive flashcard app with GitHub Gists sync"
5. Choose **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **Create repository**

## Step 3: Connect and Push to GitHub

GitHub will show you commands. Use these (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/flashcards.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for GitHub to build your site
7. Your app will be available at: `https://YOUR_USERNAME.github.io/flashcards/`

## Step 5: Get GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings](https://github.com/settings/apps)
2. Click **Personal access tokens** → **Tokens (classic)**
3. Click **Generate new token** → **Generate new token (classic)**
4. Fill in:
   - **Note**: "Flashcards App"
   - **Expiration**: Choose your preference (90 days, 1 year, or no expiration)
   - **Scopes**: Check **`gist`** (this is the only scope needed)
5. Click **Generate token** at the bottom
6. **IMPORTANT**: Copy the token immediately! You won't be able to see it again.
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 6: Test Your App

1. Open your deployed app: `https://YOUR_USERNAME.github.io/flashcards/`
2. You should see the login screen
3. Paste your Personal Access Token
4. Click "Use Token"
5. You should see the dashboard (empty at first)
6. Create your first flashcard set!

## Troubleshooting

### App doesn't load
- Check that GitHub Pages is enabled and shows "Your site is live at..."
- Wait a few minutes after enabling Pages
- Check browser console for errors (F12)

### Token doesn't work
- Make sure you selected the `gist` scope
- Check that the token hasn't expired
- Try generating a new token

### Changes not showing
- GitHub Pages can take 1-2 minutes to update
- Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Check that you pushed changes to the `main` branch

### CORS errors
- GitHub API should work from GitHub Pages
- If you see CORS errors, make sure you're accessing via the GitHub Pages URL, not `file://`

## Next Steps After Deployment

- Share your app with others (they'll need their own GitHub tokens)
- Create flashcard sets and start studying!
- Your data syncs across all devices where you're logged in

