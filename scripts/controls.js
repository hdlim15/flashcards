// Keyboard and Touch Controls
export class Controls {
    constructor(study) {
        this.study = study;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
    }

    attach() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Touch controls
        const cardContainer = document.getElementById('card-container');
        if (cardContainer) {
            cardContainer.addEventListener('touchstart', this.handleTouchStart);
            cardContainer.addEventListener('touchend', this.handleTouchEnd);
        }
    }

    detach() {
        document.removeEventListener('keydown', this.handleKeyDown);
        
        const cardContainer = document.getElementById('card-container');
        if (cardContainer) {
            cardContainer.removeEventListener('touchstart', this.handleTouchStart);
            cardContainer.removeEventListener('touchend', this.handleTouchEnd);
        }
    }

    handleKeyDown = (e) => {
        // Only handle if we're on the study screen
        const studyScreen = document.getElementById('study-screen');
        if (!studyScreen || studyScreen.classList.contains('hidden')) {
            return;
        }

        // Don't handle if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                this.study.flipCard();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.study.previousCard();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.study.nextCard();
                break;
        }
    }

    handleTouchStart = (e) => {
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    handleTouchEnd = (e) => {
        const touch = e.changedTouches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;
        
        this.handleSwipe();
    }

    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Determine if it's a horizontal or vertical swipe
        if (absDeltaX > absDeltaY && absDeltaX > this.minSwipeDistance) {
            // Horizontal swipe
            if (deltaX > 0) {
                // Swipe right - next card
                this.study.nextCard();
            } else {
                // Swipe left - previous card
                this.study.previousCard();
            }
        } else if (absDeltaY > absDeltaX && absDeltaY > this.minSwipeDistance) {
            // Vertical swipe
            if (deltaY > 0) {
                // Swipe down - flip card
                this.study.flipCard();
            } else {
                // Swipe up - flip card
                this.study.flipCard();
            }
        }
    }
}

