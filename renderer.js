const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https'); // Zum Herunterladen von Dateien
const extract = require('extract-zip'); // Zum Entpacken von ZIP-Dateien (Installieren mit 'npm install extract-zip')

// Speicherort im AppData-Verzeichnis des Benutzers
const gameDir = path.join(os.homedir(), 'AppData', 'Local', 'HackergamesLauncher', 'games');

// Überprüfe, ob der Spieleordner existiert, und erstelle ihn, falls nicht
if (!fs.existsSync(gameDir)) {
    fs.mkdirSync(gameDir, { recursive: true });
}

// Funktion zum Herunterladen und Installieren des Spiels
function downloadAndInstallGame(gameName, downloadUrl) {
    const zipPath = path.join(gameDir, `${gameName}.zip`);
    const gamePath = path.join(gameDir, gameName);

    console.log(downloadUrl)

    // Lade das ZIP-Archiv herunter
    const file = fs.createWriteStream(zipPath);
    https.get(downloadUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();

            // Entpacke das ZIP-Archiv
            extract(zipPath, { dir: gamePath })
                .then(() => {
                    console.log(`${gameName} sucessfully installed.`);
                    window.alert(`${gameName} sucessfully installed.`)
                    fs.unlinkSync(zipPath); // Entferne das ZIP nach dem Entpacken
                })
                .catch((err) => console.error(`Error during unpacking: ${err}`));
        });
    });
}

// Funktion zum Starten des Spiels
function launchGame(gameName, downloadUrl) {
    const gameExePath = path.join(gameDir, gameName, `${gameName}.exe`);

    // Prüfen, ob das Spiel installiert ist
    if (!fs.existsSync(gameExePath)) {
        const download = window.confirm(`${gameName} is not installed. Would you like to download it?`);
        if (download) {
            downloadAndInstallGame(gameName, downloadUrl);
        }
    } else {
        // Starte das Spiel
        exec(`"${gameExePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error starting the game: ${stderr || error}`);
                return;
            }
            console.log(`${gameName} started successfully.`);
        });
    }
}

console.log("Launcher started");
