import { readFile, writeFile } from "node:fs";
import path from "node:path";

const code0_path = process.argv[2];
const datajs_path = process.argv[3];

// @ts-expect-error While useing the same gdjs, this script will not fully populate gdjs beforehand
globalThis.gdjs = {};

import(path.join(process.cwd(), datajs_path))
  .then(() => {
    readFile(path.join(process.cwd(), code0_path), "utf8", (_err, file) => {
      writeFile(
        path.join(process.cwd(), code0_path),
        file.replaceAll(
          /(?<=runtimeScene\s*.getScene\(\)\s*.getVariables\(\)\s*).getFromIndex\((\d+)(?: \/\* [\w\d_]* \*\/)?\)(\n|(?: \/\/[\w\d]+\n))?/g,
          (_substring: string, ...args: string[]) => {
            const variable_name =
              gdjs.projectData.layouts[0].variables[Number.parseInt(args[0])]
                .name;
            return args[1] == ""
              ? `.getFromIndex(${args[0]} /* ${variable_name} */)`
              : `.getFromIndex(${args[0]}) //${variable_name}\n`;
          },
        ),
        () => {
          return;
        },
      );
    });
  })
  .catch((err: unknown) => {
    console.error(err);
  });
