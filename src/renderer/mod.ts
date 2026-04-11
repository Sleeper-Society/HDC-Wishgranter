import type { LoadSequenceElement } from "./modMenu/loadingBar.ts";

export interface Mod {
  metadata: ModMetaData;
  onLoad?: (gdjs: unknown) => LoadSequenceElement[];
  onGameStart?: (gdgame: unknown) => void;
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
