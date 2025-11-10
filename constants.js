const CONSTANTS = {
    OPEN_LIBRARY: {
        SEARCH_AUTHORS: 'https://openlibrary.org/search/authors.json',
        SEARCH_BOOKS: 'https://openlibrary.org/search.json',
        AUTHOR_DETAILS: 'https://openlibrary.org/authors/{id}.json',
        WORK_DETAILS: 'https://openlibrary.org/works/{id}.json',
        COVERS: 'https://covers.openlibrary.org/b/{key}/{value}-{size}.jpg'
    },
    
    STORAGE_KEYS: {
        LIBRARY: 'readvoyage_library',
        SETTINGS: 'readvoyage_settings',
        BOOKS: 'readvoyage_books'
    },
    
    READING_STATUS: {
        UNREAD: 'unread',
        READING: 'reading',
        COMPLETED: 'completed'
    },
    
    CATEGORIES: {
        FICTION: 'fiction',
        NON_FICTION: 'non-fiction',
        SCIENCE_FICTION: 'science-fiction',
        FANTASY: 'fantasy',
        MYSTERY: 'mystery',
        ROMANCE: 'romance',
        BIOGRAPHY: 'biography',
        HISTORY: 'history',
        SELF_HELP: 'self-help',
        OTHER: 'other'
    },
    
    DEFAULT_SETTINGS: {
        theme: 'light',
        readingGoal: 20,
        autoSave: true,
        notifications: true
    }
};

window.CONSTANTS = CONSTANTS;