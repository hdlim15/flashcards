// Main entry point - coordinates all modules
import { Auth } from './auth.js';
import { Gists } from './gists.js';
import { Sets } from './sets.js';
import { Study } from './study.js';
import { UI } from './ui.js';
import { Controls } from './controls.js';

// Initialize app state
const App = {
    currentScreen: 'loading',
    currentSetId: null,
    studyMode: null
};

// Initialize modules
const auth = new Auth();
const gists = new Gists(auth);
const sets = new Sets(gists);
const study = new Study();
const ui = new UI();
const controls = new Controls(study);

// Initialize app
async function init() {
    ui.showScreen('loading');
    
    // Check for OAuth errors from previous attempt
    const oauthError = sessionStorage.getItem('oauth_error');
    if (oauthError) {
        sessionStorage.removeItem('oauth_error');
        ui.showScreen('login');
        ui.showError('OAuth authentication failed: ' + oauthError);
        return;
    }
    
    // Handle OAuth callback if present
    const urlParams = new URLSearchParams(window.location.search);
    const hadOAuthCallback = urlParams.get('code') !== null;
    
    if (hadOAuthCallback) {
        const success = await auth.handleOAuthCallback();
        if (!success) {
            ui.showScreen('login');
            const error = sessionStorage.getItem('oauth_error');
            if (error) {
                sessionStorage.removeItem('oauth_error');
                ui.showError('OAuth authentication failed: ' + error);
            } else {
                ui.showError('Failed to complete OAuth authentication.');
            }
            return;
        }
    }
    
    // Check if user is authenticated
    const token = auth.getToken();
    if (token) {
        try {
            await gists.loadData();
            ui.showScreen('dashboard');
            sets.renderSets();
            
            if (hadOAuthCallback) {
                ui.showMessage('Successfully signed in with GitHub!');
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            auth.clearToken();
            ui.showScreen('login');
            
            // Provide more specific error messages
            if (error.message.includes('Invalid token') || error.message.includes('401')) {
                ui.showError('Invalid token. Please check your token and try again.');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                ui.showError('Network error. Please check your connection and try again.');
            } else {
                ui.showError('Failed to load data. Please sign in again.');
            }
        }
    } else {
        ui.showScreen('login');
    }
}

// Event listeners
document.getElementById('login-btn')?.addEventListener('click', () => {
    auth.startOAuthFlow();
});

const handleTokenSubmit = async () => {
    const token = document.getElementById('token-input').value.trim();
    if (!token) {
        ui.showError('Please enter a token');
        return;
    }
    
    ui.showScreen('loading');
    auth.setToken(token);
    try {
        await gists.loadData();
        ui.showScreen('dashboard');
        sets.renderSets();
        ui.showMessage('Successfully signed in!');
    } catch (error) {
        console.error('Token validation error:', error);
        auth.clearToken();
        ui.showScreen('login');
        
        if (error.message.includes('Invalid token') || error.message.includes('401')) {
            ui.showError('Invalid token. Please check your token and try again.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            ui.showError('Network error. Please check your connection and try again.');
        } else {
            ui.showError('Failed to authenticate: ' + error.message);
        }
    }
};

document.getElementById('token-submit-btn')?.addEventListener('click', handleTokenSubmit);
document.getElementById('token-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleTokenSubmit();
    }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout? Your token will be cleared from this device.')) {
        auth.clearToken();
        // Also clear cached data
        localStorage.removeItem('flashcards_cache');
        localStorage.removeItem('flashcards_gist_id');
        ui.showScreen('login');
        document.getElementById('token-input').value = '';
        ui.showMessage('Logged out successfully');
    }
});

document.getElementById('create-set-btn')?.addEventListener('click', () => {
    sets.createNewSet();
});

document.getElementById('back-to-dashboard-btn')?.addEventListener('click', () => {
    ui.showScreen('dashboard');
    sets.renderSets();
});

document.getElementById('delete-set-btn')?.addEventListener('click', () => {
    if (App.currentSetId) {
        sets.deleteSet(App.currentSetId);
    }
});

document.getElementById('set-name-input')?.addEventListener('blur', (e) => {
    if (App.currentSetId) {
        sets.updateSetName(App.currentSetId, e.target.value);
    }
});

document.getElementById('add-card-btn')?.addEventListener('click', () => {
    if (App.currentSetId) {
        sets.addCard(App.currentSetId);
    }
});

document.getElementById('back-from-study-options-btn')?.addEventListener('click', () => {
    ui.showScreen('dashboard');
});

document.getElementById('start-study-btn')?.addEventListener('click', () => {
    const order = document.querySelector('input[name="order"]:checked').value;
    const startSide = document.querySelector('input[name="start-side"]:checked').value;
    if (App.currentSetId) {
        study.startStudy(App.currentSetId, order, startSide);
        ui.showScreen('study');
        controls.attach();
    }
});

document.getElementById('exit-study-btn')?.addEventListener('click', () => {
    study.endStudy();
    controls.detach();
    ui.showScreen('dashboard');
    sets.renderSets();
});

document.getElementById('flip-card-btn')?.addEventListener('click', () => {
    study.flipCard();
});

document.getElementById('prev-card-btn')?.addEventListener('click', () => {
    study.previousCard();
});

document.getElementById('next-card-btn')?.addEventListener('click', () => {
    study.nextCard();
});

// Expose app state globally for modules
window.App = App;
window.auth = auth;
window.gists = gists;
window.sets = sets;
window.study = study;
window.ui = ui;

// Start app
init();

