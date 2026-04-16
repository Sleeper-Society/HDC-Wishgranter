import type { PathLike } from "node:fs";
import type { Mod } from "../mod.ts";
import { original_data } from "./wishgranterModFactory.ts";

export function getHyperspaceDeckCommandAsMod(hyperspace_path: PathLike): Mod {
  return {
    metadata: {
      name: gdjs.projectData.properties.name,
      version: gdjs.projectData.properties.version,
      description: gdjs.projectData.properties.description,
      icon:
        hyperspace_path.toString() +
        window.remote_replace.path.sep() +
        "resources" +
        window.remote_replace.path.sep() +
        "app.asar" +
        window.remote_replace.path.sep() +
        "app" +
        window.remote_replace.path.sep() +
        gdjs.projectData.properties.platformSpecificAssets[
          "desktop-icon-512"
        ].split("/")[
          gdjs.projectData.properties.platformSpecificAssets[
            "desktop-icon-512"
          ].split("/").length - 1
        ],
    },
    onLoad: () => {
      for (const resource of original_data?.project_data.resources.resources ??
        []) {
        resource.file =
          hyperspace_path.toString() +
          window.remote_replace.path.sep() +
          "resources" +
          window.remote_replace.path.sep() +
          "app.asar" +
          window.remote_replace.path.sep() +
          "app" +
          window.remote_replace.path.sep() +
          resource.file;
      }
    },
  };
}
