import cleanup from "node-cleanup";
import { readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join as constructPath } from "path";
import { rmSync } from "fs";
import type { projectData, RuntimeScene } from "./gdjs.ts";

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

export function commentCode0(
  code0: string,
  hyperspace_data: projectData,
): string {
  code0 = code0.replaceAll(
    // Comment scene Variables
    // Finds *all* calls of runtimeScene.getScene().getVariables().getFromIndex, includeing those that have already had this function called on them.
    /(?<=runtimeScene\s*.getScene\(\)\s*.getVariables\(\)\s*.getFromIndex\()(\d+)(?: \/\* [\w]* \*\/)?\)(\n|(?: \/\/[\w]+\n))?/g,
    (_substring: string, ...capture_groups: string[]) => {
      const variable_name =
        hyperspace_data.layouts[0].variables[Number.parseInt(capture_groups[0])]
          .name;
      return capture_groups[1] == ""
        ? `${capture_groups[0]} /* ${variable_name} */)`
        : `${capture_groups[0]}) //${variable_name}\n`;
    },
  );
  hyperspace_data.layouts[0].objects.forEach((obj) => {
    const hashtable_regex = new RegExp(
      `(?<=${obj.name}:\\s*)[\\w\\d_\\.]+(?=,|(?:\\s*}))`,
      "g",
    );
    const copy_array_regex = new RegExp(
      `(?<=copyArray\\(\\s*runtimeScene\\.getObjects\\("${obj.name}"\\),\\s*)[\\w\\.]+(?=,?\\s*\\))`,
      "g",
    );
    const mapper = (match: RegExpExecArray) =>
      new RegExp(
        `(?<=${match[0]}\\[\\w\\]\\s*\\.getVariables\\(\\)\\s*\\.getFromIndex\\()(d+)(?: \\/\\* [\\w\\d_]* \\*\\/)?\\)(\\n|(?: \\/\\/[\\w]+\\n))?`,
        "g",
      );
    const for_eacher = (regex: RegExp) =>
      (code0 = code0.replace(
        regex,
        (_substring: string, ...capture_groups: string[]) => {
          const variable_name =
            obj.variables[Number.parseInt(capture_groups[0])].name;
          return capture_groups[1] == ""
            ? `${capture_groups[0]} /* ${variable_name} */)`
            : `${capture_groups[0]}) //${variable_name}\n`;
        },
      ));
    code0.matchAll(hashtable_regex).map(mapper).forEach(for_eacher);
    code0.matchAll(copy_array_regex).map(mapper).forEach(for_eacher);
  });
  return code0;
}

export class HyperspaceDeckCommand {
  constructor(
    data: projectData,
    code: ((runtimeScene: RuntimeScene) => void)[],
  ) {}
}
