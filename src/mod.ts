import fsPromise from "fs/promises";
import fs from 'fs'
import {
    Game
} from "./game.ts";
import {
    LoadSequenceFunction,
    LoadSequenceReturns
} from "./mod_menu/load_sequence.ts";
import {
    PathLike
} from "fs";
import path from "path";

type RuntimeGame = any
export interface Mod {
    metadata: ModMetaData
    load ? : LoadSequenceFunction;
    gamestart ? : (gdgame: RuntimeGame) => void;
};
export interface ModHeader {
    name: string;
    version: string;
}
export interface ModMetaData extends ModHeader {
    descr ? : string;
    description ? : string;

    icon ? : string;
    dependencies ? : [string, string][];
    seealso ? : [string, string][];
}
interface loadable {
    path: PathLike
    is_default ? : true
}
export interface LoadableModMetaData extends ModMetaData, loadable {}

export interface ModLoadInfo extends ModHeader, loadable {}


export let bad_mod: LoadableModMetaData = {
    name: "Something went wrong",
    version: '0',
    path: ''
}

export async function modLoadInfoToMod(input: ModLoadInfo): Promise < Mod > {
    if (input.is_default) return await convertDefualtDataToMod(input.path)
    let has_index = fs.existsSync(input.path)
    if (has_index) try {
        fs.accessSync(path.join(input.path.toString(), '/index.js'), fs.constants.R_OK)
        has_index = true
    } catch (error) {
        console.warn('Unable to load ', path, '. ', error)
    }
    if (!has_index) return {
        metadata: bad_mod
    }
    return import(path.join(input.path.toString(), "/index.js")).catch((reason) => {
        console.error(reason)
        return bad_mod
    }).then((mod_module) => {
        try {
            return mod_module.default
        } catch (error) {
            console.error(error);
            return {
                metadata: bad_mod
            }
        }
    })
}

export function loadMods(hyperspace_path: string, game: Game): LoadSequenceReturns {
    return game.modlist.map((mod) => {
        return {
            status_text: "Loading " + mod.metadata.name,
            function: () => {
                try {
                    if (mod.load) return mod.load(hyperspace_path, game);
                } catch (error) {
                    console.error(error);
                }
            }
        };
    });
}

async function convertDefualtDataToMod(hyperspace_path: PathLike): Promise < Mod > {
    return fsPromise.readFile(path.join(hyperspace_path.toString(), 'resources', 'app.asar', 'app', 'data.js'), 'utf8').then((data) => {
        let jsdata: any = {}
        eval('jsdata = ' + data.substring(19, data.length - ('gdjs.runtimeGameOptions = {};'.length + 1)));
        return {
            metadata: {
                name: jsdata.properties.name,
                version: jsdata.properties.version,
                description: jsdata.properties.description,

            }
        };
    });
}

export async function convertDefualtDataToLoadableModMetaData(hyperspace_path: PathLike): Promise < LoadableModMetaData > {
    return fsPromise.readFile(path.join(hyperspace_path.toString(), 'resources', 'app.asar', 'app', 'data.js'), 'utf8').then((data) => {
        let jsdata: any = {}
        eval('jsdata = ' + data.substring(19, data.length - ('gdjs.runtimeGameOptions = {};'.length + 1)));
        return {
            name: jsdata.properties.name,
            version: jsdata.properties.version,
            description: jsdata.properties.description,
            is_default: true,
            path: hyperspace_path
        };
    });
}