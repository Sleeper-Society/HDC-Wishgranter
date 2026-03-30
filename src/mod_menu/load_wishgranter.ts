import {
    Game,
    LoadSequenceFunction,
    LoadSequenceElement
} from "../exports.ts"
import fs from 'fs/promises'
import fss from 'fs'
import path from "path";
import { assert } from "console";

type ScriptReplacer = (hyperspace_path: string, game: Game, finisher: (on_finished ? : () => void) => void) => (string |
    Promise < string | [string, Iterable<LoadSequenceElement>] > );

const reimplementaitons: {
    [discarded_path: string]: ScriptReplacer
} = {
    'data.js': (hyperspace_path, game, finsher) => getTemporaryReplacedFile(hyperspace_path, game,
        finsher,
        'data.js',
        [
            [
                /"?file"?: ?"([\w/]*\.(?:(?:png)|(?:wav)|(?:json)|(?:ogg)))"/g,
                '"file":"' + hyperspace_path + '/$1"'
            ]
        ]),
    'code0.js': (hyperspace_path, game, finsher) => getTemporaryReplacedFile(hyperspace_path, game,
        finsher,
        'code0.js',
        [
            [
                /gdjs\s*\.evtsExt__GetPropertiesData__ReturnGameVersion\.func\(runtimeScene, null\)(?: \+(\s*)"(.*)")?/g,
                'gdjs.evtsExt__GetPropertiesData__ReturnGameVersion.func(runtimeScene, null) +$1" (' + (game
                    .modlist.length > 1 ? (game.modlist.length + ' Mods - ') : '') + 'Wishgranter)"'
            ]
        ]),
    'pixi-renderers/loadingscreen-pixi-renderer.js': () => 'dist/renderer/loading_reimplementation.js',
    'pixi-renderers/runtimegame-pixi-renderer.js': (hyperspace_path, game, finisher) => getTemporaryReplacedFile(
        hyperspace_path,
        game,
        finisher,
        'pixi-renderers/runtimegame-pixi-renderer.js',
        [
            [
                /this.getElectronRemote ?= ?\(\) ?=> ?{([\s\S]*?)}\s*?;/g,
                'this.getElectronRemote = () => window.remote_replace;'
            ]
        ]),
    'Extensions/FileSystem/filesystemtools.js': () => 'dist/renderer/filesystem_reimplementation.js',
}

export let loadWishgranter : LoadSequenceFunction = async (hyperspace_path: string, game: Game) => {
        let on_finished : (() => void)[] = []
        return fs.readFile(path.join(hyperspace_path, 'index.html'),'utf-8')
        .then((data) => Array.from(data.matchAll(/src="([\w\-\/\.]+?)"/g))
        .map((value) : LoadSequenceElement => {
            const script_source = value[1]
            return {
                status_text: "Loading " + script_source,
                function: async () => {
                    if (!(script_source in reimplementaitons)) return game.loadScript(path.join(hyperspace_path, script_source !))
                    const reimplementaiton = await reimplementaitons[script_source](hyperspace_path, game, (callback) => {if (callback && !on_finished.includes(callback)) on_finished.push(callback)})
                    if (!Array.isArray(reimplementaiton)) return game.loadScript(reimplementaiton)
                    return Array.from(reimplementaiton[1]).concat([{
                        status_text: 'Loading ' + script_source,
                        function: (_hyperspace_path: string, game : Game) => game.loadScript(reimplementaiton[0])
                    }])
                }
            }
        }).concat([{
            status_text: "Cleaning up",
            function: () => on_finished.forEach((callback) => callback())
        }]))
}

let directory : string = ''

async function getTemporaryReplacedFile(hyperspace_path: string,
    game : Game,
    finisher: (on_finished ? : () => void) => void,
    file_name: string,
    replacements: [regex: RegExp, replacement: string][]
): Promise < string | [string, Iterable<LoadSequenceElement>] > {
    if (!directory || !fss.existsSync(directory)) {
        directory = path.join(game.getTempDirectory(),'HDCWishgranter')
        fs.mkdir(directory,{recursive: true})
    }
    const temp_path = path.join(directory, 'parsed' + file_name.replaceAll(/\//g, ''))
    finisher(tempDirectoryCleanup)
    let data = await fs.readFile(path.join(hyperspace_path, file_name), 'utf8');
    let output = replacements.map((value, index, array): LoadSequenceElement => {
        return {
            status_text: file_name + ' Replacement Pass ' + index + '/' + array.length,
            function: () => {
                assert(data.match(value[0]), value[0])
                data = value[0].global ? data.replaceAll(value[0], value[1]) : data.replace(value[0],
                    value[1]);
            }
        };
    });
    if (output.length >= 1) return [temp_path, output.concat({
        status_text: 'Writing ' + file_name,
        function: () => fs.writeFile(temp_path, data, {flag : 'w'})
    })];
    await fs.writeFile(temp_path, data, {flag : 'w'});
    return temp_path;
}

async function tempDirectoryCleanup(){
    await fs.rm(directory, { force: true, recursive: true });
    return directory = '';
}