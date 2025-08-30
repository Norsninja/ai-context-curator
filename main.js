const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    title: 'AI Context Curator',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  // Optional: Check if this is first run and copy default data if it exists
  const userDataPath = path.join(app.getPath('userData'), 'curator-data.json');
  const defaultDataPath = path.join(__dirname, 'default-data.json');
  
  if (!fs.existsSync(userDataPath) && fs.existsSync(defaultDataPath)) {
    // First run - copy default data
    try {
      fs.copyFileSync(defaultDataPath, userDataPath);
      console.log('Initialized with default data');
    } catch (err) {
      console.error('Failed to copy default data:', err);
    }
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});