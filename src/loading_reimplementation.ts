export let finished_loading : Promise<void> 
const file_location_parent = document.getElementById("find_game") as HTMLElement
const loading_parent = document.getElementById("load_game") as HTMLElement
export default class{
    finished_loading_resolve: (value: void | PromiseLike<void>) => void;
    loading_bar: HTMLElement;
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
        this.loading_bar = document.createElement('p')
        this.loading_bar.className = 'loading_bar'
        loading_parent.appendChild(this.loading_bar)
    }
    setPercent(new_percent : number) {
      this.loading_bar.setAttribute('load_percent', new_percent + '%')
    }
    renderIfNeeded() {
      return Number(this.loading_bar.getAttribute('load_percent')) < 1.0;
    }
    unload() {
        for(let element of document.body.getElementsByTagName('canvas')){
            (element as HTMLElement).style.display = ''
        }
        this.loading_bar.remove()
        file_location_parent.style.display = 'none'
        loading_parent.style.display = 'none'
        document.body.style.backgroundColor = 'black'
        this.finished_loading_resolve()
    }
}
