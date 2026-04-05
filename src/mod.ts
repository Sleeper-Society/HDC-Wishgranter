import fs from "fs";
import type { Game } from "./game.ts";
import type { LoadSequenceElement, LoadSequenceFunction } from "./exports.ts";
import type { PathLike } from "fs";
import path from "path";
import { convertDefualtDataToMod } from "./mod_menu/parse_data.ts";

type RuntimeGame = unknown;
export interface Mod {
  metadata: ModMetaData;
  load?: LoadSequenceFunction;
  gamestart?: (gdgame: RuntimeGame) => void;
}
export interface ModHeader {
  name: string;
  version: string;
}
export interface ModMetaData extends ModHeader {
  descr?: string;
  description?: string;

  icon?: string;
  dependencies?: [string, string][];
  seealso?: [string, string][];
}
interface loadable {
  path: PathLike;
  is_default?: true;
}
export interface LoadableModMetaData extends ModMetaData, loadable {}

export interface ModLoadInfo extends ModHeader, loadable {}

export const bad_mod: LoadableModMetaData = {
  name: "Something went wrong",
  version: "0",
  path: "",
};

export async function modLoadInfoToMod(input: ModLoadInfo): Promise<Mod> {
  if (input.is_default) return await convertDefualtDataToMod(input.path);
  let has_index = fs.existsSync(input.path);
  if (has_index)
    try {
      fs.accessSync(
        path.join(input.path.toString(), "/index.js"),
        fs.constants.R_OK,
      );
      has_index = true;
    } catch (error) {
      console.warn("Unable to load ", path, ". ", error);
    }
  if (!has_index)
    return {
      metadata: bad_mod,
    };
  return import(path.join(input.path.toString(), "/index.js"))
    .catch((reason: unknown) => {
      console.error(reason);
      return bad_mod;
    })
    .then((mod_module: Mod) => {
      try {
        return mod_module;
      } catch (error) {
        console.error(error);
        return {
          metadata: bad_mod,
        };
      }
    });
}

export const loadMods: LoadSequenceFunction = (
  hyperspace_path: string,
  game: Game,
) => {
  return game.modlist
    .map((mod): LoadSequenceElement => {
      return {
        status_text: "Loading " + mod.metadata.name,
        function: () => {
          try {
            if (mod.load) return mod.load(hyperspace_path, game);
          } catch (error) {
            console.error(error);
          }
        },
      };
    })
    .concat([
      {
        status_text: "Applying Mods",
        function: (_hyperspace_path: string, game: Game) => game.bakeJSONs(),
      },
    ]);
};
