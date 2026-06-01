import type { Mod, MetaData } from "./modFactory.ts";
type onLoad = Required<Mod>["onLoad"];
type onGameStart = Required<Mod>["onGameStart"];
export type { onLoad, onGameStart, MetaData };
export type {
  LoadSequenceElement,
  LoadSequenceFunction,
} from "./renderer/modMenu/loadingBar.ts";

export type * from "./wishgranterInterfaces.ts";
export * from "./wishgranterInterfaceFactory.ts";
