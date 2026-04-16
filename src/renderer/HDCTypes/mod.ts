import type { LoadSequenceFunction } from "../modMenu/loadingBar.ts";
import type { RuntimeGame } from "./gdjs.ts";

export interface Mod {
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
