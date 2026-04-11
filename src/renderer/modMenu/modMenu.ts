import type PreloadedWindow from "../preload.ts";
import { startGame, loadHyperspaceLocation } from "../startGame/startGame.ts";
import { addModLocationToModList } from "../startGame/loadMods.ts";
import { reimportDefaultMod } from "../startGame/loadMods.ts";

const hyperspace_file_location_input = document.getElementById(
  "hyperspace_file_location_input",
);
const mods_file_location_input = document.getElementById(
  "mods_file_location_input",
);
const start_game_button = document.getElementById(
  "start_game_button",
) as HTMLButtonElement;

subscribeFileLocations();
prepopulateFileLocations();
enableFileLocationButtons();
enableStartGameButton();

function subscribeFileLocations() {
  hyperspace_file_location_input?.addEventListener("change", () => {
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
    addModLocationToModList(
      mods_file_location_input.getAttribute("value") ?? "",
    );
  });
}

function prepopulateFileLocations() {
  (window as unknown as PreloadedWindow).wishgranter
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
  (window as unknown as PreloadedWindow).wishgranter
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
      (window as unknown as PreloadedWindow).wishgranter
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
      (window as unknown as PreloadedWindow).wishgranter
        .getSteamGameLocation()
        .then((value) => {
          hyperspace_file_location_input?.setAttribute(
            "value",
            value.toString(),
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
    startGame(hyperspace_file_location_input?.getAttribute("value") ?? "");
  });
}
