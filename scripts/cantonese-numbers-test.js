// Unit tests for Cantonese number to jyutping conversion
// This file contains test cases for the number conversion logic

// Test cases organized by number range

const testCases = [
    // Basic numbers 0-10
    { number: 0, expected: 'ling4' },
    { number: 1, expected: 'jat1' },
    { number: 2, expected: 'ji6' },
    { number: 3, expected: 'saam1' },
    { number: 4, expected: 'sei3' },
    { number: 5, expected: 'ng5' },
    { number: 6, expected: 'lok6' },
    { number: 7, expected: 'cat1' },
    { number: 8, expected: 'baat3' },
    { number: 9, expected: 'gau2' },
    { number: 10, expected: 'sap6' },
    
    // 11-19
    { number: 11, expected: 'sap6 jat1' },
    { number: 12, expected: 'sap6 ji6' },
    { number: 13, expected: 'sap6 saam1' },
    { number: 14, expected: 'sap6 sei3' },
    { number: 15, expected: 'sap6 ng5' },
    { number: 16, expected: 'sap6 lok6' },
    { number: 17, expected: 'sap6 cat1' },
    { number: 18, expected: 'sap6 baat3' },
    { number: 19, expected: 'sap6 gau2' },
    
    // 20-99 (tens)
    { number: 20, expected: 'ji6 sap6' },
    { number: 21, expected: 'ji6 sap6 jat1' },
    { number: 25, expected: 'ji6 sap6 ng5' },
    { number: 30, expected: 'saam1 sap6' },
    { number: 33, expected: 'saam1 sap6 saam1' },
    { number: 40, expected: 'sei3 sap6' },
    { number: 50, expected: 'ng5 sap6' },
    { number: 99, expected: 'gau2 sap6 gau2' },
    
    // 100-999 (hundreds)
    { number: 100, expected: 'jat1 baak3' },
    { number: 101, expected: 'jat1 baak3 ling4 jat1' },
    { number: 103, expected: 'jat1 baak3 ling4 saam1' },
    { number: 110, expected: 'jat1 baak3 sap6' },
    { number: 111, expected: 'jat1 baak3 sap6 jat1' },
    { number: 120, expected: 'jat1 baak3 ji6 sap6' },
    { number: 125, expected: 'jat1 baak3 ji6 sap6 ng5' },
    { number: 200, expected: 'ji6 baak3' },
    { number: 201, expected: 'ji6 baak3 ling4 jat1' },
    { number: 210, expected: 'ji6 baak3 sap6' },
    { number: 250, expected: 'ji6 baak3 ng5 sap6' },
    { number: 999, expected: 'gau2 baak3 gau2 sap6 gau2' },
    
    // 1000-9999 (thousands)
    { number: 1000, expected: 'jat1 cin1' },
    { number: 1001, expected: 'jat1 cin1 ling4 jat1' },
    { number: 1010, expected: 'jat1 cin1 sap6' },
    { number: 1011, expected: 'jat1 cin1 sap6 jat1' },
    { number: 1020, expected: 'jat1 cin1 ji6 sap6' },
    { number: 1100, expected: 'jat1 cin1 jat1 baak3' },
    { number: 1101, expected: 'jat1 cin1 jat1 baak3 ling4 jat1' },
    { number: 1111, expected: 'jat1 cin1 jat1 baak3 sap6 jat1' },
    { number: 2000, expected: 'ji6 cin1' },
    { number: 2001, expected: 'ji6 cin1 ling4 jat1' },
    { number: 2010, expected: 'ji6 cin1 sap6' },
    { number: 2100, expected: 'ji6 cin1 jat1 baak3' },
    { number: 2030, expected: 'ji6 cin1 ling4 saam1 sap6' },
    { number: 2034, expected: 'ji6 cin1 ling4 saam1 sap6 sei3' },
    { number: 2304, expected: 'ji6 cin1 saam1 baak3 ling4 sei3' },
    { number: 20304, expected: 'ji6 maan6 ling4 saam1 baak3 ling4 sei3' },
    { number: 9999, expected: 'gau2 cin1 gau2 baak3 gau2 sap6 gau2' },
    
    // 10000+ (ten thousands)
    { number: 10000, expected: 'jat1 maan6' },
    { number: 10001, expected: 'jat1 maan6 ling4 jat1' },
    { number: 10010, expected: 'jat1 maan6 sap6' },
    { number: 10100, expected: 'jat1 maan6 jat1 baak3' },
    { number: 10101, expected: 'jat1 maan6 jat1 baak3 ling4 jat1' },
    { number: 11000, expected: 'jat1 maan6 jat1 cin1' },
    { number: 11001, expected: 'jat1 maan6 jat1 cin1 ling4 jat1' },
    { number: 11111, expected: 'jat1 maan6 jat1 cin1 jat1 baak3 sap6 jat1' },
    { number: 20000, expected: 'ji6 maan6' },
    { number: 20100, expected: 'ji6 maan6 jat1 baak3' },
    { number: 20101, expected: 'ji6 maan6 jat1 baak3 ling4 jat1' },
    { number: 20304, expected: 'ji6 maan6 ling4 saam1 baak3 ling4 sei3' },
    { number: 23040, expected: 'ji6 maan6 saam1 cin1 ling4 sei3 sap6' },
    { number: 23456, expected: 'ji6 maan6 saam1 cin1 sei3 baak3 ng5 sap6 lok6' },
    { number: 99999, expected: 'gau2 maan6 gau2 cin1 gau2 baak3 gau2 sap6 gau2' },
    
    // Edge cases with multiple zeros
    { number: 1003, expected: 'jat1 cin1 ling4 saam1' },
    { number: 1030, expected: 'jat1 cin1 ling4 saam1 sap6' },
    { number: 1300, expected: 'jat1 cin1 saam1 baak3' },
    { number: 10003, expected: 'jat1 maan6 ling4 saam1' },
    { number: 10030, expected: 'jat1 maan6 ling4 saam1 sap6' },
    { number: 10300, expected: 'jat1 maan6 ling4 saam1 baak3' },
    { number: 13000, expected: 'jat1 maan6 saam1 cin1' },
    { number: 100003, expected: 'jat1 sap6 maan6 ling4 saam1' },
];

// Helper function to run tests (for manual review)
function runTests() {
    console.log('Cantonese Number Conversion Test Cases\n');
    console.log('='.repeat(60));
    
    testCases.forEach((test, index) => {
        console.log(`Test ${index + 1}: ${test.number} -> "${test.expected}"`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`Total test cases: ${testCases.length}`);
}

// Export for use in implementation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testCases, runTests };
}

// Run tests if executed directly
if (typeof window === 'undefined') {
    runTests();
}

