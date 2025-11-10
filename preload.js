const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    navigateTo: (page) => ipcRenderer.send('navigate-to', page),
    
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    quitApp: () => ipcRenderer.invoke('quit-app'),
    
    addBook: (bookData) => ipcRenderer.send('item:add', bookData),
    clearBooks: () => ipcRenderer.send('item:clear'),
    openAddBookWindow: () => ipcRenderer.send('open-add-book-window'),
    
    onNavigate: (callback) => ipcRenderer.on('navigate-to', callback),
    onBookAdded: (callback) => ipcRenderer.on('item:add', callback),
    onBooksCleared: (callback) => ipcRenderer.on('item:clear', callback),
    
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

console.log('ReadVoyage Preload Script Loaded Successfully');