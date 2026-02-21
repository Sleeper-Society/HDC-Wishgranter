const {dialog, BrowserWindow} = require('@electron/remote')
const fs = require('fs')

const getPath = () => document.getElementById('hyperspace_file_location_input')?.getAttribute('value') + '/resources/app.asar/app/'
const web_contents = BrowserWindow.getFocusedWindow().webContents

prepopulate_file_locations();
enable_file_loction_buttons();
enable_start_game_button();

function prepopulate_file_locations(){
    const {findSteamApp} = require('steam-locate')
    findSteamApp('2711190').then((response: { installDir: string }) => {
        document.getElementById('hyperspace_file_location_input')?.setAttribute('value', response.installDir)
    })
}
function enable_file_loction_buttons(){
    for (let button of document.getElementsByTagName('button')) {
        if (button.hasAttribute('for')){
            button.addEventListener('click', findFile.bind(null, button.getAttribute('for')))
        }
    }
}
function enable_start_game_button(){document.getElementById('start_game_button')?.addEventListener('click', startGame)}
async function findFile(output_id : string | null) {
    if (output_id == null){return}
    const { canceled, filePaths } = await dialog.showOpenDialog({options: {
        defaultPath: document.getElementById(output_id)?.getAttribute('value'),
        properties: ['openDirectory']
    }})
    if (!canceled) {
        document.getElementById(output_id)?.setAttribute('value', filePaths[0])
    }
}

async function startGame() {
    show_html('load_game')
    await Promise.all([loadGdscripts(), parseCode0(), loadMods()])
    show_html('')
    baseStartGame()
}
function show_html(element_id_to_show : string){
    for (let child of document.body.children){
        (child as HTMLElement).style.display = 'none'
    }
    const element_to_show = document.getElementById(element_id_to_show)
    if (element_to_show){
        element_to_show.style.display = 'flex'
    }
}
async function loadGdscripts() {
    let data = fs.readFileSync(getPath() + 'index.html', 'utf-8') 
    await new Promise<void>((resolve) => {
        const parser = new DOMParser
        const base_document = parser.parseFromString(data, 'text/html')
        const gd_script_elements = Array.from(base_document.head.getElementsByTagName('script')).filter((value) => !['code0.js', 'data.js', 'pixi-renderers/loadingscreen-pixi-renderer.js'].includes(value.getAttribute('src')!))
        let loaded_scripts = 0
        const on_script_loaded = function () {
            loaded_scripts += 1
            document.getElementById('gdstatus')?.setAttribute('load_percent', ((loaded_scripts / gd_script_elements.length) * 100) + '%')
            if (loaded_scripts >= gd_script_elements.length){
                resolve()
            }
        }
        const load_next_script = function (iterator: ArrayIterator<HTMLScriptElement>) {
            const result = iterator.next()
            if (result.done) {return}
            const path = getPath() + result.value.getAttribute('src')
            const script_orphan = document.createElement('script')
            script_orphan.src = path
            script_orphan.addEventListener('load', on_script_loaded)
            script_orphan.addEventListener('load', load_next_script.bind(null, iterator))
            script_orphan.crossOrigin= 'anonymous'
            document.head.appendChild(script_orphan)
        }
        load_next_script(gd_script_elements[Symbol.iterator]())
    })
}
async function parseCode0() {
    
}
async function loadMods() {
    
}
function baseStartGame(){
    // @ts-expect-error
    //Initialization
    var game = new gdjs.RuntimeGame(gdjs.projectData, {})

    //Create a renderer
    game.getRenderer().createStandardCanvas(document.body)

    //Bind keyboards/mouse/touch events
    game.getRenderer().bindStandardEvents(game.getInputManager(), window, document)

    //Load all assets and start the game
    game.loadAllAssets(function() {
        game.startGameLoop()
    });
}




