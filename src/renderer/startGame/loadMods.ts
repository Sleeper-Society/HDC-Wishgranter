import type { PathLike } from "fs";
import type { LoadedMod } from "../mod.ts";
import type { LoadSequenceElement } from "../modMenu/loadingBar.ts";
import type PreloadedWindow from "../preload.ts";
import type { ModEntry } from "../modMenu/modEntry.ts";
import { convertDefualtDataToLoadedMod } from "./parseData.ts";

const modlist_parent = document.getElementById("modlist");
let modlist: LoadedMod[] = [];

export function reimportDefaultMod(hyperspace_location: PathLike) {
  if (modlist[0].metadata.is_default) modlist = modlist.slice(1);
  modlist = [convertDefualtDataToLoadedMod(hyperspace_location)].concat(
    modlist,
  );
}

export function addModLocationToModList(mods_location: PathLike) {
  (window as unknown as PreloadedWindow).wishgranter
    .getModsFromLocation(mods_location)
    .then((mods) => {
      for (const mod of mods) {
        const mod_entry = document.createElement("mod-entry") as ModEntry;
        mod_entry.mod = mod;
        modlist_parent?.append(mod_entry);
      }
    })
    .catch((error: unknown) => {
      console.log(error);
    });
}
export function getModCount(): number {
  return modlist.length;
}
export function hasOnlyDefaultMods(): boolean {
  return modlist.length == 1 && modlist[0].metadata.is_default == true;
}
export function getModGamestarts(): ((runtime_game: unknown) => void)[] {
  return modlist
    .map((mod) => mod.gamestart)
    .filter((gamestart) => gamestart != undefined);
}
export function getModLoadLoadingElements(): LoadSequenceElement[] {
  return modlist.map((mod): LoadSequenceElement => {
    return {
      status_text: "Loading " + mod.metadata.name,
      function: () => {
        try {
          if (mod.load) return mod.load();
        } catch (error) {
          console.error(error);
        }
      },
    };
  });
}
