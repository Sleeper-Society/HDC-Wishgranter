const {app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const path = require('node:path');
const { findSteamApp } = require('steam-locate');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let finderWindow = null;
let gameWindow = null;

// Initialize `@electron/remote` module
require('@electron/remote/main').initialize();

const createGameFinderWindow = () => {
    finderWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Finding Hyperspace Deck Command",
        webPreferences: {
            preload: path.join(__dirname, 'file_finder_preload.js')
        }
    });

    finderWindow.loadFile('file_finder.html');

     // Emitted when the window is closed.
    finderWindow.on("closed", function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        finderWindow = null;
    });
}

app.whenReady().then(() => {
    ipcMain.handle('beginGame', createGameWindow)
    ipcMain.handle('findSteamApp', findSteamGamePath)
    createGameFinderWindow()
})

function createGameWindow(_event, gameFilePath){
    finderWindow.close()

    // Create the browser window.
    gameWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        useContentSize: true,
        title: "Hyperspace Deck Command: Wishgranter",
        backgroundColor: '#000000',
        webPreferences: {
            // Allow Node.js API access in renderer process, as long
            // as we've not removed dependency on it and on "@electron/remote".
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // Enable `@electron/remote` module for renderer process
    require('@electron/remote/main').enable(gameWindow.webContents);

    // Open external link in the OS default browser
    gameWindow.webContents.setWindowOpenHandler(details => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });

    // and load the index.html of the app.
    gameWindow.loadFile(gameFilePath + "/resources/app.asar/app/index.html");

    Menu.setApplicationMenu(null);

    // Open the DevTools.
    // gameWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    gameWindow.on("closed", function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        gameWindow = null;
    });

    // Quit when all windows are closed.
    app.on("window-all-closed", function() {
        app.quit();
    });
}

async function findSteamGamePath(_event, gameID){
    return (await findSteamApp(gameID)).installDir
}