class StorageManager {
    constructor() {
        this.storage = window.localStorage;
        this.STORAGE_KEYS = {
            LIBRARY: "library",
            SETTINGS: "settings"
        };
        this.DEFAULT_SETTINGS = {
            theme: "light",
            layout: "grid"
        };
        this.init();
    }

    init() {
        if (!this.getLibrary()) {
            this.setLibrary([]);
        }

        if (!this.getSettings()) {
            this.setSettings(this.DEFAULT_SETTINGS);
        }
    }

    retrieveData(key) {
        try {
            const raw = this.storage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error("❌ Error retrieving data:", error);
            return null;
        }
    }

    storeData(key, value) {
        try {
            this.storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("❌ Error saving data:", error);
            return false;
        }
    }

    getLibrary() {
        return this.retrieveData(this.STORAGE_KEYS.LIBRARY) || [];
    }

    setLibrary(books) {
        return this.storeData(this.STORAGE_KEYS.LIBRARY, books);
    }

    addBook(bookData) {
        const library = this.getLibrary();
        const newBook = {
            id: this.generateId(),
            ...bookData,
            addedDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        library.push(newBook);
        const success = this.setLibrary(library);

        if (success) {
            this.triggerEvent("booksUpdated", { action: "add", book: newBook });
        }

        return success ? newBook : null;
    }

    getBookById(bookId) {
        return this.getLibrary().find(b => b.id === bookId) || null;
    }

    updateBook(bookId, updates) {
        const library = this.getLibrary();
        const index = library.findIndex(book => book.id === bookId);

        if (index === -1) return false;

        library[index] = {
            ...library[index],
            ...updates,
            lastUpdated: new Date().toISOString()
        };

        const success = this.setLibrary(library);

        if (success) {
            this.triggerEvent("booksUpdated", { action: "update", book: library[index] });
        }

        return success;
    }

    deleteBook(bookId) {
        const library = this.getLibrary();
        const index = library.findIndex(book => book.id === bookId);

        if (index === -1) return false;

        const deleted = library.splice(index, 1)[0];
        const success = this.setLibrary(library);

        if (success) {
            this.triggerEvent("booksUpdated", { action: "delete", book: deleted });
        }

        return success;
    }

    clearLibrary() {
        const success = this.setLibrary([]);
        if (success) {
            this.triggerEvent("booksUpdated", { action: "clear" });
        }
        return success;
    }

    getSettings() {
        return this.retrieveData(this.STORAGE_KEYS.SETTINGS) || this.DEFAULT_SETTINGS;
    }

    setSettings(settings) {
        return this.storeData(this.STORAGE_KEYS.SETTINGS, settings);
    }

    updateSettings(newSettings) {
        const current = this.getSettings();
        const updated = { ...current, ...newSettings };
        const success = this.setSettings(updated);

        if (success) {
            this.triggerEvent("settingsUpdated", updated);
        }

        return success;
    }

    getLibraryStats() {
        const books = this.getLibrary();
        const total = books.length;
        const reading = books.filter(b => b.status === "reading").length;
        const completed = books.filter(b => b.status === "completed").length;
        const unread = books.filter(b => b.status === "unread").length;

        return { total, reading, completed, unread };
    }

    exportLibrary() {
        const data = {
            library: this.getLibrary(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString(),
            version: "1.0"
        };
        return JSON.stringify(data, null, 2);
    }

    importLibrary(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.library) this.setLibrary(data.library);
            if (data.settings) this.setSettings(data.settings);
            this.triggerEvent("dataImported");
            return true;
        } catch (error) {
            console.error("❌ Error importing library:", error);
            return false;
        }
    }

    generateId() {
        return "book_" + Math.random().toString(36).substr(2, 9);
    }

    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    on(eventName, callback) {
        window.addEventListener(eventName, callback);
    }

    off(eventName, callback) {
        window.removeEventListener(eventName, callback);
    }
}

const storageManager = new StorageManager();
window.storageManager = storageManager;
