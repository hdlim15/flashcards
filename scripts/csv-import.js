// CSV Import functionality
export class CSVImport {
    constructor(sets) {
        this.sets = sets;
    }

    parseCSV(text) {
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        // Try to detect delimiter (comma, semicolon, or tab)
        const firstLine = lines[0];
        let delimiter = ',';
        if (firstLine.includes(';') && !firstLine.includes(',')) {
            delimiter = ';';
        } else if (firstLine.includes('\t')) {
            delimiter = '\t';
        }

        // Parse header (optional)
        const header = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
        const hasHeader = header[0] === 'front' || header[0] === 'question' || 
                         header[1] === 'back' || header[1] === 'answer';

        let startIndex = hasHeader ? 1 : 0;
        const cards = [];

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            // Handle quoted fields
            const parts = this.parseCSVLine(line, delimiter);
            
            if (parts.length < 2) {
                console.warn(`Skipping line ${i + 1}: insufficient columns`);
                continue;
            }

            const front = this.unescapeCSV(parts[0].trim());
            const back = this.unescapeCSV(parts[1].trim());

            if (!front && !back) {
                continue; // Skip empty rows
            }

            cards.push({ front, back });
        }

        if (cards.length === 0) {
            throw new Error('No valid cards found in CSV file');
        }

        return cards;
    }

    parseCSVLine(line, delimiter) {
        const parts = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                // End of field
                parts.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        // Add last field
        parts.push(current);
        return parts;
    }

    unescapeCSV(text) {
        // Remove surrounding quotes if present
        if (text.startsWith('"') && text.endsWith('"')) {
            text = text.slice(1, -1);
        }
        // Replace escaped quotes
        text = text.replace(/""/g, '"');
        return text;
    }

    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const text = e.target.result;
                    const cards = this.parseCSV(text);
                    resolve(cards);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    async createSetFromCSV(cards, setName) {
        const data = this.sets.gists.getData();
        const newSet = {
            id: Date.now().toString(),
            name: setName,
            cards: cards.map((card, index) => ({
                id: `${Date.now()}_${index}`,
                front: card.front,
                back: card.back
            }))
        };

        data.sets.push(newSet);
        
        try {
            await this.sets.gists.updateData(data);
            this.sets.renderSets();
            return newSet;
        } catch (error) {
            throw error;
        }
    }

    async appendCardsToSet(setId, cards) {
        const data = this.sets.gists.getData();
        const targetSet = data.sets.find(set => set.id === setId);
        if (!targetSet) {
            throw new Error('Set not found');
        }

        const now = Date.now();
        const importedCards = cards.map((card, index) => ({
            id: `${now}_${index}`,
            front: card.front,
            back: card.back
        }));

        targetSet.cards.push(...importedCards);
        await this.sets.gists.updateData(data);
        return importedCards.length;
    }
}

