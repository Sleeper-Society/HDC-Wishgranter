import type { PathLike } from "fs";

export type LesserLoadingSequenceFunction =
  () => // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    | void
    | LesserLoadingSequenceElement[]
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    | Promise<void | LesserLoadingSequenceElement[]>;
export interface LesserLoadingSequenceElement {
  status_text: string;
  function: LesserLoadingSequenceFunction;
}
type RuntimeGame = unknown;
export interface Mod {
  enabled: boolean;
  metadata: ModMetaData;
  load?: LesserLoadingSequenceFunction;
  gamestart?: (gdgame: RuntimeGame) => void;
}
export interface LoadedMod {
  metadata: LoadedModMetaData;
  load?: LesserLoadingSequenceFunction;
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
export interface LoadedModMetaData extends ModMetaData, loadable {}

export interface ModLoadInfo extends ModHeader, loadable {}

export const bad_mod: LoadedModMetaData = {
  name: "Something went wrong",
  version: "0",
  path: "",
};
