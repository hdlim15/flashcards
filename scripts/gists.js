// GitHub Gists API Integration
export class Gists {
    constructor(auth) {
        this.auth = auth;
        this.apiBase = 'https://api.github.com';
        this.gistFilename = 'flashcards-data.json';
        this.data = { sets: [] };
        this.gistId = null;
    }

    async loadData() {
        const token = this.auth.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            // First try loading by previously known gist id (most reliable on refresh).
            const cachedGistId = localStorage.getItem('flashcards_gist_id');
            if (cachedGistId) {
                const byIdResponse = await fetch(`${this.apiBase}/gists/${cachedGistId}`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (byIdResponse.ok) {
                    const gist = await byIdResponse.json();
                    if (gist.files && gist.files[this.gistFilename]) {
                        this.gistId = gist.id;
                        await this.loadDataFromGistFile(gist.files[this.gistFilename]);
                        localStorage.setItem('flashcards_cache', JSON.stringify(this.data));
                        localStorage.setItem('flashcards_gist_id', this.gistId);
                        return this.data;
                    }
                }
            }

            // Fallback: get user's gists (up to 100 to reduce false "missing gist" results)
            const response = await fetch(`${this.apiBase}/gists?per_page=100`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid token');
                }
                throw new Error(`Failed to load gists: ${response.statusText}`);
            }

            const gists = await response.json();
            
            // Find our flashcard gist
            const flashcardGist = gists.find(gist => 
                gist.files && gist.files[this.gistFilename]
            );

            if (flashcardGist) {
                this.gistId = flashcardGist.id;
                await this.loadDataFromGistFile(flashcardGist.files[this.gistFilename]);
            } else {
                // Create new gist
                await this.createGist();
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
                    this.gistId = localStorage.getItem('flashcards_gist_id');
                    // Validate cached data
                    if (!this.data.sets || !Array.isArray(this.data.sets)) {
                        this.data = { sets: [] };
                    }
                    console.warn('Loaded from cache due to error:', error);
                    return this.data;
                } catch (parseError) {
                    console.error('Failed to parse cached data:', parseError);
                    // Clear corrupted cache
                    localStorage.removeItem('flashcards_cache');
                    localStorage.removeItem('flashcards_gist_id');
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
            await this.createGist();
        }
    }

    async createGist() {
        const token = this.auth.getToken();
        const initialData = { sets: [] };

        const response = await fetch(`${this.apiBase}/gists`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Flashcards App Data',
                public: false,
                files: {
                    [this.gistFilename]: {
                        content: JSON.stringify(initialData, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create gist: ${response.statusText}`);
        }

        const gist = await response.json();
        this.gistId = gist.id;
        this.data = initialData;
        return gist;
    }

    async saveData() {
        const token = this.auth.getToken();
        if (!token || !this.gistId) {
            throw new Error('Not authenticated or no gist ID');
        }

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
        this.data = newData;
        return this.saveData();
    }
}

