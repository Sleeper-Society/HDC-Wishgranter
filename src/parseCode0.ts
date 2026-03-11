const fs = require('fs')

export async function parseCode0(hyperspace_path : string, mods_path : string) {
    const promise = new Promise<void>((resolve) => {
        fs.readFile(hyperspace_path + '/code0.js', 'utf8', (_err : any, data : string) => {
                const regex = /gdjs\s*\.evtsExt__GetPropertiesData__ReturnGameVersion\.func\(runtimeScene, null\)(?: \+(\s)*"(.*)")?/g
                data = data.replace(regex, 'gdjs.evtsExt__GetPropertiesData__ReturnGameVersion.func(runtimeScene, null) +$1" (Modded - Wishgranter)"')
                fs.writeFile(mods_path + "/parsedCode0.js",data, () => {
                    const script_orphan = document.createElement('script')
                    script_orphan.src = mods_path + "/parsedCode0.js"
                    script_orphan.crossOrigin= 'anonymous'
                    script_orphan.addEventListener('load', () => {
                        fs.rm(mods_path + "/parsedCode0.js", () => {
                            resolve()
                        })
                    })
                    document.head.appendChild(script_orphan)
                })
        })
    })
    return promise
}
