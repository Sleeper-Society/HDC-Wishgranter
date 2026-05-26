import type { LoadSequenceFunction } from "wishgranter";
import type { RuntimeGame } from "./gdjs.ts";

export interface Mod {
  setDisabled(arg0: boolean): unknown;
  metadata: ModMetaData;
  onLoad?: () => ReturnType<LoadSequenceFunction>;
  onGameStart?: (gdgame: RuntimeGame) => void;
}
export interface ModMetaData {
  name: string;
  version: string;
  descr?: string;
  description?: string;
  icon?: string;
  dependencies?: [string, string][];
  seealso?: [string, string][];
}

export function pathToMod(path: string): Mod {}
