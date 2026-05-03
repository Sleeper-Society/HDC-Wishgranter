import type { PathLike } from "fs";
import type { Mod } from "../wishgranterTypes/mod.ts";
import type { ModEntry } from "../modMenu/modEntry.ts";
import { getHyperspaceDeckCommandAsMod } from "../factories/modFactories/hyperspaceDeckCommandModFactory.ts";
import { getWishgranterMod } from "../factories/modFactories/wishgranterModFactory.ts";

const modlist_parent = document.getElementById("modlist");
let modlist: Mod[] = [];

export async function reimportDefaultMod(hyperspace_location: PathLike) {
  modlist = [
    await getWishgranterMod(hyperspace_location),
    getHyperspaceDeckCommandAsMod(hyperspace_location),
  ].concat(
    modlist.filter(
      (mod) =>
        ![gdjs.projectData.properties.name, "Wishgranter"].includes(
          mod.metadata.name,
        ),
    ),
  );
  recreateHTMLModlist();
}

export function loadModLocation(mods_location: PathLike): void {
  window.wishgranter
    .getModsFromLocation(mods_location)
    .then((path_list: PathLike[]) =>
      Promise.all(
        path_list.map(
          (mod_path) =>
            import(
              mod_path.toString() +
                window.remote_replace.path.sep() +
                "index.js"
            ),
        ),
      ),
    )
    .then((mods: Mod[]) => {
      modlist.push(...mods);
    })
    .then(recreateHTMLModlist)
    .catch((error: unknown) => {
      console.log(error);
    });
}

export function recreateHTMLModlist() {
  if (modlist_parent == undefined) return;
  modlist_parent.innerHTML = "";
  for (const mod of modlist) {
    const mod_entry = document.createElement("mod-entry") as ModEntry;
    mod_entry.mod = mod.metadata;
    mod_entry.enabled = true;
    modlist_parent.append(mod_entry);
  }
}

export function getModCount(): number {
  return modlist.length;
}
export function hasOnlyDefaultMods(): boolean {
  return modlist.length == 2;
}
export function getModGamestarts() {
  return modlist
    .map((mod) => mod.onGameStart)
    .filter((gamestart) => gamestart != undefined);
}
export function getModLoadLoadingElements() {
  return modlist.map((mod) => {
    return {
      status_text: "Loading " + mod.metadata.name,
      function: () => {
        try {
          if (mod.onLoad) return mod.onLoad();
        } catch (error) {
          console.error(error);
        }
      },
    };
  });
}
