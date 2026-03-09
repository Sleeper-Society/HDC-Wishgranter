import {
    loadMods
} from "./loadMods.ts"
import {
    parseCode0
} from "./parseCode0.ts"
import {
    loadGdscripts
} from "./loadGdscripts.ts"

const {
    dialog
} = require('@electron/remote')
const fs = require('fs')
const os = require('os')

const loading_parent = document.getElementById("load_game") as HTMLElement
const hyperspace_file_location_input = document.getElementById('hyperspace_file_location_input')
const mods_file_location_input = document.getElementById('mods_file_location_input')

const getHyperspacePath = () => hyperspace_file_location_input?.getAttribute('value') + '/resources/app.asar/app/'
const getModsPath = () => document.getElementById('mods_file_location_input')?.getAttribute('value') as string
const config_path = os.homedir() + "/HDC/config.json"

type load_sequence_returns = void | load_sequence_element[] | Promise < void | load_sequence_element[] >
    type load_sequence_function = ((hyperspace_path: string, mods_path: string) => load_sequence_returns) | (() =>
        load_sequence_returns)
type load_sequence_element = {
    status_text: string,
    function: load_sequence_function
}

prepopulateFileLocations();
enableFileLoctionButtons();
enableStartGameButton([{
        status_text: "Loading Gdevelop internals and plugins",
        function: loadGdscripts
    },
    {
        status_text: "Creating hooks for mods",
        function: parseCode0
    },
    {
        status_text: "Adding mods",
        function: loadMods
    },
    {
        status_text: "Loading sprites and sounds",
        function: baseStartGame
    },
]);

function prepopulateFileLocations() {
    let config = JSON.parse(fs.readFileSync(config_path, 'utf8'))
    if (config.hyperspace_path == null) {
        const {
            findSteamApp
        } = require('steam-locate')
        findSteamApp('2711190').then((response: {
            installDir: string
        }) => {
            hyperspace_file_location_input?.setAttribute('value', response.installDir)
        })
    } else {
        hyperspace_file_location_input?.setAttribute('value', config.hyperspace_path)
    }
    if (config.mods_path == null) {
        mods_file_location_input?.setAttribute('value', os.homedir() + "/HDC/Mods")
    } else {
        mods_file_location_input?.setAttribute('value', config.mods_path)
    }


}

function enableFileLoctionButtons() {
    for (let button of document.getElementsByTagName('button')) {
        if (!button.hasAttribute('for')) {
            continue
        }
        button.addEventListener('click', async function findFile() {
            let output_id = button.getAttribute('for')
            if (output_id == null) {
                return
            }
            const {
                canceled,
                filePaths
            } = await dialog.showOpenDialog({
                defaultPath: document.getElementById(output_id)?.getAttribute('value') as string,
                properties: ['openDirectory']
            })
            if (!canceled) {
                document.getElementById(output_id)?.setAttribute('value', filePaths[0])
            }
        })
    }
}

function enableStartGameButton(load_sequence: load_sequence_element[]) {
    const button = document.getElementById('start_game_button') as HTMLButtonElement
    button.addEventListener('click', function startGame() {
        button.disabled = true
        savePaths()
        runThroughLoadingSequence(load_sequence)
    })
}

function savePaths() {
    let config = JSON.parse(fs.readFileSync(config_path, 'utf8'))
    config.hyperspace_path = hyperspace_file_location_input?.getAttribute('value')
    config.mods_path = mods_file_location_input?.getAttribute('value')
    fs.writeFile(config_path, JSON.stringify(config), 'utf8', () => {})
}

async function runThroughLoadingSequence(load_sequence: load_sequence_element[]) {
    let index = 0
    const loading_bar = document.createElement('p')
    loading_bar.className = 'loading_bar'
    loading_parent.appendChild(loading_bar)
    for (let element of load_sequence) {
        loading_bar.textContent = element.status_text
        loading_bar.setAttribute('load_percent', ((index / load_sequence.length) * 100) + '%')
        let sub_sequence = await element.function(getHyperspacePath(), getModsPath())
        if (sub_sequence) {
            await runThroughLoadingSequence(sub_sequence)
        }
        index++
    }
    loading_bar.remove()
}

function baseStartGame() {
    // @ts-expect-error
    // GDJS does exist, but in the gloabl js scope
    //Initialization
    var game = new gdjs.RuntimeGame(gdjs.projectData, {})

    //Create a renderer
    game.getRenderer().createStandardCanvas(document.body)

    //Bind keyboards/mouse/touch events
    game.getRenderer().bindStandardEvents(game.getInputManager(), window, document)

    //Load all assets and start the game
    game.loadAllAssets(function () {
        game.startGameLoop()
    });
}