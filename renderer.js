const { exec } = require('child_process');

function launchGame(gamePath) {
    const fullPath = window.electronAPI.getGamePath(gamePath);
    exec("${fullPath}", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting game: ${error}`);
            return;
        }
        console.log(`Game started: ${stdout}`);
    });
}

console.log("Launcher Started");
