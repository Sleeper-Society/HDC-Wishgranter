import type { Game } from "../game.ts";
import type { LoadSequenceElement } from "./load_sequence.ts";
import { getTemporaryReplacedFile } from "./load_wishgranter.ts";

export function replaceCode0(
  hyperspace_path: string,
  game: Game,
): Promise<string | [string, LoadSequenceElement[]]> {
  return getTemporaryReplacedFile(hyperspace_path, game, "code0.js", [
    /gdjs\s*\.evtsExt__GetPropertiesData__ReturnGameVersion\.func\(runtimeScene, null\)(?: \+(\s*)"(.*)")?/g,
    'gdjs.evtsExt__GetPropertiesData__ReturnGameVersion.func(runtimeScene, null) +$1" (' +
      (game.modlist.length > 1
        ? game.modlist.length.toString() + " Mods - "
        : "") +
      'Wishgranter)"',
  ]);
}
