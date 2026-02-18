// GitHub Gists API Integration (Hardcoded gist ID, auth required for writes)
export class Gists {
    constructor(auth) {
        this.auth = auth;
        this.apiBase = 'https://api.github.com';
        this.gistFilename = 'flashcards-data.json';
        this.data = { sets: [] };
        // Hardcoded gist ID: https://gist.github.com/hdlim15/36c3db73fd4c3f09bbce5a495c0e4cd2
        this.gistId = '36c3db73fd4c3f09bbce5a495c0e4cd2';
    }

    async loadData() {
        try {
            // Load from hardcoded public gist (no auth required)
            const response = await fetch(`${this.apiBase}/gists/${this.gistId}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load gist: ${response.statusText}`);
            }

            const gist = await response.json();
            
            if (gist.files && gist.files[this.gistFilename]) {
                await this.loadDataFromGistFile(gist.files[this.gistFilename]);
            } else {
                throw new Error('Flashcard data file not found in gist');
            }

            // Cache in localStorage as backup
            localStorage.setItem('flashcards_cache', JSON.stringify(this.data));
            localStorage.setItem('flashcards_gist_id', this.gistId);

            return this.data;
        } catch (error) {
            // Try to load from cache
            const cached = localStorage.getItem('flashcards_cache');
            if (cached) {
                try {
                    this.data = JSON.parse(cached);
                    // Validate cached data
                    if (!this.data.sets || !Array.isArray(this.data.sets)) {
                        this.data = { sets: [] };
                    }
                    console.warn('Loaded from cache due to error:', error);
                    return this.data;
                } catch (parseError) {
                    console.error('Failed to parse cached data:', parseError);
                    localStorage.removeItem('flashcards_cache');
                }
            }
            throw error;
        }
    }

    async loadDataFromGistFile(gistFile) {
        try {
            // List responses can omit/truncate file content, so use raw_url when needed.
            let fileContent = gistFile.content;
            if (!fileContent && gistFile.raw_url) {
                const rawResponse = await fetch(gistFile.raw_url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });
                if (!rawResponse.ok) {
                    throw new Error('Failed to read gist file content');
                }
                fileContent = await rawResponse.text();
            }

            this.data = JSON.parse(fileContent || '{"sets":[]}');
            if (!this.data.sets || !Array.isArray(this.data.sets)) {
                this.data = { sets: [] };
            }
        } catch (parseError) {
            console.error('Failed to parse gist data:', parseError);
            // Fallback to empty data if parsing fails
            this.data = { sets: [] };
        }
    }

    // Note: createGist removed - using hardcoded public gist only

    async saveData() {
        const token = this.auth.getToken();
        if (!token) {
            throw new Error('Not authenticated - cannot save to gist');
        }

        this.data = this.sanitizeData(this.data);

        // Validate data before saving
        if (!this.data || !this.data.sets || !Array.isArray(this.data.sets)) {
            throw new Error('Invalid data structure');
        }

        try {
            const response = await fetch(`${this.apiBase}/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: 'Flashcards App Data',
                    files: {
                        [this.gistFilename]: {
                            content: JSON.stringify(this.data, null, 2)
                        }
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid token');
                }
                throw new Error(`Failed to save: ${response.statusText}`);
            }

            // Update cache
            localStorage.setItem('flashcards_cache', JSON.stringify(this.data));
            localStorage.setItem('flashcards_gist_id', this.gistId);

            return await response.json();
        } catch (error) {
            // Update cache even if save fails
            localStorage.setItem('flashcards_cache', JSON.stringify(this.data));
            throw error;
        }
    }

    getData() {
        return this.data;
    }

    updateData(newData) {
        this.data = this.sanitizeData(newData);
        return this.saveData();
    }

    sanitizeData(data) {
        const safeData = data && Array.isArray(data.sets) ? data : { sets: [] };
        return {
            sets: safeData.sets.map((set) => ({
                ...set,
                name: (set.name || '').trim(),
                cards: (Array.isArray(set.cards) ? set.cards : []).filter((card) => {
                    const front = (card.front || '').trim();
                    const back = (card.back || '').trim();
                    return front.length > 0 && back.length > 0;
                }).map((card) => ({
                    ...card,
                    front: (card.front || '').trim(),
                    back: (card.back || '').trim()
                }))
            }))
        };
    }

    getGistUrl() {
        return `https://gist.github.com/hdlim15/${this.gistId}`;
    }
}

