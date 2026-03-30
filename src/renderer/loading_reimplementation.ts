const loading_bar = document.getElementById("loading_bar")!
declare var gdjs: any;

(function (gdjs: any) {
    class LoadingReimplementiation {
        constructor(renderer: any, _imagemanager: any, loadingscreenproperties: any, _watermarkproperties: any,
            _falsebool: any) {
            (renderer.getPIXIRenderer().background.color =
                loadingscreenproperties.backgroundColor)

            for (let element of document.body.getElementsByTagName('canvas')) {
                (element as HTMLElement).style.display = 'none'
            }
        }
        setPercent(new_percent: number) {
            loading_bar.setAttribute('load_percent', new_percent + '%')
        }
        renderIfNeeded() {
            return Number(loading_bar.getAttribute('load_percent')) < 1.0;
        }
        unload() {
            for (let element of document.body.getElementsByTagName('canvas')) {
                (element as HTMLElement).style.display = ''
            }

            document.body.style.backgroundColor = 'black'
        }

    }
    gdjs.LoadingScreenRenderer = LoadingReimplementiation
})(gdjs || (gdjs = {}))