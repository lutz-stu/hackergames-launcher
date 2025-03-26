const fs = require("fs");
const https = require("https");
const extract = require("extract-zip");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const { contextBridge, ipcRenderer, shell } = require("electron");

const gameDir = path.join(
    os.homedir(),
    "AppData",
    "Local",
    "HackergamesLauncher",
    "games"
);

contextBridge.exposeInMainWorld("electron", {
    uninstallGame: (gameName) => ipcRenderer.send("uninstall-game", gameName),
    closeSettings: () => ipcRenderer.send("closeSettingsWindow")
});
