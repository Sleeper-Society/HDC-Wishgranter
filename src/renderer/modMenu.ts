import { startGame, loadHyperspaceLocation } from "./startGame.ts";
import type { ModEntry } from "./modEntry.ts";
import type { PathLike } from "node:fs";

const hyperspace_file_location_input = document.getElementById(
  "hyperspace_file_location_input",
);
const mods_file_location_input = document.getElementById(
  "mods_file_location_input",
);
const modlist_parent = document.getElementById("modlist");
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
      .then(() => {
        (modlist_parent?.firstChild as ModEntry).onModDirectoryChanged();
      })
      .catch((error: unknown) => {
        console.log(error);
      });
  });
  mods_file_location_input?.addEventListener("change", () => {
    loadModLocation(mods_file_location_input.getAttribute("value") ?? "").catch(
      (error: unknown) => {
        console.log(error);
      },
    );
  });
  if (modlist_parent?.firstChild)
    (modlist_parent.firstChild as ModEntry).mod_directory_path = () =>
      `${hyperspace_file_location_input?.getAttribute("value") ?? ""}/resources/app.asar/app/`;
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

async function loadModLocation(mods_location: PathLike) {
  for (const path in await window.wishgranter.getModsFromLocation(
    mods_location,
  )) {
    if (
      modlist_parent?.children[Symbol.iterator]().find(
        (mod_entry) => (mod_entry as ModEntry).mod_directory_path == path,
      )
    )
      continue;
    const mod_entry = document.createElement("mod-entry") as ModEntry;
    mod_entry.mod_directory_path = path;
    modlist_parent?.append(mod_entry);
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
    startGame().catch((err: unknown) => {
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
