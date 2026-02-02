const {findSteamApp} = require('steam-locate')
findSteamApp('2711190').then(response => {
    document.getElementById('hyperspace_file_location_input').setAttribute('value', response.installDir)
})

const {dialog} = require('@electron/remote')
async function findFile(output_id) {
    const { canceled, filePaths } = await dialog.showOpenDialog({options: {
        defaultPath: document.getElementById(output_id).getAttribute('value'),
        properties: ['openDirectory']
    }})
    if (!canceled) {
        document.getElementById(output_id).setAttribute('value', filePaths[0])
    }
}
for (button of document.getElementsByTagName('button')) {
    if (button.hasAttribute('for')){
        button.addEventListener('click', findFile.bind(this, button.getAttribute('for')))
    }
}

const fs = require('fs')
const {BrowserWindow} = require('@electron/remote')
const getPath = () => document.getElementById('hyperspace_file_location_input').getAttribute('value') + '/resources/app.asar/app/'
const web_contents = BrowserWindow.getFocusedWindow().webContents
document.getElementById('start_game_button').addEventListener('click', startGame)
async function startGame() {
    document.getElementById('find_game').style.display = 'none'
    document.getElementById('load_game').style.display = 'flex'
    await Promise.all([loadGdscripts(), parseCode0(), loadMods()])
    document.getElementById('load_game').style.display = 'none'
    baseStartGame()
}
async function loadGdscripts() {
    let data = fs.readFileSync(getPath() + 'index.html', 'utf-8') 
    await new Promise((resolve, reject) => {
        const parser = new DOMParser
        const base_document = parser.parseFromString(data, 'text/html')
        const gd_script_elements = Array.from(base_document.head.getElementsByTagName('script'))//.filter((value) => !['code0.js', 'data.js', 'pixi-renderers/loadingscreen-pixi-renderer.js'].includes(value.getAttribute('src')))
        let loaded_scripts = 0
        const on_script_loaded = function () {
            loaded_scripts += 1
            document.getElementById('gdstatus').setAttribute('load_percent', ((loaded_scripts / gd_script_elements.length) * 100) + '%')
            if (loaded_scripts >= gd_script_elements.length){
                resolve()
            }
        }
        const load_next_script = function (iterator) {
            const result = iterator.next()
            if (result.done) {return}
            const path = getPath() + result.value.getAttribute('src')
            const script_orphan = document.createElement('script')
            script_orphan.src = path
            script_orphan.addEventListener('load', on_script_loaded)
            script_orphan.addEventListener('load', load_next_script.bind(this, iterator))
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




