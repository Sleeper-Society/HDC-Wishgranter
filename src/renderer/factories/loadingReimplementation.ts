import type { LoadSequenceElement } from "wishgranter";

(function (gdjs: { LoadingScreenRenderer?: unknown }) {
  class LoadingReimplementiation {
    private previous_percent = 0;
    private static load_sequence_element_resolvers: (() => void)[] = [];
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
      for (let i = this.previous_percent; i < new_percent; i++) {
        const resolver =
          LoadingReimplementiation.load_sequence_element_resolvers.shift();
        if (resolver) resolver();
      }
      this.previous_percent = new_percent;
    }
    renderIfNeeded() {
      return this.previous_percent < 1.0;
    }
    unload() {
      document.body.setAttribute("game_loaded", "");
    }
    static getLoadingElements(): LoadSequenceElement[] {
      return Array.from({ length: 100 }, () => {
        return {
          status_text: "Loading Hyperspace Deck Command",
          function: () => {
            return new Promise<void>((resolve) => {
              this.load_sequence_element_resolvers.push(resolve); //Never resolves, handled by loading reimplementaion
            });
          },
        };
      });
    }
  }
  gdjs.LoadingScreenRenderer = LoadingReimplementiation;
})(gdjs);
