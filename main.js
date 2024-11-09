const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 825,
        minWidth: 800,
        minHeight: 600,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'img', 'app-icon-invert.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Use preload for security
            contextIsolation: false, 
            enableRemoteModule: false, // Disables remote module for security
            nodeIntegration: true, 
        }
    });

    win.loadFile('index.html');
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Handle a request for the current version from the renderer process
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});
