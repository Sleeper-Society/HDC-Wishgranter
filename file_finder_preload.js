const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('steam', {
    findSteamApp: (gameId) => ipcRenderer.invoke('findSteamApp', gameId),
    beginGame: (gameLocation) => ipcRenderer.invoke('beginGame', gameLocation)
})