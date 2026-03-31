import Game from "../game.ts";

export type LoadSequenceReturns = void | LoadSequenceElement[]
export type LoadSequenceAsyncReturns = Promise < LoadSequenceReturns >
    export type LoadSequenceFunction = (hyperspace_path: string, game: Game) => (LoadSequenceReturns | LoadSequenceAsyncReturns)
export type LoadSequenceElement = {
    status_text: string;
    function: LoadSequenceFunction;
};