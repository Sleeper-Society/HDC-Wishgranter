import { commentCode0 } from "./code0Commenter.ts";
import type { projectData } from "./gdjs.ts";
import type { LoadSequenceElement } from "./loadingBar.ts";

export function unloadWishgranter() {
  document.body.classList.remove("game_loadable");
  for (const element of document.head.getElementsByClassName(
    "wishgranter_script",
  )) {
    element.remove();
  }
}

export async function loadWishgranter(
  hyperspace_path: string,
): Promise<Iterable<LoadSequenceElement<[string]>>> {
  return await window.wishgranter
    .getHyperspaceScriptTags(hyperspace_path)
    .then((script_sources) =>
      script_sources.map(getAddPossiblyReplacedScriptLoadSequenceElement),
    );
}

const replacements: Record<
  `${string}.js`,
  | string
  | Promise<string>
  | ((
      hyperspace_path: string,
    ) => AsyncIterable<string> | Iterable<string> | Promise<string> | string)
> = {
  "pixi-renderers/loadingscreen-pixi-renderer.js":
    "dist/renderer/loadingReimplementation.js",
  "Extensions/FileSystem/filesystemtools.js":
    "dist/renderer/filesystemReimplementation.js",
  "jsonmanager.js": "dist/renderer/jsonManagerReimplementation.js",
  "data.js": async (hyperspace_path) =>
    await window.wishgranter.createTemporaryFile(
      "truedata.js",
      await window.wishgranter
        .readHyperspaceFile(hyperspace_path, "data.js")
        .then((data) =>
          data.replaceAll(
            /(?<=file: ?")[\w.-]*(?=")/g,
            `${hyperspace_path}${window.remote_replace.path.sep()}resources${window.remote_replace.path.sep()}app.asar${window.remote_replace.path.sep()}app${window.remote_replace.path.sep()}$&`,
          ),
        ),
    ),
  "code0.js": async function* (hyperspace_path) {
    const commented_code_0 = commentCode0(
      await window.wishgranter.readHyperspaceFile(hyperspace_path, "code0.js"),
      (
        (await import(
          await window.wishgranter
            .readHyperspaceFile(hyperspace_path, "data.js")
            .then((data: string) =>
              data.replace(/gdjs.projectData = /, "export default "),
            )
            .then((data: string) =>
              window.wishgranter.createTemporaryFile("data.js", data),
            )
        )) as { default: projectData }
      ).default, //Get data from file since it loads in after code0
    );
    const regex =
      /gdjs.CommandCode.eventsList\d+ ?= ?function ?\(runtimeScene\) ?\{[^]*?\};/g;
    yield window.wishgranter.createTemporaryFile(
      "code0remainder.js",
      commented_code_0.replaceAll(regex, ""),
    );
    yield* commented_code_0
      .match(regex)
      ?.map((match, index) =>
        window.wishgranter.createTemporaryFile(
          `code0event${index.toString()}.js`,
          match.replace(
            /(?<=gdjs\s*\.evtsExt__GetPropertiesData__ReturnGameVersion\.func\(\s*runtimeScene,\s*null,?\s*\)\s*\+\s*")[\w()\s-]*(?="?)/g,
            " (Modded - Wishgranter)",
          ),
        ),
      ) ?? [];
  },
};

function getAddPossiblyReplacedScriptLoadSequenceElement(
  script_source: `${string}.js`,
): LoadSequenceElement<[string]> {
  const sep: string = window.remote_replace.path.sep();
  return {
    status_text:
      "Loading " +
      script_source.split(sep)[script_source.split(sep).length - 1],
    estimated_loading_time_multiplier:
      typeof replacements[script_source] == "function" ? 100 : 1,
    function: async (hyperspace_path) => {
      let script_sources: Iterable<string> | AsyncIterable<string>;
      if (!(script_source in replacements)) {
        script_sources = [
          `${hyperspace_path}${sep}resources${sep}app.asar${sep}app${sep}${script_source}`,
        ];
      } else if (typeof replacements[script_source] == "string") {
        script_sources = [replacements[script_source]];
      } else if (typeof replacements[script_source] != "function") {
        script_sources = [await replacements[script_source]];
      } else {
        const script_source_result =
          await replacements[script_source](hyperspace_path);
        if (typeof script_source_result == "string")
          script_sources = [script_source_result];
        else script_sources = script_source_result;
      }
      for await (const true_script_source of script_sources) {
        await new Promise<void>((resolve) => {
          const script_orphan = document.createElement("script");
          script_orphan.src = true_script_source;
          if (script_source in replacements) script_orphan.type = "module";
          script_orphan.crossOrigin = "anonymous";
          script_orphan.className = "wishgranter_script";
          script_orphan.addEventListener("load", () => {
            resolve();
          });
          document.head.appendChild(script_orphan);
        });
      }
    },
  };
}
