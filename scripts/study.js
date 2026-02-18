// Study Mode Logic
export class Study {
    constructor() {
        this.currentSetId = null;
        this.cards = [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.startSide = 'front';
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
        
        // Copy valid cards array
        this.cards = [...validCards];
        
        // Shuffle if needed
        if (order === 'shuffled') {
            this.shuffleCards();
        }
        
        this.currentIndex = 0;
        this.updateCardContent();
        this.updateCardDisplay();
        this.updateProgress();
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
        if (flashcard) {
            // Ensure flip transition is enabled for manual flips
            flashcard.style.transition = '';
        }
        this.isFlipped = !this.isFlipped;
        this.updateCardDisplay();
    }

    nextCard() {
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;
        
        // Disable flip transition for navigation
        flashcard.style.transition = 'none';
        
        // Set flip state instantly (no animation) - preserve flip state in transform
        this.isFlipped = this.startSide === 'back';
        const flipTransform = this.isFlipped ? 'rotateY(180deg) ' : '';
        
        if (this.isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }
        
        // Update content first
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
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

    previousCard() {
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;
        
        // Disable flip transition for navigation
        flashcard.style.transition = 'none';
        
        // Set flip state instantly (no animation) - preserve flip state in transform
        this.isFlipped = this.startSide === 'back';
        const flipTransform = this.isFlipped ? 'rotateY(180deg) ' : '';
        
        if (this.isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }
        
        // Update content first
        this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
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

    updateCardContent() {
        if (this.cards.length === 0) return;

        const card = this.cards[this.currentIndex];
        const frontContent = document.getElementById('card-front-content');
        const backContent = document.getElementById('card-back-content');

        if (!frontContent || !backContent) return;

        // Use textContent to prevent XSS, but preserve line breaks
        frontContent.textContent = card.front || '(empty)';
        backContent.textContent = card.back || '(empty)';
    }

    updateCardDisplay() {
        if (this.cards.length === 0) return;

        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;

        // Update content
        this.updateCardContent();

        // Flip state should already be set before this method is called
        // Only update if it's not already correct (for flipCard() calls)
        const shouldBeFlipped = this.isFlipped;
        const isCurrentlyFlipped = flashcard.classList.contains('flipped');
        
        if (shouldBeFlipped !== isCurrentlyFlipped) {
            // Use requestAnimationFrame only when state needs to change (for smooth flip animation)
            requestAnimationFrame(() => {
                if (this.isFlipped) {
                    flashcard.classList.add('flipped');
                } else {
                    flashcard.classList.remove('flipped');
                }
            });
        }
    }

    updateProgress() {
        const progressEl = document.getElementById('study-progress');
        if (progressEl) {
            progressEl.textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
        }
    }

    endStudy() {
        this.currentSetId = null;
        this.cards = [];
        this.currentIndex = 0;
        this.isFlipped = false;
    }

    getCurrentCard() {
        if (this.cards.length === 0) return null;
        return this.cards[this.currentIndex];
    }
}

