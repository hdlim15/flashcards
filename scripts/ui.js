// UI Management
export class UI {
    constructor() {
        this.screens = {
            'loading': 'loading-screen',
            'login': 'login-screen',
            'dashboard': 'dashboard-screen',
            'set-edit': 'set-edit-screen',
            'study-options': 'study-options-screen',
            'study': 'study-screen'
        };
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.add('hidden');
            }
        });

        // Show requested screen
        const targetScreen = document.getElementById(this.screens[screenName]);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            window.App.currentScreen = screenName;
        }
    }

    showMessage(message, duration = 3000) {
        this.showToast(message, 'success', duration);
    }

    showError(message, duration = 5000) {
        this.showToast(message, 'error', duration);
    }

    showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }

    showLoading() {
        this.showScreen('loading');
    }

    hideLoading() {
        // Loading screen is hidden when another screen is shown
    }
}

