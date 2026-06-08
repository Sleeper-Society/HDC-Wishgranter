import type { LoadSequenceElement } from "./loadingBar.ts";

export function unloadWishgranter() {
  document.body.classList.remove("game_loadable");
  for (const element of document.head.getElementsByClassName(
    "wishgranter_script",
  )) {
    element.remove();
  }
}

export async function loadWishgranter(hyperspace_path: string) {
  return await window.wishgranter
    .getHyperspaceScriptTags(hyperspace_path)
    .then((script_sources) =>
      script_sources.map(
        getAddPossiblyReplacedScriptLoadSequenceElement(hyperspace_path),
      ),
    );
}

const replacements: Record<string, string> = {
  "pixi-renderers/loadingscreen-pixi-renderer.js":
    "dist/renderer/loadingReimplementation.js",
  "Extensions/FileSystem/filesystemtools.js":
    "dist/renderer/filesystemReimplementation.js",
  "jsonmanager.js": "dist/renderer/jsonManagerReimplementation.js",
};

function getAddPossiblyReplacedScriptLoadSequenceElement(
  hyperspace_path: string,
): (script_source: string) => LoadSequenceElement {
  const sep: string = window.remote_replace.path.sep();
  return (script_source) => {
    return {
      status_text:
        "Loading " +
        script_source.split(sep)[script_source.split(sep).length - 1],
      function: () => {
        return new Promise<void>((resolve) => {
          const script_orphan = document.createElement("script");
          script_orphan.src =
            script_source in replacements
              ? replacements[script_source]
              : `${hyperspace_path}${sep}resources${sep}app.asar${sep}app${sep}${script_source}`;
          if (script_source in replacements) script_orphan.type = "module";
          script_orphan.crossOrigin = "anonymous";
          script_orphan.className = "wishgranter_script";
          script_orphan.addEventListener("load", () => {
            resolve();
          });
          document.head.appendChild(script_orphan);
        });
      },
    };
  };
}
