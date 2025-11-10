const { ipcRenderer } = require('electron');

console.log('ReadVoyage renderer loaded');

const Storage = {
    getLibrary() {
        try {
            return JSON.parse(localStorage.getItem('readvoyage-library')) || [];
        } catch {
            return [];
        }
    },

    saveLibrary(library) {
        localStorage.setItem('readvoyage-library', JSON.stringify(library));
    },

    addBook(book) {
        const library = this.getLibrary();
        library.push(book);
        this.saveLibrary(library);
        return library;
    },

    deleteBook(bookId) {
        const library = this.getLibrary().filter(book => book.id !== bookId);
        this.saveLibrary(library);
        return library;
    },

    clearLibrary() {
        this.saveLibrary([]);
        return [];
    },

    getStats() {
        const library = this.getLibrary();
        return {
            total: library.length,
            reading: library.filter(book => book.status === 'reading').length,
            completed: library.filter(book => book.status === 'completed').length,
            unread: library.filter(book => book.status === 'unread').length
        };
    }
};


function showPage(page) {
    console.log('Switching to page:', page);
    
    
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('search-content').style.display = 'none';
    document.getElementById('library-content').style.display = 'none';
    
    
    document.getElementById(`${page}-content`).style.display = 'block';
    
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).parentElement.classList.add('active');
    
   
    document.getElementById('page-title').textContent = 
        page === 'dashboard' ? 'Dashboard' : 
        page === 'search' ? 'Search Books' : 'My Library';
    
   
    if (page === 'library') {
        displayBooks();
    }
    
    updateStats();
}


function displayBooks() {
    const booksList = document.getElementById('books-list');
    const library = Storage.getLibrary();
    
    if (library.length === 0) {
        booksList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📚</span>
                <h4>Your library is empty</h4>
                <p>Add some books to get started with your reading journey!</p>
                <button class="btn btn-primary" id="add-first-book">Add Your First Book</button>
            </div>`;
        
        document.getElementById('add-first-book').addEventListener('click', () => {
            showPage('search');
        });
    } else {
        booksList.innerHTML = library.map(book => `
            <div class="book-card">
                <div class="book-header">
                    <h3>${book.title}</h3>
                    <span class="book-status ${book.status}">${book.status}</span>
                </div>
                <div class="book-details">
                    <p><strong>Author:</strong> ${book.author}</p>
                    ${book.category ? `<p><strong>Category:</strong> ${book.category}</p>` : ''}
                    ${book.pages ? `<p><strong>Pages:</strong> ${book.pages}</p>` : ''}
                    ${book.description ? `<p><strong>Notes:</strong> ${book.description}</p>` : ''}
                </div>
                <div class="book-actions">
                    ${book.status !== 'completed' ? `
                        <button class="btn btn-primary" onclick="markAsCompleted('${book.id}')">
                            ✓ Done Read
                        </button>
                    ` : ''}
                    <button class="btn btn-outline" onclick="deleteBook('${book.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function markAsCompleted(bookId) {
    const library = Storage.getLibrary();
    const bookIndex = library.findIndex(book => book.id === bookId);
    
    if (bookIndex !== -1) {
        library[bookIndex].status = 'completed';
        library[bookIndex].lastUpdated = new Date().toISOString();
        Storage.saveLibrary(library);
        
        alert(`"${library[bookIndex].title}" marked as completed! 📖✅`);
        displayBooks();
        updateStats();  
    }
}

function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        Storage.deleteBook(bookId);
        displayBooks();
        updateStats();
        alert('Book deleted!');
    }
}

function updateStats() {
    const stats = Storage.getStats();
    console.log('Updating stats:', stats);
    
    const totalBooksElement = document.getElementById('total-books');
    const booksReadElement = document.getElementById('books-read');
    
    if (totalBooksElement) totalBooksElement.textContent = stats.total;
    if (booksReadElement) booksReadElement.textContent = stats.completed;
    
    const dashboardTotalElement = document.getElementById('dashboard-total-books');
    const dashboardCompletedElement = document.getElementById('dashboard-completed');
    
    if (dashboardTotalElement) dashboardTotalElement.textContent = stats.total;
    if (dashboardCompletedElement) dashboardCompletedElement.textContent = stats.completed;
    
    const statTotalElement = document.getElementById('stat-total');
    const statReadingElement = document.getElementById('stat-reading');
    const statCompletedElement = document.getElementById('stat-completed');
    
    if (statTotalElement) statTotalElement.textContent = stats.total;
    if (statReadingElement) statReadingElement.textContent = stats.reading;
    if (statCompletedElement) statCompletedElement.textContent = stats.completed;
    
    console.log('Stats updated successfully');
}

async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    try {
        resultsDiv.innerHTML = '<div class="loading">Searching...</div>';
        
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
        const data = await response.json();
        const results = data.docs || [];
        
        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="empty-state">No results found</div>';
            return;
        }
        
        resultsDiv.innerHTML = results.map(book => `
            <div class="search-result-item">
                <div class="book-cover">
                    ${book.cover_i ? 
                        `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" 
                              alt="${book.title}" 
                              class="book-cover-image"
                              onerror="this.style.display='none'">` :
                        `<div class="book-cover-placeholder">📚</div>`
                    }
                </div>
                <div class="book-info">
                    <h4>${book.title || 'Unknown Title'}</h4>
                    <p><strong>Author:</strong> ${book.author_name ? book.author_name.join(', ') : 'Unknown'}</p>
                    <p><strong>Published:</strong> ${book.first_publish_year || 'Unknown'}</p>
                    ${book.isbn ? `<p><strong>ISBN:</strong> ${book.isbn[0]}</p>` : ''}
                </div>
                <div class="search-result-actions">
                    <button class="btn btn-primary" onclick="addBookFromSearch(${JSON.stringify(book).replace(/"/g, '&quot;')})">
                        Add to Library
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        resultsDiv.innerHTML = '<div class="error">Search failed</div>';
    }
}

function displayBooks() {
    const booksList = document.getElementById('books-list');
    const library = Storage.getLibrary();
    
    if (library.length === 0) {
        booksList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📚</span>
                <h4>Your library is empty</h4>
                <p>Add some books to get started with your reading journey!</p>
                <button class="btn btn-primary" id="add-first-book">Add Your First Book</button>
            </div>`;
        
        document.getElementById('add-first-book').addEventListener('click', () => {
            showPage('search');
        });
    } else {
        booksList.innerHTML = library.map(book => `
            <div class="book-card">
                <div class="book-cover">
                    ${book.coverId ? 
                        `<img src="https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg" 
                              alt="${book.title}" 
                              class="book-cover-image"
                              onerror="this.style.display='none'">` :
                        `<div class="book-cover-placeholder">📚</div>`
                    }
                </div>
                <div class="book-content">
                    <div class="book-header">
                        <h3>${book.title}</h3>
                        <span class="book-status ${book.status}">${book.status}</span>
                    </div>
                    <div class="book-details">
                        <p><strong>Author:</strong> ${book.author}</p>
                        ${book.category ? `<p><strong>Category:</strong> ${book.category}</p>` : ''}
                        ${book.pages ? `<p><strong>Pages:</strong> ${book.pages}</p>` : ''}
                        ${book.description ? `<p><strong>Notes:</strong> ${book.description}</p>` : ''}
                    </div>
                    <div class="book-actions">
                        ${book.status !== 'completed' ? `
                            <button class="btn btn-primary" onclick="markAsCompleted('${book.id}')">
                                ✓ Done Read
                            </button>
                        ` : ''}
                        <button class="btn btn-outline" onclick="deleteBook('${book.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function addBookFromSearch(bookData) {
    console.log('Book data received:', bookData);
    
    const book = {
        id: Date.now().toString(),
        title: bookData.title || 'Unknown Title',
        author: bookData.author_name ? bookData.author_name.join(', ') : 'Unknown Author',
        isbn: bookData.isbn ? bookData.isbn[0] : '',
        pages: bookData.number_of_pages_median || '',
        category: 'fiction',
        status: 'unread',
        description: '',
        coverId: bookData.cover_i || null, 
        publishedYear: bookData.first_publish_year || '',
        addedDate: new Date().toISOString()
    };
    
    console.log('Book being saved:', book);
    
    Storage.addBook(book);
    alert(`"${book.title}" added to library!`);
    updateStats();
    showPage('library');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.getAttribute('data-page'));
        });
    });
    
    document.getElementById('add-book-btn').addEventListener('click', () => {
        ipcRenderer.send('open-add-book-window');
    });
    
    document.getElementById('search-button').addEventListener('click', performSearch);
    
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    document.getElementById('clear-library').addEventListener('click', () => {
        if (confirm('Clear entire library?')) {
            Storage.clearLibrary();
            displayBooks();
            updateStats(); 
            alert('Library cleared!');
        }
    });
    
    document.getElementById('export-library').addEventListener('click', () => {
        const library = Storage.getLibrary();
        if (library.length === 0) {
            alert('No books to export');
            return;
        }
        
        const data = JSON.stringify(library, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-library.json';
        a.click();
        alert('Library exported!');
    });
    
    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
    });
}

ipcRenderer.on('book:add', (event, bookData) => {
    const book = {
        id: Date.now().toString(),
        ...bookData,
        addedDate: new Date().toISOString()
    };
    
    Storage.addBook(book);
    alert(`"${book.title}" added to library!`);
    
    updateStats();
    
    if (document.getElementById('library-content').style.display !== 'none') {
        displayBooks();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing app');
    setupEventListeners();
    updateStats();
    displayBooks();
});

window.performSearch = performSearch;
window.addBookFromSearch = addBookFromSearch;
window.deleteBook = deleteBook;
window.showPage = showPage;
window.updateStats = updateStats;