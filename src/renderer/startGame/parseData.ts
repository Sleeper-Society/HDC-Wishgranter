import type { PathLike } from "node:fs";
import type { LoadedMod } from "../mod.ts";
import { getReplacedFile } from "./loadWishgranter.ts";
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

export function replaceData(original_file: string, hyperspace_path: PathLike) {
  return getReplacedFile(original_file, [
    /(?<="?file"?: ?")([\w/]*)(?=\.(?:(?:png)|(?:wav)|(?:ogg)|(?:json))")/g,
    hyperspace_path.toString() +
      (window as unknown as PreloadedWindow).remote_replace.path.sep() +
      "resources" +
      (window as unknown as PreloadedWindow).remote_replace.path.sep() +
      "app.asar" +
      (window as unknown as PreloadedWindow).remote_replace.path.sep() +
      "app" +
      (window as unknown as PreloadedWindow).remote_replace.path.sep() +
      "$1",
  ]);
}

declare let gdjs: {
  projectData: {
    properties: {
      name: string;
      version: string;
      description: string;
    };
  };
};

export function convertDefualtDataToLoadedMod(
  hyperspace_path: PathLike,
): LoadedMod {
  return {
    metadata: {
      path: hyperspace_path,
      is_default: true,
      name: gdjs.projectData.properties.name,
      version: gdjs.projectData.properties.version,
      description: gdjs.projectData.properties.description,
    },
  };
}
