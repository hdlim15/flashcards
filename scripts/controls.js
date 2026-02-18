// Keyboard and Touch Controls
export class Controls {
    constructor(study) {
        this.study = study;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        this.isSwiping = false;
        this.swipeState = null; // 'know', 'dont-know', or null
        this.touchStarted = false;
        this.trackProgress = false; // Track progress toggle state
    }

    setTrackProgress(enabled) {
        this.trackProgress = enabled;
        this.updateReturnButtonVisibility();
    }

    updateReturnButtonVisibility() {
        const returnBtn = document.getElementById('return-card-btn');
        if (returnBtn) {
            // On mobile, always show. On desktop, only show when track progress is on
            if (window.innerWidth >= 768) {
                returnBtn.style.display = this.trackProgress ? 'flex' : 'none';
            }
        }
    }

    attach() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Touch controls
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('touchstart', this.handleTouchStart, { passive: true });
            flashcard.addEventListener('touchmove', this.handleTouchMove, { passive: true });
            flashcard.addEventListener('touchend', this.handleTouchEnd, { passive: true });
            flashcard.addEventListener('touchcancel', this.handleTouchCancel, { passive: true });
            // Tap to flip
            flashcard.addEventListener('click', this.handleTap);
        }
        
        // Handle window resize to update return button visibility
        window.addEventListener('resize', this.handleResize);
        this.updateReturnButtonVisibility();
    }

    detach() {
        document.removeEventListener('keydown', this.handleKeyDown);
        
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.removeEventListener('touchstart', this.handleTouchStart);
            flashcard.removeEventListener('touchmove', this.handleTouchMove);
            flashcard.removeEventListener('touchend', this.handleTouchEnd);
            flashcard.removeEventListener('touchcancel', this.handleTouchCancel);
            flashcard.removeEventListener('click', this.handleTap);
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        // Clear any swipe state
        this.clearSwipeState();
    }

    handleResize = () => {
        this.updateReturnButtonVisibility();
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
                if (this.trackProgress) {
                    // Mark as "don't know" (orange outline)
                    this.showKnowState('dont-know');
                } else {
                    // Go to previous card
                    this.study.previousCard();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (this.trackProgress) {
                    // Mark as "know" (green outline)
                    this.showKnowState('know');
                } else {
                    // Go to next card
                    this.study.nextCard();
                }
                break;
        }
    }

    showKnowState(state) {
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.classList.remove('swipe-know', 'swipe-dont-know');
            if (state === 'know') {
                flashcard.classList.add('swipe-know');
            } else if (state === 'dont-know') {
                flashcard.classList.add('swipe-dont-know');
            }
            // Clear after a delay and move to next card
            setTimeout(() => {
                this.clearSwipeState();
                // Move to next card after marking
                this.study.nextCard();
            }, 300);
        }
    }

    handleTouchStart = (e) => {
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.isSwiping = false;
        this.swipeState = null;
        this.touchStarted = true;
    }

    handleTouchMove = (e) => {
        if (!e.touches[0]) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Only consider horizontal swipes
        if (absDeltaX > absDeltaY && absDeltaX > 10) {
            this.isSwiping = true;
            const flashcard = document.getElementById('flashcard');
            if (flashcard) {
                // Move the card with the swipe, preserving flip state
                const translateX = deltaX;
                const isFlipped = flashcard.classList.contains('flipped');
                const flipTransform = isFlipped ? 'rotateY(180deg) ' : '';
                flashcard.style.transform = `${flipTransform}translateX(${translateX}px)`;
                flashcard.style.transition = 'none'; // Disable transition during drag
                
                // Only show border/glow if swipe distance exceeds threshold
                if (absDeltaX > this.minSwipeDistance) {
                    // Remove previous state
                    flashcard.classList.remove('swipe-know', 'swipe-dont-know');
                    
                    if (this.trackProgress) {
                        // Track progress mode: swipe right = know, swipe left = don't know
                        if (deltaX > 0) {
                            // Swipe right - "know" (green)
                            this.swipeState = 'know';
                            flashcard.classList.add('swipe-know');
                        } else {
                            // Swipe left - "don't know" (orange)
                            this.swipeState = 'dont-know';
                            flashcard.classList.add('swipe-dont-know');
                        }
                    }
                } else {
                    // Not far enough yet, remove any visual state
                    flashcard.classList.remove('swipe-know', 'swipe-dont-know');
                    this.swipeState = null;
                }
            }
        }
    }

    handleTouchEnd = (e) => {
        const touch = e.changedTouches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;
        
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        const flashcard = document.getElementById('flashcard');
        
        // Reset card position with smooth transition, preserving flip state
        if (flashcard) {
            const isFlipped = flashcard.classList.contains('flipped');
            const flipTransform = isFlipped ? 'rotateY(180deg)' : '';
            flashcard.style.transition = 'transform 0.3s ease-out';
            flashcard.style.transform = flipTransform;
        }
        
        if (this.isSwiping && absDeltaX > this.minSwipeDistance) {
            // Horizontal swipe detected
            if (this.trackProgress) {
                // Track progress mode: show visual feedback, then move to next card
                setTimeout(() => {
                    this.clearSwipeState();
                    // Move to next card after marking
                    this.study.nextCard();
                }, 300);
            } else {
                // Normal mode: navigate cards
                this.clearSwipeState();
                if (deltaX > 0) {
                    // Swipe right - previous card
                    this.study.previousCard();
                } else {
                    // Swipe left - next card
                    this.study.nextCard();
                }
            }
        } else {
            // Not a swipe or insufficient distance - snap back
            this.clearSwipeState();
            
            // If movement was very small, treat as tap
            if (absDeltaX < 10 && absDeltaY < 10 && !this.isSwiping) {
                // Small tap - flip the card
                // Prevent click event from firing
                e.preventDefault();
                this.study.flipCard();
            }
        }
        
        this.isSwiping = false;
        // Reset after a short delay to allow click prevention
        setTimeout(() => {
            this.touchStarted = false;
            // Re-enable flip transition after swipe animation
            if (flashcard) {
                flashcard.style.transition = '';
            }
        }, 300);
    }

    handleTouchCancel = () => {
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            const isFlipped = flashcard.classList.contains('flipped');
            const flipTransform = isFlipped ? 'rotateY(180deg)' : '';
            flashcard.style.transition = 'transform 0.3s ease-out';
            flashcard.style.transform = flipTransform;
        }
        this.clearSwipeState();
        this.isSwiping = false;
    }

    handleTap = (e) => {
        // Only handle tap on desktop (mouse click), not touch events
        // Touch events are handled in handleTouchEnd
        if (!this.touchStarted && !('ontouchstart' in window)) {
            this.study.flipCard();
        }
    }

    clearSwipeState() {
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.classList.remove('swipe-know', 'swipe-dont-know');
            // Reset transform if not already reset, preserving flip state
            if (flashcard.style.transform && !flashcard.style.transform.includes('rotateY')) {
                const isFlipped = flashcard.classList.contains('flipped');
                const flipTransform = isFlipped ? 'rotateY(180deg)' : '';
                flashcard.style.transition = 'transform 0.3s ease-out';
                flashcard.style.transform = flipTransform;
            }
        }
        this.swipeState = null;
    }
}

