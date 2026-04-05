import type PreloadedWindow from "./bridge.ts";

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
        (
          window as unknown as PreloadedWindow
        ).loading.load_game_percent_increase();
      this.previous_percent = new_percent;
    }
    renderIfNeeded() {
      return this.previous_percent < 1.0;
    }
    unload() {
      (window as unknown as PreloadedWindow).loading.game_loaded();
      document.body.setAttribute("game_loaded", "");
    }
  }
  gdjs.LoadingScreenRenderer = LoadingReimplementiation;
})(gdjs);
