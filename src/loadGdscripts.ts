const fs = require('fs')

const reimplementaiton_list = [
    /*'code0.js',*/
    'data.js', 
    ]

export function loadGdscripts(hyperspace_path : string, mods_path : string){
    let data = fs.readFileSync(hyperspace_path + 'index.html', 'utf-8') 
    const parser = new DOMParser
    const base_document = parser.parseFromString(data, 'text/html')
    return Array.from(base_document.head.getElementsByTagName('script'))
    .filter(
        (value) => !reimplementaiton_list.includes(value.getAttribute('src')!))
    .map((value, index, array) => {
        return {
            status_text: "Loading " + value.getAttribute('src'),
            function: () => {
                const path = hyperspace_path + value.getAttribute('src')
                const script_orphan = document.createElement('script')
                script_orphan.src = path
                script_orphan.crossOrigin= 'anonymous'
                const promise = new Promise<void>((resolve) => {
                    script_orphan.addEventListener('load', () => resolve())
                })
                document.head.appendChild(script_orphan)
                return promise
            }
        }
    })
}