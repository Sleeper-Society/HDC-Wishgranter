const {dialog, BrowserWindow} = require('@electron/remote')
const fs = require('fs')
const os = require('os')

const file_location_parent = document.getElementById("find_game") as HTMLElement
const loading_parent = document.getElementById("load_game") as HTMLElement
const hyperspace_file_location_input = document.getElementById('hyperspace_file_location_input')
const mods_file_location_input = document.getElementById('mods_file_location_input')
const getHyperspacePath = () => hyperspace_file_location_input?.getAttribute('value') + '/resources/app.asar/app/'
const getModsPath = () => document.getElementById('mods_file_location_input')?.getAttribute('value')
const config_path = os.homedir() + "/HDC/config.json"
const loading_bars = Array.from(loading_parent.children) as Array<HTMLElement>
type load_sequence_element = {status_text : string, function : () => void | Promise<void> | load_sequence_element[] | Promise<load_sequence_element[]>}
const load_sequence : load_sequence_element[] = [
    {
        status_text:"Loading Gdevelop internals and plugins",
        function: loadGdscripts
    },
    {
        status_text:"Creating hooks for mods",
        function: parseCode0
    },
    {
        status_text:"Adding mods",
        function: loadMods
    },
    {
        status_text:"Loading sprites and sounds",
        function: baseStartGame
    },
]

prepopulateFileLocations();
enableFileLoctionButtons();
enableStartGameButton();

function prepopulateFileLocations(){
    let config = JSON.parse(fs.readFileSync(config_path))
    if (config.hyperspace_path == null){
        const {findSteamApp} = require('steam-locate')
        findSteamApp('2711190').then((response: { installDir: string }) => {
            hyperspace_file_location_input?.setAttribute('value', response.installDir)
        })
    } else {
        hyperspace_file_location_input?.setAttribute('value', config.hyperspace_path)
    } 
    if (config.mods_path == null){
        mods_file_location_input?.setAttribute('value', os.homedir() + "/HDC/Mods")
    } else {
        mods_file_location_input?.setAttribute('value', config.mods_path)
    }
    
    
}
function enableFileLoctionButtons(){
    for (let button of document.getElementsByTagName('button')) {
        if (!button.hasAttribute('for')){continue}
        button.addEventListener('click', async function findFile() {
            let output_id = button.getAttribute('for')
            if (output_id == null) {return}
            const { canceled, filePaths } = await dialog.showOpenDialog({options: {
                defaultPath: document.getElementById(output_id)?.getAttribute('value'),
                properties: ['openDirectory']
            }})
            if (!canceled) {
                document.getElementById(output_id)?.setAttribute('value', filePaths[0])
            }
        })
    }
}
function enableStartGameButton(){
    document.getElementById('start_game_button')?.addEventListener('click', async function startGame() {
        savePaths()
        file_location_parent.style.display = 'none'
        loading_parent.style.display = 'flex'
        await runThroughLoadingSequence(load_sequence)
        loading_parent.style.display = 'none'
    })
}

function savePaths(){
    let config = JSON.parse(fs.readFileSync(config_path))
    config.hyperspace_path = hyperspace_file_location_input?.getAttribute('value')
    config.mods_path = mods_file_location_input?.getAttribute('value')
    fs.writeFile(config_path,JSON.stringify(config),'utf8',() => {})
}
async function runThroughLoadingSequence(load_sequence : load_sequence_element[], level : number = 0){
    let index = 0
    for (let element of load_sequence){
        loading_bars[level].textContent = element.status_text
        loading_bars[level].setAttribute('load_percent', ((index / load_sequence.length) * 100) + '%')
        let sub_sequence = await element.function()
        if (sub_sequence){
            await runThroughLoadingSequence(sub_sequence, level + 1)
        }
        index++
    }
    loading_bars[level].textContent = ''
    loading_bars[level].setAttribute('load_percent', '0%')
}

function loadGdscripts() : load_sequence_element[]{
    let data = fs.readFileSync(getHyperspacePath() + 'index.html', 'utf-8') 
    const parser = new DOMParser
    const base_document = parser.parseFromString(data, 'text/html')
    return Array.from(base_document.head.getElementsByTagName('script'))
    .filter(
        (value) => ![/*'code0.js',*/ 'data.js', /*'pixi-renderers/loadingscreen-pixi-renderer.js'*/]
        .includes(value.getAttribute('src')!))
    .map((value, index, array) => {
        return {
            status_text: "Loading " + value.getAttribute('src'),
            function: () => {
                const path = getHyperspacePath() + value.getAttribute('src')
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
async function parseCode0() {
    
}
async function loadMods() {
    let modlist : string[] = []
    modlist.push(convertDataToMod())
    // for (const path of fs.readdirSync(getModsPath())){
    //     modlist.push(convertPathToMod(path))
    // }
    return modlist.map((value, index) => { return {
        status_text: "Mod "+ index,
        function: () => {eval(value); return}
    }})
}
function convertDataToMod() : string{
    let data : string = fs.readFileSync(getHyperspacePath() + '/data.js', 'utf8')
    const regex = /file: "([\w/]*\.(?:(?:png)|(?:wav)|(?:json)|(?:ogg)))"/g
    return data.replace(regex, 'file: "' + getHyperspacePath() + '$1"')
}
function convertPathToMod(path : string) : string{
    return fs.readFileSync(path + "/index.js", 'utf8')
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




