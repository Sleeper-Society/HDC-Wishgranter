import type { PathLike } from "node:fs";
import type {
  LoadSequenceFunction,
  LoadSequenceElement,
  LoadingBarElement,
} from "../modMenu/loadingBar.ts";
import { loadWishgranter, unloadWishgranter } from "./loadWishgranter.ts";
import { getModLoadLoadingElements, getModGamestarts } from "./loadMods.ts";

const loading_bar = document.getElementsByTagName(
  "loading-bar",
)[0] as LoadingBarElement;
const start_game_button = document.getElementById(
  "start_game_button",
) as HTMLButtonElement;

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
export async function startGame(hyperspace_path: PathLike) {
  start_game_button.disabled = true;
  document.body.classList.add("game_loading");
  await loading_bar.runThroughLoadingSequence(
    [
      {
        status_text: "Loading Mods",
        function: getModLoadLoadingElements,
      },
      {
        status_text: "Loading Hyperspace Deck Command",
        function: loadHyperspaceDeckCommand,
      },
    ],
    hyperspace_path,
  );
  document.body.classList.remove("game_loading");
  document.body.classList.add("game_loaded");
}

function loadHyperspaceDeckCommand(): LoadSequenceElement[] {
  return [
    {
      status_text: "Starting Game",
      function: baseStartGame,
    },
  ].concat(gdjs.LoadingScreenRenderer?.getLoadingElements() ?? []);
}

export async function loadHyperspaceLocation(hyperspace_path: PathLike) {
  start_game_button.disabled = true;
  unloadWishgranter();
  await loading_bar.runThroughLoadingSequence(
    await loadWishgranter(hyperspace_path),
    hyperspace_path,
  );
  document.body.classList.add("game_loadable");
  start_game_button.disabled = false;
}
