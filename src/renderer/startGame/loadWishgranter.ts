import { replaceData } from "./parseData.ts";
import { replaceCode0 } from "./parseCode0.ts";
import type {
  LoadSequenceElement,
  LoadSequenceFunction,
} from "../modMenu/loadingBar.ts";
import type { PathLike } from "fs";
import type PreloadedWindow from "../preload.ts";

export type ScriptReplacer = (
  original_file: string,
  hyperspace_path: PathLike,
) => ReturnType<typeof getReplacedFile>;

export function unloadWishgranter() {
  document.body.classList.remove("game_loadable");
  for (const element of document.head.getElementsByClassName(
    "wishgranter_script",
  )) {
    element.remove();
  }
}

export const loadWishgranter: LoadSequenceFunction = (
  hyperspace_path: PathLike,
) =>
  (window as unknown as PreloadedWindow).wishgranter
    .getHyperspaceScriptTags(hyperspace_path)
    .then((script_sources) =>
      script_sources
        .map(getPossiblyReplacedScriptSource(hyperspace_path))
        .map(getAddPossiblyParsedScriptLoadSequenceElement(script_sources)),
    );

const reimplementaitons: Record<string, ScriptReplacer> = {
  "data.js": replaceData,
  "code0.js": replaceCode0,
  "pixi-renderers/runtimegame-pixi-renderer.js": (original_file) =>
    getReplacedFile(original_file, [
      /this.getElectronRemote ?= ?\(\) ?=> ?{([\s\S]*?)}\s*?;/g,
      "this.getElectronRemote = () => window.remote_replace;",
    ]),
};

const replacements: Record<string, PathLike> = {
  "pixi-renderers/loadingscreen-pixi-renderer.js":
    "dist/renderer/loadingReimplementation.js",
  "Extensions/FileSystem/filesystemtools.js":
    "dist/renderer/filesystemReimplementation.js",
};

function getPossiblyReplacedScriptSource(
  hyperspace_path: PathLike,
): (
  script_source: PathLike,
) => PathLike | Promise<PathLike | [Promise<PathLike>, LoadSequenceElement[]]> {
  return (script_source) => {
    if (
      !(script_source.toString() in reimplementaitons) &&
      !(script_source.toString() in replacements)
    ) {
      const sep: string = (
        window as unknown as PreloadedWindow
      ).remote_replace.path.sep();
      return (
        hyperspace_path.toString() +
        sep +
        "resources" +
        sep +
        "app.asar" +
        sep +
        "app" +
        sep +
        script_source.toString()
      );
    } else if (script_source.toString() in replacements) {
      return replacements[script_source.toString()];
    } else
      return (window as unknown as PreloadedWindow).wishgranter
        .readHyperspaceFile(hyperspace_path, script_source)
        .then((script) =>
          reimplementaitons[script_source as keyof typeof reimplementaitons](
            script,
            hyperspace_path,
          ),
        )
        .then(
          (
            replaced_script,
          ):
            | PathLike
            | Promise<PathLike>
            | [Promise<PathLike>, LoadSequenceElement[]] => {
            const promise = replaced_script[0].then((new_file) =>
              (
                window as unknown as PreloadedWindow
              ).wishgranter.createTemporaryFile(script_source, new_file),
            );
            return [promise, replaced_script[1]];
          },
        );
  };
}

function getAddPossiblyParsedScriptLoadSequenceElement(
  script_sources: PathLike[],
): (
  script_source:
    | PathLike
    | Promise<PathLike | [Promise<PathLike>, LoadSequenceElement[]]>,
  index: number,
) => LoadSequenceElement {
  return (script_source, index) => {
    return {
      status_text: "Loading " + script_sources[index].toString(),
      function: async () => {
        const parsed_script_source = await script_source;
        if (!Array.isArray(parsed_script_source))
          return addScript(parsed_script_source);
        return parsed_script_source[1].concat([
          {
            status_text: "Writing " + script_sources[index].toString(),
            function: async () => addScript(await parsed_script_source[0]),
          },
        ]);
      },
    };
  };
}

export function getReplacedFile(
  original_file: string,
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
): [Promise<string>, LoadSequenceElement[]] {
  if (replacements.length <= 0)
    return [
      new Promise<string>((resolve) => {
        resolve(original_file);
      }),
      [],
    ];
  let resolve: (value: string) => void = () => {
    return;
  };
  const promised: Promise<string> = new Promise<string>(
    (true_resolve) => (resolve = true_resolve),
  );
  const resolver = replacements
    .map((value, index, array): LoadSequenceElement => {
      return {
        status_text:
          " Replacement Pass " +
          index.toString() +
          "/" +
          array.length.toString(),
        function: async () => {
          const match = value[0].global
            ? original_file.matchAll(value[0])
            : [original_file.match(value[0])][Symbol.iterator]();
          if (typeof value[1] == "function") {
            for (const replacement of value[1](match))
              original_file.replace(replacement[0], await replacement[1]);
          } else {
            original_file = value[0].global
              ? original_file.replaceAll(value[0], value[1])
              : original_file.replace(value[0], value[1]);
          }
        },
      };
    })
    .concat([
      {
        status_text: "Resolve",
        function: () => {
          resolve(original_file);
        },
      },
    ]);
  return [promised, resolver];
}

function addScript(script_source: PathLike) {
  return new Promise<void>((resolve) => {
    const script_orphan = document.createElement("script");
    script_orphan.src = script_source.toString();
    script_orphan.crossOrigin = "anonymous";
    script_orphan.className = "wishgranter_script";
    //script_orphan.type = "module";
    script_orphan.addEventListener("load", () => {
      resolve();
    });
    document.head.appendChild(script_orphan);
  });
}
