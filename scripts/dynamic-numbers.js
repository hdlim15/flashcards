// Dynamic Numbers Flashcard Set
// Generates random numbers and converts them to Cantonese jyutping
// Does not read or write to gist

import { numberToJyutping, generateRandomNumber } from './cantonese-numbers.js';

export class DynamicNumbers {
    constructor() {
        this.setId = 'DYNAMIC_NUMBERS';
        this.setName = 'Numbers';
        this.isDynamic = true;
    }

    /**
     * Generates a new card with a random number
     * @returns {Object} Card object with front (number) and back (jyutping)
     */
    generateCard() {
        const number = generateRandomNumber(0, 99999);
        const jyutping = numberToJyutping(number);
        
        return {
            id: `dynamic_${Date.now()}_${Math.random()}`,
            front: number.toString(),
            back: jyutping
        };
    }

    /**
     * Gets the set info (for display in dashboard)
     * @returns {Object} Set object
     */
    getSetInfo() {
        return {
            id: this.setId,
            name: this.setName,
            cards: [], // Empty array since cards are generated dynamically
            isDynamic: true
        };
    }

    /**
     * Checks if a set ID is the dynamic numbers set
     * @param {string} setId - Set ID to check
     * @returns {boolean}
     */
    isDynamicSet(setId) {
        return setId === this.setId;
    }
}

