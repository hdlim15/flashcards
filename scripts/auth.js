// GitHub Authentication Module
export class Auth {
    constructor() {
        this.tokenKey = 'github_token';
        // Set your GitHub OAuth App Client ID here or via environment
        // Get it from: https://github.com/settings/developers
        this.clientId = window.GITHUB_CLIENT_ID || null;
        this.redirectUri = window.location.origin + window.location.pathname;
        this.apiBase = window.API_BASE_URL || '/api'; // Serverless function endpoint
    }

    getToken() {
        // Return stored token (synchronous)
        return localStorage.getItem(this.tokenKey);
    }

    async handleOAuthCallback() {
        // Check URL for OAuth callback
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        
        if (error) {
            console.error('OAuth error:', error);
            const errorDescription = params.get('error_description') || error;
            sessionStorage.setItem('oauth_error', errorDescription);
            window.history.replaceState({}, document.title, window.location.pathname);
            return false;
        }
        
        if (code) {
            // Exchange code for token via serverless function
            const success = await this.exchangeCodeForToken(code);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return success;
        }

        return false;
    }

    async exchangeCodeForToken(code) {
        try {
            const response = await fetch(`${this.apiBase}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to exchange authorization code');
            }

            const data = await response.json();
            if (!data.access_token) {
                throw new Error('No access token received');
            }
            
            this.setToken(data.access_token);
            
            // Trigger reload to continue with authenticated state
            // The reload will call init() which will load data with the new token
            return true;
        } catch (error) {
            console.error('Token exchange error:', error);
            // Store error to show after UI is initialized
            sessionStorage.setItem('oauth_error', error.message);
            return false;
        }
    }

    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    clearToken() {
        localStorage.removeItem(this.tokenKey);
    }

    startOAuthFlow() {
        if (!this.clientId) {
            // Fallback to token input if OAuth not configured
            window.ui?.showError('OAuth not configured. Please enter a Personal Access Token.');
            return;
        }

        // Redirect to GitHub OAuth
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: 'gist',
            state: this.generateState(), // CSRF protection
        });

        const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
        window.location.href = authUrl;
    }

    generateState() {
        // Generate random state for CSRF protection
        const state = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        sessionStorage.setItem('oauth_state', state);
        return state;
    }

    validateState(state) {
        const storedState = sessionStorage.getItem('oauth_state');
        sessionStorage.removeItem('oauth_state');
        return state === storedState;
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

