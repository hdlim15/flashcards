// GitHub Authentication Module
export class Auth {
    constructor() {
        this.tokenKey = 'github_token';
        this.clientId = null; // Will be set if using OAuth App
        this.redirectUri = window.location.origin + window.location.pathname;
    }

    getToken() {
        // Check URL for OAuth callback
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
            // Handle OAuth callback - for MVP, we'll use token from localStorage
            // In production, exchange code for token via backend
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        return localStorage.getItem(this.tokenKey);
    }

    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    clearToken() {
        localStorage.removeItem(this.tokenKey);
    }

    startOAuthFlow() {
        // For MVP, we'll use Personal Access Token approach
        // OAuth flow would require a backend to exchange code for token
        // For now, show instructions
        alert('For MVP, please create a GitHub Personal Access Token:\n\n1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)\n2. Generate new token with "gist" scope\n3. Paste it in the input below');
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

