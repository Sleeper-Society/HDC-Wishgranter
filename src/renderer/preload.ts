import type { IpcRendererEvent } from "electron";
import { contextBridge, ipcRenderer } from "electron";
import type { ModHeader } from "../mod.ts";
import type PreloadedWindow from "./bridge.ts";
import type { PathLike } from "node:fs";

const loading: PreloadedWindow["loading"] = {
  onNewStatus: (callback: (new_status: string) => void) =>
    ipcRenderer.on(
      "loading_status",
      (_event: IpcRendererEvent, new_status: string) => {
        callback(new_status);
      },
    ),
  onSplit: (callback: (peices: number) => void) =>
    ipcRenderer.on(
      "loading_split",
      (_event: IpcRendererEvent, peices: number) => {
        callback(peices);
      },
    ),
  onComplete: (callback: () => void) =>
    ipcRenderer.on("loading_complete", () => {
      callback();
    }),
  onAddScript: (callback: (script_source: string) => Promise<void>) =>
    ipcRenderer.on(
      "add_script",
      (_event: IpcRendererEvent, script_source: string) =>
        void callback(script_source).then(() =>
          ipcRenderer.invoke(script_source + "_loaded"),
        ),
    ),
  load_game_percent_increase: () => void ipcRenderer.invoke("loading"),
  game_loaded: () => void ipcRenderer.invoke("game_loaded"),
};
const wishgranter: PreloadedWindow["wishgranter"] = {
  onGameStart: (
    callback: (modlist: ((runtime_game: unknown) => void)[]) => void,
  ) =>
    ipcRenderer.on(
      "start_game",
      (
        _event: IpcRendererEvent,
        modlist: ((runtime_game: unknown) => void)[],
      ) => {
        callback(modlist);
      },
    ),
  getDefaultHyperspacePath: () => ipcRenderer.invoke("getHyperspace"),
  getDefaultModsPath: () => ipcRenderer.invoke("getDefaultMods"),
  getSteamGameLocation: () => ipcRenderer.invoke("getSteam"),
  getModsFromLocation: (game_location: PathLike, location: PathLike) =>
    ipcRenderer.invoke("getMods", game_location, location),
  askUserForDirectory: (start_directory: string) =>
    ipcRenderer.invoke("askForDirectory", start_directory),
  startGame: (hyperspace_path: string, modlist: ModHeader[]) =>
    void ipcRenderer.invoke("startGame", hyperspace_path, modlist),
};
const remote_replace: PreloadedWindow["remote_replace"] = {
  getCurrentWindow: () => {
    return {
      focus: () => void ipcRenderer.invoke("focus"),
      setFullScreen: (set_fullscreen: boolean) =>
        void ipcRenderer.invoke("fullscreen", set_fullscreen),
      setContentSize: (width: number, height: number) =>
        void ipcRenderer.invoke("content_size", width, height),
      close: () => void ipcRenderer.invoke("close"),
      setResizable: (resizeable: boolean) =>
        void ipcRenderer.invoke("resizeable", resizeable),
      setFullScreenable: (fullscreenable: boolean) =>
        void ipcRenderer.invoke("fullscreenable", fullscreenable),
    };
  },
  app: {
    getPath: (path_flag: "documents" | "home") =>
      path_flag == "documents" ? documents_path : home_path,
  },
  path: {
    sep: () => sep,
  },
  fs: {
    existsSync: (file: PathLike) => cached_files.has(file),
    unlinkSync: (file: PathLike) => {
      void ipcRenderer.invoke("deleteFile", file);
    },
    writeFileSync: writeFile,
    readFileSync: (file: PathLike) => cached_files.get(file) ?? "",
    mkdirSync: (dir: PathLike) => void ipcRenderer.invoke("mkdir", dir),
  },
};

let sep = "/";
let documents_path = "";
let home_path = "";
const cached_files: Map<PathLike, string | null> = new Map<PathLike, string>();
void ipcRenderer
  .invoke("getPath", "documents")
  .then((response: string) => (documents_path = response));
void Promise.all([
  ipcRenderer
    .invoke("getPath", "home")
    .then((response: string) => (home_path = response)),
  ipcRenderer.invoke("sep").then((response: string) => (sep = response)),
]).then(([home_path, sep]) => {
  const paths_to_check_in_hdc: string[] = [
    "",
    "config.json",
    "unlocks.json",
    "flagships.json",
    "run_save.json",
    "run_save_mod.json",
    "run_save_lp.json",
  ];
  for (const path of paths_to_check_in_hdc.map(
    (value) => home_path + sep + "HDC" + sep + value,
  )) {
    void ipcRenderer
      .invoke("readFile", path)
      .then((data: string | undefined | null) => {
        if (data != undefined) cached_files.getOrInsert(path, data);
      });
  }
});

contextBridge.exposeInMainWorld("loading", loading);
contextBridge.exposeInMainWorld("remote_replace", remote_replace);
contextBridge.exposeInMainWorld("wishgranter", wishgranter);

function writeFile(file: PathLike, data: string) {
  cached_files.set(file, data);
  void ipcRenderer.invoke("writeFile", file, data);
}
