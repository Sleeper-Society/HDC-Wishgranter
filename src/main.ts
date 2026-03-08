import { loadMods } from "./loadMods.ts"
import { parseCode0 } from "./parseCode0.ts"
import { loadGdscripts } from "./loadGdscripts.ts" 

const {dialog, BrowserWindow} = require('@electron/remote')
const fs = require('fs')
const os = require('os')

const file_location_parent = document.getElementById("find_game") as HTMLElement
const loading_parent = document.getElementById("load_game") as HTMLElement
const loading_bars = Array.from(loading_parent.children) as Array<HTMLElement>
const hyperspace_file_location_input = document.getElementById('hyperspace_file_location_input')
const mods_file_location_input = document.getElementById('mods_file_location_input')

const getHyperspacePath = () => hyperspace_file_location_input?.getAttribute('value') + '/resources/app.asar/app/'
const getModsPath = () => document.getElementById('mods_file_location_input')?.getAttribute('value') as string
const config_path = os.homedir() + "/HDC/config.json"

type load_sequence_returns = void | Promise<void> | load_sequence_element[] | Promise<load_sequence_element[]>
type load_sequence_element = {
    status_text : string, 
    function : ((hyperspace_path : string, mods_path : string) => load_sequence_returns) | (() => load_sequence_returns)}
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
    let config = JSON.parse(fs.readFileSync(config_path, 'utf8'))
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
            const { canceled, filePaths } = await dialog.showOpenDialog({
                defaultPath: document.getElementById(output_id)?.getAttribute('value') as string,
                properties: ['openDirectory']
            })
            if (!canceled) {
                document.getElementById(output_id)?.setAttribute('value', filePaths[0])
            }
        })
    }
}
function enableStartGameButton(){
    document.getElementById('start_game_button')?.addEventListener('click', function startGame() {
        savePaths()
        runThroughLoadingSequence(load_sequence)
    })
}

function savePaths(){
    let config = JSON.parse(fs.readFileSync(config_path, 'utf8'))
    config.hyperspace_path = hyperspace_file_location_input?.getAttribute('value')
    config.mods_path = mods_file_location_input?.getAttribute('value')
    fs.writeFile(config_path,JSON.stringify(config),'utf8',() => {})
}
async function runThroughLoadingSequence(load_sequence : load_sequence_element[], level : number = 0){
    let index = 0
    for (let element of load_sequence){
        loading_bars[level].textContent = element.status_text
        loading_bars[level].setAttribute('load_percent', ((index / load_sequence.length) * 100) + '%')
        let sub_sequence = await element.function(getHyperspacePath(), getModsPath())
        if (sub_sequence){
            await runThroughLoadingSequence(sub_sequence, level + 1)
        }
        index++
    }
    loading_bars[level].textContent = level == 0 ? loading_bars[level].textContent : ''
    loading_bars[level].setAttribute('load_percent', level == 0 ? '100%' : '0%')
}

function baseStartGame(){
    // @ts-expect-error
    // GDJS does exist, but in the gloabl js scope
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




