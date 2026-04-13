import type { PathLike } from "node:fs";
import type { Mod } from "../mod.ts";
import type PreloadedWindow from "../preload.ts";

export const modified_jsons = [
  "cards",
  "encounters",
  "upgrades",
  "comms",
  "loot_list_up",
  "loot_list_card",
  "unlock_cond",
];
export const unmodified_jsons = [
  "tooltips",
  "tutorials",
  "text_lists",
  "cloud_lables",
  "credits",
];

export function getHyperspaceDeckCommandAsMod(hyperspace_path: PathLike): Mod {
  return {
    metadata: {
      name: gdjs.projectData.properties.name,
      version: gdjs.projectData.properties.version,
      description: gdjs.projectData.properties.description,
      icon:
        hyperspace_path.toString() +
        (window as unknown as PreloadedWindow).remote_replace.path.sep() +
        "resources" +
        (window as unknown as PreloadedWindow).remote_replace.path.sep() +
        "app.asar" +
        (window as unknown as PreloadedWindow).remote_replace.path.sep() +
        "app" +
        (window as unknown as PreloadedWindow).remote_replace.path.sep() +
        gdjs.projectData.properties.platformSpecificAssets[
          "desktop-icon-512"
        ].split("/")[
          gdjs.projectData.properties.platformSpecificAssets[
            "desktop-icon-512"
          ].split("/").length - 1
        ],
    },
    onLoad: () => {
      for (const resource of gdjs.projectData.resources.resources) {
        resource.file =
          hyperspace_path.toString() +
          (window as unknown as PreloadedWindow).remote_replace.path.sep() +
          "resources" +
          (window as unknown as PreloadedWindow).remote_replace.path.sep() +
          "app.asar" +
          (window as unknown as PreloadedWindow).remote_replace.path.sep() +
          "app" +
          (window as unknown as PreloadedWindow).remote_replace.path.sep() +
          resource.file;
      }
    },
  };
}
