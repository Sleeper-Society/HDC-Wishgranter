import type { LoadingBarElement } from "../modMenu/loadingBar.ts";

const loading_bar = document.getElementsByTagName(
  "loading-bar",
)[0] as LoadingBarElement;

declare let gdjs: { LoadingScreenRenderer: undefined };

(function (gdjs: { LoadingScreenRenderer?: unknown }) {
  class LoadingReimplementiation {
    private previous_percent = 0;
    constructor(
      renderer: { getPIXIRenderer: () => { background: { color: unknown } } },
      _imagemanager: unknown,
      loadingscreenproperties: { backgroundColor: unknown },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _watermarkproperties: unknown,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _falsebool: boolean,
    ) {
      renderer.getPIXIRenderer().background.color =
        loadingscreenproperties.backgroundColor;
    }
    setPercent(new_percent: number) {
      for (let i = this.previous_percent; i < new_percent; i++)
        loading_bar.complete();
      this.previous_percent = new_percent;
    }
    renderIfNeeded() {
      return this.previous_percent < 1.0;
    }
    unload() {
      document.body.setAttribute("game_loaded", "");
    }
  }
  gdjs.LoadingScreenRenderer = LoadingReimplementiation;
})(gdjs);
