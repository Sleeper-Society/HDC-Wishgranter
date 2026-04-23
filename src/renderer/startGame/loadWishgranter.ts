import type {
  LoadSequenceElement,
  LoadSequenceFunction,
} from "../modMenu/loadingBar.ts";
import type { PathLike } from "fs";

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
  window.wishgranter
    .getHyperspaceScriptTags(hyperspace_path)
    .then((script_sources) =>
      script_sources
        .map(getPossiblyReplacedScriptSource(hyperspace_path))
        .map(getAddScriptLoadSequenceElement),
    );

const replacements: Record<string, PathLike> = {
  "pixi-renderers/loadingscreen-pixi-renderer.js":
    "dist/renderer/factories/loadingReimplementation.js",
  "Extensions/FileSystem/filesystemtools.js":
    "dist/renderer/factories/filesystemReimplementation.js",
};

function getPossiblyReplacedScriptSource(
  hyperspace_path: PathLike,
): (script_source: PathLike) => PathLike {
  return (script_source) => {
    if (script_source.toString() in replacements) {
      return replacements[script_source.toString()];
    } else {
      const sep: string = window.remote_replace.path.sep();
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
    }
  };
}

function getAddScriptLoadSequenceElement(
  script_source: PathLike,
): LoadSequenceElement {
  const sep: string = window.remote_replace.path.sep();
  return {
    status_text:
      "Loading " +
      script_source.toString().split(sep)[
        script_source.toString().split(sep).length - 1
      ],
    function: () => {
      return new Promise<void>((resolve) => {
        const script_orphan = document.createElement("script");
        script_orphan.src = script_source.toString();
        script_orphan.crossOrigin = "anonymous";
        script_orphan.className = "wishgranter_script";
        script_orphan.addEventListener("load", () => {
          resolve();
        });
        document.head.appendChild(script_orphan);
      });
    },
  };
}
