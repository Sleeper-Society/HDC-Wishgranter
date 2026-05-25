import cleanup from "node-cleanup";
import { readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join as constructPath } from "path";
import { rmSync } from "fs";
import type { projectData, RuntimeScene } from "./gdjs.ts";
import { commentCode0 } from "./code0Commenter.ts";

export const tmpdir_name = "HDCWishgranter";

export async function getFromPath(
  hyperspace_path: string,
): Promise<HyperspaceDeckCommand> {
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
  return new HyperspaceDeckCommand(data, code);
}

export async function constructData(data_path: string): Promise<string> {
  return await readFile(data_path, "utf8")
    .then((data: string) =>
      data.replace(/gdjs.projectData = /, "export default "),
    )
    .then((data: string) =>
      writeFile(constructPath(tmpdir(), tmpdir_name, "data.js"), data, "utf8"),
    )
    .then(() => constructPath(tmpdir(), tmpdir_name, "data.js"));
}

export async function constructCode0(
  code0_path: string,
  hyperspace_data: projectData,
) {
  // gdjs\.(?!CommandCode)(?!evtTools)(?!evtsExt)(?!copyArray)(?!RuntimeObject)(?!VariablesContainer)(?!random)(?!fileSystem)(?!LongLivedObjectsList)
  return await readFile(code0_path, "utf8")
    .then((code0) => commentCode0(code0, hyperspace_data))
    .then(function* (file: string) {
      const regex =
        /gdjs.CommandCode.eventsList(\d+) ?= ?function ?\(runtimeScene\) ?\{([^]*?)\};/g;
      yield "export default function output(runtimeScene) {return;};\n" +
        file.replace(regex, "");
      yield* file.matchAll(regex).map(
        (func) =>
          `export default function output(runtimeScene) ${func[2]};\n
            gdjs.CommandCode.eventsList${func[1]} = output`,
      );
    })
    .then((code0_functions) =>
      code0_functions.map(async (code0_function, index) => {
        const path = constructPath(
          tmpdir(),
          tmpdir_name,
          `code${index.toString()}.js`,
        );
        await writeFile(path, code0_function, "utf8");
        return path;
      }),
    );
}

export class HyperspaceDeckCommand {
  constructor(
    data: projectData,
    code: ((runtimeScene: RuntimeScene) => void)[],
  ) {}
  mods: Mod[] = [getBaseGameMod()];
  addMod(mod: Mod) {
    throw new Error("Method not implemented.");
  }
  load() {
    throw new Error("Method not implemented.");
  }
}
