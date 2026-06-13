import type { projectData } from "./gdjs.ts";
import type { ModEntry } from "./modEntry.ts";

export async function loadModdedFile<FileContents = object>(
  parser: (
    mod_path: string,
    file_name_to_parse: string,
  ) => Partial<FileContents> | Promise<Partial<FileContents>>,
  combiner: (
    old_object: FileContents,
    new_object: Partial<FileContents>,
  ) => FileContents,
  ...files_to_load: string[]
): Promise<FileContents> {
  return await (
    Array.from(document.getElementById("modlist")?.children ?? []) as ModEntry[]
  )
    .map((mod_entry) => mod_entry.mod_directory_path)
    .reduce(
      (file_contents_promise: Promise<FileContents>, mod_path: string) =>
        files_to_load.reduce(
          (file_contents_promise, file_to_load) =>
            file_contents_promise.then(async (file_contents) =>
              combiner(file_contents, await parser(mod_path, file_to_load)),
            ),
          file_contents_promise,
        ),

      Promise.resolve({} as FileContents),
    );
}

export function get_file(file_name: string, mod_path: string) {
  return window.remote_replace.fsPromise.readFile(
    `${mod_path}${window.remote_replace.path.sep()}${file_name}`,
  );
}
export async function parseJson<JsonObject = object>(
  mod_path: string,
  file_name: string,
) {
  return JSON.parse(await get_file(file_name, mod_path)) as Partial<JsonObject>;
}

export function mergeDeep<MergeTarget = object>(
  target: MergeTarget,
  addition?: Partial<MergeTarget>,
): MergeTarget {
  if (addition == undefined) return target;
  if (Array.isArray(target)) return target.concat(addition) as MergeTarget;
  if (["number", "string", "boolean"].includes(typeof target))
    return addition as MergeTarget;
  const out: Partial<MergeTarget> = {};
  for (const property in target) {
    if (!(property in (addition as object))) out[property] = target[property];
    else
      out[property] = mergeDeep(
        target[property],
        (addition as MergeTarget)[property],
      );
  }

  for (const property in addition) {
    if (property in (target as object)) continue;
    out[property] = addition[property];
  }

  return out as MergeTarget;
}

export async function parseData(
  mod_path: string,
  file_name: string,
): Promise<projectData> {
  const new_data: Partial<projectData> = /js(?!on)/.exec(file_name)
    ? (eval(
        await get_file(file_name, mod_path).then(
          (data: string) =>
            data
              .replace(/gdjs.projectData\s*=\s*/, "(")
              .replace(/;\s*gdjs.runtimeGameOptions\s*=\s*\{\};/, "") + ")",
        ),
      ) as projectData)
    : (JSON.parse(await get_file(file_name, mod_path)) as Partial<projectData>);

  if (new_data.resources)
    new_data.resources.resources = new_data.resources.resources.map(
      (resource) => {
        resource.file = `${mod_path}/${resource.file}`;
        return resource;
      },
    );
  return new_data as projectData;
}
