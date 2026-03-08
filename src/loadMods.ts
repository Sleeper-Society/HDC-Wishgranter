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

export async function loadMods(hyperspace_path : string, mods_path : string) {
    let mods: Mod[] = [];
    mods.push(convertDefualtDataToMod(hyperspace_path));
    const modpaths = fs.readdirSync(mods_path)
    for (const path of modpaths){
        try {
            // @ts-expect-error
            // Modules are being annoying and the fixes are not fixing
             mods.push((await import(path + "/index.js"))())
        } catch (error) {
            console.error(error);
            
        }
    }
    return mods.map((value, index) => {
        return {
            status_text: "Mod " + index,
            function: value.load
        };
    });
}
function convertDefualtDataToMod(hyperspace_path : string) : Mod{
    let data : string = fs.readFileSync(hyperspace_path + '/data.js', 'utf8')
    const regex = /file: "([\w/]*\.(?:(?:png)|(?:wav)|(?:json)|(?:ogg)))"/g
    data = data.replace(regex, 'file: "' + hyperspace_path + '$1"')
    return {
        name:"Base Game",
        version: '1.0.0',
        load: () => {eval(data)}
    }
}
