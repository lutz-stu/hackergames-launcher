const fs = require('fs');
const https = require('https');
const extract = require('extract-zip');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const gameDir = path.join(os.homedir(), 'AppData', 'Local', 'HackergamesLauncher', 'games');

// Funktion zum Überprüfen der Version und zum Updaten des Spiels
function checkForUpdate(gameName, downloadUrl, callback) {
    const localVersionFile = path.join(gameDir, gameName, 'version.txt');
    const onlineVersionUrl = `${downloadUrl.replace(/\.zip$/, '')}/version.txt`;

    https.get(onlineVersionUrl, (response) => {
        let onlineVersion = '';
        response.on('data', (chunk) => onlineVersion += chunk);
        response.on('end', () => {
            const localVersion = fs.existsSync(localVersionFile) ? fs.readFileSync(localVersionFile, 'utf-8') : '0.0.0';
            if (onlineVersion.trim() !== localVersion.trim()) {
                const update = window.confirm(`A new version of ${gameName} is available. Update now?`);
                if (update) {
                    downloadAndInstallGame(gameName, downloadUrl, onlineVersion.trim(), callback);
                } else {
                    callback();
                }
            } else {
                callback();
            }
        });
    });
}

// Funktion zum Herunterladen, Installieren und erstmaligen Setzen der Version
function downloadAndInstallGame(gameName, downloadUrl, version, callback) {
    const zipPath = path.join(gameDir, `${gameName}.zip`);
    const gamePath = path.join(gameDir, gameName);

    const file = fs.createWriteStream(zipPath);
    https.get(downloadUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            extract(zipPath, { dir: gamePath })
                .then(() => {
                    fs.writeFileSync(path.join(gamePath, 'version.txt'), version); // Speichert die Version
                    fs.unlinkSync(zipPath);
                    window.alert(`${gameName} has been successfully installed.`);
                    callback();
                })
                .catch((err) => console.error(`Error during unpacking: ${err}`));
        });
    });
}

// Funktion zum Starten des Spiels
function launchGame(gameName, downloadUrl) {
    const gameExePath = path.join(gameDir, gameName, `${gameName}.exe`);
    if (!fs.existsSync(gameExePath)) {
        const onlineVersionUrl = `${downloadUrl.replace(/\.zip$/, '')}/version.txt`;
        https.get(onlineVersionUrl, (response) => {
            let onlineVersion = '';
            response.on('data', (chunk) => onlineVersion += chunk);
            response.on('end', () => {
                const download = window.confirm(`${gameName} is not installed. Would you like to download it?`);
                if (download) {
                    downloadAndInstallGame(gameName, downloadUrl, onlineVersion.trim(), () => {
                        exec(`"${gameExePath}"`, (error) => {
                            if (error) console.error(`Error starting the game: ${error}`);
                        });
                    });
                }
            });
        });
    } else {
        checkForUpdate(gameName, downloadUrl, () => {
            exec(`"${gameExePath}"`, (error) => {
                if (error) console.error(`Error starting the game: ${error}`);
            });
        });
    }
}

console.log("Launcher started");
