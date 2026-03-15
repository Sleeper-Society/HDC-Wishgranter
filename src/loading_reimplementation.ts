import { Game } from "./game";
import { LoadingBarElement } from "./loading_bar";

const file_location_parent = document.getElementById("find_game") as HTMLElement
const loading_bar = document.getElementById("loading_bar") as LoadingBarElement
export default function(game : Game) {return class{
    constructor(renderer: any, _imagemanager: any, loadingscreenproperties: any, _watermarkproperties: any, _falsebool: any) {
        (renderer.getPIXIRenderer().background.color =
            loadingscreenproperties.backgroundColor)

        for(let element of document.body.getElementsByTagName('canvas')){
            (element as HTMLElement).style.display = 'none'
        }
    }
    setPercent(new_percent : number) {
      loading_bar.setAttribute('load_percent', new_percent + '%')
    }
    renderIfNeeded() {
      return Number(loading_bar.getAttribute('load_percent')) < 1.0;
    }
    unload() {
        for(let element of document.body.getElementsByTagName('canvas')){
            (element as HTMLElement).style.display = ''
        }
        file_location_parent.style.display = 'none'
        loading_bar.style.display = 'none'
        document.body.style.backgroundColor = 'black'
        for (let mod of game.modlist){
            if(mod.ongamestart){
                mod.ongamestart()
            }
        }
    }
}}
