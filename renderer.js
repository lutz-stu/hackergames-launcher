const { exec } = require('child_process');

function launchGame(path) {
    exec(`"${path}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting game: ${error}`);
            return;
        }
        console.log(`Game started: ${stdout}`);
    });
}
