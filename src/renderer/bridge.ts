import {
    PathLike
} from "node:fs";
import {
    LoadableModMetaData,
    ModLoadInfo
} from "../mod";

export default interface PreloadedWindow {
    loading: {
        game_loaded() : void;
        load_game_percent_increase(): void;
        onComplete(subscriber: () => void): void;
        onSplit(subscriber: (peices: number) => void): void;
        onNewStatus(subscriber: (new_status: string) => void): void;
        onAddScript(addScript: (script_source: string) => Promise < void > ): void;
    };
    wishgranter: {
        getModsFromLocation(hyperspace_path: PathLike, mods_path: PathLike): Promise < LoadableModMetaData[] > ;
        startGame(hyperspacePath: PathLike, mods: ModLoadInfo[]): void;
        getSteamGameLocation(): PromiseLike < string > ;
        askUserForDirectory(default_path: string | null | undefined): PromiseLike < string > ;
        getDefaultModsPath(): PromiseLike < string > ;
        getDefaultHyperspacePath(): PromiseLike < string > ;
        onGameStart(baseStartGame: (modlist: ((runtime_game: any) => void)[]) => void): void;
    };
    remote_replace: {
        getCurrentWindow: () => {
            focus: () => void;
            setFullScreen: (set_fullscreen: boolean) => void;
            setContentSize: (width: number, height: number) => void;
            close: () => void;
            setResizable: (resizeable: boolean) => void;
            setFullScreenable: (fullscreenable: boolean) => void;
        };
        path: {
            sep: string
        };
        app: {
            getPath(flag: 'documents' | 'home'): string
        };
        fs: {
            existsSync(file: PathLike): boolean;
            unlinkSync(file: PathLike): void;
            writeFileSync(file: PathLike, arg1: string, arg2: string): void;
            mkdirSync(dir: PathLike): void;
            readFileSync(file: PathLike): string | null;
        }
    };

}