import { Game } from "./game";
import { load_sequence_function } from "./load_sequence_element";
type RuntimeGame = any
export type Mod = {
    name: string;
    descr?: string;
    description?: string;
    version: string;
    dependencies?: [string, string][];
    seealso?: [string, string][];
    load: load_sequence_function;
    gamestart?: (game : Game, gdgame : RuntimeGame) => void;
};
