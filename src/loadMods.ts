import {
    Game
} from "./game.ts";
import {
    load_sequence_element,
    load_sequence_returns
} from "./load_sequence_element.ts";
import loading_reimplementation from "./loading_reimplementation.ts"
import {
    finished_loading
} from "./loading_reimplementation.ts"
import {
    Mod
} from "./Mod.ts"
const fs = require('fs')

export function loadModInfo(hyperspace_path: string, mods_path: string, game: Game): load_sequence_returns {
    let output: load_sequence_element[] = [{
        status_text: "Reading Base Game as mod",
        function: (hyperspace_path: string, mods_path: string) => {
            game.modlist.push(convertDefualtDataToMod(hyperspace_path, mods_path));
        }
    }]
    return output.concat((fs.readdirSync(mods_path) as string[])
        .filter((path: string) => {
            const file_exists = fs.statSync(mods_path + '/' + path + "/index.js").isFile()
            if (!file_exists) {
                console.warn(path, ' mod at ', mods_path + '/' + path + "/index.js", ' skipped: no index')
            }
            return file_exists
        })
        .map((path: string): load_sequence_element => {
            return {
                status_text: "Reading " + path,
                function: (hyperspace_path: string, mods_path: string) => {
                    return new Promise((resolve) => {
                        // @ts-expect-error
                        // import() conflicts with not adding error causeing module nonsesense to top of build files
                        import(mods_path + '/' + path + "/index.js").catch((reason) => {
                            console.error(reason);
                        }).then((mod_module) => {
                            try {
                                const mod = mod_module.default()
                                game.modlist.push(mod)
                            } catch (error) {
                                console.error(error);
                            }
                            resolve()
                        })
                    })
                }
            }
        }))
}

export function loadMods(hyperspace_path: string, mods_path: string, game: Game): load_sequence_returns {
    return game.modlist.map((mod) => {
        return {
            status_text: "Loading " + mod.name,
            function: () => {
                try {
                    if (mod.ongamestart) {
                        //finished_loading.then(mod.ongamestart)
                    }
                    return mod.load(hyperspace_path, mods_path, game)
                } catch (error) {
                    console.error(error);
                }
            }
        };
    })
}

function convertDefualtDataToMod(hyperspace_path: string, mods_path: string): Mod {

    return {
        name: "Base Game",
        version: '1.0.0',
        load: () => {
            const promise = new Promise < void > ((resolve) => {
                fs.readFile(hyperspace_path + '/data.js', 'utf8', (_err: any, data: string) => {
                    const regex = /"?file"?: ?"([\w/]*\.(?:(?:png)|(?:wav)|(?:json)|(?:ogg)))"/g
                    console.log(data.match(regex))
                    data = data.replace(regex, '"file":"' + hyperspace_path + '$1"')
                    fs.writeFile(mods_path + "/parsedData.js", data, () => {
                        const script_orphan = document.createElement('script')
                        script_orphan.src = mods_path + "/parsedData.js"
                        script_orphan.crossOrigin = 'anonymous'
                        script_orphan.addEventListener('load', () => {
                            fs.rm(mods_path + "/parsedData.js", () => {
                                resolve()
                            })
                        })
                        document.head.appendChild(script_orphan)
                    })
                })
            })

            // @ts-expect-error
            // GDJS does exist, but declaring it here will bugger the eval call
            gdjs.LoadingScreenRenderer = loading_reimplementation
            return promise
        }
    }
}