import type {
  contextBridge as contextBridgeType,
  ipcRenderer as ipcRendererType,
} from "electron";
//eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require("electron") as {
  contextBridge: typeof contextBridgeType;
  ipcRenderer: typeof ipcRendererType;
};
import type { PathLike } from "node:fs";

declare global {
  interface Window {
    wishgranter: Wishgranter;
    remote_replace: RemoteReplace;
  }
}

export type Wishgranter = typeof wishgranter;
export type RemoteReplace = typeof remote_replace;

let sep = "/";
let documents_path = "~/Documents";
let home_path = "~";
let temp_path = "tmp/HDCWishgranter";
const cached_files: Map<PathLike, string> = new Map<PathLike, string>();

const wishgranter = {
  getDefaultHyperspacePath: () =>
    ipcRenderer.invoke("getDefaultHyperspacePath") as Promise<PathLike>,
  getDefaultModsPath: () =>
    ipcRenderer.invoke("getDefaultModsPath") as Promise<PathLike>,
  getSteamGameLocation: () =>
    ipcRenderer.invoke("getSteamGameLocation") as Promise<PathLike>,
  getModsFromLocation: (location: PathLike) =>
    ipcRenderer.invoke("getModsFromLocation", location) as Promise<string[]>,
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
  getPaths: getPaths,
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
    sep: () => sep,
  },
  fs: {
    existsSync: (file: PathLike) => cached_files.has(file),
    unlinkSync: (file: PathLike) => {
      void ipcRenderer.invoke("unlinkSync", file);
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

async function getPaths() {
  documents_path =
    (await (ipcRenderer.invoke("getPath", "documents") as Promise<
      string | undefined
    >)) ?? documents_path;
  temp_path =
    (await (ipcRenderer.invoke("getPath", "temp") as Promise<
      string | undefined
    >)) ?? temp_path;
  home_path =
    (await (ipcRenderer.invoke("getPath", "home") as Promise<
      string | undefined
    >)) ?? home_path;
  sep =
    (await (ipcRenderer.invoke("sep") as Promise<string | undefined>)) ?? sep;

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
}

function writeFile(file: PathLike, data: string) {
  cached_files.set(file, data);
  ipcRenderer.invoke("writeFileSync", file, data).catch((error: unknown) => {
    console.error(error);
  });
}
