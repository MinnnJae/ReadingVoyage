console.log("✅ ReadVoyage unified script loaded");

let books = JSON.parse(localStorage.getItem("books")) || [];

let readingChallenge = JSON.parse(localStorage.getItem("readingChallenge")) || {
    target: 12,
    booksRead: 0
};

document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 DOM fully loaded - initializing ReadVoyage");
    initializeApp();
});

function initializeApp() {
    console.log("🎯 Initializing ReadVoyage app...");
    
    setupNavigation();
    setupSearch();
    setupLibrary();
    setupReadingChallenge();
    
    renderLibrary();
    updateDashboardStats();
    updateReadingChallengeDisplay();
    
    console.log("✅ ReadVoyage fully initialized");
}

function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const target = this.getAttribute("data-page");
            switchPage(target);
        });
    });
}

function switchPage(target) {
    console.log("🔄 Switching to page:", target);
    
    const pages = [
        'dashboard-content',
        'search-content', 
        'library-content',
        'challenge-content'
    ];
    
    pages.forEach(pageId => {
        const element = document.getElementById(pageId);
        if (element) {
            element.style.display = "none";
        } else {
            console.warn(`Page element not found: ${pageId}`);
        }
    });
    
    const targetElement = document.getElementById(`${target}-content`);
    if (targetElement) {
        targetElement.style.display = "block";
        console.log(`✅ Showing page: ${target}-content`);
        
        if (target === 'challenge') {
            updateReadingChallengeDisplay();
        }
    } else {
        console.error(`❌ Target page not found: ${target}-content`);
    }
    
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        if (link.parentElement) {
            link.parentElement.classList.remove("active");
        }
    });
    
    const activeNav = document.querySelector(`[data-page="${target}"]`);
    if (activeNav && activeNav.parentElement) {
        activeNav.parentElement.classList.add("active");
    }
    
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) {
        pageTitle.textContent = target.charAt(0).toUpperCase() + target.slice(1);
    }
}

function setupReadingChallenge() {
    console.log("🔥 Setting up reading challenge...");
    
    const editChallengeBtn = document.getElementById("edit-challenge-from-dashboard");
    if (editChallengeBtn) {
        editChallengeBtn.addEventListener("click", function() {
            console.log("Editing challenge from dashboard");
            switchPage("challenge");
        });
    }
    
    const backToDashboardBtn = document.getElementById("back-to-dashboard");
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener("click", function() {
            console.log("Returning to dashboard from challenge");
            switchPage("dashboard");
        });
    }
    
    const updateChallengeBtn = document.getElementById("update-challenge");
    if (updateChallengeBtn) {
        updateChallengeBtn.addEventListener("click", updateChallenge);
    }
    
    const cancelBtn = document.getElementById("cancel-edit");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function() {
            console.log("Cancel clicked");
            switchPage("dashboard");
        });
    }
    
    const booksReadInput = document.getElementById("books-read-input");
    const targetInput = document.getElementById("target-input");
    
    if (booksReadInput) {
        booksReadInput.addEventListener("input", function(e) {
            readingChallenge.booksRead = parseInt(e.target.value) || 0;
            updateReadingChallengeDisplay();
        });
    }
    
    if (targetInput) {
        targetInput.addEventListener("input", function(e) {
            readingChallenge.target = parseInt(e.target.value) || 1;
            updateReadingChallengeDisplay();
        });
    }
    
    console.log("✅ Reading challenge setup complete");
}

function updateReadingChallengeDisplay() {
    console.log("📊 Updating reading challenge display:", readingChallenge);
    
    const progress = (readingChallenge.booksRead / readingChallenge.target) * 100;
    const progressPercent = Math.min(progress, 100);
    const remaining = Math.max(0, readingChallenge.target - readingChallenge.booksRead);
    
    console.log(`Progress: ${progressPercent}% (${readingChallenge.booksRead}/${readingChallenge.target})`);
    
    const progressCircle = document.querySelector('.progress-circle');
    if (progressCircle) {
        progressCircle.style.background = 
            `conic-gradient(#3498db 0% ${progressPercent}%, #ecf0f1 ${progressPercent}% 100%)`;
    }
    
    const elementsToUpdate = {
        'progress-percent': `${Math.round(progressPercent)}%`,
        'challenge-books-read': readingChallenge.booksRead,
        'challenge-target': readingChallenge.target,
        'challenge-remaining': remaining,
        'target-display': readingChallenge.target,
        'dashboard-challenge-progress': `${Math.round(progressPercent)}%`
    };
    
    Object.entries(elementsToUpdate).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    const booksReadInput = document.getElementById('books-read-input');
    const targetInput = document.getElementById('target-input');
    if (booksReadInput) booksReadInput.value = readingChallenge.booksRead;
    if (targetInput) targetInput.value = readingChallenge.target;
    
    const progressBar = document.getElementById('challenge-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
    
    updateMotivationMessage(progressPercent);
    
    localStorage.setItem("readingChallenge", JSON.stringify(readingChallenge));
}

function updateChallenge() {
    console.log("💾 Updating challenge...");
    
    const booksReadInput = document.getElementById('books-read-input');
    const targetInput = document.getElementById('target-input');
    
    if (booksReadInput && targetInput) {
        readingChallenge.booksRead = parseInt(booksReadInput.value) || 0;
        readingChallenge.target = parseInt(targetInput.value) || 1;
        
        updateReadingChallengeDisplay();
        switchPage('dashboard');
        
        alert('✅ Reading challenge updated successfully!');
    }
}

function updateMotivationMessage(progress) {
    const messageElement = document.getElementById('motivation-text');
    if (!messageElement) return;

    let message = '';
    
    if (progress === 0) {
        message = '🎯 Start your reading journey! Add your first book to begin.';
    } else if (progress < 25) {
        message = '📖 Great start! Every book counts toward your goal.';
    } else if (progress < 50) {
        message = '🚀 You\'re making progress! Keep up the good work.';
    } else if (progress < 75) {
        message = '🌟 Halfway there! You\'re doing amazing.';
    } else if (progress < 100) {
        message = '💪 Almost there! Just a few more books to go.';
    } else {
        message = '🎉 Congratulations! You\'ve reached your reading goal!';
    }

    messageElement.innerHTML = `<strong>Keep going!</strong> ${message}`;
}

function setupSearch() {
    console.log("🔍 Setting up search functionality...");
    
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");
    
    if (searchButton) {
        searchButton.addEventListener("click", handleSearch);
        console.log("✅ Search button event listener added");
    }
    
    if (searchInput) {
        searchInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                handleSearch();
            }
        });
    }
}

function handleSearch() {
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    
    if (!searchInput || !searchResults) return;
    
    const query = searchInput.value.trim();
    
    if (!query) {
        alert("📝 Please enter a book title or author name.");
        return;
    }
    
    searchResults.innerHTML = `
        <div class="loading" style="text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
            <h3>Searching for "${query}"</h3>
            <p>Please wait while we search OpenLibrary...</p>
        </div>
    `;
    
    performSearch(query);
}

async function performSearch(query) {
    try {
        const response = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        displaySearchResults(data.docs || [], query);
        
    } catch (error) {
        console.error("❌ Search error:", error);
        const searchResults = document.getElementById("search-results");
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="error" style="text-align: center; padding: 40px; color: #e74c3c;">
                    <h3>Search Failed</h3>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    }
}

function displaySearchResults(books, query) {
    const searchResults = document.getElementById("search-results");
    if (!searchResults) return;
    
    if (!books || books.length === 0) {
        searchResults.innerHTML = `
            <div class="error" style="text-align: center; padding: 40px;">
                <h3>No Results Found</h3>
                <p>No books found for "<strong>${query}</strong>"</p>
            </div>
        `;
        return;
    }
    
    const resultsHTML = books.map((book) => {
        const title = book.title || "Untitled";
        const author = book.author_name ? book.author_name[0] : "Unknown Author";
        const cover = book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/120x170/ecf0f1/7f8c8d?text=No+Cover";
        
        return `
            <div class="book-card search-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px; text-align: center;">
                <img src="${cover}" alt="${title}" class="book-cover" 
                     style="width: 120px; height: 170px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;"
                     onerror="this.src='https://via.placeholder.com/120x170/ecf0f1/7f8c8d?text=No+Cover'">
                <h4 class="book-title" style="margin: 10px 0; font-size: 16px;">${title}</h4>
                <p class="book-author" style="color: #666; margin: 5px 0;">by ${author}</p>
                <button class="btn btn-primary" 
                        onclick="addToLibrary('${title.replace(/'/g, "\\'")}', '${author.replace(/'/g, "\\'")}')"
                        style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                    + Add to Library
                </button>
            </div>
        `;
    }).join('');
    
    searchResults.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3>📚 Search Results for "${query}"</h3>
            <p>Found ${books.length} results</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
            ${resultsHTML}
        </div>
    `;
}

function setupLibrary() {
    const clearLibraryBtn = document.getElementById("clear-library");
    if (clearLibraryBtn) {
        clearLibraryBtn.addEventListener("click", clearLibrary);
    }
}

function renderLibrary() {
    const booksList = document.getElementById("books-list");
    if (!booksList) return;
    
    if (books.length === 0) {
        booksList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">📚</div>
                <h3 style="color: #2c3e50; margin-bottom: 10px;">Your Library is Empty</h3>
                <p style="color: #7f8c8d; margin-bottom: 30px;">Add some books to start your reading journey!</p>
                <button class="btn btn-primary" id="add-first-book"
                        style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                    🔍 Search for Books
                </button>
            </div>
        `;
        
        setTimeout(() => {
            const addFirstBookBtn = document.getElementById("add-first-book");
            if (addFirstBookBtn) {
                addFirstBookBtn.addEventListener("click", function() {
                    switchPage("search");
                });
            }
        }, 100);
        return;
    }
    
    booksList.innerHTML = books.map(book => `
        <div class="book-card library-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; background: white;">
            <h3 style="color: #2c3e50; margin-bottom: 10px;">${book.title}</h3>
            <p style="margin: 5px 0;"><strong>Author:</strong> ${book.author}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${book.status === "read" ? "✅ Completed" : "📖 Currently Reading"}</p>
            <div class="book-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                ${book.status !== "read" 
                    ? `<button class="btn-done" onclick="markAsRead('${book.id}')"
                         style="background: #27ae60; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                         Mark as Read
                      </button>`
                    : `<button class="btn-done read" disabled
                         style="background: #95a5a6; color: white; border: none; padding: 8px 16px; border-radius: 4px;">
                         ✅ Completed
                      </button>`
                }
                <button class="btn btn-outline" onclick="deleteBook('${book.id}')"
                        style="background: transparent; color: #e74c3c; border: 1px solid #e74c3c; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function addToLibrary(title, author) {
    const newBook = {
        id: Date.now().toString(),
        title: title,
        author: author,
        status: "reading",
        addedDate: new Date().toISOString(),
    };
    
    books.push(newBook);
    localStorage.setItem("books", JSON.stringify(books));
    
    alert(`✅ "${title}" has been added to your library!`);
    renderLibrary();
    updateDashboardStats();
    switchPage("library");
}

function markAsRead(id) {
    const book = books.find(b => b.id === id);
    if (book) {
        book.status = "read";
        localStorage.setItem("books", JSON.stringify(books));
        
        readingChallenge.booksRead = books.filter(b => b.status === "read").length;
        localStorage.setItem("readingChallenge", JSON.stringify(readingChallenge));
        
        renderLibrary();
        updateDashboardStats();
        updateReadingChallengeDisplay();
        alert(`🎉 Congratulations! You've completed "${book.title}"!`);
    }
}

function deleteBook(id) {
    const book = books.find(b => b.id === id);
    if (book) {
        if (confirm(`Are you sure you want to remove "${book.title}" from your library?`)) {
            books = books.filter(b => b.id !== id);
            localStorage.setItem("books", JSON.stringify(books));
            
            if (book.status === "read") {
                readingChallenge.booksRead = books.filter(b => b.status === "read").length;
                localStorage.setItem("readingChallenge", JSON.stringify(readingChallenge));
            }
            
            renderLibrary();
            updateDashboardStats();
            updateReadingChallengeDisplay();
            alert(`🗑️ "${book.title}" has been removed from your library.`);
        }
    }
}

function clearLibrary() {
    if (books.length === 0) {
        alert("Your library is already empty!");
        return;
    }
    
    if (confirm(`Are you sure you want to clear your entire library? This will remove ${books.length} books.`)) {
        books = [];
        readingChallenge.booksRead = 0;
        localStorage.setItem("books", JSON.stringify(books));
        localStorage.setItem("readingChallenge", JSON.stringify(readingChallenge));
        renderLibrary();
        updateDashboardStats();
        updateReadingChallengeDisplay();
        alert("🧹 Your library has been cleared!");
    }
}

function updateDashboardStats() {
    const total = books.length;
    const read = books.filter(b => b.status === "read").length;
    const reading = books.filter(b => b.status === "reading").length;
    
    const statElements = {
        'total-books': total,
        'books-reading': reading, 
        'books-completed': read,
        'sidebar-total-books': total,
        'sidebar-books-read': read
    };
    
    Object.entries(statElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

window.addToLibrary = addToLibrary;
window.markAsRead = markAsRead;
window.deleteBook = deleteBook;
window.handleSearch = handleSearch;
window.searchBooks = handleSearch;
window.switchPage = switchPage;
window.clearLibrary = clearLibrary;
window.updateChallenge = updateChallenge;