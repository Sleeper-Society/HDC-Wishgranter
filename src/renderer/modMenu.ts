import { startGame, loadHyperspaceLocation } from "./startGame.ts";
import type { ModEntry } from "./modEntry.ts";

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
    const hyperspace_location =
      hyperspace_file_location_input.getAttribute("value") ?? "";
    modlist_parent?.children[0]?.setAttribute(
      "mod_directory_path",
      window.remote_replace.path.join(
        hyperspace_location,
        "resources",
        "app.asar",
        "app",
      ),
    );

    changeStyleToHyperspace(hyperspace_location);
    loadHyperspaceLocation(hyperspace_location).catch((error: unknown) => {
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
  hyperspace_file_location_input?.addEventListener("change", saveFilePaths);
  mods_file_location_input?.addEventListener("change", saveFilePaths);
}
function saveFilePaths() {
  window.mod_menu
    .savePaths(
      hyperspace_file_location_input?.getAttribute("value") ?? "",
      mods_file_location_input?.getAttribute("value") ?? "",
      ...(
        Array.from(modlist_parent?.children ?? []).slice(1) as ModEntry[]
      ).map((entry: ModEntry) => entry.mod_directory_path),
    )
    .catch((err: unknown) => {
      console.error(err);
    });
}

function changeStyleToHyperspace(hyperspace_location: string) {
  box_art.src = window.remote_replace.path.join(
    hyperspace_location,
    "resources",
    "app.asar",
    "app",
    "store_capsule_header.png",
  );
  font.innerText = `@font-face {font-family: "Oxanium";src: url("${window.remote_replace.path.join(
    hyperspace_location,
    "resources",
    "app.asar",
    "app",
    "Oxanium-Hyper.ttf",
  )}");}`;
}

function prepopulateFileLocations() {
  window.mod_menu
    .getDefaultHyperspacePath()
    .then((value) => {
      hyperspace_file_location_input?.setAttribute("value", value);
      hyperspace_file_location_input?.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    })
    .catch((error: unknown) => {
      console.log(error);
    });
  window.mod_menu
    .getDefaultModsPath()
    .then((mods_path) => {
      mods_file_location_input?.setAttribute("value", mods_path);
      mods_file_location_input?.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    })
    .catch((error: unknown) => {
      console.log(error);
    });
  window.mod_menu
    .getDefaultModPaths()
    .then((mod_directory_paths) => {
      mod_directory_paths.forEach(addMod);
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
      window.mod_menu
        .askUserForDirectory(default_path ?? "")
        .then((value) => {
          document.getElementById(output_id)?.setAttribute("value", value);
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
      window.mod_menu
        .getSteamGameLocation()
        .then((value) => {
          hyperspace_file_location_input?.setAttribute("value", value);
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

async function loadModLocation(mods_location: string) {
  for (const path of await window.mod_menu.getModsFromLocation(mods_location)) {
    addMod(path);
  }
}
function addMod(mod_directory_path: string) {
  if (
    modlist_parent?.children[Symbol.iterator]().find(
      (mod_entry) =>
        (mod_entry as ModEntry).mod_directory_path == mod_directory_path,
    )
  )
    return;
  const mod_entry = document.createElement("mod-entry") as ModEntry;
  //@ts-expect-error Using custom event
  mod_entry.addEventListener(
    "mod_directory_changed",
    (e: { detail: { new_directory: string } }) => {
      (Array.from(modlist_parent?.children ?? []) as ModEntry[])
        .filter((sub_mod_entry) => sub_mod_entry != mod_entry)
        .forEach((sub_mod_entry) => {
          if (sub_mod_entry.mod_directory_path == e.detail.new_directory)
            sub_mod_entry.remove();
        });
    },
  );
  mod_entry.mod_directory_path = mod_directory_path;
  modlist_parent?.append(mod_entry);
}

function enableStartGameButton() {
  start_game_button.addEventListener("click", () => {
    saveFilePaths();
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
