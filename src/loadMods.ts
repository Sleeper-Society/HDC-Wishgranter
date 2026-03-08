const fs = require('fs')

export async function loadMods(hyperspace_path : string, mods_path : string) {
    let modlist: string[] = [];
    modlist.push(convertDataToMod(hyperspace_path));
    // for (const path of fs.readdirSync(getModsPath())){
    //     modlist.push(convertPathToMod(path))
    // }
    return modlist.map((value, index) => {
        return {
            status_text: "Mod " + index,
            function: () => { eval(value); return; }
        };
    });
}
function convertDataToMod(hyperspace_path : string) : string{
    let data : string = fs.readFileSync(hyperspace_path + '/data.js', 'utf8')
    const regex = /file: "([\w/]*\.(?:(?:png)|(?:wav)|(?:json)|(?:ogg)))"/g
    return data.replace(regex, 'file: "' + hyperspace_path + '$1"')
}
function convertPathToMod(path : string) : string{
    return fs.readFileSync(path + "/index.js", 'utf8')
}
