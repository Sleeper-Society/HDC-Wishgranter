import {
    LoadableModMetaData,
    ModLoadInfo,
} from "../mod.ts"
import PreloadedWindow from "./bridge.ts"

const modlist_parent = document.getElementById('modlist') !
    const mod_entry_template = document.getElementsByTagName('template')[0] !
        const hyperspace_file_location_input = document.getElementById('hyperspace_file_location_input') !
            const mods_file_location_input = document.getElementById('mods_file_location_input') !

                populateHtml()

async function populateHtml() {
    await prepopulateFileLocations();
    enableFileLocationButtons();
    enableStartGameButton();
    await populateModList();
    (window as unknown as PreloadedWindow).wishgranter.onGameStart(baseStartGame);
    (window as unknown as PreloadedWindow).loading.onAddScript(addScript)
}

async function prepopulateFileLocations() {
    hyperspace_file_location_input?.setAttribute('value', await (window as unknown as PreloadedWindow).wishgranter
        .getDefaultHyperspacePath())
    mods_file_location_input?.setAttribute('value', await (window as unknown as PreloadedWindow).wishgranter
        .getDefaultModsPath())
    mods_file_location_input?.addEventListener('change', populateModList)
}

function enableFileLocationButtons() {
    for (let button of document.getElementsByClassName('file_location_button')) {
        button.addEventListener('click', async function findFile() {
            const output_id = button.getAttribute('for') !
                const default_path = document.getElementById(output_id)?.getAttribute('value')
            document.getElementById(output_id)?.setAttribute('value', await (
                    window as unknown as PreloadedWindow).wishgranter
                .askUserForDirectory(
                    default_path))
        })
    }
    for (let button of document.getElementsByClassName('steam_button')) {
        button.addEventListener('click', async function fillSteam() {
            hyperspace_file_location_input?.setAttribute('value', await (
                    window as unknown as PreloadedWindow).wishgranter
                .getSteamGameLocation())
        })
    }
}

function enableStartGameButton() {
    const button = document.getElementById('start_game_button') as HTMLButtonElement
    button.addEventListener('click', function startGame() {
        button.disabled = true;
        (window as unknown as PreloadedWindow).wishgranter.startGame(hyperspace_file_location_input
            .getAttribute('value') !, getMods())
    })
}

function getMods(): ModLoadInfo[] {
    return (Array.from(modlist_parent.children) as ModEntry[]).map((value) => value.mod).filter((value) => value !=
        undefined)
}

async function populateModList() {
    modlist_parent.innerHTML = ''
    for (let mod of await (window as unknown as PreloadedWindow).wishgranter.getModsFromLocation(
            hyperspace_file_location_input.getAttribute(
                'value') !,
            mods_file_location_input.getAttribute('value') !)) {
        const mod_entry = document.createElement('mod-entry') as ModEntry
        mod_entry.mod = mod
        modlist_parent.append(mod_entry)
    }
}

class ModEntry extends HTMLElement {
    mod: LoadableModMetaData | undefined
    connectedCallback() {
        if (!this.mod) {
            this.remove()
            return
        }
        this.append(mod_entry_template.content.cloneNode(true))
        if (this.mod.icon) {
            (this.getElementsByClassName('icon')[0] as HTMLImageElement).src = this.mod.icon
        }
        this.getElementsByClassName('name')[0].textContent = this.mod.name
        this.getElementsByClassName('version')[0].textContent = this.mod.version
        if (this.mod.description) {
            this.getElementsByClassName('description')[0].textContent = this.mod.description
        }

        this.getElementsByClassName('move_up')[0].addEventListener('click', () => {
            this.parentElement?.moveBefore(this, this.previousSibling)
        })
        this.getElementsByClassName('move_down')[0].addEventListener('click', () => {
            this.parentElement?.moveBefore(this, this.nextSibling)
        })
    }

}

customElements.define('mod-entry', ModEntry)

declare var gdjs: any

function baseStartGame(modlist: ((runtime_game: any) => void)[]) {
    //Initialization
    var gdgame = new gdjs.RuntimeGame(gdjs.projectData, {})

    //Create a renderer
    gdgame.getRenderer().createStandardCanvas(document.body)

    //Put at the back of the dom
    document.body.moveBefore(document.body.getElementsByTagName('canvas')[0], document.body.firstChild)

    //Bind keyboards/mouse/touch events
    gdgame.getRenderer().bindStandardEvents(gdgame.getInputManager(), window, document)

    //Load all assets and start the game
    gdgame.loadAllAssets(async function() {
        gdgame.startGameLoop()
        for (let mod of modlist) {
            try {
                mod(gdgame)
            } catch (error) {
                console.error(error)
            }
        }
    });
}

async function addScript(script_source: string) {
    return new Promise < void > ((resolve) => {
        const script_orphan = document.createElement('script')
        script_orphan.src = script_source
        script_orphan.crossOrigin = 'anonymous'
        script_orphan.addEventListener('load', () => {
            resolve()
        })
        document.head.appendChild(script_orphan)
    })
}