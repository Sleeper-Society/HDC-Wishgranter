import type { LoadableModMetaData, ModLoadInfo } from "../mod.ts";
import type PreloadedWindow from "./bridge.ts";

const modlist_parent = document.getElementById("modlist");
const mod_entry_template = document.getElementsByTagName("template")[0];
const hyperspace_file_location_input = document.getElementById(
  "hyperspace_file_location_input",
);
const mods_file_location_input = document.getElementById(
  "mods_file_location_input",
);

void populateHtml();

async function populateHtml() {
  await prepopulateFileLocations();
  enableFileLocationButtons();
  enableStartGameButton();
  populateModList();
  (window as unknown as PreloadedWindow).wishgranter.onGameStart(baseStartGame);
  (window as unknown as PreloadedWindow).loading.onAddScript(addScript);
}

async function prepopulateFileLocations() {
  hyperspace_file_location_input?.setAttribute(
    "value",
    await (
      window as unknown as PreloadedWindow
    ).wishgranter.getDefaultHyperspacePath(),
  );
  mods_file_location_input?.setAttribute(
    "value",
    await (
      window as unknown as PreloadedWindow
    ).wishgranter.getDefaultModsPath(),
  );
  mods_file_location_input?.addEventListener("change", populateModList);
}

function enableFileLocationButtons() {
  for (const button of document.getElementsByClassName(
    "file_location_button",
  )) {
    button.addEventListener("click", function findFile() {
      const output_id = button.getAttribute("for");
      if (!output_id) return;
      const default_path = document
        .getElementById(output_id)
        ?.getAttribute("value");
      (window as unknown as PreloadedWindow).wishgranter
        .askUserForDirectory(default_path)
        .then((value) => {
          document.getElementById(output_id)?.setAttribute("value", value);
        });
    });
  }
  for (const button of document.getElementsByClassName("steam_button")) {
    button.addEventListener("click", function fillSteam() {
      (window as unknown as PreloadedWindow).wishgranter
        .getSteamGameLocation()
        .then((value) => {
          hyperspace_file_location_input?.setAttribute("value", value);
        });
    });
  }
}

function enableStartGameButton() {
  const button = document.getElementById(
    "start_game_button",
  ) as HTMLButtonElement;
  button.addEventListener("click", function startGame() {
    button.disabled = true;
    (window as unknown as PreloadedWindow).wishgranter.startGame(
      hyperspace_file_location_input?.getAttribute("value") ?? "",
      getMods(),
    );
  });
}

function getMods(): ModLoadInfo[] {
  return (Array.from(modlist_parent?.children ?? []) as ModEntry[])
    .map((value) => value.mod)
    .filter((value) => value != undefined);
}

function populateModList() {
  if (modlist_parent) modlist_parent.innerHTML = "";
  void (window as unknown as PreloadedWindow).wishgranter
    .getModsFromLocation(
      hyperspace_file_location_input?.getAttribute("value") ?? "",
      mods_file_location_input?.getAttribute("value") ?? "",
    )
    .then((mods) => {
      mods.forEach((mod) => {
        const mod_entry = document.createElement("mod-entry") as ModEntry;
        mod_entry.mod = mod;
        modlist_parent?.append(mod_entry);
      });
    });
}

class ModEntry extends HTMLElement {
  mod: LoadableModMetaData | undefined;
  connectedCallback() {
    if (!this.mod) {
      this.remove();
      return;
    }
    this.append(mod_entry_template.content.cloneNode(true));
    if (this.mod.icon) {
      (this.getElementsByClassName("icon")[0] as HTMLImageElement).src =
        this.mod.icon;
    }
    this.getElementsByClassName("name")[0].textContent = this.mod.name;
    this.getElementsByClassName("version")[0].textContent = this.mod.version;
    if (this.mod.description) {
      this.getElementsByClassName("description")[0].textContent =
        this.mod.description;
    }

    this.getElementsByClassName("move_up")[0].addEventListener("click", () => {
      this.parentElement?.moveBefore(this, this.previousSibling);
    });
    this.getElementsByClassName("move_down")[0].addEventListener(
      "click",
      () => {
        this.parentElement?.moveBefore(this, this.nextSibling);
      },
    );
  }
}

customElements.define("mod-entry", ModEntry);

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

function baseStartGame(modlist: ((runtime_game: unknown) => void)[]) {
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
    for (const mod of modlist) {
      try {
        mod(gdgame);
      } catch (error) {
        console.error(error);
      }
    }
  });
}

async function addScript(script_source: string) {
  return new Promise<void>((resolve) => {
    const script_orphan = document.createElement("script");
    script_orphan.src = script_source;
    script_orphan.crossOrigin = "anonymous";
    script_orphan.addEventListener("load", () => {
      resolve();
    });
    document.head.appendChild(script_orphan);
  });
}
