/**
 * This is the file handling the startup and lifetime of the game
 * running in Electron Runtime.
 */
// Modules to control application life and create native browser window
import { app, BrowserWindow, shell, Menu, ipcMain, dialog } from "electron"
import path, { dirname } from "path"
import fs, { PathLike } from 'fs'
import fsPromise from 'fs/promises'
import os from 'os'
import {findSteamApp} from 'steam-locate'
import { bad_mod, convertDefualtDataToLoadableModMetaData, LoadableModMetaData, loadMods, ModLoadInfo, modLoadInfoToMod, ModMetaData } from '../mod.ts'
import { LoadSequenceElement } from "./load_sequence.ts"
import { Game } from "../game.ts"
import { loadWishgranter } from "./load_wishgranter.ts"

const config_path = os.homedir() + "/HDC/config.json"

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null;

function createWindow() {

  setupPreloads()

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
    return { action: 'deny' };
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
    app.quit();
  });
}

function setupPreloads(){
  ipcMain.handle('getHyperspace', (_event) => {
    if (fs.existsSync(config_path)){
      let config = JSON.parse(fs.readFileSync(config_path, 'utf8'))
      if (config.hyperspace_path) {
        return config.hyperspace_path
      }
    }
    return findSteamApp('2711190').then((response) => {
            return response.installDir
        })
  })
  ipcMain.handle('getDefaultMods', (_event) => {
    if (fs.existsSync(config_path)){
      let config = JSON.parse(fs.readFileSync(config_path, 'utf8'))
      if (config.mods_path) {
        return config.mods_path
      }
    }
    return os.homedir() + "/HDC/Mods"
  })
  ipcMain.handle('getSteam', (_event) => findSteamApp('2711190').then((response) => {
            return response.installDir
        }))
  ipcMain.handle('getMods', async function(_event, hyperspace_path : PathLike, mods_path : PathLike) : Promise<LoadableModMetaData[]>{
    let output: LoadableModMetaData[] = [await convertDefualtDataToLoadableModMetaData(hyperspace_path)]
    return !fs.existsSync(mods_path) ? output : output.concat(await Promise.all(
      (fs.readdirSync(mods_path) as PathLike[])
      .filter((mod_path: PathLike) => {
        try {
            fs.accessSync(path.join(mods_path.toString(),mod_path.toString(), '/index.js'), fs.constants.R_OK)
            return true
        } catch (error) {
            console.warn('Unable to load ', path, '. ', error)
            return false
        }
        })
      .map(async (mod_path: PathLike): Promise<LoadableModMetaData> => 
        await import(path.join(mods_path.toString(),mod_path.toString(), "/index.js")).catch((reason) => {
            console.error(reason)
            return bad_mod
        }).then((mod_module) => {
          try {
              const mod_data : ModMetaData | LoadableModMetaData = mod_module.metadata as ModMetaData
              (mod_data as LoadableModMetaData).path = mod_path
              return mod_data as LoadableModMetaData
          } catch (error) {
              console.error(error);
              return bad_mod
          }                      
        })
      )
    ))
  })
  ipcMain.handle('askForDirectory', async (_event, start_directory) => {
    const {
        canceled,
        filePaths
    } = await dialog.showOpenDialog({
        defaultPath: start_directory,
        properties: ['openDirectory']
    })
    if (!canceled) {
        return filePaths[0]
    }
    return ''
  }),
  ipcMain.handle('startGame', (_event, hyperspace_path : PathLike, modlist : ModLoadInfo[]) => startGame(hyperspace_path, modlist))
  ipcMain.handle('focus', (_event) => mainWindow?.focus())
  ipcMain.handle('fullscreen', (_event, set_fullscreen : boolean) => mainWindow?.setFullScreen(set_fullscreen))
  ipcMain.handle('content_size', (_event, width : number, height : number) => mainWindow?.setContentSize(width,height))
  ipcMain.handle('close', (_event) => mainWindow?.close())
  ipcMain.handle('resizeable', (_event, resizeable : boolean) => mainWindow?.setResizable(resizeable))
  ipcMain.handle('fullscreenable', (_event, fullscreenable : boolean) => mainWindow?.setFullScreenable(fullscreenable))
  ipcMain.handle('sep', (_event) => path.sep)
  ipcMain.handle('getPath', (_event, path_flag) => app.getPath(path_flag))
  ipcMain.handle('writeFile', (_event, file : PathLike, data) => fs.writeFileSync(file, data, 'utf8'))
  ipcMain.handle('readFile', (_event, file : PathLike) => {
    if (!fs.existsSync(file)) return undefined
    if (fs.lstatSync(file).isDirectory()) return null
    return fsPromise.readFile(file, 'utf8')
  })
  ipcMain.handle('deleteFile', (_event, file : PathLike) => fs.unlinkSync(file))
  ipcMain.handle('mkdir', (_event, dir : PathLike) => fsPromise.mkdir(dir,{recursive: true}))
  ipcMain.handle('exists', (_event, file : PathLike) => fs.existsSync(file))
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  app.quit();
});

async function startGame(hyperspace_path: PathLike, modlist: ModLoadInfo[]){
  const game = new Game(mainWindow!, await Promise.all(modlist.map(modLoadInfoToMod)))
  runThroughLoadingSequence([{
      status_text: "Loading Wishgranter",
      function: loadWishgranter
    },
    {
      status_text: "Loading Mods",
      function: loadMods
    },
    {
      status_text: "Loading Hyperspace Deck Command",
      function: (_hyperspace_path: string, game: Game) => game.startGame()
    },
    ], hyperspace_path, game)
}

async function runThroughLoadingSequence(load_sequence: LoadSequenceElement[], hyperspace_path : PathLike, game : Game) {
    mainWindow?.webContents.send('loading_split', load_sequence.length)
    for (let element of load_sequence) {
      mainWindow?.webContents.send('loading_status', element.status_text)
      let sub_sequence = await element.function(path.join(hyperspace_path.toString(), 'resources', 'app.asar', 'app'), game)
      if (sub_sequence) {
          await runThroughLoadingSequence(sub_sequence, hyperspace_path, game)
      }
      mainWindow?.webContents.send('loading_complete')
    }
}