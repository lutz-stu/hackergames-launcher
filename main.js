const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow; // Global variable to keep a reference to the main window
let settingsWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
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

    mainWindow.loadFile('index.html');
}

// Create the main window when the app is ready
app.on('ready', createWindow);
// Quit the app when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

function openSettingsWindow() {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 500,
        height: 400,
        title: "Settings | HACKERGAMES Launcher",
        //frame: false,
        //resizable: false,
        modal: true,
        parent: mainWindow,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'img', 'app-icon-invert.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Use preload for security
            contextIsolation: false, 
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    settingsWindow.loadFile(path.join(__dirname, 'settings.html'));

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

module.exports = { openSettingsWindow };

ipcMain.on('open-settings-window', () => {
    openSettingsWindow();
});

ipcMain.on("closeSettingsWindow", () => {
    if (settingsWindow) {
        settingsWindow.close();
    }
});

// Handle a request for the current version from the renderer process
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});
