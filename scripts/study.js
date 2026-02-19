// Study Mode Logic
export class Study {
    constructor() {
        this.currentSetId = null;
        this.cards = [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.startSide = 'front';
        this.isDynamic = false; // Flag for dynamic sets
        this.originalSet = null; // Reference to the original set for updates
    }

    startStudy(setId, order, startSide) {
        const data = window.gists.getData();
        const set = data.sets.find(s => s.id === setId);
        
        if (!set) {
            window.ui.showError('Set not found');
            return;
        }
        
        if (set.cards.length === 0) {
            window.ui.showError('This set has no cards to study');
            return;
        }
        
        // Filter out cards with empty content
        const validCards = set.cards.filter(card => 
            (card.front && card.front.trim()) || (card.back && card.back.trim())
        );
        
        if (validCards.length === 0) {
            window.ui.showError('No valid cards to study (all cards are empty)');
            return;
        }

        this.currentSetId = setId;
        this.startSide = startSide;
        this.isFlipped = startSide === 'back';
        this.isDynamic = false;
        
        // Show edit button for regular sets
        const editBtn = document.getElementById('edit-card-btn');
        if (editBtn) {
            editBtn.style.display = '';
        }
        
        // Show track progress and order buttons for regular sets
        const trackProgressBtn = document.getElementById('track-progress-toggle-btn');
        if (trackProgressBtn) {
            trackProgressBtn.style.display = '';
        }
        const orderBtn = document.getElementById('order-toggle-btn');
        if (orderBtn) {
            orderBtn.style.display = '';
        }
        
        // Store reference to original set for updates
        this.originalSet = set;
        
        // Copy valid cards array (keep references to original cards for updates)
        this.cards = validCards;
        
        // Shuffle if needed
        if (order === 'shuffled') {
            this.shuffleCards();
        }
        
        this.currentIndex = 0;
        this.updateCardContent();
        // Skip animation when starting study - show correct side immediately
        this.updateCardDisplay(true);
        this.updateProgress();
        this.cancelEditMode(); // Ensure edit mode is off when starting study
    }

    startDynamicStudy(setId, order, startSide) {
        // Dynamic sets don't use order/shuffle since each card is generated fresh
        this.currentSetId = setId;
        this.startSide = startSide;
        this.isFlipped = startSide === 'back';
        this.isDynamic = true;
        this.originalSet = null;
        
        // Hide edit button for dynamic sets
        const editBtn = document.getElementById('edit-card-btn');
        if (editBtn) {
            editBtn.style.display = 'none';
        }
        
        // Hide track progress and order buttons for dynamic sets
        const trackProgressBtn = document.getElementById('track-progress-toggle-btn');
        if (trackProgressBtn) {
            trackProgressBtn.style.display = 'none';
        }
        const orderBtn = document.getElementById('order-toggle-btn');
        if (orderBtn) {
            orderBtn.style.display = 'none';
        }
        
        // Generate first card
        this.cards = [];
        this.currentIndex = 0;
        this.generateNewCard();
        this.updateCardContent();
        this.updateCardDisplay(true); // Skip animation when starting study
        this.updateProgress();
        this.cancelEditMode(); // Ensure edit mode is off when starting study
    }

    generateNewCard() {
        if (!this.isDynamic || !window.dynamicNumbers) return;
        
        const newCard = window.dynamicNumbers.generateCard();
        // For dynamic sets, we only keep the current card
        this.cards = [newCard];
        this.currentIndex = 0;
    }

    shuffleCards() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    flipCard() {
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;
        
        // Ensure flip transition is enabled for manual flips
        // Remove any inline transform that might interfere
        flashcard.style.transition = '';
        flashcard.style.transform = '';
        
        this.isFlipped = !this.isFlipped;
        this.updateCardDisplay();
    }

    nextCard() {
        // Cancel edit mode if active
        this.cancelEditMode();
        
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;
        
        // For dynamic sets, generate a new card instead of navigating
        if (this.isDynamic) {
            this.generateNewCard();
        } else {
            // Update content first
            this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        }
        
        // Disable flip transition for navigation
        flashcard.style.transition = 'none';
        
        // Set flip state instantly (no animation) - preserve flip state in transform
        this.isFlipped = this.startSide === 'back';
        const flipTransform = this.isFlipped ? 'rotateX(180deg) ' : '';
        
        if (this.isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }
        
        this.updateCardContent();
        
        // Slide animation: start new card from right, slide to center
        flashcard.style.transform = `${flipTransform}translateX(100%)`;
        
        // Slide in new card
        requestAnimationFrame(() => {
            flashcard.style.transition = 'transform 0.3s ease-out';
            flashcard.style.transform = flipTransform;
            
            // Re-enable flip transition after slide completes
            setTimeout(() => {
                flashcard.style.transition = '';
            }, 300);
        });
        
        this.updateProgress();
    }

    previousCard() {
        // Cancel edit mode if active
        this.cancelEditMode();
        
        // For dynamic sets, previous card doesn't make sense (cards are temporary)
        if (this.isDynamic) {
            window.ui.showMessage('Previous card not available for dynamic sets');
            return;
        }
        
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;
        
        // Disable flip transition for navigation
        flashcard.style.transition = 'none';
        
        // Set flip state instantly (no animation) - preserve flip state in transform
        this.isFlipped = this.startSide === 'back';
        const flipTransform = this.isFlipped ? 'rotateX(180deg) ' : '';
        
        if (this.isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }
        
        // Update content first
        this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.updateCardContent();
        
        // Slide animation: start new card from left, slide to center
        flashcard.style.transform = `${flipTransform}translateX(-100%)`;
        
        // Slide in new card
        requestAnimationFrame(() => {
            flashcard.style.transition = 'transform 0.3s ease-out';
            flashcard.style.transform = flipTransform;
            
            // Re-enable flip transition after slide completes
            setTimeout(() => {
                flashcard.style.transition = '';
            }, 300);
        });
        
        this.updateProgress();
    }

    updateCardContent() {
        if (this.cards.length === 0) return;

        const card = this.cards[this.currentIndex];
        const frontContent = document.getElementById('card-front-content');
        const backContent = document.getElementById('card-back-content');
        const editFrontInput = document.getElementById('card-edit-front');
        const editBackInput = document.getElementById('card-edit-back');

        if (!frontContent || !backContent) return;

        // Use textContent to prevent XSS, but preserve line breaks
        frontContent.textContent = card.front || '(empty)';
        backContent.textContent = card.back || '(empty)';

        // Also update edit mode inputs if they exist
        if (editFrontInput && editBackInput) {
            editFrontInput.value = card.front || '';
            editBackInput.value = card.back || '';
        }
    }

    updateCardDisplay(skipAnimation = false) {
        if (this.cards.length === 0) return;

        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;

        // Update content
        this.updateCardContent();

        // For flipCard(), update the flip state with animation
        const shouldBeFlipped = this.isFlipped;
        const isCurrentlyFlipped = flashcard.classList.contains('flipped');
        
        if (shouldBeFlipped !== isCurrentlyFlipped) {
            if (skipAnimation) {
                // Set instantly without animation
                flashcard.style.transition = 'none';
                if (this.isFlipped) {
                    flashcard.classList.add('flipped');
                } else {
                    flashcard.classList.remove('flipped');
                }
                // Re-enable transition after a brief moment
                setTimeout(() => {
                    flashcard.style.transition = '';
                }, 50);
            } else {
                // Ensure transition is enabled for flip animation
                flashcard.style.transition = '';
                flashcard.style.transform = '';
                
                // Use requestAnimationFrame for smooth flip animation
                requestAnimationFrame(() => {
                    if (this.isFlipped) {
                        flashcard.classList.add('flipped');
                    } else {
                        flashcard.classList.remove('flipped');
                    }
                });
            }
        }
    }

    updateProgress() {
        const progressEl = document.getElementById('study-progress');
        if (progressEl) {
            if (this.isDynamic) {
                progressEl.textContent = 'Numbers';
            } else {
                progressEl.textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
            }
        }
    }

    endStudy() {
        this.currentSetId = null;
        this.cards = [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.isDynamic = false;
        this.originalSet = null;
        this.cancelEditMode(); // Ensure edit mode is off when exiting study
    }

    getCurrentCard() {
        if (this.cards.length === 0) return null;
        return this.cards[this.currentIndex];
    }

    getCurrentCardId() {
        const card = this.getCurrentCard();
        return card ? card.id : null;
    }

    startEditMode() {
        // Dynamic sets cannot be edited
        if (this.isDynamic) {
            window.ui.showMessage('Dynamic sets cannot be edited');
            return;
        }
        
        const card = this.getCurrentCard();
        if (!card) return;

        const flashcard = document.getElementById('flashcard');
        const editMode = document.getElementById('card-edit-mode');
        
        if (flashcard && editMode) {
            flashcard.classList.add('hidden');
            editMode.classList.remove('hidden');
            
            document.getElementById('card-edit-front').value = card.front || '';
            document.getElementById('card-edit-back').value = card.back || '';
        }
    }

    cancelEditMode() {
        const flashcard = document.getElementById('flashcard');
        const editMode = document.getElementById('card-edit-mode');
        
        if (flashcard && editMode) {
            flashcard.classList.remove('hidden');
            editMode.classList.add('hidden');
        }
    }

    async saveCardEdit() {
        const card = this.getCurrentCard();
        if (!card || !this.currentSetId) return;

        const frontInput = document.getElementById('card-edit-front');
        const backInput = document.getElementById('card-edit-back');
        
        if (!frontInput || !backInput) return;

        const front = frontInput.value.trim();
        const back = backInput.value.trim();

        // Validate
        if (front.length > 1000 || back.length > 1000) {
            window.ui.showError('Card content must be 1000 characters or less');
            return;
        }

        if (!front || !back) {
            window.ui.showError('Both front and back must have content');
            return;
        }

        try {
            // Update via sets module
            await window.sets.updateCard(this.currentSetId, card.id, front, back);
            
            // Update local card data
            card.front = front;
            card.back = back;
            
            // Update display
            this.updateCardContent();
            this.cancelEditMode();
            
            window.ui.showMessage('Card updated successfully');
        } catch (error) {
            window.ui.showError('Failed to update card: ' + error.message);
        }
    }
}

