import { getReplacedFile } from "./loadWishgranter.ts";

export function replaceCode0(
  original_file: string,
): ReturnType<typeof getReplacedFile> {
  return getReplacedFile(original_file, [
    /gdjs\s*\.evtsExt__GetPropertiesData__ReturnGameVersion\.func\(runtimeScene, null\)(?: \+(\s*)"(.*)")?/g,
    'gdjs.evtsExt__GetPropertiesData__ReturnGameVersion.func(runtimeScene, null) +$1"(Wishgranter)"',
  ]);
}
