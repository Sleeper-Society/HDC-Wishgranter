import cleanup from "node-cleanup";
import { join as constructPath } from "path";
import type { HyperspaceDeckCommand } from "wishgranter";
import {
  constructCode0,
  constructData,
  tmpdir_name,
} from "./hyperspaceDeckCommand.ts";
import { tmpdir } from "os";
import { rmSync } from "fs";
import type { projectData, RuntimeScene } from "./gdjs.ts";
import type { Mod } from "./modFactory.ts";

export async function getFromPath(
  hyperspace_path: string,
): Promise<HyperspaceDeckCommandGUI> {
  const hyperspace_resources_path = constructPath(
    hyperspace_path,
    "resources",
    "app.asar",
    "app",
  );
  cleanup(() => {
    rmSync(constructPath(tmpdir(), tmpdir_name), {
      recursive: true,
      force: true,
    });
  });
  const data = (await import(
    await constructData(constructPath(hyperspace_resources_path, "data.js"))
  )) as projectData;
  const code = await Promise.all(
    (
      await constructCode0(
        constructPath(hyperspace_resources_path, "code0.js"),
        data,
      )
    ).map(
      async (path) =>
        (await import(await path)) as (runtimeScene: RuntimeScene) => void,
    ),
  );
  return new HyperspaceDeckCommandGUI(data, code, hyperspace_resources_path);
}
export class HyperspaceDeckCommandGUI implements HyperspaceDeckCommand {
  constructor(
    data: projectData,
    code: ((runtimeScene: RuntimeScene) => void)[],
    resources_path: string,
  ) {}
  mods: Mod[] = [];
  addMod(mod: Mod): void {
    throw new Error("Method not implemented.");
  }
  load(): void {
    throw new Error("Method not implemented.");
  }
  loadModMenu() {
    throw new Error("Method not implemented.");
  }
}
