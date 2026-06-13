import type { projectData } from "./gdjs.ts";
import type { ModEntry } from "./modEntry.ts";

export async function getFileFromMods<FileContents = object>(
  parser: (
    old_object: Partial<FileContents>,
    file_contents: Response,
    mod_directory_path: string,
    file_name: string,
  ) => FileContents | Promise<FileContents>,
  ...files: string[]
): Promise<FileContents> {
  let result: Partial<FileContents> = {};
  for (const mod_entry of Array.from(
    document.getElementById("modlist")?.children ?? [],
  ) as ModEntry[]) {
    for (const file of files) {
      try {
        let response = await fetch(`${mod_entry.mod_directory_path}/${file}`, {
          method: "HEAD",
        });
        if (!response.ok) continue;
        response = await fetch(`${mod_entry.mod_directory_path}/${file}`);
        result = await parser(
          result,
          response,
          mod_entry.mod_directory_path,
          file,
        );
      } catch (err: unknown) {
        console.warn(`${mod_entry.mod_name} ${file} not loaded:`, err);
      }
    }
  }
  return result as FileContents;
}

export async function parseJson<JsonObject = unknown>(
  json: JsonObject,
  json_response: { json: () => Promise<JsonObject> },
  _mod_directory_path: string,
  file_name: string,
) {
  const new_json = (await json_response.json()) as Partial<JsonObject>;
  if (!/list/.exec(file_name)) return { ...json, ...new_json };
  return mergeDeep(json, new_json);
}

function mergeDeep<MergeTarget = object>(
  target: MergeTarget,
  addition?: Partial<MergeTarget>,
): MergeTarget {
  if (addition == undefined) return target;
  if (Array.isArray(target)) return target.concat(addition) as MergeTarget;
  if (["number", "string", "boolean"].includes(typeof target))
    return addition as MergeTarget;
  const out: Partial<MergeTarget> = {};
  for (const property in target) {
    if (!(property in addition)) out[property] = target[property];
    out[property] = mergeDeep(target[property], addition[property]);
  }
  for (const property in addition) {
    if (property in (target as object)) continue;
    out[property] = addition[property];
  }
  return out as MergeTarget;
}

export async function parseData(
  data: Partial<projectData>,
  response: {
    json: () => Promise<Partial<projectData>>;
    text: () => Promise<string>;
  },
  mod_directory_path: string,
  file_name: string,
): Promise<projectData> {
  if (/js(?!on)/.exec(file_name)) {
    //No one should ever make data.js in a normal mod, so it should be safe to give data back directly
    return eval(
      await response
        .text()
        .then(
          (data: string) =>
            data
              .replace(/gdjs.projectData\s*=\s*/, "(")
              .replace(/;\s*gdjs.runtimeGameOptions\s*=\s*\{\};/, "") + ")",
        )
        .then((data) =>
          data.replaceAll(
            /(?<="?file"?: ?")[\w.-]*(?=")/g,
            `${mod_directory_path}$&`,
          ),
        ),
    ) as projectData;
  } else if (/json/.exec(file_name)) {
    const new_data = await response.json();
    if (new_data.resources)
      new_data.resources.resources = new_data.resources.resources.map(
        (resource) => {
          resource.file = `${mod_directory_path}/${resource.file}`;
          return resource;
        },
      );
    return mergeDeep(data, new_data) as projectData;
  }
  return data as projectData;
}
