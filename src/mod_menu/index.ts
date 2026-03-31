/**
 * This is the file handling the startup and lifetime of the game
 * running in Electron Runtime.
 */
// Modules to control application life and create native browser window
import {
    app,
    BrowserWindow,
    shell,
    Menu
} from "electron"
import path from "path"
import Game from "../game.ts"

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null;
let game: Game | null = null

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        useContentSize: true,
        title: "Hyperspace Deck Command: Wishgranter",
        backgroundColor: '#000000',
        webPreferences: {
            preload: path.join(__dirname, '..', 'renderer', 'preload.js')
        }
    });

    // Open external link in the OS default browser
    mainWindow.webContents.setWindowOpenHandler(details => {
        shell.openExternal(details.url);
        return {
            action: 'deny'
        };
    });

    // and load the index.html of the app.
    mainWindow.loadFile("../../mod_menu.html");

    Menu.setApplicationMenu(null);

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on("closed", function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        game = null
        app.quit();
    });

    // Quit when all windows are closed.
    app.on("window-all-closed", function() {
        mainWindow = null;
        game = null
        app.quit();
    });

    return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => game = new Game(createWindow));