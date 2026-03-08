import loading_reimplementation from "./loading_reimplementation.ts"
const fs = require('fs')

type Mod = {
    name : string,
    descr? : string,
    description? : string,
    version : string
    dependencies? : [string, string][]
    seealso? : [string, string][]
    load : () => void
}

type Mod = {
    name: string,
    descr ? : string,
    description ? : string,
    version: string
    dependencies ? : [string, string][]
    seealso ? : [string, string][]
    load: () => void
}

export async function loadMods(hyperspace_path: string, mods_path: string) {
    let mods: Mod[] = [];
    return [{
        status_text : "Loading Mod Info",
        function : (hyperspace_path: string, mods_path: string) => {
            let output = [{
                status_text : "Reading Base Game as mod",
                function : (hyperspace_path: string, mods_path: string) => {
                    mods.push(convertDefualtDataToMod(hyperspace_path));
                }
            }]
            const modpaths = fs.readdirSync(mods_path)
            output.concat(modpaths.map((path : string) => {
                return {
                    status_text : "Reading " + path,
                    function : async (hyperspace_path: string, mods_path: string) => {
                        try {
                            const full_path = mods_path + '/' + path + "/index.js"
                            // @ts-expect-error
                            // import() conflicts with not adding module crap to top of build files
                            const mod_module = await import(full_path)
                            const mod = mod_module.default()
                            mods.push(mod)
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            }))
            return output
        }
    },{
        status_text : "Loading Mods",
        function : () => {
        return mods.map((mod, index) => {
            return {
                status_text: "Loading " + mod.name ,
                function: () => {
                    try {
                        mod.load()
                    } catch (error) {
                        console.error(error);
                }
            }
        };
    });
        }
    }]
}

function convertDefualtDataToMod(hyperspace_path: string): Mod {
    return {
        name: "Base Game",
        version: '1.0.0',
        load: () => {
            let data: string = fs.readFileSync(hyperspace_path + '/data.js', 'utf8')
            const regex = /file: "([\w/]*\.(?:(?:png)|(?:wav)|(?:json)|(?:ogg)))"/g
            data = data.replace(regex, 'file: "' + hyperspace_path + '$1"')
            eval(data)
            // @ts-expect-error
            // GDJS does exist, but declaring it here will bugger the eval call
            gdjs.LoadingScreenRenderer = loading_reimplementation
        }
    }
}