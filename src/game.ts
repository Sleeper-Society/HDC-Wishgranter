import fs, {
    PathLike
} from 'fs'
import fsPromise from 'fs/promises';
import path from 'node:path';
import os from 'os';
import {
    bad_mod,
    LoadableModMetaData,
    ModLoadInfo,
    ModMetaData,
    loadMods,
    modLoadInfoToMod
} from "./mod.ts";
import { convertDefualtDataToLoadableModMetaData, modified_jsons, unmodified_jsons } from './mod_menu/parse_data.ts';
import {
    app,
    BrowserWindow,
    dialog,
    ipcMain
} from 'electron';
import {
    findSteamApp
} from 'steam-locate';
import {
    getTemporaryReplacedFile,
    loadWishgranter
} from './mod_menu/load_wishgranter.ts';
import { Mod, Card, CardLootTable, Dongle, Encounter, StartingDeck, LoadSequenceElement } from './exports.ts';



const config_path = path.join(os.homedir(), 'HDC', 'config.json')
export type Faction = 'glo' | 'lt' | 'tu' | 'con' | 'flo' | 'et' | string

type GameFunctions = {[Method in keyof Game as (Game[Method] extends (() => void) ? Method : never)]: (() => void)}
/**
 * Go between class for Main process and mods and the render process and game state.
 */
export class Game {
    public modlist: Mod[] = [];
    private game_window: BrowserWindow;
    private temp_directory : string = ''
    
    private factions : Faction[] = []
    private encounters : Map<Faction, Encounter[]> = new Map()
    private starting_decks : Map<Faction,StartingDeck[]> = new Map()
    private encounter_reward_dongles: Map<Faction,Dongle[]> = new Map()
    private store_dongles: Map<Faction,Dongle[]> = new Map()
    private encounter_start_dongles: Map<Faction, [gen: Dongle[], stat: Dongle[]]> = new Map()
    private card_loot_table: Map<Faction,CardLootTable> = new Map()
    private additional_comms : Map<string, string[][]> = new Map()

    public bakeJSONs() : LoadSequenceElement[]{
        return unmodified_jsons.map((json_name) => {
            return {
                status_text: 'Copying ' + json_name + '.json',
                function: (hyperspace_path : string, game : Game) => {getTemporaryReplacedFile(hyperspace_path, game, json_name + '.json')}
            }
        }).concat(modified_jsons.map((json_name) => {
            return {
                status_text: 'Baking ' + json_name + '.json',
                function: this[('bake_' + json_name) as keyof GameFunctions]
            }
        }))
    }
    private bake_cards() : void{
         
    }
    private bake_encounters() : void{

    }
    private bake_upgrades() : void {

    }
    private bake_comms() : void {

    }
    private bake_loot_list_up() : void {

    }
    private bake_loot_list_card() : void{

    }
    private bake_unlock_cond() : void{

    }
    public addEncounter(encounter : Encounter, faction : Faction){

    }
    public addStartingDeck(starting_deck : StartingDeck, faction : Faction){

    }
    public addCardToLootPool(card : Card, loot_pool : keyof CardLootTable, faction : Faction, combo_faction?: Faction){
        
    }
    public addDongleToLootPool(dongle : Dongle, loot_pool : 'encounter_reward_dongles' | 'store_dongles' | 'encounter_start_dongles', faction : Faction){

    }
    public addUnrefrencedComm(name : string, comm : string[][]){

    }


    constructor(get_main_window: () => BrowserWindow) {
        this.setupPreloads()
        this.game_window = get_main_window()
    }

    public loadScript(script_source: fs.PathLike): Promise < void > {
        const promise = new Promise < void > ((resolve) => ipcMain.handleOnce(script_source + '_loaded', () =>
            resolve()));
        this.game_window.webContents.send('add_script', script_source)
        return promise
    }
    public getTempDirectory() : string{
        if (!this.temp_directory || !fs.existsSync(this.temp_directory)) {
            this.temp_directory = path.join(os.tmpdir(), 'HDCWishgranter')
            fs.mkdirSync(this.temp_directory, {
                recursive: true
            })
        }
        return this.temp_directory
    }
    public async tempDirectoryCleanup() {
        await fs.rmSync(this.getTempDirectory(), {
            force: true,
            recursive: true
        });
        return this.temp_directory = '';
    }

    private async startGame(hyperspace_path: PathLike, modlist: ModLoadInfo[]) {
        this.modlist = await Promise.all(modlist.map(modLoadInfoToMod))
        this.runThroughLoadingSequence([{
                status_text: "Loading Wishgranter",
                function: loadWishgranter
            },
            {
                status_text: "Loading Mods",
                function: loadMods
            },
            {
                status_text: "Loading Hyperspace Deck Command",
                function: this.loadGame.bind(this)
            },
        ], hyperspace_path)
    }
    private loadGame() : LoadSequenceElement[]{
        return [{
            status_text: 'Starting Game',
            function: (_hyperspace_path: string, game: Game) => this.game_window.webContents.send(
                    'start_game', this.modlist.filter((value) => value.gamestart).map((value) =>
                        value.gamestart))
        }].concat(Array.apply(null,Array(100)).map(() => {return {
                status_text: 'Loading Hyperspace Deck Command',
                function: () => new Promise<void>((resolve) => ipcMain.handleOnce('loading', (_event) => resolve()))
            }}))
    }
    public async runThroughLoadingSequence(load_sequence: LoadSequenceElement[], hyperspace_path: PathLike) {
        this.game_window.webContents.send('loading_split', load_sequence.length)
        for (let element of load_sequence) {
            this.game_window.webContents.send('loading_status', element.status_text)
            let sub_sequence = await element.function(path.join(hyperspace_path.toString(), 'resources', 'app.asar', 'app'), this)
            if (sub_sequence) {
                await this.runThroughLoadingSequence(sub_sequence, hyperspace_path)
            }
            this.game_window.webContents.send('loading_complete')
        }
    }

    private setupPreloads() {
        this.setupLoadingPreloads()
        this.setupModMenuPreloads()
        this.setupRemoteReplacePreloads()
    }
    private setupLoadingPreloads(){
        ipcMain.handle('game_loaded', (_event) => {})
    }
    private setupModMenuPreloads() {
        ipcMain.handle('getHyperspace', (_event) => {
            if (fs.existsSync(config_path)) {
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
            if (fs.existsSync(config_path)) {
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
        ipcMain.handle('getMods', async function(_event, hyperspace_path: PathLike, mods_path: PathLike): Promise <
            LoadableModMetaData[] > {
                let output: LoadableModMetaData[] = [await convertDefualtDataToLoadableModMetaData(
                    hyperspace_path)]
                return !fs.existsSync(mods_path) ? output : output.concat(await Promise.all(
                    (fs.readdirSync(mods_path) as PathLike[])
                    .filter((mod_path: PathLike) => {
                        try {
                            fs.accessSync(path.join(mods_path.toString(), mod_path.toString(),
                                '/index.js'), fs.constants.R_OK)
                            return true
                        } catch (error) {
                            console.warn('Unable to load ', path, '. ', error)
                            return false
                        }
                    })
                    .map(async (mod_path: PathLike): Promise < LoadableModMetaData > =>
                        await import(path.join(mods_path.toString(), mod_path.toString(),
                            "/index.js")).catch((reason) => {
                            console.error(reason)
                            return bad_mod
                        }).then((mod_module) => {
                            try {
                                const mod_data: ModMetaData | LoadableModMetaData =
                                    mod_module.metadata as ModMetaData;
                                (mod_data as LoadableModMetaData).path = mod_path
                                return mod_data as LoadableModMetaData
                            } catch (error) {
                                console.error(error)
                                return bad_mod
                            }
                        }))
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
            })
        ipcMain.handle('startGame', (_event, hyperspace_path: PathLike, modlist: ModLoadInfo[]) => this.startGame(
                hyperspace_path, modlist))
    }
    private setupRemoteReplacePreloads() {
        this.setupWindowPreloads()
        this.setupFilesystemPreloads()
    }
    private setupWindowPreloads() {
        ipcMain.handle('focus', (_event) => this.game_window.focus())
        ipcMain.handle('fullscreen', (_event, set_fullscreen: boolean) => this.game_window.setFullScreen(
            set_fullscreen))
        ipcMain.handle('content_size', (_event, width: number, height: number) => this.game_window.setContentSize(
            width,
            height))
        ipcMain.handle('close', (_event) => this.game_window.close())
        ipcMain.handle('resizeable', (_event, resizeable: boolean) => this.game_window.setResizable(resizeable))
        ipcMain.handle('fullscreenable', (_event, fullscreenable: boolean) => this.game_window.setFullScreenable(
            fullscreenable))
    }
    private setupFilesystemPreloads() {
        ipcMain.handle('sep', (_event) => path.sep)
        ipcMain.handle('getPath', (_event, path_flag) => app.getPath(path_flag))
        ipcMain.handle('writeFile', (_event, file: PathLike, data) => fs.writeFileSync(file, data, 'utf8'))
        ipcMain.handle('readFile', (_event, file: PathLike) => {
            if (!fs.existsSync(file)) return undefined
            if (fs.lstatSync(file).isDirectory()) return null
            return fsPromise.readFile(file, 'utf8')
        })
        ipcMain.handle('deleteFile', (_event, file: PathLike) => fs.unlinkSync(file))
        ipcMain.handle('mkdir', (_event, dir: PathLike) => fsPromise.mkdir(dir, {
            recursive: true
        }))
        ipcMain.handle('exists', (_event, file: PathLike) => fs.existsSync(file))
    }
    
}