import { contextBridge, ipcRenderer } from "electron";

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
let temp_path = "tmp/Wishgranter";
const cached_files: Map<string, string> = new Map<string, string>();

const wishgranter = {
  getDefaultHyperspacePath: () =>
    ipcRenderer.invoke("getDefaultHyperspacePath") as Promise<string>,
  getDefaultModsPath: () =>
    ipcRenderer.invoke("getDefaultModsPath") as Promise<string>,
  getDefaultModPaths: () =>
    ipcRenderer.invoke("getDefaultModPaths") as Promise<string[]>,
  savePaths: (
    hyperspace_path: string,
    mods_path: string,
    ...mod_paths: string[]
  ) =>
    ipcRenderer.invoke("savePaths", hyperspace_path, mods_path, ...mod_paths),
  getSteamGameLocation: () =>
    ipcRenderer.invoke("getSteamGameLocation") as Promise<string>,
  getModsFromLocation: (location: string) =>
    ipcRenderer.invoke("getModsFromLocation", location) as Promise<
      Iterable<string>
    >,
  askUserForDirectory: (start_directory: string) =>
    ipcRenderer.invoke(
      "askUserForDirectory",
      start_directory,
    ) as Promise<string>,
  getHyperspaceScriptTags: (hyperspace_path: string) =>
    ipcRenderer.invoke("getHyperspaceScriptTags", hyperspace_path) as Promise<
      `${string}.js`[]
    >,
  readHyperspaceFile: (hyperspace_path: string, file_name: string) =>
    ipcRenderer.invoke(
      "readHyperspaceFile",
      hyperspace_path,
      file_name,
    ) as Promise<string>,
  createTemporaryFile: (file_name: string, data: string) =>
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
    existsSync: (file: string) => cached_files.has(file),
    unlinkSync: (file: string) => {
      void ipcRenderer.invoke("unlinkSync", file);
    },
    writeFileSync: writeFile,
    readFileSync: (file: string) => cached_files.get(file) ?? "",
    mkdirSync: (dir: string) => {
      void ipcRenderer.invoke("mkdirSync", dir);
    },
  },
  fsPromise: {
    readFile: (file: string) =>
      ipcRenderer.invoke("readFile", file) as Promise<string>,
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

function writeFile(file: string, data: string) {
  cached_files.set(file, data);
  ipcRenderer.invoke("writeFileSync", file, data).catch((error: unknown) => {
    console.error(error);
  });
}
