import type { PathLike } from "fs";
import type { Mod } from "../mod.ts";
import type { LoadSequenceElement } from "../modMenu/loadingBar.ts";
import type PreloadedWindow from "../preload.ts";
import type { ModEntry } from "../modMenu/modEntry.ts";
import { convertDefualtDataToMod } from "./parseData.ts";
import { getWishgranterMod } from "./parseCode0.ts";

const modlist_parent = document.getElementById("modlist");
const modlist: Record<string, [Mod, boolean]> = {
  wishgranter: [getWishgranterMod(), true],
};

// eslint-disable-next-line no-var
declare var gdjs: { projectData: { properties: { name: string } } };

export function reimportDefaultMod(hyperspace_location: PathLike) {
  modlist[gdjs.projectData.properties.name] = [
    convertDefualtDataToMod(hyperspace_location),
    modlist[gdjs.projectData.properties.name][1],
  ];
  recreateHTMLModlist();
}

export function loadModLocation(mods_location: PathLike): void {
  (window as unknown as PreloadedWindow).wishgranter
    .getModsFromLocation(mods_location)
    .then((path_list: PathLike[]) =>
      Promise.all(
        path_list.map(
          (mod_path) =>
            import(
              mod_path.toString() +
                (
                  window as unknown as PreloadedWindow
                ).remote_replace.path.sep() +
                "index.js"
            ),
        ),
      ),
    )
    .then((mods: Mod[]) => {
      for (const mod of mods) {
        modlist[mod.metadata.name] = [mod, true];
      }
    })
    .then(recreateHTMLModlist)
    .catch((error: unknown) => {
      console.log(error);
    });
}

export function recreateHTMLModlist() {
  if (modlist_parent == undefined) return;
  modlist_parent.innerHTML = "";
  for (const mod in modlist) {
    const mod_entry = document.createElement("mod-entry") as ModEntry;
    mod_entry.mod = modlist[mod][0].metadata;
    mod_entry.enabled = modlist[mod][1];
    modlist_parent.append(mod_entry);
  }
}

export function getModCount(): number {
  return Object.keys(modlist).length;
}
export function hasOnlyDefaultMods(): boolean {
  return Object.keys(modlist).length == 2;
}
export function getModGamestarts(): ((runtime_game: unknown) => void)[] {
  return Object.keys(modlist)
    .map((mod) => modlist[mod][0].onGameStart)
    .filter((gamestart) => gamestart != undefined);
}
export function getModLoadLoadingElements(): LoadSequenceElement[] {
  return Object.keys(modlist)
    .filter((mod) => modlist[mod][1])
    .map((mod): LoadSequenceElement => {
      return {
        status_text: "Loading " + mod,
        function: (hyperspace_location) => {
          try {
            if (modlist[mod][0].onLoad)
              return modlist[mod][0].onLoad(hyperspace_location);
          } catch (error) {
            console.error(error);
          }
        },
      };
    });
}
