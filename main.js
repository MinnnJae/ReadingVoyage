const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src/renderer/index.html'));
  mainWindow.on('closed', () => (mainWindow = null));
}

app.whenReady().then(createMainWindow);

ipcMain.on('open-add-book-window', () => {
  const addBookWindow = new BrowserWindow({
    width: 600,
    height: 700,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  addBookWindow.loadFile(path.join(__dirname, 'src/renderer/add-book.html'));
});

ipcMain.on('item:add', (event, bookData) => {
  console.log('📚 Book added:', bookData);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('book:add', bookData);
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

