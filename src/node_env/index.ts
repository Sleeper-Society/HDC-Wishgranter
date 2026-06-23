/**
 * This is the file handling the startup and lifetime of the game
 * running in Electron Runtime.
 */
// Modules to control application life and create native browser window
import { app, BrowserWindow, shell, Menu, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import fsPromise from "fs/promises";
import os from "os";
import { findSteamApp } from "steam-locate";
import type { ModMenu, RemoteReplace, Wishgranter } from "../preload.ts";

const config_path = path.join(os.homedir(), "HDC", "config.json");
interface Config {
    hyperspace_path?: string;
    mods_path?: string;
    mod_paths?: (string | { mod_directory_path: string; enabled: boolean })[];
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null;

function createWindow() {
    new WishgranterPreloadHandler();
    new RemoteReplacePreloadHandler();
    new ModMenuPreloadHandler();

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        useContentSize: true,
        title: "Hyperspace Deck Command: Wishgranter",
        backgroundColor: "#000000",
        webPreferences: {
            preload: path.join(import.meta.dirname, "..", "preload.js"),
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
    void mainWindow.loadFile("./modMenu.html");

    Menu.setApplicationMenu(null);

    // Open the DevTools.
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        // De-reference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        fs.rmSync(path.join(app.getPath("temp"), "Wishgranter"), {
            force: true,
            recursive: true,
        });
        app.quit();
    });

    return mainWindow;
}

type AwaitedFuncs<T> = {
    [Key in keyof T]: T[Key] extends (...args: never) => unknown ?
        (
            ...args: Parameters<T[Key]>
        ) => Awaited<ReturnType<T[Key]>> | ReturnType<T[Key]>
    :   () => Promise<T[Key]> | T[Key];
};
class ModMenuPreloadHandler implements AwaitedFuncs<ModMenu> {
    constructor() {
        for (const key of Object.getOwnPropertyNames(
            this.constructor.prototype,
        ).filter(
            (key) => key != "constructor",
        ) as (keyof ModMenuPreloadHandler)[]) {
            ipcMain.handle(
                key,
                (_event, ...args: Parameters<ModMenu[keyof ModMenu]>) =>
                    (
                        this[key] as (
                            ...args: Parameters<
                                ModMenuPreloadHandler[keyof ModMenuPreloadHandler]
                            >
                        ) => ReturnType<
                            ModMenuPreloadHandler[keyof ModMenuPreloadHandler]
                        >
                    )(...args),
            );
        }
    }
    async getDefaultHyperspacePath(): Promise<string> {
        if (fs.existsSync(config_path)) {
            const config = JSON.parse(
                await fsPromise.readFile(config_path, "utf8"),
            ) as Config;
            if (config.hyperspace_path) {
                return config.hyperspace_path;
            }
        }
        return this.getSteamGameLocation();
    }
    getDefaultModsPath(): string {
        if (fs.existsSync(config_path)) {
            const config = JSON.parse(
                fs.readFileSync(config_path, "utf8"),
            ) as Config;
            if (config.mods_path) {
                return config.mods_path;
            }
        }
        return path.join(os.homedir(), "HDC", "Mods");
    }
    async getDefaultModPaths(): Promise<
        { mod_directory_path: string; enabled: boolean }[]
    > {
        if (fs.existsSync(config_path)) {
            const config = JSON.parse(
                await fsPromise.readFile(config_path, "utf8"),
            ) as Config;
            if (config.mod_paths) {
                return config.mod_paths
                    .filter((mod_path) =>
                        fs.existsSync(
                            typeof mod_path == "string" ? mod_path : (
                                mod_path.mod_directory_path
                            ),
                        ),
                    )
                    .map((mod_path) =>
                        typeof mod_path == "string" ?
                            { mod_directory_path: mod_path, enabled: true }
                        :   mod_path,
                    );
            }
        }
        return (
            await this.getModsFromLocation(
                path.join(os.homedir(), "HDC", "Mods"),
            )
        ).map((mod_path) => {
            return { mod_directory_path: mod_path, enabled: true };
        });
    }
    async savePaths(
        hyperspace_path: string,
        mods_path: string,
        ...mod_paths: { mod_directory_path: string; enabled: boolean }[]
    ) {
        let config: Config =
            fs.existsSync(config_path) ?
                (JSON.parse(
                    await fsPromise.readFile(config_path, "utf8"),
                ) as Config)
            :   {};
        config = {
            ...config,
            hyperspace_path:
                hyperspace_path != "" ? hyperspace_path : (
                    config.hyperspace_path
                ),
            mods_path: mods_path != "" ? mods_path : config.mods_path,
            mod_paths: mod_paths.length > 0 ? mod_paths : config.mod_paths,
        };
        await fsPromise.writeFile(config_path, JSON.stringify(config, null, 4));
    }
    async getSteamGameLocation(): Promise<string> {
        const response = await findSteamApp("2711190");
        return response.installDir ?? "";
    }
    async getModsFromLocation(location: string) {
        if (!fs.existsSync(location)) return [];
        return (await fsPromise.readdir(location))
            .map((mod_path) => path.join(location, mod_path))
            .filter((mod_path) => fs.lstatSync(mod_path).isDirectory());
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
    getModMetadata(mod_directory_path: string): {
        name: string;
        description?: string;
        icon_path?: string;
        version?: string;
    } {
        return {
            name: mod_directory_path.split(path.sep)[
                mod_directory_path.split(path.sep).length - 1
            ],
            icon_path:
                fs.existsSync(path.join(mod_directory_path, "icon.png")) ?
                    path.join(mod_directory_path, "icon.png")
                :   "",
        };
    }
}
class WishgranterPreloadHandler implements AwaitedFuncs<Wishgranter> {
    constructor() {
        for (const key of Object.getOwnPropertyNames(
            this.constructor.prototype,
        ).filter(
            (key) => key != "constructor",
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

    async getHyperspaceScriptTags(
        hyperspace_path: string,
    ): Promise<`${string}.js`[]> {
        const file = await fsPromise.readFile(
            path.join(
                hyperspace_path,
                "resources",
                "app.asar",
                "app",
                "index.html",
            ),
            "utf8",
        );
        return Array.from(file.matchAll(/(?<=src=")[\w\-/.]+?\.js(?=")/g)).map(
            (match) => match[0] as `${string}.js`,
        );
    }
    readHyperspaceFile(
        hyperspace_path: string,
        file_name: string,
    ): Promise<string> {
        return fsPromise.readFile(
            path.join(
                hyperspace_path,
                "resources",
                "app.asar",
                "app",
                file_name,
            ),
            "utf8",
        );
    }
    async createTemporaryFile(
        file_name: string,
        data: string,
    ): Promise<string> {
        const sep_file_name = file_name.split(path.sep);
        await fsPromise.mkdir(path.join(app.getPath("temp"), "Wishgranter"), {
            recursive: true,
        });
        const temp_path = path.join(
            app.getPath("temp"),
            "Wishgranter",
            sep_file_name[sep_file_name.length - 1],
        );
        await fsPromise.writeFile(temp_path, data, { flag: "w" });
        return temp_path;
    }
    getAllFilesToLoadFromMod(mod_directory_path: string) {
        return fsPromise
            .readdir(mod_directory_path, { recursive: true })
            .then((files) =>
                files.filter((file) =>
                    ["js", "json"].includes(
                        file.split(".")[file.split(".").length - 1],
                    ),
                ),
            );
    }
}

type Flatten<
    T extends Record<string, unknown>,
    Key = keyof T,
    A = Key extends string ?
        T[Key] extends Record<string, unknown> ? Flatten<T[Key]>
        : T[Key] extends () => Record<string, unknown> ?
            Flatten<ReturnType<T[Key]>>
        :   Record<Key, T[Key]>
    :   never,
> =
    (A extends unknown ? (k: A) => void : never) extends (k: infer I) => void ?
        I
    :   never;

class RemoteReplacePreloadHandler implements AwaitedFuncs<
    Flatten<RemoteReplace>
> {
    constructor() {
        for (const key of Object.getOwnPropertyNames(
            this.constructor.prototype,
        ).filter(
            (key) => key != "constructor",
        ) as (keyof RemoteReplacePreloadHandler)[]) {
            ipcMain.handle(
                key,
                (
                    _event,
                    ...args: Parameters<
                        Extract<
                            Flatten<RemoteReplace>[keyof Flatten<RemoteReplace>],
                            //eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (...args: any[]) => any
                        >
                    >
                ) =>
                    (
                        this[key] as (
                            ...args: Parameters<
                                Extract<
                                    Flatten<RemoteReplace>[keyof Flatten<RemoteReplace>],
                                    //eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (...args: any[]) => any
                                >
                            >
                        ) => ReturnType<
                            Extract<
                                Flatten<RemoteReplace>[keyof Flatten<RemoteReplace>],
                                //eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (...args: any[]) => any
                            >
                        >
                    )(...args),
            );
        }
    }
    getPaths() {
        return;
    }
    join(...file_names: string[]) {
        return path.join(...file_names);
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
            if (
                !fs.existsSync(path.join(app.getPath(path_flag), "Wishgranter"))
            )
                fs.mkdirSync(path.join(app.getPath(path_flag), "Wishgranter"));
            return path.join(out, "Wishgranter");
        }
        return out;
    }
    isPackaged() {
        return app.isPackaged;
    }
    sep() {
        return path.sep;
    }
    existsSync(file: string) {
        return !file;
    }
    unlinkSync() {
        return;
    }
    writeFileSync(file: string, data: string) {
        fs.writeFileSync(file, data, { flag: "w", encoding: "utf8" });
    }
    readFileSync(file: string) {
        if (!fs.existsSync(file)) return "undefined";
        if (fs.lstatSync(file).isDirectory()) return "null";
        return fs.readFileSync(file, "utf8");
    }
    readFile(file: string) {
        if (!fs.existsSync(file) || fs.lstatSync(file).isDirectory()) return "";
        return fsPromise.readFile(file, "utf8");
    }
    mkdirSync(file: string) {
        return fs.existsSync(file);
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);
