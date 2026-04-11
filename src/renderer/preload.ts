const {
  contextBridge,
  ipcRenderer,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
} = require("electron") as {
  contextBridge: { exposeInMainWorld: (a: string, b: unknown) => void };
  ipcRenderer: { invoke: (a: string, ...args: unknown[]) => Promise<unknown> };
};
import type { PathLike } from "node:fs";
import type { LoadedModMetaData } from "./mod.ts";

export default interface PreloadedWindow {
  wishgranter: Wishgranter;
  remote_replace: RemoteReplace;
}
export type Wishgranter = typeof wishgranter;
export type RemoteReplace = typeof remote_replace;

let sep: string | undefined = "/";
let documents_path = "";
let home_path = "";
let temp_path = "";
const cached_files: Map<PathLike, string> = new Map<PathLike, string>();
void ipcRenderer
  .invoke("getPath", "documents")
  .then((response: unknown) => (documents_path = response as string));
void ipcRenderer
  .invoke("getPath", "temp")
  .then((response: unknown) => (temp_path = response as string));
void Promise.all([
  ipcRenderer
    .invoke("getPath", "home")
    .then((response: unknown) => (home_path = response as string)),
  ipcRenderer
    .invoke("sep")
    .then((response: unknown) => (sep = response as string)),
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
    void ipcRenderer.invoke("readFileSync", path).then((data: unknown) => {
      if (data != "undefined") cached_files.getOrInsert(path, data as string);
    });
  }
});

const wishgranter = {
  getDefaultHyperspacePath: () =>
    ipcRenderer.invoke("getDefaultHyperspacePath") as Promise<PathLike>,
  getDefaultModsPath: () =>
    ipcRenderer.invoke("getDefaultModsPath") as Promise<PathLike>,
  getSteamGameLocation: () =>
    ipcRenderer.invoke("getSteamGameLocation") as Promise<PathLike>,
  getModsFromLocation: (location: PathLike) =>
    ipcRenderer.invoke("getModsFromLocation", location) as Promise<
      LoadedModMetaData[]
    >,
  askUserForDirectory: (start_directory: string) =>
    ipcRenderer.invoke(
      "askUserForDirectory",
      start_directory,
    ) as Promise<PathLike>,
  getHyperspaceScriptTags: (hyperspace_path: PathLike) =>
    ipcRenderer.invoke("getHyperspaceScriptTags", hyperspace_path) as Promise<
      PathLike[]
    >,
  readHyperspaceFile: (hyperspace_path: PathLike, file_name: PathLike) =>
    ipcRenderer.invoke(
      "readHyperspaceFile",
      hyperspace_path,
      file_name,
    ) as Promise<string>,
  createTemporaryFile: (file_name: PathLike, data: string) =>
    ipcRenderer.invoke(
      "createTemporaryFile",
      file_name,
      data,
    ) as Promise<string>,
};
const remote_replace = {
  getCurrentWindow: () => {
    return {
      focus: (): void => void ipcRenderer.invoke("focus"),
      setFullScreen: (set_fullscreen: boolean): void =>
        void ipcRenderer.invoke("setFullScreen", set_fullscreen),
      setContentSize: (width: number, height: number): void =>
        void ipcRenderer.invoke("setContentSize", width, height),
      close: (): void => void ipcRenderer.invoke("close"),
      setResizable: (resizeable: boolean): void =>
        void ipcRenderer.invoke("setResizable", resizeable),
      setFullScreenable: (fullscreenable: boolean): void =>
        void ipcRenderer.invoke("setFullScreenable", fullscreenable),
    };
  },
  app: {
    getPath: (path_flag: "documents" | "home" | "temp") => {
      switch (path_flag) {
        case "documents":
          return documents_path;
        case "home":
          return home_path;
        case "temp":
          return temp_path;
      }
    },
  },
  path: {
    sep: () => sep ?? "/",
  },
  fs: {
    existsSync: (file: PathLike) => cached_files.has(file),
    unlinkSync: (file: PathLike) => {
      void ipcRenderer.invoke("deleteFile", file);
    },
    writeFileSync: writeFile,
    readFileSync: (file: PathLike) => cached_files.get(file) ?? "",
    mkdirSync: (dir: PathLike) => {
      void ipcRenderer.invoke("mkdirSync", dir);
    },
  },
};

contextBridge.exposeInMainWorld("remote_replace", remote_replace);
contextBridge.exposeInMainWorld("wishgranter", wishgranter);

function writeFile(file: PathLike, data: string) {
  cached_files.set(file, data);
  void ipcRenderer.invoke("writeFile", file, data);
}
