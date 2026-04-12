import type { LoadSequenceElement } from "./modMenu/loadingBar.ts";

export interface Mod {
  metadata: ModMetaData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLoad?: (gdjs: any) => LoadSequenceElement[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onGameStart?: (gdgame: any) => void;
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
