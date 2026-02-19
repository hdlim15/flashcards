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
        const defaultName = 'New Set';

        const data = this.gists.getData();
        const newSet = {
            id: Date.now().toString(),
            name: defaultName,
            cards: []
        };

        data.sets.push(newSet);
        
        try {
            window.ui.showMessage('Creating set...');
            await this.gists.updateData(data);
            this.renderSets();
            window.ui.showMessage('Set created successfully');
            this.openSet(newSet.id);
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
            const data = this.gists.getData();
            const set = data.sets.find(s => s.id === setId);
            if (set) {
                const input = document.getElementById('set-name-input');
                if (input) input.value = set.name;
            }
            window.ui.showError('Set title cannot be blank');
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
        // Save any unsaved input values before re-rendering
        this.saveAllCardInputs(setId);
        
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        if (!set) return;

        const newCard = {
            id: Date.now().toString(),
            front: '',
            back: '',
            _draft: true
        };

        set.cards.push(newCard);
        this.renderCards(setId);
    }
    
    // Save all card input values from DOM to data model before re-rendering
    saveAllCardInputs(setId) {
        const container = document.getElementById('cards-container');
        if (!container) return;
        
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        if (!set) return;
        
        // Get all card inputs and update the data model
        container.querySelectorAll('.card-item').forEach(cardItem => {
            const cardId = cardItem.dataset.cardId;
            if (!cardId) return;
            
            const frontInput = cardItem.querySelector(`.card-front-input[data-card-id="${cardId}"]`);
            const backInput = cardItem.querySelector(`.card-back-input[data-card-id="${cardId}"]`);
            
            if (frontInput && backInput) {
                const card = set.cards.find(c => c.id === cardId);
                if (card) {
                    card.front = frontInput.value;
                    card.back = backInput.value;
                    card._draft = !(frontInput.value.trim().length > 0 && backInput.value.trim().length > 0);
                }
            }
        });
    }

    async saveAllCards(setId) {
        // Save all input values from DOM to data model
        this.saveAllCardInputs(setId);
        
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        if (!set) {
            window.ui.showError('Set not found');
            return;
        }

        try {
            // Save all cards, including drafts
            await this.gists.updateData(data);
            window.ui.showMessage('Set saved successfully');
        } catch (error) {
            console.error('Failed to save set:', error);
            window.ui.showError('Failed to save set: ' + error.message);
        }
    }

    async updateCard(setId, cardId, front, back, forceSave = false) {
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
            card._draft = !(front.trim().length > 0 && back.trim().length > 0);

            // Only persist when both sides are non-empty, or if forceSave is true
            if (card._draft && !forceSave) {
                return;
            }
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

        const targetCard = set.cards.find(c => c.id === cardId);
        set.cards = set.cards.filter(c => c.id !== cardId);

        if (targetCard && targetCard._draft) {
            this.renderCards(setId);
            return;
        }

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

        // Get dynamic numbers set if available
        const dynamicNumbersSet = window.dynamicNumbers?.getSetInfo();
        const allSets = dynamicNumbersSet ? [dynamicNumbersSet, ...sets] : sets;

        if (allSets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>No flashcard sets yet</h2>
                    <p>Create your first set to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = allSets.map(set => {
            const isDynamic = set.isDynamic || set.id === 'DYNAMIC_NUMBERS';
            // Count only non-draft cards (matching study mode behavior)
            const validCards = isDynamic ? [] : set.cards.filter(card => 
                (card.front && card.front.trim()) || (card.back && card.back.trim())
            );
            const cardCount = isDynamic ? '∞ cards' : `${validCards.length} card${validCards.length !== 1 ? 's' : ''}`;
            const editButton = isDynamic ? '' : `<button class="btn btn-text set-edit-btn" data-set-id="${this.escapeHtml(set.id)}">Edit</button>`;
            
            return `
                <div class="set-card" data-set-id="${this.escapeHtml(set.id)}">
                    <h3>${this.escapeHtml(set.name)}</h3>
                    <div class="card-count">${cardCount}</div>
                    <div class="set-card-actions">
                        ${editButton}
                    </div>
                </div>
            `;
        }).join('');

        // Click anywhere on set card to study
        container.querySelectorAll('.set-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const setId = e.currentTarget.dataset.setId;
                if (setId) this.startStudyOptions(setId);
            });
        });

        container.querySelectorAll('.set-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const setId = e.target.dataset.setId;
                if (setId) {
                    this.openSet(setId);
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
                <div class="card-drag-handle" title="Drag to reorder" draggable="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="12" r="1"></circle>
                        <circle cx="9" cy="5" r="1"></circle>
                        <circle cx="9" cy="19" r="1"></circle>
                        <circle cx="15" cy="12" r="1"></circle>
                        <circle cx="15" cy="5" r="1"></circle>
                        <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                </div>
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
                    <button class="btn btn-danger btn-text card-delete-btn" data-set-id="${this.escapeHtml(setId)}" data-card-id="${this.escapeHtml(card.id)}" tabindex="-1">Delete</button>
                </div>
            </div>
        `).join('');


        // Use event delegation instead of inline onclick
        container.querySelectorAll('.card-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const button = e.currentTarget;
                const setId = button.dataset.setId;
                const cardId = button.dataset.cardId;
                if (setId && cardId) {
                    this.deleteCard(setId, cardId);
                }
            });
        });

        // Add event listeners for card updates (auto-save)
        const allInputs = container.querySelectorAll('.card-front-input, .card-back-input');
        allInputs.forEach((input, index) => {
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

        // Auto-add card when tabbing from last card's back input
        const lastCardItem = container.querySelector('.card-item:last-child');
        if (lastCardItem) {
            const lastBackInput = lastCardItem.querySelector('.card-back-input');
            if (lastBackInput) {
                lastBackInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                        // Check if next focusable element would be the Add Card button
                        const addCardBtn = document.getElementById('add-card-btn');
                        if (addCardBtn) {
                            // Get all focusable elements
                            const focusableElements = document.querySelectorAll(
                                'a[href], button:not([tabindex="-1"]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                            );
                            const focusableArray = Array.from(focusableElements);
                            const currentIndex = focusableArray.indexOf(lastBackInput);
                            const nextIndex = currentIndex + 1;
                            
                            if (nextIndex < focusableArray.length && focusableArray[nextIndex] === addCardBtn) {
                                // Next element is Add Card button, so add a card instead
                                e.preventDefault();
                                this.addCard(setId);
                                
                                // Focus the new card's front input after it's rendered
                                setTimeout(() => {
                                    const newCardItems = container.querySelectorAll('.card-item');
                                    if (newCardItems.length > 0) {
                                        const newLastCard = newCardItems[newCardItems.length - 1];
                                        const newFrontInput = newLastCard.querySelector('.card-front-input');
                                        if (newFrontInput) {
                                            newFrontInput.focus();
                                        }
                                    }
                                }, 50);
                            }
                        }
                    }
                });
            }
        }

        // Add drag and drop event listeners
        this.setupDragAndDrop(setId, container);
    }

    setupDragAndDrop(setId, container) {
        let draggedElement = null;
        let draggedIndex = null;

        container.querySelectorAll('.card-item').forEach((cardItem, index) => {
            const dragHandle = cardItem.querySelector('.card-drag-handle');
            
            // Handle drag start from the drag handle
            if (dragHandle) {
                dragHandle.addEventListener('dragstart', (e) => {
                    draggedElement = cardItem;
                    draggedIndex = index;
                    cardItem.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', cardItem.innerHTML);
                });

                dragHandle.addEventListener('dragend', (e) => {
                    cardItem.classList.remove('dragging');
                    container.querySelectorAll('.card-item').forEach(item => {
                        item.classList.remove('drag-over');
                    });
                    draggedElement = null;
                    draggedIndex = null;
                });
            }

            // Make the entire card item a drop zone
            cardItem.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                const afterElement = this.getDragAfterElement(container, e.clientY);
                const dragging = container.querySelector('.dragging');
                
                if (dragging && afterElement == null) {
                    container.appendChild(dragging);
                } else if (dragging && afterElement) {
                    container.insertBefore(dragging, afterElement);
                }
            });


            cardItem.addEventListener('dragenter', (e) => {
                e.preventDefault();
                if (cardItem !== draggedElement) {
                    cardItem.classList.add('drag-over');
                }
            });

            cardItem.addEventListener('dragleave', (e) => {
                cardItem.classList.remove('drag-over');
            });

            cardItem.addEventListener('drop', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                cardItem.classList.remove('drag-over');
                
                if (draggedElement) {
                    // Save any unsaved input values before reordering
                    this.saveAllCardInputs(setId);
                    
                    // Get the new order from DOM
                    const cardItems = Array.from(container.querySelectorAll('.card-item'));
                    const newOrder = cardItems.map(item => item.dataset.cardId);
                    
                    // Update the data model with new order
                    await this.reorderCards(setId, newOrder);
                    draggedElement = null;
                    draggedIndex = null;
                }
            });
        });

        // Also handle drop on the container itself (for dropping at the end)
        container.addEventListener('drop', async (e) => {
            e.preventDefault();
            if (draggedElement) {
                // Save any unsaved input values before reordering
                this.saveAllCardInputs(setId);
                
                // Get the new order from DOM
                const cardItems = Array.from(container.querySelectorAll('.card-item'));
                const newOrder = cardItems.map(item => item.dataset.cardId);
                
                // Update the data model with new order
                await this.reorderCards(setId, newOrder);
                draggedElement = null;
                draggedIndex = null;
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.card-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async reorderCards(setId, newOrder) {
        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        if (!set) return;

        // Create a map of card ID to card object
        const cardMap = new Map(set.cards.map(card => [card.id, card]));
        
        // Reorder cards based on newOrder array
        set.cards = newOrder.map(cardId => cardMap.get(cardId)).filter(card => card !== undefined);
        
        try {
            await this.gists.updateData(data);
            // Re-render to ensure UI matches data
            this.renderCards(setId);
            window.ui.showMessage('Card order updated');
        } catch (error) {
            console.error('Failed to reorder cards:', error);
            window.ui.showError('Failed to save card order: ' + error.message);
            // Re-render to restore original order
            this.renderCards(setId);
        }
    }

    startStudyOptions(setId) {
        // Check if it's the dynamic numbers set
        if (window.dynamicNumbers?.isDynamicSet(setId)) {
            window.App.currentSetId = setId;
            const order = window.App.studySettings?.order || 'sequential';
            const startSide = window.App.studySettings?.startSide || 'front';
            window.study.startDynamicStudy(setId, order, startSide);
            window.ui.showScreen('study');
            window.controls?.attach?.();
            return;
        }

        const data = this.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        
        if (!set || set.cards.length === 0) {
            window.ui.showError('This set has no cards to study');
            return;
        }

        window.App.currentSetId = setId;
        const order = window.App.studySettings?.order || 'sequential';
        const startSide = window.App.studySettings?.startSide || 'front';
        window.study.startStudy(setId, order, startSide);
        window.ui.showScreen('study');
        window.controls?.attach?.();
    }

    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
}

