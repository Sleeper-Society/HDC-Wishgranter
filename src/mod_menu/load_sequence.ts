import type { Game } from "../game.ts";

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type LoadSequenceReturns = void | LoadSequenceElement[];
export type LoadSequenceAsyncReturns = Promise<LoadSequenceReturns>;
export type LoadSequenceFunction = (
  hyperspace_path: string,
  game: Game,
) => LoadSequenceReturns | LoadSequenceAsyncReturns;
export interface LoadSequenceElement {
  status_text: string;
  loading_bar_fraction?: number;
  function: LoadSequenceFunction;
}
