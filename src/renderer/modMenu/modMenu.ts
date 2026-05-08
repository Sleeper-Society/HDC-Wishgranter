import { startGame, loadHyperspaceLocation } from "../startGame/startGame.ts";
import { loadModLocation } from "../startGame/loadMods.ts";
import { reimportDefaultMod } from "../startGame/loadMods.ts";

const hyperspace_file_location_input = document.getElementById(
  "hyperspace_file_location_input",
);
const mods_file_location_input = document.getElementById(
  "mods_file_location_input",
);
const box_art = document.getElementById(
  "hyperspace_box_art",
) as HTMLImageElement;
const font = document.getElementById("font") as HTMLStyleElement;
const start_game_button = document.getElementById(
  "start_game_button",
) as HTMLButtonElement;

subscribeFileLocations();
enableFileLocationButtons();
enableStartGameButton();
window.remote_replace
  .getPaths()
  .then(prepopulateFileLocations)
  .catch((error: unknown) => {
    console.error(error);
  });

function subscribeFileLocations() {
  hyperspace_file_location_input?.addEventListener("change", () => {
    changeStyleToHyperspace(
      hyperspace_file_location_input.getAttribute("value") ?? "",
    );
    loadHyperspaceLocation(
      hyperspace_file_location_input.getAttribute("value") ?? "",
    )
      .then(() =>
        { reimportDefaultMod(
          hyperspace_file_location_input.getAttribute("value") ?? "",
        ); },
      )
      .catch((error: unknown) => {
        console.log(error);
      });
  });
  mods_file_location_input?.addEventListener("change", () => {
    loadModLocation(mods_file_location_input.getAttribute("value") ?? "");
  });
}

function changeStyleToHyperspace(hyperspace_location: string) {
  box_art.src =
    hyperspace_location +
    window.remote_replace.path.sep() +
    "resources" +
    window.remote_replace.path.sep() +
    "app.asar" +
    window.remote_replace.path.sep() +
    "app" +
    window.remote_replace.path.sep() +
    "store_capsule_header.png";
  font.innerText =
    '@font-face {font-family: "Oxanium";src: url("' +
    hyperspace_location +
    window.remote_replace.path.sep() +
    "resources" +
    window.remote_replace.path.sep() +
    "app.asar" +
    window.remote_replace.path.sep() +
    "app" +
    window.remote_replace.path.sep() +
    '/Oxanium-Hyper.ttf");}';
}

function prepopulateFileLocations() {
  window.wishgranter
    .getDefaultHyperspacePath()
    .then((value) => {
      hyperspace_file_location_input?.setAttribute("value", value.toString());
      hyperspace_file_location_input?.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    })
    .catch((error: unknown) => {
      console.log(error);
    });
  window.wishgranter
    .getDefaultModsPath()
    .then((value) => {
      mods_file_location_input?.setAttribute("value", value.toString());
      mods_file_location_input?.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    })
    .catch((error: unknown) => {
      console.log(error);
    });
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
      window.wishgranter
        .askUserForDirectory(default_path ?? "")
        .then((value) => {
          document
            .getElementById(output_id)
            ?.setAttribute("value", value.toString());
          document
            .getElementById(output_id)
            ?.dispatchEvent(new Event("change", { bubbles: true }));
        })
        .catch((error: unknown) => {
          console.log(error);
        });
    });
  }
  for (const button of document.getElementsByClassName("steam_button")) {
    button.addEventListener("click", () => {
      window.wishgranter
        .getSteamGameLocation()
        .then((value) => {
          hyperspace_file_location_input?.setAttribute(
            "value",
            value.toString(),
          );
          hyperspace_file_location_input?.dispatchEvent(
            new Event("change", { bubbles: true }),
          );
        })
        .catch((error: unknown) => {
          console.log(error);
        });
    });
  }
}

function enableStartGameButton() {
  start_game_button.addEventListener("click", () => {
    Array.from(document.body.getElementsByClassName("mod_menu")).forEach(
      (element) => {
        if ("disabled" in element) {
          element.disabled = true;
        }
      },
    );
    startGame(
      hyperspace_file_location_input?.getAttribute("value") ?? "",
    ).catch((err: unknown) => {
      console.error(err);
      Array.from(document.body.getElementsByClassName("mod_menu")).forEach(
        (element) => {
          if ("disabled" in element) {
            element.disabled = false;
          }
        },
      );
    });
  });
}
