import type { PathLike } from "node:fs";
import type {
  LoadSequenceFunction,
  LoadingBarElement,
} from "../modMenu/loadingBar.ts";
import { runThroughLoadingSequence } from "../modMenu/loadingBar.ts";
import { loadWishgranter, unloadWishgranter } from "./loadWishgranter.ts";
import { getModLoadLoadingElements, getModGamestarts } from "./loadMods.ts";

const loading_bar = document.getElementsByTagName(
  "loading-bar",
)[0] as LoadingBarElement;
const start_game_button = document.getElementById(
  "start_game_button",
) as HTMLButtonElement;

declare let gdjs: {
  projectData: unknown;
  RuntimeGame: new (
    projectData: typeof gdjs.projectData,
    something_else: unknown,
  ) => {
    getRenderer: () => {
      createStandardCanvas: (on: HTMLElement) => void;
      bindStandardEvents: (a: unknown, b: unknown, c: unknown) => void;
    };
    getInputManager: () => unknown;
    loadAllAssets: (callback: () => void) => void;
    startGameLoop: () => void;
  };
};

const baseStartGame: LoadSequenceFunction = () => {
  //Initialization
  const gdgame = new gdjs.RuntimeGame(gdjs.projectData, {});

  //Create a renderer
  gdgame.getRenderer().createStandardCanvas(document.body);

  //Put at the back of the dom
  document.body.moveBefore(
    document.body.getElementsByTagName("canvas")[0],
    document.body.firstChild,
  );

  //Bind keyboards/mouse/touch events
  gdgame
    .getRenderer()
    .bindStandardEvents(gdgame.getInputManager(), window, document);

  //Load all assets and start the game
  gdgame.loadAllAssets(() => {
    gdgame.startGameLoop();
    for (const gamestart of getModGamestarts()) {
      try {
        gamestart(gdgame);
      } catch (error) {
        console.error(error);
      }
    }
  });
};
export function startGame(hyperspace_path: PathLike) {
  document.body.classList.add("game_loading");
  runThroughLoadingSequence(
    loading_bar,
    [
      {
        status_text: "Loading Mods",
        function: getModLoadLoadingElements,
      },
      {
        status_text: "Loading Hyperspace Deck Command",
        function: baseStartGame,
      },
    ],
    hyperspace_path,
  ).catch((error: unknown) => {
    console.log(error);
  });
}

export async function loadHyperspaceLocation(hyperspace_path: PathLike) {
  start_game_button.disabled = true;
  unloadWishgranter();
  await runThroughLoadingSequence(
    loading_bar,
    [{ status_text: "Loading Wishgranter", function: loadWishgranter }],
    hyperspace_path,
  );
  document.body.classList.add("game_loadable");
  start_game_button.disabled = false;
}
