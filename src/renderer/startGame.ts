import type { projectData } from "./gdjs.ts";
import type { LoadSequenceElement, LoadingBarElement } from "./loadingBar.ts";
import { loadWishgranter, unloadWishgranter } from "./loadWishgranter.ts";
import { loadModdedFile, mergeDeep, parseData } from "./modFactory.ts";

const loading_bar = document.getElementsByTagName(
  "loading-bar",
)[0] as LoadingBarElement;
const start_game_button = document.getElementById(
  "start_game_button",
) as HTMLButtonElement;

async function baseStartGame() {
  //Initialization
  const gdgame = new gdjs.RuntimeGame(
    await loadModdedFile<projectData>(
      parseData,
      mergeDeep,
      "data.js",
      "data.json",
    ),
    {},
  );

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
  });
}
export async function startGame() {
  start_game_button.disabled = true;
  document.body.classList.add("game_loading");
  await loading_bar.runThroughLoadingSequence([
    {
      status_text: "Loading Hyperspace Deck Command",
      function: loadHyperspaceDeckCommand,
    },
  ]);
  document.body.classList.remove("game_loading");
  document.body.classList.add("game_loaded");
}

function loadHyperspaceDeckCommand(): LoadSequenceElement[] {
  return [
    {
      status_text: "Starting Game",
      function: baseStartGame,
    } as LoadSequenceElement<[]>,
  ].concat(gdjs.LoadingScreenRenderer?.getLoadingElements() ?? []);
}

export async function loadHyperspaceLocation(hyperspace_path: string) {
  start_game_button.disabled = true;
  unloadWishgranter();
  await loading_bar.runThroughLoadingSequence(
    await loadWishgranter(hyperspace_path),
    hyperspace_path,
  );
  document.body.classList.add("game_loadable");
  start_game_button.disabled = false;
}
