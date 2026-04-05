import fsPromise from "fs/promises";
import type { PathLike } from "node:fs";
import path from "node:path";
import type { Game, Mod } from "../exports.ts";

import type { LoadableModMetaData } from "../mod.ts";
import { getTemporaryReplacedFile } from "./load_wishgranter.ts";

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

export function replaceData(hyperspace_path: string, game: Game) {
  return getTemporaryReplacedFile(
    hyperspace_path,
    game,
    "data.js",
    [
      /(?<="?file"?: ?")([\w/]*)(?=\.(?:(?:png)|(?:wav)|(?:ogg))")/g,
      path.join(hyperspace_path, "$1"),
    ],
    [
      /(?<="?file"?: ?")([\w/]*)(?=\.(?:json)")/g,
      path.join(game.getTempDirectory(), "parsed$1"),
    ],
  );
}

export async function convertDefualtDataToMod(
  hyperspace_path: PathLike,
): Promise<Mod> {
  return fsPromise
    .readFile(
      path.join(
        hyperspace_path.toString(),
        "resources",
        "app.asar",
        "app",
        "data.js",
      ),
      "utf8",
    )
    .then((data) => {
      // eslint-disable-next-line prefer-const
      let jsdata = {
        properties: { name: "", version: "", description: "" },
      };
      eval(
        "jsdata = " +
          data.substring(
            19,
            data.length - ("gdjs.runtimeGameOptions = {};".length + 1),
          ),
      );
      return {
        metadata: {
          name: jsdata.properties.name,
          version: jsdata.properties.version,
          description: jsdata.properties.description,
        },
      };
    });
}
export async function convertDefualtDataToLoadableModMetaData(
  hyperspace_path: PathLike,
): Promise<LoadableModMetaData> {
  return fsPromise
    .readFile(
      path.join(
        hyperspace_path.toString(),
        "resources",
        "app.asar",
        "app",
        "data.js",
      ),
      "utf8",
    )
    .then((data) => {
      // eslint-disable-next-line prefer-const
      let jsdata = {
        properties: { name: "", version: "", description: "" },
      };
      eval(
        "jsdata = " +
          data.substring(
            19,
            data.length - ("gdjs.runtimeGameOptions = {};".length + 1),
          ),
      );
      return {
        name: jsdata.properties.name,
        version: jsdata.properties.version,
        description: jsdata.properties.description,
        is_default: true,
        path: hyperspace_path,
      };
    });
}
