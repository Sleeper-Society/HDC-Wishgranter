export let finished_loading : Promise<void> 
const file_location_parent = document.getElementById("find_game") as HTMLElement
const loading_parent = document.getElementById("load_game") as HTMLElement
const loading_bars = Array.from(loading_parent.children) as Array<HTMLElement>
export default class{
    finished_loading_resolve: (value: void | PromiseLike<void>) => void;
    constructor(renderer: any, _imagemanager: any, loadingscreenproperties: any, _watermarkproperties: any, _falsebool: any) {
        (renderer.getPIXIRenderer().background.color =
            loadingscreenproperties.backgroundColor)
        this.finished_loading_resolve = () => {}
        finished_loading = new Promise((resolve, reject)=> {
            this.finished_loading_resolve = resolve
        })
        for(let element of document.body.getElementsByTagName('canvas')){
            (element as HTMLElement).style.display = 'none'
        }
    }
    setPercent(new_percent : number) {
      loading_bars[1].setAttribute('load_percent', new_percent + '%')
    }
    renderIfNeeded() {
      return Number(loading_bars[1].getAttribute('load_percent')) < 1.0;
    }
    unload() {
        this.finished_loading_resolve()
        for(let element of document.body.getElementsByTagName('canvas')){
            (element as HTMLElement).style.display = ''
        }
        file_location_parent.style.display = 'none'
        loading_parent.style.display = 'none'
        document.body.style.backgroundColor = 'black'
    }
}
