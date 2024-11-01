const { contextBridge } = require('electron');
const path = require('path');

const appPathArg = process.argv.find(arg => arg.startsWith('--appPath='));
const appPath = appPathArg ? appPathArg.replace('--appPath=', '') : '';

contextBridge.exposeInMainWorld('electronAPI', {
    getGamePath: (gamePath) => path.join(appPath, 'resources', gamePath)
});
