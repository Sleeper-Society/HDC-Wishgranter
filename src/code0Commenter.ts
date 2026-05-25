import { readFile, writeFileSync } from "node:fs";
import path from "node:path";
import type { projectData } from "./gdjs.ts";

const code0_path = process.argv[2];
const datajs_path = process.argv[3];

// @ts-expect-error While useing the same gdjs, this script will not fully populate gdjs beforehand
globalThis.gdjs = {};

import(path.join(process.cwd(), datajs_path))
  .then(() => {
    console.log(datajs_path, "imported");
    readFile(path.join(process.cwd(), code0_path), "utf8", (_err, file) => {
      console.log(code0_path, "read");
      writeFileSync(
        path.join(process.cwd(), code0_path),
        commentCode0(file, gdjs.projectData),
      );
    });
  })
  .catch((err: unknown) => {
    console.error(err);
  });

export function commentCode0(
  code0: string,
  hyperspace_data: projectData,
): string {
  const possibly_commented_get_from_index_regex =
    /(?<=\.getVariables\(\)\s*.getFromIndex\()(\d+)(?: \/\* [\w]* \*\/)?\)(\n|(?: \/\/[\w]+\n))?/;
  const scene_variable_regex = /(?<=runtimeScene\s*\.getScene\(\)\s*)/;
  const object_assignment_regex =
    /(?:copyArray\(\s*runtimeScene\.getObjects\(")?([\w.]+)(?:(?:"\),)|:)\s*([\w.]+)(?:(?:,?\s*\))|(?:,|(?:\s*})))/g;
  const object_map = new Map<string, string>(
    code0
      .matchAll(object_assignment_regex)
      .map((match) => [match[2], match[1]]),
  );
  const object_variable_regex = /(?<=([\w.]+)\[\w+\]\s*)/;
  const replacing_scene_variable_regex = new RegExp(
    scene_variable_regex.source.substring(
      0,
      scene_variable_regex.source.length - ")".length,
    ) + possibly_commented_get_from_index_regex.source.substring("(?<=".length),
    "g",
  );
  const replacing_object_variable_regex = new RegExp(
    object_variable_regex.source.substring(
      0,
      object_variable_regex.source.length - ")".length,
    ) + possibly_commented_get_from_index_regex.source.substring("(?<=".length),
    "g",
  );
  const scene_variable_replacer = (
    _substring: string,
    ...capture_groups: string[]
  ) => {
    const variable_name =
      hyperspace_data.layouts[0].variables[Number.parseInt(capture_groups[0])]
        .name;
    return capture_groups[1] == ""
      ? `${capture_groups[0]} /* ${variable_name} */)`
      : `${capture_groups[0]}) //${variable_name}\n`;
  };
  const object_variable_replacer = (
    _substring: string,
    ...capture_groups: string[]
  ) => {
    const index = Number.parseInt(capture_groups[1]);
    const object =
      hyperspace_data.layouts[0].objects.find(
        (obj) => obj.name == object_map.get(capture_groups[0]),
      ) ??
      hyperspace_data.layouts[0].objects.find(
        (obj) =>
          obj.name ==
          object_map.get(
            object_map
              .keys()
              .find((key) =>
                new RegExp(
                  capture_groups[0].substring(
                    0,
                    capture_groups[0].length -
                      (/\d+$/.exec(capture_groups[0]) ?? [{ length: 0 }])[0]
                        .length,
                  ) + "\\d",
                ).test(key),
              ) ?? "",
          ),
      );
    if (!object) {
      console.error("Cannot find object for", capture_groups[0]);
      return `${capture_groups[1]})`;
    }
    const variable_name = object.variables[index].name;
    return capture_groups[2] == ""
      ? `${capture_groups[1]} /* ${variable_name} */)`
      : `${capture_groups[1]}) //${variable_name}\n`;
  };
  return code0
    .replaceAll(replacing_scene_variable_regex, scene_variable_replacer)
    .replaceAll(replacing_object_variable_regex, object_variable_replacer);
}
