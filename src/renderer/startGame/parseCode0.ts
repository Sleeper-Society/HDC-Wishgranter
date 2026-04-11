import { getReplacedFile } from "./loadWishgranter.ts";

export function replaceCode0(
  original_file: string,
): ReturnType<typeof getReplacedFile> {
  const out = getReplacedFile(original_file, [
    /gdjs\s*\.evtsExt__GetPropertiesData__ReturnGameVersion\.func\(runtimeScene, null\)(?: \+(\s*)"(.*)")?/g,
    'gdjs.evtsExt__GetPropertiesData__ReturnGameVersion.func(runtimeScene, null) +$1 (" + (hasOnlyDefaultMods() ? "" : getModCount() + " Mods - ") + "Wishgranter)"',
  ]);
  return [
    out[0].then(
      (file) =>
        'import {hasOnlyDefaultMods, getModCount} from "/dist/renderer/startGame/loadMods.js"\n' +
        file,
    ),
    out[1],
  ];
}
