const {app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const path = require('node:path');
const { findSteamApp } = require('steam-locate');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

// Initialize `@electron/remote` module
require('@electron/remote/main').initialize();

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Finding Hyperspace Deck Command",
        webPreferences: {
            preload: path.join(__dirname, 'file_finder_preload.js')
        }
    });

    mainWindow.loadFile('file_finder.html');
}

app.whenReady().then(() => {
    ipcMain.handle('beginGame', beginGame)
    ipcMain.handle('findSteamApp', findSteamGamePath)
    createWindow()
})

// Emitted when the window is closed.
mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
});

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  app.quit();
});

function beginGame(_event, gameFilePath){
    mainWindow.width = 1280
    mainWindow.height = 720
    mainWindow.useContentSize = true
    mainWindow.title = "Hyperspace Deck Command: Wishgranter"
    mainWindow.backgroundColor = '#000000'
    mainWindow.webPreferences = {
      // Allow Node.js API access in renderer process, as long
      // as we've not removed dependency on it and on "@electron/remote".
      nodeIntegration: true,
      contextIsolation: false,
    }

    // Enable `@electron/remote` module for renderer process
    require('@electron/remote/main').enable(mainWindow.webContents);

    // Open external link in the OS default browser
    mainWindow.webContents.setWindowOpenHandler(details => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });

    // and load the index.html of the app.
    mainWindow.loadFile(gameFilePath + "/resources/app.asar/app/index.html");

    Menu.setApplicationMenu(null);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

async function findSteamGamePath(_event, gameID){
    return (await findSteamApp(gameID)).installDir
}