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
      script_sources
        .filter((script_source) => !exclusions.includes(script_source))
        .map(getAddPossiblyReplacedScriptLoadSequenceElement),
    );
}

const exclusions = ["data.js"];

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
  const script_name =
    script_source.split(sep)[script_source.split(sep).length - 1];
  if (!(script_source in replacements)) {
    return {
      status_text: `Loading ${script_name}`,
      function: (hyperspace_path) =>
        addScript(
          `${hyperspace_path}${sep}resources${sep}app.asar${sep}app${sep}${script_source}`,
          false,
        ),
    };
  } else if (typeof replacements[script_source] == "string") {
    return {
      status_text: `Loading ${script_name}`,
      function: () => addScript(replacements[script_source] as string),
    };
  } else if (typeof replacements[script_source] != "function") {
    return {
      status_text: `Loading ${script_name}`,
      function: async () =>
        addScript(await (replacements[script_source] as Promise<string>)),
    };
  } else {
    return {
      status_text: `Loading ${script_name}`,
      estimated_loading_time_multiplier: 100,
      function: async (hyperspace_path) => {
        const script_source_result = await (
          replacements[script_source] as (
            hyperspace_path: string,
          ) =>
            | AsyncIterable<string>
            | Iterable<string>
            | Promise<string>
            | string
        )(hyperspace_path);
        if (typeof script_source_result == "string")
          return addScript(script_source_result);
        else {
          let i = 0;
          const out = [];
          for await (const sub_script_source of script_source_result) {
            out.push({
              status_text: `Loading ${script_name}${(i++).toString()}`,
              function: () => addScript(sub_script_source),
            });
          }
          return out.map((element, index) => {
            element.status_text = `Loading ${script_name} ${index.toString()}/${out.length.toString()}`;
            return element;
          });
        }
      },
    };
  }
}

function addScript(script_source: string, moudle = true) {
  return new Promise<void>((resolve) => {
    const script_orphan = document.createElement("script");
    script_orphan.src = script_source;
    if (moudle) script_orphan.type = "module";
    script_orphan.crossOrigin = "anonymous";
    script_orphan.className = "wishgranter_script";
    script_orphan.addEventListener("load", () => {
      resolve();
    });
    document.head.appendChild(script_orphan);
  });
}
