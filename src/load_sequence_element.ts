import { Game } from "./game";

export type load_sequence_returns = void | load_sequence_element[] | Promise<void | load_sequence_element[]>;
export type load_sequence_function = (hyperspace_path: string, mods_path: string, game : Game) => load_sequence_returns
export type load_sequence_element = {
    status_text: string;
    function: load_sequence_function;
};
