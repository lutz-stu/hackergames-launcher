function uninstallGame(gameName) {
    window.electron.uninstallGame(gameName);
}

function closeSettingsWindow() {
    window.electron.closeSettings();
}

// Uninstall-Result anzeigen
window.electron.on("uninstall-result", (message) => {
    alert(message);
});
