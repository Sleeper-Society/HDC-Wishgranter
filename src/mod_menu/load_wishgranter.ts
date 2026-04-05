import type {
  Game,
  LoadSequenceFunction,
  LoadSequenceElement,
} from "../exports.ts";
import fs from "fs/promises";
import path from "path";
import { replaceData } from "./parse_data.ts";
import { replaceCode0 } from "./parse_code0.ts";

type ScriptReplacer = (
  hyperspace_path: string,
  game: Game,
) => string | Promise<string | [string, Iterable<LoadSequenceElement>]>;

const reimplementaitons: Record<string, ScriptReplacer> = {
  "data.js": replaceData,
  "code0.js": replaceCode0,
  "pixi-renderers/loadingscreen-pixi-renderer.js": () =>
    "dist/renderer/loading_reimplementation.js",
  "pixi-renderers/runtimegame-pixi-renderer.js": (hyperspace_path, game) =>
    getTemporaryReplacedFile(
      hyperspace_path,
      game,
      "pixi-renderers/runtimegame-pixi-renderer.js",
      [
        /this.getElectronRemote ?= ?\(\) ?=> ?{([\s\S]*?)}\s*?;/g,
        "this.getElectronRemote = () => window.remote_replace;",
      ],
    ),
  "Extensions/FileSystem/filesystemtools.js": () =>
    "dist/renderer/filesystem_reimplementation.js",
};

export const loadWishgranter: LoadSequenceFunction = async (
  hyperspace_path: string,
  game: Game,
) => {
  const on_finished: (() => void)[] = [];
  return fs
    .readFile(path.join(hyperspace_path, "index.html"), "utf-8")
    .then((data) =>
      Array.from(data.matchAll(/src="([\w\-/.]+?)"/g))
        .map((value): LoadSequenceElement => {
          const script_source = value[1];
          return {
            status_text: "Loading " + script_source,
            function: async () => {
              if (!(script_source in reimplementaitons))
                return game.loadScript(
                  path.join(hyperspace_path, script_source),
                );
              const reimplementaiton = await reimplementaitons[script_source](
                hyperspace_path,
                game,
              );
              if (!Array.isArray(reimplementaiton))
                return game.loadScript(reimplementaiton);
              return Array.from(reimplementaiton[1]).concat([
                {
                  status_text: "Loading " + script_source,
                  function: (_hyperspace_path: string, game: Game) =>
                    game.loadScript(reimplementaiton[0]),
                },
              ]);
            },
          };
        })
        .concat([
          {
            status_text: "Cleaning up",
            function: () => {
              on_finished.forEach((callback) => {
                callback();
              });
            },
          },
        ]),
    );
};

export async function getTemporaryReplacedFile(
  hyperspace_path: string,
  game: Game,
  file_name: string,
  ...replacements: [
    regex: RegExp,
    replacement:
      | string
      | ((
          match: ArrayIterator<RegExpMatchArray | null>,
        ) => Iterable<
          [matched: string, replacement: string | Promise<string>]
        >),
  ][]
): Promise<string | [string, LoadSequenceElement[]]> {
  const temp_path = path.join(
    game.getTempDirectory(),
    "parsed" + file_name.replaceAll(/\//g, ""),
  );
  let data = await fs.readFile(path.join(hyperspace_path, file_name), "utf8");
  const output = replacements.map(
    (value, index, array): LoadSequenceElement => {
      return {
        status_text:
          file_name +
          " Replacement Pass " +
          index.toString() +
          "/" +
          array.length.toString(),
        function: async () => {
          const match = value[0].global
            ? data.matchAll(value[0])
            : [data.match(value[0])][Symbol.iterator]();
          if (typeof value[1] == "function") {
            for (const replacement of value[1](match))
              data.replace(replacement[0], await replacement[1]);
          } else {
            data = value[0].global
              ? data.replaceAll(value[0], value[1])
              : data.replace(value[0], value[1]);
          }
        },
      };
    },
  );
  if (output.length >= 1)
    return [
      temp_path,
      output.concat({
        status_text: "Writing " + file_name,
        function: () =>
          fs.writeFile(temp_path, data, {
            flag: "w",
          }),
      }),
    ];
  await fs.writeFile(temp_path, data, {
    flag: "w",
  });
  return temp_path;
}
