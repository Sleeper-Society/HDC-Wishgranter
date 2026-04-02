import fsPromise from "fs/promises";
import { PathLike } from "node:fs";
import path from "node:path";
import { Game, Mod, Card, LoadSequenceFunction, Encounter, StartingDeck, Dongle } from "../exports";
import { LoadableModMetaData } from "../mod";
import { getTemporaryReplacedFile } from "./load_wishgranter";

export function replaceData(hyperspace_path: string, game: Game, finsher: (on_finished?: () => void) => void){
    return getTemporaryReplacedFile(hyperspace_path, game, finsher, 'data.js',
        [
            [
                /(?<="?file"?: ?")([\w/]*)(?=\.(?:(?:png)|(?:wav)|(?:ogg))")/g,
                path.join(hyperspace_path, '$1')
            ],
            [
                /(?<="?file"?: ?")([\w/]*)(?=\.(?:json)")/g,
                path.join(game.getTempDirectory(), '$1')
            ]
        ]);
}

export const bakeJSONs : LoadSequenceFunction = async function(hyperspace_path: string, game : Game) {

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

export function addEncounter(this : Game, encounter : Encounter) {

}
export function addStartingDeck(this : Game, starting_deck : StartingDeck) {

}
export function addCardToLootPool(this : Game, loot_pool : string, card : Card){

}
export function addDongleToLootPool(this : Game, loot_pool : string, dongle : Dongle){

}
