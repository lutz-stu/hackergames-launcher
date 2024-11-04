const fs = require('fs');
const https = require('https');
const extract = require('extract-zip');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const gameDir = path.join(os.homedir(), 'AppData', 'Local', 'HackergamesLauncher', 'games');

// Function to ensure the directory exists
function ensureGameDirExists() {
    if (!fs.existsSync(gameDir)) {
        fs.mkdirSync(gameDir, { recursive: true }); // Creates the entire path if it doesn't exist
    }
}

function showLoadingWindow() {
    // Open a new window
    const loadingWindow = window.open("", "loadingWindow", "width=300,height=200,autoHideMenuBar=true");

    // Set the content of the window
    loadingWindow.document.write(`
        <style>
            body {
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                background-color: #333;
                color: white;
                margin: 0;
                height: 100vh;
            }
            .loader {
                border: 8px solid #f3f3f3;
                border-top: 8px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            p {
                margin-top: 10px;
            }
        </style>
        <div>
            <div class="loader"></div>
            <p>Downloading and installing...</p>
        </div>
    `);

    // Return the window so it can be closed later
    return loadingWindow;
}

const gameNames = [
    'CubeSmash',
    'SpaceCollector',
    'JustKlick',
    'Little-Farming-Game',
    'Easteregg-Hunt',
    'EscapeTheSpike'
];

// Function to load the game versions
function loadGameVersions() {
    gameNames.forEach((gameName) => {
        const versionFilePath = path.join(gameDir, gameName, 'version.txt');
        const versionElement = document.querySelector(`#version-subtitle-${gameName}`);

        if (versionElement) { // Check if the element exists
            if (fs.existsSync(versionFilePath)) {
                const version = fs.readFileSync(versionFilePath, 'utf-8').trim();
                versionElement.textContent = `v${version}`;
            } else {
                versionElement.textContent = 'Not installed';
            }
        }
    });
}

// Function to check the version and update the game
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

// Function to download, install, and initially set the version
function downloadAndInstallGame(gameName, downloadUrl, version, callback) {
    const loadingWindow = showLoadingWindow(); // Show loading window
    ensureGameDirExists(); // Ensure the directory exists

    const zipPath = path.join(gameDir, `${gameName}.zip`);
    const gamePath = path.join(gameDir, gameName);

    const file = fs.createWriteStream(zipPath);
    https.get(downloadUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            extract(zipPath, { dir: gamePath })
                .then(() => {
                    fs.writeFileSync(path.join(gamePath, 'version.txt'), version); // Save the version
                    fs.unlinkSync(zipPath);
                    loadGameVersions();
                    // Close the loading window when the download and installation are complete
                    loadingWindow.close();
                    window.alert(`${gameName} has been successfully installed.`);
                    callback();
                })
                .catch((err) => {
                    console.error(`Error during unpacking: ${err}`);
                    loadingWindow.close(); // Close the loading window on error
                });
        });
    });
}

// Function to launch the game
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
                        // Game will not auto-launch after installation
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

// Function to uninstall a game
function uninstallGame(gameName) {
    const gamePath = path.join(gameDir, gameName);
    
    if (fs.existsSync(gamePath)) {
        fs.rm(gamePath, { recursive: true, force: true }, (err) => {
            if (err) {
                console.error(`Error while uninstalling ${gameName}: ${err}`);
                window.alert(`Error while uninstalling ${gameName}: ${err}`);
            } else {
                window.alert(`${gameName} was uninstalled successfully.`);
            }
        });
    } else {
        window.alert(`${gameName} is not installed.`);
    }
}

console.log("Launcher started");

document.addEventListener('DOMContentLoaded', (event) => {
    loadGameVersions();
});
