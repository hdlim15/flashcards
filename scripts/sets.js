// Flashcard Set Management
export class Sets {
    constructor(gists) {
        this.gists = gists;
    }

    getSets() {
        const data = this.gists.getData();
        return data.sets || [];
    }

    async createNewSet() {
        const name = await window.ui.prompt('Enter set name:', 'My Flashcard Set');
        if (!name || !name.trim()) {
            return;
        }

        if (name.trim().length > 100) {
            window.ui.showError('Set name must be 100 characters or less');
            return;
        }

        const data = this.gists.getData();
        const newSet = {
            id: Date.now().toString(),
            name: name.trim(),
            cards: []
        };

        data.sets.push(newSet);
        
        try {
            window.ui.showMessage('Creating set...');
            await this.gists.updateData(data);
            this.renderSets();
            window.ui.showMessage('Set created successfully');
        } catch (error) {
            console.error('Failed to create set:', error);
            if (error.message.includes('network') || error.message.includes('fetch')) {
                window.ui.showError('Network error. Set will be saved when connection is restored.');
            } else {
                window.ui.showError('Failed to create set: ' + error.message);
            }
        }
    }

    async updateSetName(setId, newName) {
        if (!newName || !newName.trim()) {
            return;
        }

        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        if (set) {
            set.name = newName.trim();
            try {
                await this.gists.updateData(data);
            } catch (error) {
                window.ui.showError('Failed to update set name: ' + error.message);
            }
        }
    }

    async deleteSet(setId) {
        const confirmed = await window.ui.confirm('Are you sure you want to delete this set? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        const data = this.gists.getData();
        data.sets = data.sets.filter(s => s.id !== setId);
        
        try {
            await this.gists.updateData(data);
            window.App.currentSetId = null;
            window.ui.showScreen('dashboard');
            this.renderSets();
            window.ui.showMessage('Set deleted successfully');
        } catch (error) {
            console.error('Failed to delete set:', error);
            if (error.message.includes('network') || error.message.includes('fetch')) {
                window.ui.showError('Network error. Changes will be saved when connection is restored.');
            } else {
                window.ui.showError('Failed to delete set: ' + error.message);
            }
        }
    }

    async addCard(setId) {
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        if (!set) return;

        const newCard = {
            id: Date.now().toString(),
            front: '',
            back: ''
        };

        set.cards.push(newCard);
        
        try {
            await this.gists.updateData(data);
            this.renderCards(setId);
        } catch (error) {
            window.ui.showError('Failed to add card: ' + error.message);
        }
    }

    async updateCard(setId, cardId, front, back) {
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        if (!set) return;

        const card = set.cards.find(c => c.id === cardId);
        if (card) {
            // Validate card content length
            if (front.length > 1000 || back.length > 1000) {
                window.ui.showError('Card content must be 1000 characters or less');
                return;
            }
            card.front = front;
            card.back = back;
            try {
                await this.gists.updateData(data);
            } catch (error) {
                window.ui.showError('Failed to update card: ' + error.message);
            }
        }
    }

    async deleteCard(setId, cardId) {
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        if (!set) return;

        set.cards = set.cards.filter(c => c.id !== cardId);
        
        try {
            await this.gists.updateData(data);
            this.renderCards(setId);
        } catch (error) {
            window.ui.showError('Failed to delete card: ' + error.message);
        }
    }

    renderSets() {
        const sets = this.getSets();
        const container = document.getElementById('sets-container');
        
        if (!container) return;

        if (sets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>No flashcard sets yet</h2>
                    <p>Create your first set to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sets.map(set => `
            <div class="set-card" data-set-id="${this.escapeHtml(set.id)}">
                <h3>${this.escapeHtml(set.name)}</h3>
                <div class="card-count">${set.cards.length} card${set.cards.length !== 1 ? 's' : ''}</div>
                <div class="set-card-actions">
                    <button class="btn btn-primary set-edit-btn" data-set-id="${this.escapeHtml(set.id)}">Edit</button>
                    <button class="btn btn-secondary set-study-btn" data-set-id="${this.escapeHtml(set.id)}">Study</button>
                </div>
            </div>
        `).join('');

        // Use event delegation instead of inline onclick
        container.querySelectorAll('.set-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const setId = e.target.dataset.setId;
                if (setId) {
                    this.openSet(setId);
                }
            });
        });

        container.querySelectorAll('.set-study-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const setId = e.target.dataset.setId;
                if (setId) {
                    this.startStudyOptions(setId);
                }
            });
        });
    }

    openSet(setId) {
        window.App.currentSetId = setId;
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        
        if (!set) {
            window.ui.showError('Set not found');
            return;
        }

        document.getElementById('set-name-input').value = set.name;
        this.renderCards(setId);
        window.ui.showScreen('set-edit');
    }

    renderCards(setId) {
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        if (!set) return;

        const container = document.getElementById('cards-container');
        if (!container) return;

        if (set.cards.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>No cards in this set</h2>
                    <p>Add your first card to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = set.cards.map(card => `
            <div class="card-item" data-card-id="${this.escapeHtml(card.id)}">
                <div class="card-inputs">
                    <div class="card-input-group">
                        <label>Front</label>
                        <textarea class="input card-front-input" rows="2" data-card-id="${this.escapeHtml(card.id)}">${this.escapeHtml(card.front)}</textarea>
                    </div>
                    <div class="card-input-group">
                        <label>Back</label>
                        <textarea class="input card-back-input" rows="2" data-card-id="${this.escapeHtml(card.id)}">${this.escapeHtml(card.back)}</textarea>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-danger btn-text card-delete-btn" data-set-id="${this.escapeHtml(setId)}" data-card-id="${this.escapeHtml(card.id)}">Delete</button>
                </div>
            </div>
        `).join('');

        // Use event delegation instead of inline onclick
        container.querySelectorAll('.card-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const setId = e.target.dataset.setId;
                const cardId = e.target.dataset.cardId;
                if (setId && cardId) {
                    this.deleteCard(setId, cardId);
                }
            });
        });

        // Add event listeners for card updates
        container.querySelectorAll('.card-front-input, .card-back-input').forEach(input => {
            let timeout;
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    const cardId = input.dataset.cardId;
                    const frontInput = container.querySelector(`.card-front-input[data-card-id="${cardId}"]`);
                    const backInput = container.querySelector(`.card-back-input[data-card-id="${cardId}"]`);
                    this.updateCard(setId, cardId, frontInput.value, backInput.value);
                }, 500);
            });
        });
    }

    startStudyOptions(setId) {
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        
        if (!set || set.cards.length === 0) {
            window.ui.showError('This set has no cards to study');
            return;
        }

        window.App.currentSetId = setId;
        window.ui.showScreen('study-options');
    }

    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
}

