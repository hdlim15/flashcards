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
        this.modalResolve = null;
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

    // Modal functions
    showModal(title, message, showInput = false, inputPlaceholder = '') {
        return new Promise((resolve) => {
            const overlay = document.getElementById('modal-overlay');
            const titleEl = document.getElementById('modal-title');
            const messageEl = document.getElementById('modal-message');
            const inputEl = document.getElementById('modal-input');
            const confirmBtn = document.getElementById('modal-confirm-btn');
            const cancelBtn = document.getElementById('modal-cancel-btn');
            const closeBtn = document.getElementById('modal-close-btn');

            if (!overlay) return resolve(null);

            titleEl.textContent = title;
            messageEl.textContent = message;
            
            if (showInput) {
                inputEl.classList.remove('hidden');
                inputEl.placeholder = inputPlaceholder;
                inputEl.value = '';
                inputEl.focus();
            } else {
                inputEl.classList.add('hidden');
            }

            this.modalResolve = resolve;
            overlay.classList.remove('hidden');

            // Set up event listeners
            const handleConfirm = () => {
                const result = showInput ? inputEl.value.trim() : true;
                this.hideModal();
                resolve(result);
            };

            const handleCancel = () => {
                this.hideModal();
                resolve(showInput ? null : false);
            };

            // Remove old listeners
            const newConfirmBtn = confirmBtn.cloneNode(true);
            const newCancelBtn = cancelBtn.cloneNode(true);
            const newCloseBtn = closeBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

            // Add new listeners
            newConfirmBtn.addEventListener('click', handleConfirm);
            newCancelBtn.addEventListener('click', handleCancel);
            newCloseBtn.addEventListener('click', handleCancel);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    handleCancel();
                }
            });

            // Handle Enter key for input
            if (showInput) {
                inputEl.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        handleConfirm();
                    }
                });
            }
        });
    }

    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        this.modalResolve = null;
    }

    async confirm(message) {
        const result = await this.showModal('Confirm', message, false);
        return result === true;
    }

    async prompt(message, placeholder = '') {
        const result = await this.showModal('Input', message, true, placeholder);
        return result;
    }
}

