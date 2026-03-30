import { IpcRendererEvent, contextBridge, ipcRenderer } from "electron"
import { ModHeader } from "../mod.ts"
import PreloadedWindow from "./bridge.ts"
import { PathLike } from "node:fs"

contextBridge.exposeInMainWorld('loading', {
    onNewStatus: (callback: (new_status: string) => void) => ipcRenderer.on('loading_status', (_event : IpcRendererEvent, new_status : string) => callback(new_status)),
    onSplit: (callback: (peices: number) => void) => ipcRenderer.on('loading_split', (_event : IpcRendererEvent, peices : number) => callback(peices)),
    onComplete: (callback: () => void) => ipcRenderer.on('loading_complete', (_event : IpcRendererEvent) => callback()),
    onAddScript: (callback: (script_source: string) => Promise<void>) => ipcRenderer.on('add_script', (_event : IpcRendererEvent, script_source : string) => callback(script_source).then(() => ipcRenderer.invoke(script_source + '_loaded')))
} as PreloadedWindow["loading"])

contextBridge.exposeInMainWorld('wishgranter', {
    onGameStart : (callback: (modlist: ((runtime_game : any) => void)[]) => void ) => ipcRenderer.on('start_game', (_event : IpcRendererEvent, modlist: ((runtime_game : any) => void)[]) => callback(modlist)),
    getDefaultHyperspacePath : () => ipcRenderer.invoke('getHyperspace'),
    getDefaultModsPath : () => ipcRenderer.invoke('getDefaultMods'),
    getSteamGameLocation: () => ipcRenderer.invoke('getSteam'),
    getModsFromLocation: (game_location: PathLike , location: PathLike) => ipcRenderer.invoke('getMods', game_location, location),
    askUserForDirectory: (start_directory: string) => ipcRenderer.invoke('askForDirectory', start_directory),
    startGame: (hyperspace_path: string, modlist: ModHeader[]) => ipcRenderer.invoke('startGame', hyperspace_path, modlist)
} as PreloadedWindow["wishgranter"])

let sep = '/'
let documents_path = ''
let home_path = ''
let cached_files : Map<PathLike, string | null> = new Map<PathLike, string>()
Promise.all([
    ipcRenderer.invoke('getPath', 'documents').then((response : string) => documents_path = response),
    ipcRenderer.invoke('getPath', 'home').then((response : string) => home_path = response),
    ipcRenderer.invoke('sep').then((response : string) => sep = response)
]).then(([documents, home_path, sep]) => {
    const paths_to_check_in_hdc : string[] = ['','config.json','unlocks.json','flagships.json','run_save.json','run_save_mod.json','run_save_lp.json']
    for (const path of paths_to_check_in_hdc.map((value) => home_path + sep + 'HDC' + sep + value)){
        ipcRenderer.invoke('readFile', path).then((data : string | undefined | null) => {if (data != undefined) cached_files.getOrInsert(path,data)})
    }
})

contextBridge.exposeInMainWorld('remote_replace', {
    getCurrentWindow : () => {return {
        focus : () => ipcRenderer.invoke('focus'),
        setFullScreen : (set_fullscreen : boolean) => ipcRenderer.invoke('fullscreen', set_fullscreen),
        setContentSize : (width : number, height : number) => ipcRenderer.invoke('content_size', width, height),
        close : () => ipcRenderer.invoke('close'),
        setResizable : (resizeable : boolean) => ipcRenderer.invoke('resizeable', resizeable),
        setFullScreenable : (fullscreenable : boolean) => ipcRenderer.invoke('fullscreenable', fullscreenable)
    }},
    app : {
        getPath : (path_flag : 'documents' | 'home') => path_flag == 'documents' ? documents_path : home_path
    },
    path : {
        sep : '/'
    },
    fs : {
        existsSync : (file : PathLike) => cached_files.has(file),
        unlinkSync : (file : PathLike) => {ipcRenderer.invoke('deleteFile', file)},
        writeFileSync : writeFile,
        readFileSync : (file : PathLike) => cached_files.get(file),
        mkdirSync : (dir : PathLike) => ipcRenderer.invoke('mkdir', dir),
    }
} as PreloadedWindow["remote_replace"])

function writeFile(file : PathLike, data : string){
    cached_files.set(file, data)
    ipcRenderer.invoke('writeFile', file, data)
}