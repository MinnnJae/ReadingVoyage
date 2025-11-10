class OpenLibraryAPI {
    constructor() {
        this.baseURL = 'https://openlibrary.org';
        this.searchCache = new Map();
    }

    async searchAuthorsBasic(query) {
        try {
            const response = await fetch(
                `${this.baseURL}/search/authors.json?q=${encodeURIComponent(query)}&limit=10`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.docs || [];
        } catch (error) {
            console.error('Error fetching authors:', error);
            this.showError('Failed to fetch authors. Please check your connection and try again.');
            return [];
        }
    }

    async searchBooksBasic(query) {
        try {
            const response = await fetch(
                `${this.baseURL}/search.json?q=${encodeURIComponent(query)}&limit=20`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.docs || [];
        } catch (error) {
            console.error('Error fetching books:', error);
            this.showError('Failed to fetch books. Please check your connection and try again.');
            return [];
        }
    }

    async getAuthorDetails(authorKey) {
        try {
            const response = await fetch(`${this.baseURL}/authors/${authorKey}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching author details:', error);
            return null;
        }
    }

    getCoverUrl(coverId, size = 'M') {
        if (!coverId) return null;
        return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
    }

    displayResultsInHTML(data, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🔍</span>
                    <h4>No results found</h4>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.map((item, index) => `
            <div class="book-item" data-index="${index}">
                <div class="book-header">
                    <h4>${item.title || item.name}</h4>
                    ${item.author_name ? `<p class="book-author">by ${item.author_name.join(', ')}</p>` : ''}
                </div>
                <div class="book-details">
                    ${item.birth_date ? `<p><strong>Born:</strong> ${item.birth_date}</p>` : ''}
                    ${item.first_publish_year ? `<p><strong>First Published:</strong> ${item.first_publish_year}</p>` : ''}
                    ${item.subject ? `<p><strong>Subjects:</strong> ${item.subject.slice(0, 3).join(', ')}</p>` : ''}
                </div>
                <div class="book-actions">
                    <button class="btn btn-primary btn-sm" onclick="addBookFromSearch(${index})">
                        Add to Library
                    </button>
                </div>
            </div>
        `).join('');

        this.searchCache.set(containerId, data);
    }

    async performSearch(query, searchType) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Searching for "${query}"...</p>
            </div>
        `;

        try {
            let results;
            if (searchType === 'authors') {
                results = await this.searchAuthorsBasic(query);
            } else {
                results = await this.searchBooksBasic(query);
            }

            this.displayResultsInHTML(results, 'search-results');
            
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <span class="error-icon">⚠️</span>
                    <h4>Search failed</h4>
                    <p>Please check your connection and try again</p>
                </div>
            `;
        }
    }

    showError(message) {
        alert(`API Error: ${message}`);
    }

    getCachedResults(containerId) {
        return this.searchCache.get(containerId) || [];
    }
}

const openLibraryAPI = new OpenLibraryAPI();

window.performSearch = function() {
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-type').value;
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    openLibraryAPI.performSearch(query, searchType);
};

window.addBookFromSearch = function(index) {
    const results = openLibraryAPI.getCachedResults('search-results');
    const item = results[index];
    
    if (!item) {
        alert('Book data not found');
        return;
    }

    const bookData = {
        id: Helpers.generateId(),
        title: item.title || item.name,
        author: item.author_name ? item.author_name.join(', ') : 'Unknown Author',
        firstPublishYear: item.first_publish_year || null,
        subjects: item.subject || [],
        addedDate: new Date().toISOString(),
        status: 'unread',
        category: 'other'
    };

    if (window.electronAPI) {
        window.electronAPI.addBook(bookData);
    } else {
        Helpers.showSuccess(`"${bookData.title}" added to library!`);
        console.log('Book added:', bookData);
    }
};

window.demonstrateFetchAPI = async function() {
    const output = document.getElementById('demo-output');
    if (!output) return;

    output.innerHTML = '<div class="loading-state">Fetching data from OpenLibrary API...</div>';

    try {
        const response = await fetch('https://openlibrary.org/search.json?q=javascript&limit=3');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        output.innerHTML = `<strong>Fetch API Example:</strong>\n\n` +
                          `URL: https://openlibrary.org/search.json?q=javascript&limit=3\n\n` +
                          `Response status: ${response.status}\n\n` +
                          `Found ${data.docs.length} books:\n\n` +
                          data.docs.map(book => 
                              `• "${book.title}" by ${book.author_name ? book.author_name[0] : 'Unknown'}\n`
                          ).join('');

    } catch (error) {
        output.innerHTML = `<strong>Fetch API Error:</strong>\n\n${error.message}`;
    }
};