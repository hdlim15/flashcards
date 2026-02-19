// Cantonese number to jyutping conversion
// Converts Arabic numerals to Cantonese jyutping romanization

const DIGITS = {
    0: 'ling4',
    1: 'jat1',
    2: 'ji6',
    3: 'saam1',
    4: 'sei3',
    5: 'ng5',
    6: 'lok6',
    7: 'cat1',
    8: 'baat3',
    9: 'gau2'
};

const TEN = 'sap6';
const HUNDRED = 'baak3';
const THOUSAND = 'cin1';
const TEN_THOUSAND = 'maan6';

/**
 * Converts a number to Cantonese jyutping
 * @param {number} num - The number to convert
 * @returns {string} - The jyutping representation
 */
export function numberToJyutping(num) {
    if (num === 0) return DIGITS[0];
    if (num < 0) return 'negative numbers not supported';
    
    const parts = [];
    
    // Handle ten thousands (10,000+)
    if (num >= 10000) {
        const tenThousands = Math.floor(num / 10000);
        if (tenThousands > 0) {
            if (tenThousands === 1) {
                parts.push('jat1');
            } else if (tenThousands < 10) {
                parts.push(DIGITS[tenThousands]);
            } else {
                // For numbers like 100003, we need to handle 10 ten-thousands
                const tensOfTenThousands = Math.floor(tenThousands / 10);
                const onesOfTenThousands = tenThousands % 10;
                if (tensOfTenThousands > 0) {
                    parts.push(DIGITS[tensOfTenThousands]);
                    parts.push(TEN);
                }
                if (onesOfTenThousands > 0) {
                    parts.push(DIGITS[onesOfTenThousands]);
                }
            }
            parts.push(TEN_THOUSAND);
        }
        num = num % 10000;
        
        // Add ling4 if there's a gap (e.g., 20304 -> ji6 maan6 ling4 saam1 baak3...)
        if (num > 0 && num < 1000) {
            parts.push('ling4');
        }
    }
    
    // Handle thousands (1,000-9,999)
    if (num >= 1000) {
        const thousands = Math.floor(num / 1000);
        if (thousands > 0) {
            parts.push(DIGITS[thousands]);
            parts.push(THOUSAND);
        }
        num = num % 1000;
        
        // Add ling4 if there's a gap (e.g., 103 -> jat1 cin1 ling4 saam1)
        if (num > 0 && num < 100) {
            parts.push('ling4');
        }
    }
    
    // Handle hundreds (100-999)
    if (num >= 100) {
        const hundreds = Math.floor(num / 100);
        if (hundreds > 0) {
            parts.push(DIGITS[hundreds]);
            parts.push(HUNDRED);
        }
        num = num % 100;
        
        // Add ling4 if there's a gap in tens place (e.g., 103 -> jat1 baak3 ling4 saam1)
        // Only add if tens digit is 0 but ones digit is not 0
        if (num > 0 && num < 10) {
            parts.push('ling4');
        }
    }
    
    // Handle tens and ones (0-99)
    if (num >= 10) {
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        
        if (tens > 0) {
            if (tens === 1) {
                parts.push(TEN);
            } else {
                parts.push(DIGITS[tens]);
                parts.push(TEN);
            }
        }
        
        if (ones > 0) {
            parts.push(DIGITS[ones]);
        }
    } else if (num > 0) {
        parts.push(DIGITS[num]);
    }
    
    return parts.join(' ');
}

/**
 * Generates a random number with equal weight to different ranges:
 * - 1-100 (inclusive)
 * - 101-1000 (inclusive)
 * - 1001-10000 (inclusive)
 * - 10001+ (up to 99999)
 * @returns {number} - Random number
 */
export function generateRandomNumber() {
    // Randomly select one of the 4 ranges with equal probability (25% each)
    const rangeIndex = Math.floor(Math.random() * 4);
    
    switch (rangeIndex) {
        case 0:
            // 1-100 (100 numbers)
            return Math.floor(Math.random() * 100) + 1;
        case 1:
            // 101-1000 (900 numbers)
            return Math.floor(Math.random() * 900) + 101;
        case 2:
            // 1001-10000 (9000 numbers)
            return Math.floor(Math.random() * 9000) + 1001;
        case 3:
            // 10001-99999 (90000 numbers)
            return Math.floor(Math.random() * 90000) + 10001;
        default:
            // Fallback (should never happen)
            return Math.floor(Math.random() * 99999) + 1;
    }
}

