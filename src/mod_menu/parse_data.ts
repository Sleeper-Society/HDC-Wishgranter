import fsPromise from "fs/promises";
import { PathLike } from "node:fs";
import path from "node:path";
import { Game, Mod, Card, LoadSequenceFunction, Encounter, StartingDeck, Dongle } from "../exports";
import { LoadableModMetaData } from "../mod";
import { getTemporaryReplacedFile } from "./load_wishgranter";

export const modified_jsons = ['cards','encounters','upgrades','comms','loot_list_up','loot_list_card','unlock_cond']
export const unmodified_jsons = ['tooltips','tutorials','text_lists','cloud_labels','credits']

export function replaceData(hyperspace_path: string, game: Game){
    return getTemporaryReplacedFile(hyperspace_path, game, 'data.js',
        [
            /(?<="?file"?: ?")([\w/]*)(?=\.(?:(?:png)|(?:wav)|(?:ogg))")/g,
            path.join(hyperspace_path, '$1')
        ],
        [
            /(?<="?file"?: ?")([\w/]*)(?=\.(?:json)")/g,
            path.join(game.getTempDirectory(), '$1')
        ]);
}

export async function convertDefualtDataToMod(hyperspace_path: PathLike): Promise<Mod> {
    return fsPromise.readFile(path.join(hyperspace_path.toString(), 'resources', 'app.asar', 'app', 'data.js'), 'utf8').then((data) => {
        let jsdata: any = {};
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
export async function convertDefualtDataToLoadableModMetaData(hyperspace_path: PathLike): Promise<LoadableModMetaData> {
    return fsPromise.readFile(path.join(hyperspace_path.toString(), 'resources', 'app.asar', 'app', 'data.js'), 'utf8').then((data) => {
        let jsdata: any = {};
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
