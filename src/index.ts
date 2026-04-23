/**
 * This is the file handling the startup and lifetime of the game
 * running in Electron Runtime.
 */
// Modules to control application life and create native browser window
import { app, BrowserWindow, shell, Menu, ipcMain, dialog } from "electron";
import path from "path";
import type { PathLike } from "fs";
import fs from "fs";
import fsPromise from "fs/promises";
import os from "os";
import { findSteamApp } from "steam-locate";
import type { RemoteReplace, Wishgranter } from "./renderer/preload.ts";

const config_path = path.join(os.homedir(), "HDC", "config.json");
interface Config {
  hyperspace_path?: string;
  mods_path?: string;
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  new WishgranterPreloadHandler();
  new RemoteReplacePreloadHandler();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    useContentSize: true,
    title: "Hyperspace Deck Command: Wishgranter",
    backgroundColor: "#000000",
    webPreferences: {
      preload: path.join(import.meta.dirname, "renderer", "preload.js"),
    },
  });

  // Open external link in the OS default browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url);
    return {
      action: "deny",
    };
  });

  // and load the index.html of the app.
  void mainWindow.loadFile("../mod_menu.html");

  Menu.setApplicationMenu(null);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    fs.rmSync(path.join(app.getPath("temp"), "HDCWishgranter"), {
      force: true,
      recursive: true,
    });
    app.quit();
  });

  return mainWindow;
}

type AwaitedFuncs<T> = {
  [Key in keyof T]: T[Key] extends (...args: never) => unknown
    ? (
        ...args: Parameters<T[Key]>
      ) => Awaited<ReturnType<T[Key]>> | ReturnType<T[Key]>
    : T[Key];
};
class WishgranterPreloadHandler implements AwaitedFuncs<Wishgranter> {
  constructor() {
    for (const key of Object.getOwnPropertyNames(
      this.constructor.prototype,
    ) as (keyof WishgranterPreloadHandler)[]) {
      ipcMain.handle(
        key,
        (_event, ...args: Parameters<Wishgranter[keyof Wishgranter]>) =>
          (
            this[key] as (
              ...args: Parameters<
                WishgranterPreloadHandler[keyof WishgranterPreloadHandler]
              >
            ) => ReturnType<
              WishgranterPreloadHandler[keyof WishgranterPreloadHandler]
            >
          )(...args),
      );
    }
  }
  async getDefaultHyperspacePath(): Promise<PathLike> {
    if (fs.existsSync(config_path)) {
      const config = JSON.parse(fs.readFileSync(config_path, "utf8")) as Config;
      if (config.hyperspace_path) {
        return config.hyperspace_path;
      }
    }
    return this.getSteamGameLocation();
  }
  getDefaultModsPath(): PathLike {
    if (fs.existsSync(config_path)) {
      const config = JSON.parse(fs.readFileSync(config_path, "utf8")) as Config;
      if (config.mods_path) {
        return config.mods_path;
      }
    }
    return os.homedir() + "/HDC/Mods";
  }
  async getSteamGameLocation(): Promise<PathLike> {
    const response = await findSteamApp("2711190");
    return response.installDir ?? "";
  }
  getModsFromLocation(location: PathLike) {
    if (!fs.existsSync(location)) return [];
    return fs
      .readdirSync(location)
      .map((mod_path) => path.join(location.toString(), mod_path))
      .filter((mod_path) => fs.existsSync(path.join(mod_path, "/index.js")));
  }
  async askUserForDirectory(start_directory: string): Promise<string> {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      defaultPath: start_directory,
      properties: ["openDirectory"],
    });
    if (!canceled) {
      return filePaths[0];
    }
    return "";
  }
  async getHyperspaceScriptTags(hyperspace_path: PathLike): Promise<string[]> {
    const file = await fsPromise.readFile(
      path.join(
        hyperspace_path.toString(),
        "resources",
        "app.asar",
        "app",
        "index.html",
      ),
      "utf8",
    );
    return Array.from(file.matchAll(/src="([\w\-/.]+?)"/g)).map(
      (value) => value[1],
    );
  }
  readHyperspaceFile(
    hyperspace_path: PathLike,
    file_name: PathLike,
  ): Promise<string> {
    return fsPromise.readFile(
      path.join(
        hyperspace_path.toString(),
        "resources",
        "app.asar",
        "app",
        file_name.toString(),
      ),
      "utf8",
    );
  }
  async createTemporaryFile(
    file_name: PathLike,
    data: string,
  ): Promise<string> {
    const sep_file_name = file_name.toString().split(path.sep);
    await fsPromise.mkdir(path.join(app.getPath("temp"), "HDCWishgranter"), {
      recursive: true,
    });
    const temp_path = path.join(
      app.getPath("temp"),
      "HDCWishgranter",
      sep_file_name[sep_file_name.length - 1],
    );
    await fsPromise.writeFile(temp_path, data, { flag: "w" });
    return temp_path;
  }
}

type Flatten<
  T extends Record<string, unknown>,
  Key = keyof T,
  A = Key extends string
    ? T[Key] extends Record<string, unknown>
      ? Flatten<T[Key]>
      : T[Key] extends () => Record<string, unknown>
        ? Flatten<ReturnType<T[Key]>>
        : Record<Key, T[Key]>
    : never,
> = (A extends unknown ? (k: A) => void : never) extends (k: infer I) => void
  ? I
  : never;

class RemoteReplacePreloadHandler implements AwaitedFuncs<
  Flatten<RemoteReplace>
> {
  constructor() {
    for (const key of Object.getOwnPropertyNames(this.constructor.prototype)) {
      if (key == "constructor") continue;
      ipcMain.handle(key, (_event, ...args) => {
        // @ts-expect-error Blind Call into class, cannot typecheck
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this[key as keyof RemoteReplacePreloadHandler](...args);
      });
    }
  }
  getPaths() {
    return;
  }
  focus() {
    mainWindow?.focus();
  }
  close() {
    mainWindow?.close();
  }
  setFullScreen(set_fullscreen: boolean) {
    mainWindow?.setFullScreen(set_fullscreen);
  }
  setContentSize(width: number, height: number) {
    mainWindow?.setContentSize(width, height);
  }
  setResizable(set_resizable: boolean) {
    mainWindow?.setResizable(set_resizable);
  }
  setFullScreenable(set_fullscreenable: boolean) {
    mainWindow?.setFullScreenable(set_fullscreenable);
  }
  getPath(path_flag: "documents" | "home" | "temp") {
    const out = app.getPath(path_flag);
    if (path_flag == "temp") {
      fs.mkdirSync(path.join(app.getPath(path_flag), "HDCWishgranter"));
      return path.join(out, "HDCWishgranter");
    }
    return out;
  }
  sep() {
    const out = path.sep;
    return out;
  }
  existsSync(file: PathLike) {
    return !file;
  }
  unlinkSync() {
    return;
  }
  writeFileSync(file: PathLike, data: string) {
    fs.writeFileSync(file, data, { flag: "w", encoding: "utf8" });
  }
  readFileSync(file: PathLike) {
    if (!fs.existsSync(file)) return "undefined";
    if (fs.lstatSync(file).isDirectory()) return "null";
    return fs.readFileSync(file, "utf8");
  }
  mkdirSync(file: PathLike) {
    return fs.existsSync(file);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);
