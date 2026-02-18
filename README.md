# Flashcards App

A responsive flashcard application that syncs across devices using GitHub Gists.

## Features

- Create multiple flashcard sets
- Add, edit, and delete cards
- **Import from CSV** - Bulk import cards from CSV files
- Study modes:
  - Sequential or shuffled order
  - Start with front or back first
- Intuitive controls:
  - Keyboard: ↑↓ to flip, ←→ to navigate
  - Touch: Swipe up/down to flip, left/right to navigate
- Cross-device sync via GitHub Gists
- Human-readable JSON data storage
- Responsive design (mobile and desktop)

## Setup

### 1. GitHub Personal Access Token

To use this app, you need a GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Flashcards App")
4. Select the `gist` scope
5. Click "Generate token"
6. Copy the token (you won't be able to see it again!)

### 2. Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings > Pages
3. Select source branch (usually `main` or `master`)
4. Select folder (usually `/root` or `/docs` if you move files there)
5. Your app will be available at `https://[username].github.io/[repository-name]`

### 3. Using the App

1. Open the deployed app
2. Enter your GitHub Personal Access Token
3. Start creating flashcard sets!

## Project Structure

```
flashcards/
├── index.html              # Main app entry point
├── styles/
│   └── main.css           # All styling (responsive, mobile-friendly)
├── scripts/
│   ├── main.js            # App initialization and event coordination
│   ├── auth.js            # GitHub authentication
│   ├── gists.js           # Gists API integration
│   ├── sets.js            # Flashcard set management
│   ├── study.js           # Study mode logic
│   ├── ui.js              # UI rendering and updates
│   └── controls.js        # Keyboard and touch event handlers
└── README.md              # This file
```

## How It Works

- All flashcard data is stored in a single GitHub Gist per user
- The gist contains a JSON file (`flashcards-data.json`) with all sets and cards
- Data is cached in localStorage as a backup
- The app uses GitHub REST API v3 for all operations

## Browser Support

- Modern browsers with ES6 module support
- Mobile browsers (iOS Safari, Chrome Mobile, etc.)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## License

MIT

